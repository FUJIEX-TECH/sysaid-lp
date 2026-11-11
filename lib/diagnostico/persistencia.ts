// ==========================================================================
// Diagnóstico ITSM — adaptador de gravação da LP da SysAid (SOB MEDIDA).
// O motor (lib/conversa-core) não sabe gravar; este arquivo liga a conversa
// às rotas que a LP já tem: /api/lead/partial (parcial silencioso no e-mail e
// no contato) e /api/lead (envio final, com trava de e-mail corporativo e
// honeypot do servidor como sempre). Depois, best-effort, /api/diagnostico
// grava a classificação nas colunas diag_* (só com DIAGNOSTICO_PERSIST=true;
// migração lib/migrations/2026-10-28-diagnostico.sql NÃO aplicada em produção).
// ==========================================================================

import type { Contexto, Persistencia, Respostas } from "@/lib/conversa-core";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"] as const;

function getUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  return found;
}

function utmDosSinais(s: Contexto["sinais"] | undefined): Record<string, string> {
  if (!s) return {};
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = s[k];
    if (v) out[k] = v;
  }
  return out;
}

// 11/11/2026: o e-mail chega no passo 3 (SPIN). Quando chega, o que a pessoa já
// contou vai junto no registro parcial, na coluna `notes` (texto; nunca vai pro
// RD Station, que só recebe o lead completo). Antes do e-mail nada é gravado.
function notasSpin(r: Respostas, ctx: Contexto): string {
  const linhas: string[] = [];
  if (r.situacao_texto) linhas.push(`Situação: ${r.situacao_texto}`);
  const implicacao = ctx.gerados?.palpite?.textos?.palpite;
  if (implicacao && r.palpite) linhas.push(`Implicação (chat): ${implicacao}`);
  if (r.palpite === "sim") linhas.push("Resposta: é isso");
  if (r.palpite === "mais") linhas.push(`Resposta: tem mais${r.implicacao_mais ? `: ${r.implicacao_mais}` : ""}`);
  if (r.situacao) linhas.push(`Situação (chip): ${r.situacao}`);
  else if (ctx.variaveis.concorrente && r.situacao_texto) linhas.push(`Situação (pela origem): usa ${ctx.variaveis.concorrente}`);
  if (r.dor) linhas.push(`Dor: ${r.dor}`);
  return linhas.join("\n").slice(0, 1900);
}

export function criarPersistenciaLP(): Persistencia {
  let leadId: number | null = null;
  let utm: Record<string, string> | null = null;
  let salvoEmail = "";
  let salvoIdent = "";
  let salvoContato = "";
  const ensureUtm = () => (utm ??= getUtm());

  async function salvarParcial(campos: Record<string, string>) {
    try {
      const res = await fetch("/api/lead/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId ?? undefined,
          ...campos,
          page_url: window.location.href,
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const data = await res.json();
      if (data?.id) leadId = Number(data.id);
    } catch {
      // nunca bloqueia a conversa
    }
  }

  return {
    aoResponder(etapaId: string, r: Respostas, ctx: Contexto) {
      if (etapaId === "email" && r.email && r.email !== salvoEmail) {
        salvoEmail = r.email;
        const notes = notasSpin(r, ctx);
        salvarParcial(notes ? { email: r.email, notes } : { email: r.email });
      }
      // nome e empresa confirmados (ou digitados) entram no parcial logo que existem
      if ((etapaId === "confirma" || etapaId === "nome" || etapaId === "empresa") && r.nome && r.empresa) {
        const chave = `${r.nome}|${r.empresa}`;
        if (chave !== salvoIdent) {
          salvoIdent = chave;
          salvarParcial({ name: r.nome, company: r.empresa });
        }
      }
      if (etapaId === "telefone" && r.nome && r.telefone) {
        const chave = `${r.nome}|${r.telefone}`;
        if (chave !== salvoContato) {
          salvoContato = chave;
          salvarParcial({ name: r.nome, phone: r.telefone });
        }
      }
    },

    async enviar({ respostas, ctx, classificacao, honeypot, medicao }) {
      const s = ctx.sinais;
      const diag = {
        variante: "b",
        origem: ctx.origem,
        concorrente: ctx.variaveis.concorrente ?? null,
        // v2: o que a origem leu (intenção, canal) e os sinais crus (UTMs lembrados, página de entrada)
        variaveis: ctx.variaveis,
        sinais: s
          ? { caminho: s.caminho, entrada: s.entrada, referrer: s.referrer, utm_source: s.utm_source, utm_medium: s.utm_medium, utm_campaign: s.utm_campaign, utm_term: s.utm_term, utm_content: s.utm_content, gclid: s.gclid }
          : null,
        // v2: a empresa lida pelo domínio (só o que é público; a pessoa confirmou ou corrigiu o nome em `respostas.empresa`)
        empresa_lida: ctx.empresa ? { dominio: ctx.empresa.dominio, nome: ctx.empresa.nome, origem: ctx.empresa.origem, cnpj: ctx.empresa.cnpj ?? null, cidade: ctx.empresa.cidade ?? null, uf: ctx.empresa.uf ?? null } : null,
        respostas,
        pontos: classificacao.pontos,
        detalhe: classificacao.detalhe,
        classe: classificacao.classe,
        rotulo: classificacao.rotulo,
        rotulo_origem: classificacao.rotuloOrigem,
        rota: classificacao.rota,
        segundos: classificacao.segundos,
        // parte 2: o que o Jev leu no texto livre (dor, coerência) e o custo da IA nesta sessão
        jev: classificacao.jevDados ?? null,
        medicao,
      };
      if (process.env.NODE_ENV !== "production") console.log("[diagnostico] classificação", diag);

      const payload = {
        id: leadId ?? undefined,
        email: respostas.email ?? "",
        name: respostas.nome ?? "",
        phone: respostas.telefone ?? "",
        company: respostas.empresa ?? "",
        num_admins: respostas.tecnicos ?? "",
        website: honeypot,
        page_url: window.location.href,
        referrer: document.referrer,
        // UTMs da URL atual; se não tem, os lembrados da 1ª página (sinais)
        ...utmDosSinais(s),
        ...ensureUtm(),
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) return { ok: false };

      if (data.id && !data.hp) {
        try {
          await fetch("/api/diagnostico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: Number(data.id), diag }),
          });
        } catch {
          // enfeite: nunca segura o redirect
        }
      }
      // mesma regra da LP: envio descartado pelo honeypot não vira conversão
      if (!data.hp) sessionStorage.setItem("sysaid_lead", "1");
      return { ok: true, redirecionar: "/obrigado" };
    },
  };
}
