// ==========================================================================
// Qualifica v2 · busca genérica — CARTÕES e LISTAS DO DOCUMENTO da SysAid
// (13/11/2026). Funções puras sobre o contexto; textos do arquivo de conteúdo
// do sysaid-growth (_growth/qualifica-fluxo-generico-conteudo-2026-11-13.md).
//   - cena da dor (passo 2) e cena com o logo (depois do papel/ferramenta)
//   - a conta (passo 7)
//   - maturidade e etapas: SÓ no documento (decisão do Fernando)
//   - o que entra em cada seção do documento (itens)
// ==========================================================================

import { geradoValido } from "../conversa-core/condicoes";
import type { CartaoConfig, Condicao, Contexto, DadosLinhaTempo, DadosMedidor, DadosNumero, ItemDocumento } from "../conversa-core/tipos";
import { cenaSysaid } from "./cenas-sysaid";
import {
  CAPACIDADES,
  CONSEQUENCIAS,
  DORES,
  type CapacidadeId,
  type DorId,
  capacidadesDoCaso,
  consequenciaTexto,
  consequencias,
  conta,
  dorAtual,
  dorP1,
  dorPrincipal,
  dores,
  fraseVolume,
  payoffs,
  pedido,
  horariosPedidos,
  querTexto,
  resumoDuasLinhas,
} from "./generica-sysaid";
import { listaNatural } from "../conversa-core/selecao";

const maiuscula = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

// --------------------------------------------------------------------------
// 14/11/2026 (direção A): a cena tem 3 atos (hoje → onde quebra → o que isso
// causa / com a SysAid) e as palavras da pessoa vão nos cartões embaixo.
// "Hoje" e "onde quebra" vêm das anotações do Haiku quando a geração vale e é
// da mesma dor (o prompt pede 2 ou 3 anotações: a 1ª é onde o pedido chega, a
// última é onde quebra); senão dos textos fixos da dor.
// PROVISÓRIO (sysaid-growth): os textos fixos abaixo e o remapeamento do prompt
// pra devolver {hoje, quebra, causa} direto, em vez das anotações por slot.
// --------------------------------------------------------------------------
const ATOS_FIXOS: Partial<Record<DorId, { hoje: string; quebra: string }>> = {
  perda: { hoje: "pedido chega por whatsapp, e-mail e pessoalmente", quebra: "aqui o pedido se perde" },
  complexidade: { hoje: "o time resolve por fora da ferramenta", quebra: "qualquer ajuste vira projeto" },
  sla: { hoje: "o chamado entra e ninguém acompanha o prazo", quebra: "o prazo estoura sem ninguém ver" },
  relatorio: { hoje: "a diretoria pede o número", quebra: "o número chega depois, montado na planilha" },
};
export function atosDaDor(ctx: Contexto, dor: DorId, comHaiku: boolean): { hoje: string; quebra: string } {
  const chip = DORES[dor].rotulosChip;
  const fixos = ATOS_FIXOS[dor] ?? { hoje: chip[0], quebra: chip[chip.length - 1] };
  if (comHaiku && geradoValido(ctx, "implicacao") && ctx.gerados?.implicacao?.dados?.dor === dor) {
    const a = (ctx.gerados.implicacao.listas?.anotacoes ?? []).map((x) => x.trim()).filter(Boolean);
    if (a.length >= 2) return { hoje: a[0], quebra: a[a.length - 1] };
  }
  return fixos;
}
// o 3º ato no estado 2: as consequências que a pessoa marcou, nas palavras dos chips (até 2)
export function causaTexto(ctx: Contexto): string {
  return consequencias(ctx)
    .slice(0, 2)
    .map((c) => CONSEQUENCIAS[c].triste.charAt(0).toLowerCase() + CONSEQUENCIAS[c].triste.slice(1))
    .join(" · ");
}
// o 3º ato no estado 3: a 1ª capacidade da dor, e só da lista fechada C1–C10
export function solucaoTexto(dor: DorId): string {
  const n = CAPACIDADES[DORES[dor].capacidades[0]].necessidade;
  return n.charAt(0).toLowerCase() + n.slice(1);
}

function logoDa(ctx: Contexto): { src: string; alt: string } | null {
  const e = ctx.empresa;
  return e && e.origem !== "fallback" && e.logo ? { src: e.logo, alt: e.nome } : null;
}

const cenaDaDor = (fonte: "p1" | "atual", comHaiku: boolean) => (ctx: Contexto) => {
  const d = fonte === "p1" ? dorP1(ctx) : dorAtual(ctx);
  return d ? cenaSysaid(DORES[d].cena, { estado: 1, ...atosDaDor(ctx, d, comHaiku) }) : null;
};

