import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chaveDe, criarCache, criarJev, criarLLM, escolhaDe } from "@/lib/conversa-core/servidor";
import type { Gerado } from "@/lib/conversa-core";
import {
  CONSEQUENCIA_JEV,
  DORES_JEV_GENERICA,
  IMPLICACAO_PROMPT,
  JEV_SYSAID_GERAR,
  LEITURA_PROMPT,
  LLM_SYSAID,
  SAIDA_IMPLICACAO,
  SAIDA_LEITURA,
  SITUACAO_JEV_GENERICA,
  SYSTEM_IMPLICACAO,
  SYSTEM_LEITURA,
  ferramentaNoTexto,
  perguntasComentario,
  perguntasImplicacao,
  perguntasPrincipal,
  perguntasReleitura,
  travaAnotacao,
  travaImplicacao,
  travaLeitura,
} from "@/lib/diagnostico/servidor-sysaid";
import { DORES } from "@/lib/diagnostico/generica-sysaid";

export const runtime = "nodejs";

// Qualifica v2 · busca genérica (13/11/2026). Gerações chamadas pela conversa:
//   implicacao  passo 1, texto livre: Jev (dor, situação, consequência) + Haiku (implicação + rótulos da cena)
//   comentario  passo 2, texto no lugar do "É isso": Jev (consequência, outra dor)
//   releitura   "Não é bem isso": Jev (dor, consequência)
//   principal   mais de uma dor: Jev escolhe a de mais valor
//   leitura     no WhatsApp: Haiku escreve a leitura do caso pro documento
// Nada aqui classifica, pontua ou roteia o lead. Jev ou Haiku fora = a conversa
// segue com as reservas fixas da config. Nenhum dado pessoal vai pro Jev nem pro Haiku.

const schema = z.object({
  id: z.enum(["implicacao", "comentario", "releitura", "principal", "leitura"]),
  sessao: z.string().min(8).max(64),
  respostas: z.record(z.string(), z.string().max(2000)),
  origem: z.string().max(16),
  variaveis: z.record(z.string(), z.string().nullable()),
  extras: z.record(z.string(), z.string().max(1200)).optional(),
});

const llm = criarLLM(LLM_SYSAID);
const jev = criarJev(JEV_SYSAID_GERAR);
const cacheJev = criarCache<Record<string, string>>(LLM_SYSAID.cache.ttlMs, LLM_SYSAID.cache.maximo);
const DORES_IDS = Object.keys(DORES_JEV_GENERICA);
const CONS_IDS = Object.keys(CONSEQUENCIA_JEV);
const ATALHOS = new Set(["sim", "mais", "nao"]);

type Medicao = NonNullable<Gerado["medicao"]>;

async function perguntarJev(sessao: string, chave: string, estado: unknown, perguntas: Parameters<typeof jev.perguntar>[0]["perguntas"], ler: (r: Record<string, unknown> | null) => Record<string, string>) {
  const ja = cacheJev.get(chave);
  if (ja) return { dados: ja, origem: "ok" as const, ms: 0 };
  const rj = await jev.perguntar({ sessao, estado, perguntas });
  const dados = ler(rj.respostas as Record<string, unknown> | null);
  if (rj.origem === "ok") cacheJev.set(chave, dados);
  return { dados, origem: rj.origem, ms: rj.ms, motivo: rj.motivo };
}

