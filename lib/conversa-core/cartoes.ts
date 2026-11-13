// ==========================================================================
// conversa-core — 12/11/2026: cartões visuais na conversa (só funções puras).
// A config declara cada cartão (tipo, depois de qual etapa, condição, textos e
// uma função pura `calcular(ctx)`); aqui o núcleo roda o `calcular`, confere o
// que voltou (número finito, faixa em ordem, nível dentro da escada...),
// formata no idioma da config e devolve a "vista" que o componente só desenha
// (ui/graficos/Cartao.tsx). Erro ou dado ruim na config = cartão some, a
// conversa segue. Nada aqui conhece cliente.
// ==========================================================================

import { avaliar, geradoValido, type Resolvedor } from "./condicoes";
import { renderTexto } from "./texto";
import type {
  CartaoConfig,
  ConfigConversa,
  Contexto,
  DadosAntesDepois,
  DadosBarras,
  DadosCena,
  DadosLinhaTempo,
  DadosMedidor,
  DadosNumero,
  FormatoNumero,
  PassoFluxo,
  TipoCartao,
} from "./tipos";

// --------------------------------------------------------------------------
// números
// --------------------------------------------------------------------------
const MENOS = "−"; // sinal de menos tipográfico

export function formatarNumero(n: number, f: FormatoNumero = {}, idioma = "pt-BR"): string {
  if (!Number.isFinite(n)) return "";
  const casas = Math.max(0, Math.min(4, f.casas ?? 0));
  const base =
    f.estilo === "moeda"
      ? new Intl.NumberFormat(idioma, { style: "currency", currency: f.moeda ?? "BRL", minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n)
      : new Intl.NumberFormat(idioma, { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);
  return `${f.prefixo ?? ""}${base}${f.sufixo ?? ""}`;
}

// arredonda estimativa pra não fingir precisão: até 20 inteiro, até 100 de 5 em
// 5, até 1.000 de 10 em 10, até 10.000 de 50 em 50, acima de 100 em 100
export function arredondar(n: number): number {
  if (!Number.isFinite(n)) return n;
  const a = Math.abs(n);
  const passo = a < 20 ? 1 : a < 100 ? 5 : a < 1000 ? 10 : a < 10000 ? 50 : 100;
  return Math.round(n / passo) * passo;
}

// teto "redondo" pra escala de régua e barras (1, 2, 2,5, 5 ou 10 × 10^k)
export function tetoRedondo(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(n)));
  const m = n / p;
  const passo = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return passo * p;
}

const pct = (v: number, max: number) => (max > 0 ? Math.max(0, Math.min(100, Math.round((v / max) * 1000) / 10)) : 0);
const finito = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const limpo = (s: unknown): string => (typeof s === "string" ? s.trim() : "");

// --------------------------------------------------------------------------
// vistas (o que o componente desenha)
// --------------------------------------------------------------------------
export type VistaNumero = {
  valor: number;
  texto: string;
  fixo: boolean; // 13/11/2026: o texto vem da config (ex.: "26 a 52", "?"): sem contagem
  regua: boolean;
  formato: FormatoNumero;
  unidade?: string;
  conta?: string;
  // régua de 0 a `escala`: onde cai o valor e a faixa (em %)
  escala: number;
  marca: number;
  faixa?: { min: number; max: number; textoMin: string; textoMax: string; inicio: number; fim: number };
};
export type VistaBarras = {
  itens: { rotulo: string; valor: number; texto: string; pct: number; destaque: boolean; nota?: string }[];
  diferenca?: { pct: number; texto: string };
};
export type VistaAntesDepois = DadosAntesDepois;
export type VistaLinhaTempo = { etapas: { quando: string; titulo: string; texto?: string }[]; atual?: number };
export type VistaMedidor = {
  niveis: { rotulo: string; texto?: string; altura: number }[];
  atual: number;
  alvo?: number;
  rotuloAtual?: string;
  rotuloAlvo?: string;
};
export type RotuloCenaPronto = { texto: string; x: number; y: number; lado: "esquerda" | "direita" | "centro"; alerta: boolean; tipo: "anotacao" | "bloco" };
export type LayoutCenaPronto = { svg: string; proporcao: number; rotulos: RotuloCenaPronto[]; placa: { x: number; y: number }; legenda: boolean };
export type VistaCena = LayoutCenaPronto & {
  descricao: string;
  logo: { src: string; alt: string } | null;
  nome?: string;
  faixa?: { texto: string };
  estreito?: LayoutCenaPronto;
};
export type VistaPorTipo = {
  numero: VistaNumero;
  barras: VistaBarras;
  antesDepois: VistaAntesDepois;
  linhaTempo: VistaLinhaTempo;
  medidor: VistaMedidor;
  cena: VistaCena;
};