// estados 2 e 3: a empresa (placa, prédio na cor da marca) e, à direita, as consequências ou a SysAid
function cenaComEmpresa(ctx: Contexto, estado: 2 | 3) {
  const d = dorPrincipal(ctx);
  const empresa = (ctx.respostas.empresa ?? "").trim();
  if (!d || !empresa) return null;
  return cenaSysaid(DORES[d].cena, {
    estado,
    ...atosDaDor(ctx, d, d === dorP1(ctx)),
    causa: estado === 2 ? causaTexto(ctx) : undefined,
    causas: estado === 2 ? consequencias(ctx) : undefined,
    solucao: estado === 3 ? solucaoTexto(d) : undefined,
    empresa,
    logo: logoDa(ctx),
    cor: ctx.empresa?.cor ?? null,
  });
}
const cenaEmpresa = (ctx: Contexto) => cenaComEmpresa(ctx, 2);
const cenaResolve = (ctx: Contexto) => cenaComEmpresa(ctx, 3);

// --------------------------------------------------------------------------
// a conta (passo 7): dias de trabalho do time por ano no problema
// --------------------------------------------------------------------------
export function horasSysaid(ctx: Contexto): DadosNumero | null {
  const c = conta(ctx);
  if (!c) return null;
  const vol = fraseVolume(c.volume);
  if (!c.medido) {
    return {
      valor: 0,
      texto: "?",
      regua: false,
      conta: `Ninguém mede hoje.${vol ? ` Pelo tamanho de vocês, o normal é chegar ${vol} chamados por mês;` : ""} quanto tempo vai neles é o primeiro número que uma fila única mostra.`,
    };
  }
  const partes = [`de trabalho do time por ano · ≈ ${c.hMesTexto} h por mês`];
  if (c.semanaTime) partes.push(`≈ ${c.semanaTime} da semana do time`);
  return {
    valor: c.diasValor,
    texto: c.diasTexto,
    unidade: "dias",
    regua: false,
    conta: `${partes.join(" · ")}.${vol ? ` Pelo tamanho de vocês, o normal é chegar ${vol} chamados por mês.` : ""}`,
  };
}
export function legendaHoras(ctx: Contexto): string {
  const c = conta(ctx);
  if (!c) return "";
  const vol = "Volume: pessoas atendidas × 1,3 chamado por pessoa por mês (HDI/MetricNet, 2020).";
  if (!c.medido) return vol;
  return `Conta: ${c.horasConta} × ${c.por === "semana" ? "52" : "12"} ÷ 8 h. ${vol}`;
}

// --------------------------------------------------------------------------
// maturidade (régua do roteiro de 12/11, seção 3 C) e etapas: só no documento
// --------------------------------------------------------------------------
export const REGUA: DadosMedidor["niveis"] = [
  { rotulo: "Reativo", texto: "O pedido chega por onde dá (WhatsApp, e-mail, pessoalmente) e depende de quem lembra." },
  { rotulo: "Registrado", texto: "Tem fila e ferramenta, mas prazo e prioridade ainda dependem de alguém olhar." },
  { rotulo: "Controlado", texto: "Fila única, prazo com aviso antes de estourar, catálogo de serviços e base de conhecimento." },
  { rotulo: "Medido", texto: "Indicadores por equipe e serviço, problemas e mudanças tratados, cada máquina ligada ao chamado." },
  { rotulo: "Automatizado", texto: "O simples se resolve sozinho, fluxos rodam sem mão humana e outras áreas atendem do mesmo jeito." },
];
const DEGRAU: Record<DorId, number> = { perda: 1, complexidade: 2, sla: 2, relatorio: 2, ativos: 3, automacao: 3, ia: 3, custo: 2, esm: 4 };
export function maturidadeSysaid(ctx: Contexto): DadosMedidor | null {
  const d = dorPrincipal(ctx);
  if (!d) return null;
  const atual = DEGRAU[d];
  const alvo = Math.min(5, Math.max(3, atual + 1));
  return { niveis: REGUA, atual, alvo, rotuloAtual: "hoje", rotuloAlvo: "com as etapas 1 e 2" };
}