function limpa(d: Record<string, string | null | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(d).filter(([, v]) => typeof v === "string" && v)) as Record<string, string>;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 422 });
  const { id, sessao, respostas: r, origem, variaveis, extras = {} } = parsed.data;
  const t0 = Date.now();
  const medicao = (llmOrigem: Medicao["llm"], jevOrigem: Medicao["jev"], custoUsd = 0): Medicao => ({ custoUsd, ms: Date.now() - t0, llm: llmOrigem, jev: jevOrigem });
  const jevOrig = (o: string): Medicao["jev"] => (o === "ok" ? "ok" : o === "desligado" ? "desligado" : "fallback");

  // ---------------------------------------------------------------- passo 1
  if (id === "implicacao") {
    const texto = (r.situacao_texto ?? "").trim();
    if (texto.length < 10) return NextResponse.json({ ok: false, error: "texto curto" }, { status: 422 });
    const j = await perguntarJev(sessao, chaveDe("imp", texto), { origem, intencao_da_busca: variaveis.intencao ?? null, texto_livre: texto }, perguntasImplicacao(), (x) =>
      limpa({
        dor: escolhaDe(x, "dor", DORES_IDS, 0.35),
        situacao: escolhaDe(x, "situacao", Object.keys(SITUACAO_JEV_GENERICA), 0.4),
        consequencia: escolhaDe(x, "consequencia", CONS_IDS, 0.5),
      })
    );
    const dor = j.dados.dor && j.dados.dor !== "vaga" ? j.dados.dor : "";
    const dados = limpa({
      dor,
      situacao: j.dados.situacao,
      consequencia: j.dados.consequencia && j.dados.consequencia !== "nenhuma" ? j.dados.consequencia : "",
      ferramenta_nome: ferramentaNoTexto(texto),
    });
    const textos: Record<string, string> = {};
    let listas: Record<string, string[]> | undefined;
    let llmOrigem: Medicao["llm"] = "desligado";
    let custo = 0;
    if (dor && DORES[dor as keyof typeof DORES]) {
      const d = DORES[dor as keyof typeof DORES];
      const rl = await llm.gerar({
        sessao,
        chave: ["implicacao", dor, texto],
        system: SYSTEM_IMPLICACAO,
        prompt: IMPLICACAO_PROMPT({ nome: d.nome, descricao: DORES_JEV_GENERICA[dor], texto }),
        schema: SAIDA_IMPLICACAO,
        validar: (v) => {
          if (travaImplicacao(v.implicacao, dor)) return { ok: true };
          log({ id, trava: "implicacao", texto: v.implicacao });
          return { ok: false, motivo: "implicacao" };
        },
      });
      llmOrigem = rl.origem;
      custo = rl.custoUsd;
      if (rl.valor) {
        textos.implicacao = rl.valor.implicacao.trim();
        const anot = rl.valor.anotacoes.map((a) => a.trim().toLowerCase().replace(/[.]$/, "")).filter((a) => travaAnotacao(a, texto));
        if (anot.length >= 2) listas = { anotacoes: anot.slice(0, 3) };
      }
      log({ id, jev: j.origem, jevMs: j.ms, llm: rl.origem, llmMs: rl.ms, custo: rl.custoUsd, motivo: rl.motivo, dor, anotacoes: listas?.anotacoes?.length ?? 0 });
    } else log({ id, jev: j.origem, jevMs: j.ms, dor: j.dados.dor ?? null, motivo: j.motivo });
    const g: Gerado = { id, para: { situacao_texto: texto }, paraPrefixo: ["situacao_texto"], textos, listas, dados, origem: "servidor", medicao: medicao(llmOrigem, jevOrig(j.origem), custo) };
    return NextResponse.json(g);
  }

  // ---------------------------------------------------------------- passo 2 (texto livre)
  if (id === "comentario") {
    const texto = (r.implicacao ?? "").trim();
    if (texto.length < 8 || ATALHOS.has(texto)) return NextResponse.json({ ok: false, error: "sem texto" }, { status: 422 });
    const j = await perguntarJev(sessao, chaveDe("com", texto), { texto_do_problema: r.situacao_texto ?? "", comentario: texto }, perguntasComentario(), (x) =>
      limpa({ consequencia: escolhaDe(x, "consequencia", CONS_IDS, 0.5), outra_dor: escolhaDe(x, "outra_dor", [...DORES_IDS, "nenhuma"], 0.45) })
    );
    log({ id, jev: j.origem, ms: j.ms, dados: j.dados });
    const dados = limpa({
      consequencia: j.dados.consequencia && j.dados.consequencia !== "nenhuma" ? j.dados.consequencia : "",
      outra_dor: j.dados.outra_dor && !["nenhuma", "vaga"].includes(j.dados.outra_dor) ? j.dados.outra_dor : "",
    });
    return NextResponse.json({ id, para: { implicacao: texto }, paraPrefixo: ["implicacao"], textos: {}, dados, origem: "servidor", medicao: medicao("desligado", jevOrig(j.origem)) } satisfies Gerado);
  }

  // ---------------------------------------------------------------- "Não é bem isso"
  if (id === "releitura") {
    const texto = (r.dor_releitura ?? "").trim();
    if (texto.length < 10) return NextResponse.json({ ok: false, error: "texto curto" }, { status: 422 });
    const j = await perguntarJev(sessao, chaveDe("rel", texto), { texto_livre: texto, primeiro_texto: r.situacao_texto ?? "" }, perguntasReleitura(), (x) =>
      limpa({ dor: escolhaDe(x, "dor", DORES_IDS, 0.35), consequencia: escolhaDe(x, "consequencia", CONS_IDS, 0.5) })
    );
    log({ id, jev: j.origem, ms: j.ms, dados: j.dados });
    const dados = limpa({ dor: j.dados.dor && j.dados.dor !== "vaga" ? j.dados.dor : "", consequencia: j.dados.consequencia && j.dados.consequencia !== "nenhuma" ? j.dados.consequencia : "" });
    return NextResponse.json({ id, para: { dor_releitura: texto }, paraPrefixo: ["dor_releitura"], textos: {}, dados, origem: "servidor", medicao: medicao("desligado", jevOrig(j.origem)) } satisfies Gerado);
  }

  // ---------------------------------------------------------------- dor principal
  if (id === "principal") {
    const dores = (extras.dores ?? "").split("|").filter((d) => DORES_JEV_GENERICA[d] && d !== "vaga");
    if (dores.length < 2) return NextResponse.json({ ok: false, error: "uma dor só" }, { status: 422 });
    const estado = { dores_escolhidas: dores, consequencias_marcadas: extras.consequencias ?? "", texto_do_problema: r.situacao_texto ?? "", outra_coisa: extras.outras ?? "" };
    const j = await perguntarJev(sessao, chaveDe("pri", dores.join("|"), extras.consequencias ?? "", r.situacao_texto ?? ""), estado, perguntasPrincipal(dores), (x) => limpa({ principal: escolhaDe(x, "principal", dores, 0) }));
    log({ id, jev: j.origem, ms: j.ms, dados: j.dados });
    if (!j.dados.principal) return NextResponse.json({ ok: false, motivo: "jev" });
    const para = Object.fromEntries(["situacao_texto", "dor_lista", "implicacao", "dor_releitura", "dor_lista2", "implicacao2", "dores_mais", "consequencias"].map((k) => [k, (r[k] ?? "").trim()]));
    return NextResponse.json({ id, para, textos: {}, dados: j.dados, origem: "servidor", medicao: medicao("desligado", jevOrig(j.origem)) } satisfies Gerado);
  }

  // ---------------------------------------------------------------- leitura do caso (documento)
  const entrada = {
    "problema principal": extras.dor_principal ?? "",
    "outros problemas": extras.outras_dores ?? "",
    implicação: extras.implicacao ?? "",
    "o que isso causa": extras.consequencias ?? "",
    "o que a equipe quer": extras.quer ?? "",
    "tempo que o time perde": extras.horas ?? "",
    porte: extras.porte ?? "",
  };
  if (!entrada["problema principal"]) return NextResponse.json({ ok: false, error: "sem caso" }, { status: 422 });
  const prompt = LEITURA_PROMPT(entrada);
  const rl = await llm.gerar({
    sessao,
    chave: ["leitura", prompt],
    system: SYSTEM_LEITURA,
    prompt,
    schema: SAIDA_LEITURA,
    validar: (v) => {
      if (travaLeitura(v.leitura, prompt)) return { ok: true };
      log({ id, trava: "leitura", texto: v.leitura });
      return { ok: false, motivo: "leitura" };
    },
  });
  log({ id, llm: rl.origem, ms: rl.ms, custo: rl.custoUsd, motivo: rl.motivo });
  if (!rl.valor) return NextResponse.json({ ok: false, motivo: `llm ${rl.motivo ?? rl.origem}` });
  return NextResponse.json({
    id,
    para: { payoff: (r.payoff ?? "").trim() },
    textos: { leitura: rl.valor.leitura.trim() },
    origem: rl.origem === "cache" ? "cache" : "servidor",
    medicao: medicao(rl.origem, "desligado", rl.custoUsd),
  } satisfies Gerado);
}

function log(d: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") console.log("[qualifica/gerar]", JSON.stringify(d));
}