export function vistaNumero(d: DadosNumero, idioma = "pt-BR"): VistaNumero | null {
  if (!d || !finito(d.valor) || (d.texto !== undefined && !limpo(d.texto))) return null;
  const formato = d.formato ?? {};
  let faixa: VistaNumero["faixa"];
  let topo = Math.abs(d.valor);
  if (d.faixa && finito(d.faixa[0]) && finito(d.faixa[1])) {
    const min = Math.min(d.faixa[0], d.faixa[1], d.valor);
    const max = Math.max(d.faixa[0], d.faixa[1], d.valor);
    topo = Math.max(topo, max);
    faixa = { min, max, textoMin: formatarNumero(min, formato, idioma), textoMax: formatarNumero(max, formato, idioma), inicio: 0, fim: 0 };
  }
  const escala = tetoRedondo(topo * 1.15);
  if (faixa) {
    faixa.inicio = pct(Math.max(0, faixa.min), escala);
    faixa.fim = pct(faixa.max, escala);
  }
  const fixo = !!limpo(d.texto);
  return {
    valor: d.valor,
    texto: fixo ? limpo(d.texto).slice(0, 24) : formatarNumero(d.valor, formato, idioma),
    fixo,
    regua: d.regua !== false,
    formato,
    unidade: limpo(d.unidade) || undefined,
    conta: limpo(d.conta) || undefined,
    escala,
    marca: pct(Math.max(0, d.valor), escala),
    faixa,
  };
}

export function vistaBarras(d: DadosBarras, idioma = "pt-BR"): VistaBarras | null {
  const itens = (d?.itens ?? []).filter((i) => limpo(i.rotulo) && finito(i.valor) && i.valor >= 0).slice(0, 6);
  if (!itens.length) return null;
  const maior = Math.max(...itens.map((i) => i.valor));
  const max = Math.max(finito(d.maximo) ? d.maximo : 0, maior);
  const f = d.formato ?? {};
  const vista: VistaBarras = {
    itens: itens.map((i) => ({ rotulo: i.rotulo.trim(), valor: i.valor, texto: formatarNumero(i.valor, f, idioma), pct: pct(i.valor, max), destaque: !!i.destaque, nota: limpo(i.nota) || undefined })),
  };
  if (d.diferenca && itens.length >= 2 && itens[0].valor > 0) {
    const p = Math.round(((itens[itens.length - 1].valor - itens[0].valor) / itens[0].valor) * 100);
    vista.diferenca = { pct: p, texto: `${p < 0 ? MENOS : p > 0 ? "+" : ""}${new Intl.NumberFormat(idioma).format(Math.abs(p))}%` };
  }
  return vista;
}

function passos(l: PassoFluxo[] | undefined): PassoFluxo[] {
  return (l ?? []).filter((p) => limpo(p?.texto)).slice(0, 6).map((p) => ({ texto: p.texto.trim(), marca: !!p.marca }));
}

export function vistaAntesDepois(d: DadosAntesDepois): VistaAntesDepois | null {
  const antes = passos(d?.antes?.passos);
  const depois = passos(d?.depois?.passos);
  if (!antes.length || !depois.length) return null;
  return { antes: { titulo: limpo(d.antes.titulo), passos: antes }, depois: { titulo: limpo(d.depois.titulo), passos: depois } };
}

export function vistaLinhaTempo(d: DadosLinhaTempo): VistaLinhaTempo | null {
  const etapas = (d?.etapas ?? [])
    .filter((e) => limpo(e.titulo))
    .slice(0, 6)
    .map((e) => ({ quando: limpo(e.quando), titulo: e.titulo.trim(), texto: limpo(e.texto) || undefined }));
  if (etapas.length < 2) return null;
  const atual = finito(d.atual) && d.atual >= 1 && d.atual <= etapas.length ? Math.round(d.atual) : undefined;
  return { etapas, atual };
}

export function vistaMedidor(d: DadosMedidor): VistaMedidor | null {
  const niveis = (d?.niveis ?? []).filter((n) => limpo(n.rotulo)).slice(0, 7);
  if (niveis.length < 2 || !finito(d.atual)) return null;
  const n = niveis.length;
  const atual = Math.max(1, Math.min(n, Math.round(d.atual)));
  const alvo = finito(d.alvo) ? Math.max(atual, Math.min(n, Math.round(d.alvo))) : undefined;
  return {
    // degraus de 28% a 100% da altura
    niveis: niveis.map((x, i) => ({ rotulo: x.rotulo.trim(), texto: limpo(x.texto) || undefined, altura: Math.round(28 + (72 * i) / (n - 1)) })),
    atual,
    alvo: alvo && alvo > atual ? alvo : undefined,
    rotuloAtual: limpo(d.rotuloAtual) || undefined,
    rotuloAlvo: limpo(d.rotuloAlvo) || undefined,
  };
}