const ETAPA2: Record<DorId, CapacidadeId> = { perda: "C5", complexidade: "C4", sla: "C3", relatorio: "C3", ativos: "C7", automacao: "C4", custo: "C5", ia: "C6", esm: "C8" };
export function etapasSysaid(ctx: Contexto): DadosLinhaTempo | null {
  const d = dorPrincipal(ctx);
  if (!d) return null;
  const e2 = CAPACIDADES[ETAPA2[d]];
  const extra: string[] = [];
  const cs = consequencias(ctx);
  if (cs.includes("incendio") || cs.includes("prazo")) extra.push(CAPACIDADES.C9.necessidade.toLowerCase());
  if (ctx.respostas.usuarios === "mais" && d !== "esm") extra.push(CAPACIDADES.C8.necessidade.toLowerCase());
  return {
    etapas: [
      { quando: "Etapa 1", titulo: "Um lugar só pra pedir, com dono e prazo", texto: `${CAPACIDADES.C1.necessidade} e ${CAPACIDADES.C2.necessidade.toLowerCase()}.` },
      { quando: "Etapa 2", titulo: e2.necessidade, texto: `Pela ${DORES[d].nome}.` },
      { quando: "Etapa 3", titulo: CAPACIDADES.C6.necessidade, texto: extra.length ? `E também: ${listaNatural(extra)}.` : "Quando as duas primeiras estiverem rodando." },
    ],
    atual: 1,
  };
}

// --------------------------------------------------------------------------
// a declaração
// --------------------------------------------------------------------------
const NAO_DOR_LISTA: Condicao = { nao: { campo: "dor_lista", definido: true } };
const NAO_DOR_LISTA2: Condicao = { nao: { campo: "dor_lista2", definido: true } };
// as cenas pedem ~2 s de pausa: é o tempo do traço se desenhar (3 atos em sequência)
const CENA_DOR = { rotulo: "O seu atendimento hoje", fala: "Deixa eu desenhar o que você contou.", naEntrega: false, pausaMs: 2200 } as const;
// estado 2: a placa com o logo vai dentro do desenho; o rótulo em cima diz de quem é a cena
const CENA_EMPRESA = { rotulo: "O atendimento da {{empresa}} hoje", fala: "Esse é o atendimento da {{empresa}} hoje, do jeito que você contou.", pausaMs: 2200 } as const;
// estado 3 (depois do need-payoff, antes da revelação): o único desenho com a SysAid, em menta
const CENA_RESOLVE = { rotulo: "O caminho na {{empresa}}", fala: "Então o desenho fecha assim:", pausaMs: 2400 } as const;

export const CARTOES_GENERICA: CartaoConfig[] = [
  { id: "cena_dor", tipo: "cena", apos: "situacao_texto", quando: NAO_DOR_LISTA, ...CENA_DOR, calcular: cenaDaDor("p1", true) },
  { id: "cena_dor_lista", tipo: "cena", apos: "dor_lista", ...CENA_DOR, calcular: cenaDaDor("p1", false) },
  { id: "cena_dor2", tipo: "cena", apos: "dor_releitura", quando: NAO_DOR_LISTA2, ...CENA_DOR, calcular: cenaDaDor("atual", false) },
  { id: "cena_dor2_lista", tipo: "cena", apos: "dor_lista2", ...CENA_DOR, calcular: cenaDaDor("atual", false) },
  // a cena volta com o logo: depois do cargo (sem o passo da ferramenta) ou depois da ferramenta
  { id: "cena_empresa", tipo: "cena", apos: "cargo", quando: { nao: { variavel: "pergunta_ferramenta", igual: "sim" } }, ...CENA_EMPRESA, calcular: cenaEmpresa },
  { id: "cena_empresa_f", tipo: "cena", apos: "ferramenta", quando: { campo: "ferramenta", diferente: "outra" }, ...CENA_EMPRESA, calcular: cenaEmpresa },
  { id: "cena_empresa_o", tipo: "cena", apos: "ferramenta_outra", ...CENA_EMPRESA, calcular: cenaEmpresa },
  // 14/11/2026: a cena no 3º estado, depois do need-payoff (entra no documento também)
  { id: "cena_resolve", tipo: "cena", apos: "payoff", ...CENA_RESOLVE, calcular: cenaResolve },
  {
    id: "horas",
    tipo: "numero",
    apos: "tempo",
    rotulo: "A conta",
    fala: "Com o que você me disse, a conta fica assim:",
    titulo: "O que {{dor_principal_nome}} tira do time",
    legenda: "{{horas_legenda}}",
    calcular: horasSysaid,
  },
  {
    id: "maturidade",
    tipo: "medidor",
    apos: "telefone",
    soNaEntrega: true,
    rotulo: "Onde vocês estão",
    titulo: "A régua de 5 degraus",
    legenda: "Régua simplificada, inspirada em modelos de maturidade de gestão de serviços. Serve pra conversa, não é avaliação formal.",
    calcular: maturidadeSysaid,
  },
  {
    id: "etapas",
    tipo: "linhaTempo",
    apos: "telefone",
    soNaEntrega: true,
    rotulo: "Por onde começar",
    titulo: "Em três etapas",
    legenda: "Quanto cada etapa leva depende do tamanho do time e do que entra primeiro; a SysAid fecha isso na proposta.",
    calcular: etapasSysaid,
  },
];

// --------------------------------------------------------------------------
// listas do documento (seção 17 do arquivo de conteúdo)
// --------------------------------------------------------------------------
export function implicacaoDoCaso(ctx: Contexto): string {
  const d = dorPrincipal(ctx);
  if (!d) return "";
  const g = ctx.gerados?.implicacao;
  if (d === dorP1(ctx) && g && geradoValido(ctx, "implicacao") && g.dados?.dor === d && g.textos?.implicacao) return g.textos.implicacao;
  return DORES[d].implicacao;
}

export function itensOQuePesa(ctx: Contexto): ItemDocumento[] {
  const p = dorPrincipal(ctx);
  if (!p) return [];
  const itens: ItemDocumento[] = [{ titulo: maiuscula(DORES[p].nome), texto: DORES[p].nomeFala, nota: `Pelo que você contou: ${implicacaoDoCaso(ctx)}` }];
  for (const d of dores(ctx).filter((x) => x !== p)) itens.push({ titulo: maiuscula(DORES[d].nome), texto: DORES[d].nomeFala });
  return itens;
}

export function itensCausa(ctx: Contexto): ItemDocumento[] {
  const l: ItemDocumento[] = consequencias(ctx).map((c) => ({ titulo: CONSEQUENCIAS[c].triste }));
  const t = consequenciaTexto(ctx);
  if (t) l.push({ titulo: `“${t}”`, nota: "nas suas palavras" });
  return l;
}

export function itensComoResolve(ctx: Contexto): ItemDocumento[] {
  return capacidadesDoCaso(ctx).map(({ cap, motivos }) => ({ titulo: cap.necessidade, texto: cap.comoResolve, nota: `por causa de: ${listaNatural(motivos)}` }));
}

export function textoLeitura(ctx: Contexto, empresa: string): string {
  const g = ctx.gerados?.leitura;
  if (g && geradoValido(ctx, "leitura") && g.textos?.leitura) return g.textos.leitura.replace(/\b([NnDd]?[Aa]) empresa\b/g, (_m, a: string) => (empresa ? `${a} ${empresa}` : `${a} empresa`));
  return resumoDuasLinhas(ctx, empresa);
}

export function itensDiretoria(ctx: Contexto, empresa: string): ItemDocumento[] {
  const c = conta(ctx);
  const l: ItemDocumento[] = [{ titulo: "O que acontece hoje", texto: implicacaoDoCaso(ctx) }];
  if (c?.medido) l.push({ titulo: "O que isso custa", texto: `${c.diasTexto} dias de trabalho do time por ano (≈ ${c.hMesTexto} h por mês), pela conta da própria equipe.` });
  const { formas, citacao } = querTexto(ctx);
  const quer = [...formas, ...(citacao ? [`“${citacao}”`] : [])];
  if (quer.length) l.push({ titulo: "O que a equipe quer", texto: maiuscula(`${listaNatural(quer)}.`) });
  const caps = capacidadesDoCaso(ctx, 3).map((x) => x.cap.necessidade.toLowerCase());
  if (caps.length) l.push({ titulo: "Como a SysAid resolve", texto: maiuscula(`${listaNatural(caps)}.`) });
  l.push({ titulo: "O que a equipe propõe", texto: `Uma reunião com o especialista da SysAid pra ver a solução no cenário ${empresa ? `da ${empresa}` : "de vocês"}, com teste grátis antes de decidir.` });
  return l;
}

export const PERGUNTAS_DIRETORIA: ItemDocumento[] = [
  { titulo: "Quanto custa?", texto: "O preço sai do escopo: quantas pessoas atendem chamados e o que entra primeiro." },
  { titulo: "Quanto tempo leva?", texto: "Depende do tamanho do time e do que entra primeiro; vem na proposta." },
  { titulo: "E se não servir?", texto: "Dá pra testar no cenário de vocês antes de decidir." },
];

export function textoProximoPasso(ctx: Contexto): string {
  const p = pedido(ctx.respostas);
  if (p === "reuniao" || p === "orcamento") {
    const h = horariosPedidos(ctx.respostas);
    const base = p === "orcamento" ? "Orçamento pedido: sai do escopo fechado na reunião." : "Reunião pedida.";
    return h ? `${base} Horários: ${h}. O especialista confirma um dos horários.` : base;
  }
  if (p === "whatsapp") return "Preferência de contato: WhatsApp. O comercial da SysAid fala com você pelo número que você passou.";
  return "";
}

// pra ficha: o que ele quer, em linha
export function textoQuer(ctx: Contexto): string {
  return payoffs(ctx)
    .map((c) => CONSEQUENCIAS[c].feliz)
    .join(" · ");
}