// 13/11/2026: cena desenhada. O SVG vem da config (desenho pronto, nunca gerado
// na hora), mas o núcleo confere mesmo assim: tem que ser um <svg> com viewBox,
// sem script, sem atributo de evento, sem link externo nem objeto estrangeiro.
// Rótulos: até 4, até 48 caracteres, posição presa entre 0 e 100.
const SVG_PROIBIDO = /<\s*(script|foreignObject|iframe|object|embed|image|use)\b|\son\w+\s*=|javascript:|href\s*=|url\s*\(\s*['"]?\s*(https?:|\/\/)/i;
const prende = (n: number) => Math.max(0, Math.min(100, n));
export function svgSeguro(svg: unknown): svg is string {
  if (typeof svg !== "string") return false;
  const t = svg.trim();
  return /^<svg\b[^>]*\bviewBox=/i.test(t) && /<\/svg>$/i.test(t) && !SVG_PROIBIDO.test(t) && t.length <= 60000;
}
function rotulosCena(l: DadosCena["rotulos"]): RotuloCenaPronto[] {
  const todos = (l ?? []).filter((r) => limpo(r?.texto) && finito(r.x) && finito(r.y));
  // até 4 anotações (as palavras da pessoa) e até 6 nomes de bloco
  const anot = todos.filter((r) => r.tipo !== "bloco").slice(0, 4);
  const blocos = todos.filter((r) => r.tipo === "bloco").slice(0, 6);
  return [...blocos, ...anot].map((r) => ({ texto: r.texto.trim().slice(0, 48), x: prende(r.x), y: prende(r.y), lado: r.lado ?? "direita", alerta: !!r.alerta, tipo: r.tipo === "bloco" ? "bloco" : "anotacao" }));
}
function proporcaoDe(p: unknown, padrao: number): number {
  return finito(p) && p > 0.5 && p < 4 ? p : padrao;
}
function placaDe(p: { x: number; y: number } | undefined): { x: number; y: number } {
  return p && finito(p.x) && finito(p.y) ? { x: prende(p.x), y: prende(p.y) } : { x: 3, y: 4 };
}
export function vistaCena(d: DadosCena): VistaCena | null {
  if (!d || !svgSeguro(d.svg)) return null;
  const logo = d.logo && limpo(d.logo.src) && /^(https:\/\/|\/)/.test(d.logo.src) ? { src: d.logo.src.trim(), alt: limpo(d.logo.alt) } : null;
  const e = d.estreito;
  const estreito: LayoutCenaPronto | undefined =
    e && svgSeguro(e.svg) ? { svg: e.svg.trim(), proporcao: proporcaoDe(e.proporcao, 4 / 3), rotulos: rotulosCena(e.rotulos), placa: placaDe(e.placa), legenda: !!e.legenda } : undefined;
  return {
    svg: d.svg.trim(),
    proporcao: proporcaoDe(d.proporcao, 16 / 9),
    descricao: limpo(d.descricao) || "Desenho",
    rotulos: rotulosCena(d.rotulos),
    logo,
    nome: limpo(d.nome) || undefined,
    faixa: d.faixa && limpo(d.faixa.texto) ? { texto: limpo(d.faixa.texto).slice(0, 80) } : undefined,
    placa: placaDe(d.placa),
    legenda: false,
    estreito,
  };
}

// valores calculados que os textos do cartão podem usar como {{chave}}
export function extrasDoCartao<K extends TipoCartao>(tipo: K, v: VistaPorTipo[K]): Record<string, string | number> {
  if (tipo === "numero") {
    const x = v as VistaNumero;
    return { valor: x.texto, unidade: x.unidade ?? "", min: x.faixa?.textoMin ?? x.texto, max: x.faixa?.textoMax ?? x.texto };
  }
  if (tipo === "barras") {
    const x = v as VistaBarras;
    return { diferenca: x.diferenca?.texto ?? "", primeiro: x.itens[0]?.texto ?? "", ultimo: x.itens[x.itens.length - 1]?.texto ?? "" };
  }
  if (tipo === "medidor") {
    const x = v as VistaMedidor;
    return { nivel: x.atual, nivelRotulo: x.niveis[x.atual - 1].rotulo, alvo: x.alvo ?? "", alvoRotulo: x.alvo ? x.niveis[x.alvo - 1].rotulo : "", total: x.niveis.length };
  }
  if (tipo === "linhaTempo") return { etapas: (v as VistaLinhaTempo).etapas.length };
  if (tipo === "cena") return { nome: (v as VistaCena).nome ?? "" };
  return {};
}

// 13/11/2026: o cartão numa linha de texto (transcrição, registro, ficha)
export function resumoCartao(c: CartaoPronto): string {
  switch (c.tipo) {
    case "numero": {
      const v = c.vista;
      const faixa = v.faixa ? ` (${v.faixa.textoMin} a ${v.faixa.textoMax})` : "";
      return `${v.texto}${v.unidade ? ` ${v.unidade}` : ""}${faixa}${v.conta ? ` · ${v.conta}` : ""}`;
    }
    case "barras":
      return c.vista.itens.map((i) => `${i.rotulo}: ${i.texto}`).join(" · ");
    case "antesDepois":
      return `${c.vista.antes.titulo}: ${c.vista.antes.passos.map((p) => p.texto).join(" → ")} | ${c.vista.depois.titulo}: ${c.vista.depois.passos.map((p) => p.texto).join(" → ")}`;
    case "linhaTempo":
      return c.vista.etapas.map((e) => `${e.quando ? `${e.quando}: ` : ""}${e.titulo}`).join(" · ");
    case "medidor": {
      const v = c.vista;
      return `nível ${v.atual} de ${v.niveis.length} (${v.niveis[v.atual - 1].rotulo})${v.alvo ? ` → ${v.alvo} (${v.niveis[v.alvo - 1].rotulo})` : ""}`;
    }
    case "cena":
      return `${c.vista.descricao}${c.vista.rotulos.some((r) => r.tipo === "anotacao") ? ` · rótulos: ${c.vista.rotulos.filter((r) => r.tipo === "anotacao").map((r) => `“${r.texto}”`).join(", ")}` : ""}${c.vista.nome ? ` · ${c.vista.nome}` : ""}`;
    default:
      return "";
  }
}

// --------------------------------------------------------------------------
// resolver: config + contexto → cartões prontos pra desenhar
// --------------------------------------------------------------------------
type Textos = { fala?: string; rotulo?: string; titulo?: string; legenda?: string };
export type CartaoPronto = { [K in TipoCartao]: { id: string; tipo: K; apos: string; naEntrega: boolean; soNaEntrega: boolean; idioma: string; vista: VistaPorTipo[K] } & Textos }[TipoCartao];

function vistaDe(c: CartaoConfig, ctx: Contexto, idioma: string): VistaPorTipo[TipoCartao] | null {
  let d: unknown;
  try {
    d = c.calcular(ctx);
  } catch {
    return null; // erro na função da config: o cartão some, a conversa segue
  }
  if (!d || typeof d !== "object") return null;
  switch (c.tipo) {
    case "numero":
      return vistaNumero(d as DadosNumero, idioma);
    case "barras":
      return vistaBarras(d as DadosBarras, idioma);
    case "antesDepois":
      return vistaAntesDepois(d as DadosAntesDepois);
    case "linhaTempo":
      return vistaLinhaTempo(d as DadosLinhaTempo);
    case "medidor":
      return vistaMedidor(d as DadosMedidor);
    case "cena":
      return vistaCena(d as DadosCena);
    default:
      return null;
  }
}

export function resolverCartao(c: CartaoConfig, ctx: Contexto, variavel?: Resolvedor, idioma = "pt-BR"): CartaoPronto | null {
  if (!avaliar(c.quando, ctx, variavel)) return null;
  const vista = vistaDe(c, ctx, idioma);
  if (!vista) return null;
  const extras = extrasDoCartao(c.tipo, vista);
  const g = c.gerado;
  const valeGerado = !!g && geradoValido(ctx, g.id);
  const texto = (campo: keyof Textos): string | undefined => {
    const chave = g?.[campo];
    if (valeGerado && chave) {
      const t = ctx.gerados?.[g!.id]?.textos?.[chave];
      if (t && t.trim()) return t.trim();
    }
    return renderTexto(c[campo], ctx, variavel, extras).trim() || undefined;
  };
  return {
    id: c.id,
    tipo: c.tipo,
    apos: c.apos,
    naEntrega: c.naEntrega !== false || !!c.soNaEntrega,
    soNaEntrega: !!c.soNaEntrega,
    idioma,
    vista,
    fala: texto("fala"),
    rotulo: texto("rotulo"),
    titulo: texto("titulo"),
    legenda: texto("legenda"),
  } as CartaoPronto;
}

// os cartões das etapas já respondidas, na ordem da conversa (e, na mesma
// etapa, na ordem da config)
export function resolverCartoes(config: ConfigConversa, ctx: Contexto, respondidas: string[], variavel?: Resolvedor): CartaoPronto[] {
  const lista = config.cartoes ?? [];
  if (!lista.length) return [];
  const idioma = config.idioma ?? "pt-BR";
  const ordem = new Map(respondidas.map((id, i) => [id, i]));
  return lista
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => ordem.has(c.apos))
    .sort((a, b) => ordem.get(a.c.apos)! - ordem.get(b.c.apos)! || a.i - b.i)
    .map(({ c }) => resolverCartao(c, ctx, variavel, idioma))
    .filter((x): x is CartaoPronto => !!x);
}
