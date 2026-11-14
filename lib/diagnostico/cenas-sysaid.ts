// ==========================================================================
// Qualifica v2 · busca genérica — as 4 CENAS da SysAid na direção A, "três
// atos em neon de console" (14/11/2026, Severino; aprovada pelo Fernando depois
// da análise do vídeo dos Maestros, em fujiex/produtos/formulario-inteligente/
// _contexto/analise-cenas-video-2026-11-14.md). Substitui o esquema técnico
// de 13/11 (reprovado).
//
// A gramática: sempre a mesma frase em 3 atos, lida da esquerda pra direita.
//   1º ato, "hoje" (ardósia)        como o pedido chega / a empresa (placa + prédio na cor da marca)
//   2º ato, "onde quebra" (coral)   a dor dentro de um anel grande, com o ✕ no ponto exato
//   3º ato (muda com a conversa)    estado 1: anel tracejado vazio ("…": a próxima pergunta é "é isso?")
//                                   estado 2: o que isso causa (as consequências que a pessoa marcou)
//                                   estado 3: com a SysAid (menta, o ÚNICO momento com a solução)
// Poucos objetos, grandes; traço de 2,6 px com brilho; o traço se desenha na
// entrada (classe cs-d + pathLength="1", em ordem de leitura, --t em segundos).
// As palavras da pessoa NUNCA entram no SVG: vão nos 3 cartões embaixo (`atos`).
// Texto no desenho só o que não é dela ("?" e a etiqueta "com a SysAid").
//
// Cada cena é função da largura: 640 × 360 (desktop, PDF) e 480 × 360 (celular,
// 4:3). Só classes cs-* (o tema pinta: escuro na tela, papel claro no PDF).
// ==========================================================================

import type { AtoCena, DadosCena } from "../conversa-core/tipos";

export type CenaId = "perda" | "complexidade" | "sla" | "relatorio";
export type CausaId = "reclama" | "incendio" | "prazo" | "mostrar" | "contratar";
export type CanalId = "mensagem" | "email" | "telefone" | "pessoalmente";
export type EstadoCena = 1 | 2 | 3;
export type OpcoesCena = {
  estado: EstadoCena;
  hoje: string; // 1º ato (palavras da pessoa ou do chip)
  quebra: string; // 2º ato
  causa?: string; // 3º ato no estado 2
  solucao?: string; // 3º ato no estado 3 (só capacidades C1–C10)
  causas?: CausaId[]; // ícones do 3º ato no estado 2 (até 3)
  canais?: CanalId[]; // por onde o pedido chega (1º ato); padrão por cena
  empresa?: string; // placa (nome) a partir do estado 2
  logo?: { src: string; alt: string } | null; // placa (logo) a partir do estado 2
  cor?: string | null; // cor da marca (hex); o núcleo decide se serve
};

const H = 360;
type Pt = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;
const rad = (a: number) => ((a - 90) * Math.PI) / 180;
const pol = (cx: number, cy: number, r: number, a: number): Pt => [f(cx + r * Math.cos(rad(a))), f(cy + r * Math.sin(rad(a)))];

// --------------------------------------------------------------------------
// primitivas. Classes do núcleo: cs-s traço, cs-sf traço com fundo, cs-t fino,
// cs-tr tracejado, cs-p fill, cs-i aparece depois do traço, cs-d se desenha.
// --------------------------------------------------------------------------
const PL = 'pathLength="1" ';
const P = (cls: string, d: string, desenha = true) => `<path class="${cls}${desenha ? " cs-d" : ""}" ${desenha ? PL : ""}d="${d}"/>`;
const Ci = (cls: string, x: number, y: number, r: number, desenha = true) => `<circle class="${cls}${desenha ? " cs-d" : ""}" ${desenha ? PL : ""}cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
const Rt = (cls: string, x: number, y: number, w: number, h: number, rx = 6, desenha = true) =>
  `<rect class="${cls}${desenha ? " cs-d" : ""}" ${desenha ? PL : ""}x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}"/>`;
const ponto = (x: number, y: number, r = 2.4) => `<circle class="cs-p cs-i" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
const ato = (papel: string, t: number, corpo: string, brilho = true) => `<g class="cs-ato cs-ato--${papel}${brilho ? " cs-brilho" : ""}" style="--t:${t}">${corpo}</g>`;
function setaPonta(x: number, y: number, ang: number, cls = "cs-s"): string {
  const [a1, a2] = pol(x, y, 9, ang + 150);
  const [b1, b2] = pol(x, y, 9, ang - 150);
  return P(cls, `M${a1} ${a2}L${f(x)} ${f(y)}L${b1} ${b2}`);
}
const setaBaixo = (x: number, y: number) => P("cs-t", `M${x - 4} ${y - 5}L${x} ${y}L${x + 4} ${y - 5}`);

// --------------------------------------------------------------------------
// peças (ícones grandes, sem rosto, sem marca de terceiro)
// --------------------------------------------------------------------------
function envelope(x: number, y: number, w = 52, h = 34): string {
  return Rt("cs-sf", x, y, w, h, 5) + P("cs-t", `M${x + 3} ${y + 4}L${f(x + w / 2)} ${f(y + h * 0.6)}L${x + w - 3} ${y + 4}`);
}
function balao(x: number, y: number, w: number, h: number): string {
  const d = `M${x + 6} ${y}H${x + w - 6}Q${x + w} ${y} ${x + w} ${y + 6}V${y + h - 6}Q${x + w} ${y + h} ${x + w - 6} ${y + h}H${x + 16}L${x + 7} ${y + h + 7}L${x + 9} ${y + h}H${x + 6}Q${x} ${y + h} ${x} ${y + h - 6}V${y + 6}Q${x} ${y} ${x + 6} ${y}Z`;
  return P("cs-sf", d) + P("cs-t", `M${x + 8} ${f(y + h * 0.38)}H${x + w - 8}M${x + 8} ${f(y + h * 0.66)}H${f(x + w * 0.55)}`);
}
function telefone(x: number, y: number, w: number, h: number): string {
  return Rt("cs-sf", x, y, w, h, 5) + P("cs-t", `M${f(x + w * 0.35)} ${y + 5}H${f(x + w * 0.65)}`) + P("cs-t", `M${x - 5} ${f(y + h * 0.3)}v${f(h * 0.22)}M${x + w + 5} ${f(y + h * 0.3)}v${f(h * 0.22)}`);
}
function pessoa(cx: number, base: number, s: number): string {
  const ombro = `M${f(cx - s * 0.42)} ${base}V${f(base - s * 0.16)}Q${f(cx - s * 0.42)} ${f(base - s * 0.44)} ${cx} ${f(base - s * 0.44)}Q${f(cx + s * 0.42)} ${f(base - s * 0.44)} ${f(cx + s * 0.42)} ${f(base - s * 0.16)}V${base}Z`;
  return Ci("cs-sf", cx, base - s * 0.7, s * 0.2) + P("cs-sf", ombro);
}
function chamado(x: number, y: number, w = 84, h = 58): string {
  return Rt("cs-sf", x, y, w, h, 7) + P("cs-t", `M${x + 14} ${y + 21}H${x + w - 32}M${x + 14} ${y + 36}H${x + w - 46}`) + Ci("cs-t", x + w - 17, y + 19, 7.5) + P("cs-t", `M${x + w - 17} ${y + 14.5}V${y + 19}H${x + w - 13.5}`);
}
// relógio: 12 traços, ponteiro passado da marca; a marca e o quanto passou em coral
function relogio(cx: number, cy: number, r: number, ponteiro: number, marca: number): string {
  let ticks = "";
  for (let i = 0; i < 12; i++) {
    const [a, b] = pol(cx, cy, r - 4, i * 30);
    const [c, d] = pol(cx, cy, r - (i % 3 ? 8 : 13), i * 30);
    ticks += `M${a} ${b}L${c} ${d}`;
  }
  const [hx, hy] = pol(cx, cy, r * 0.74, ponteiro);
  const [m1, m2] = pol(cx, cy, r - 14, marca);
  const [m3, m4] = pol(cx, cy, r + 3, marca);
  const [o1, o2] = pol(cx, cy, r + 11, marca + 6);
  const [o3, o4] = pol(cx, cy, r + 11, ponteiro - 6);
  return (
    Ci("cs-s", cx, cy, r) +
    P("cs-t", ticks) +
    P("cs-s", `M${cx} ${cy}L${hx} ${hy}`) +
    ponto(cx, cy, 3.2) +
    `<g class="cs-ato cs-ato--quebra cs-brilho">${P("cs-s", `M${m1} ${m2}L${m3} ${m4}`)}${P("cs-t cs-tr", `M${o1} ${o2}A${r + 11} ${r + 11} 0 0 1 ${o3} ${o4}`)}</g>`
  );
}
function sinoBase(cx: number, cy: number, s: number): string {
  const b = `M${f(cx - s * 0.62)} ${f(cy + s * 0.5)}H${f(cx + s * 0.62)}L${f(cx + s * 0.48)} ${f(cy + s * 0.28)}V${f(cy - s * 0.1)}Q${f(cx + s * 0.48)} ${f(cy - s * 0.62)} ${cx} ${f(cy - s * 0.62)}Q${f(cx - s * 0.48)} ${f(cy - s * 0.62)} ${f(cx - s * 0.48)} ${f(cy - s * 0.1)}V${f(cy + s * 0.28)}Z`;
  return P("cs-sf", b) + P("cs-t", `M${f(cx - s * 0.16)} ${f(cy + s * 0.68)}Q${cx} ${f(cy + s * 0.86)} ${f(cx + s * 0.16)} ${f(cy + s * 0.68)}`);
}
const sinoCortado = (cx: number, cy: number, s: number) => sinoBase(cx, cy, s) + `<g class="cs-ato cs-ato--quebra cs-brilho">${P("cs-s", `M${f(cx - s * 0.9)} ${f(cy - s * 0.9)}L${f(cx + s * 0.9)} ${f(cy + s * 0.9)}`)}</g>`;
const sinoTocando = (cx: number, cy: number, s: number) =>
  sinoBase(cx, cy, s) + P("cs-t", `M${f(cx - s * 0.95)} ${f(cy - s * 0.3)}Q${f(cx - s * 1.1)} ${cy} ${f(cx - s * 0.95)} ${f(cy + s * 0.3)}M${f(cx + s * 0.95)} ${f(cy - s * 0.3)}Q${f(cx + s * 1.1)} ${cy} ${f(cx + s * 0.95)} ${f(cy + s * 0.3)}`);
// o ✕: onde quebra (pulsa uma vez; não se desenha, aparece inteiro)
function xis(cx: number, cy: number, t: number, r = 13): string {
  return `<g class="cs-ato cs-ato--quebra cs-brilho cs-pulso" style="--t:${t}">${Ci("cs-sf", cx, cy, r, false)}${P("cs-s", `M${f(cx - 5.5)} ${f(cy - 5.5)}L${f(cx + 5.5)} ${f(cy + 5.5)}M${f(cx + 5.5)} ${f(cy - 5.5)}L${f(cx - 5.5)} ${f(cy + 5.5)}`, false)}</g>`;
}
function bandeja(x: number, y: number, w: number, h: number): string {
  const d = `M${x} ${f(y + h * 0.4)}L${f(x + w * 0.16)} ${y}H${f(x + w * 0.84)}L${x + w} ${f(y + h * 0.4)}V${y + h}H${x}Z`;
  const slot = `M${x} ${f(y + h * 0.4)}H${f(x + w * 0.3)}L${f(x + w * 0.37)} ${f(y + h * 0.64)}H${f(x + w * 0.63)}L${f(x + w * 0.7)} ${f(y + h * 0.4)}H${x + w}`;
  return P("cs-sf", d) + P("cs-t", slot);
}
function miniChamado(x: number, y: number, w: number, h: number, rot: number): string {
  return `<g transform="rotate(${rot} ${f(x + w / 2)} ${f(y + h / 2)})">${Rt("cs-sf", x, y, w, h, 3)}${P("cs-t", `M${x + 6} ${f(y + h * 0.4)}H${x + w - 8}M${x + 6} ${f(y + h * 0.68)}H${f(x + w * 0.55)}`)}</g>`;
}
const exclama = (cx: number, cy: number, s: number) => `<g class="cs-ato cs-ato--quebra cs-brilho">${P("cs-s", `M${cx} ${f(cy - s * 0.45)}V${f(cy + s * 0.12)}`)}${ponto(cx, cy + s * 0.38, 2.2)}</g>`;
function engrenagem(cx: number, cy: number, r: number): string {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const [a, b] = pol(cx, cy, r, i * 45 - 8);
    const [c, e] = pol(cx, cy, r + 9, i * 45 - 5);
    const [g, h] = pol(cx, cy, r + 9, i * 45 + 5);
    const [k, l] = pol(cx, cy, r, i * 45 + 8);
    d += `M${a} ${b}L${c} ${e}L${g} ${h}L${k} ${l}`;
  }
  return Ci("cs-s", cx, cy, r) + P("cs-s", d) + Ci("cs-t", cx, cy, r * 0.38);
}
// chave inglesa diagonal, presa na engrenagem
function chave(x1: number, y1: number, x2: number, y2: number): string {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return `<g transform="rotate(${f(ang)} ${f(x1)} ${f(y1)})">${P("cs-sf", `M${x1} ${y1 - 5}H${f(x1 + len - 22)}V${y1 + 5}H${x1}Z`)}${P("cs-sf", `M${f(x1 + len - 22)} ${y1 - 13}H${f(x1 + len)}V${y1 - 3}L${f(x1 + len - 9)} ${y1}L${f(x1 + len)} ${y1 + 3}V${y1 + 13}H${f(x1 + len - 22)}Z`)}</g>`;
}
function retrovisor(x: number, y: number, w: number, h: number): { svg: string; vao: Pt } {
  const px = (t: number) => f(x + 14 + t * (w - 28));
  const base = y + h - 18;
  const pts: Pt[] = [0, 0.13, 0.26, 0.4, 0.52, 0.64].map((t, i) => [px(t), f(base - [12, 22, 16, 30, 24, 36][i])]);
  const linha = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join("");
  const ult = pts[pts.length - 1];
  const hoje = px(1);
  const svg =
    Rt("cs-sf", x, y, w, h, 16) +
    P("cs-t", `M${x + 14} ${base}H${x + w - 14}`) +
    P("cs-s", linha) +
    pts.map((p) => ponto(p[0], p[1], 2.2)).join("") +
    `<g class="cs-ato cs-ato--quebra">${P("cs-t cs-tr", `M${f(ult[0] + 8)} ${ult[1]}H${f(hoje - 16)}`)}</g>` +
    P("cs-t", `M${ult[0]} ${base - 4}V${base + 4}M${hoje} ${base - 4}V${base + 4}`);
  return { svg, vao: [f((ult[0] + hoje) / 2 + 4), ult[1]] };
}
// a ferramenta atual: caixa com cabeçalho, chaves de configuração e um cadeado
function ferramentaCaixa(x: number, y: number, w: number, h: number): string {
  let s = Rt("cs-sf", x, y, w, h, 6) + P("cs-t", `M${x} ${y + 18}H${x + w}`);
  const linhas = Math.max(2, Math.min(3, Math.floor((h - 30) / 24)));
  for (let i = 0; i < linhas; i++) {
    const yy = y + 30 + i * 24;
    s += Rt("cs-t", x + 12, yy, 22, 11, 5.5) + ponto(i % 2 ? x + 28 : x + 18, yy + 5.5, 3) + P("cs-t", `M${x + 42} ${yy + 5.5}H${x + w - 14}`);
  }
  const cx = x + w - 16;
  const cy = y + h - 16;
  s += Rt("cs-sf", cx - 9, cy - 4, 18, 14, 3) + P("cs-t", `M${cx - 5} ${cy - 4}V${cy - 9}Q${cx - 5} ${cy - 15} ${cx} ${cy - 15}Q${cx + 5} ${cy - 15} ${cx + 5} ${cy - 9}V${cy - 4}`);
  return s;
}
function documentoPergunta(x: number, y: number, w: number, h: number): string {
  return Rt("cs-sf", x, y, w, h, 4) + P("cs-t", `M${x + 9} ${y + 14}H${x + w - 9}M${x + 9} ${y + 24}H${x + w - 16}`) + `<text class="cs-tx cs-i" x="${f(x + w / 2)}" y="${f(y + h - 12)}" text-anchor="middle" font-size="18">?</text>`;
}
function diretoria(x: number, y: number, w: number, h: number): string {
  return Rt("cs-sf", x, y, w, h, 5) + [0.25, 0.5, 0.75].map((t) => pessoa(x + w * t, y + h - 8, 26)).join("");
}
// prédio da empresa: grade de janelas; devolve o centro de cada janela
function predio(x: number, y: number, w: number, h: number, cols: number, rows: number): { svg: string; janela: (c: number, r: number) => Pt } {
  const cw = (w - 16) / cols;
  const rh = (h - 20) / rows;
  let s = Rt("cs-sf", x, y, w, h, 3);
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) s += Rt("cs-t", x + 8 + c * cw + 3, y + 10 + r * rh + 3, cw - 6, rh - 6, 2);
  s += Rt("cs-t", x + w / 2 - 12, y + h - 32, 24, 32, 2); // porta
  return { svg: s, janela: (c, r) => [f(x + 8 + c * cw + 3 + (cw - 6) / 2), f(y + 10 + r * rh + 3 + (rh - 6) / 2)] };
}
const canalPequeno = (c: CanalId, cx: number, cy: number): string =>
  c === "mensagem" ? balao(cx - 11, cy - 9, 22, 15) : c === "email" ? envelope(cx - 11, cy - 8, 22, 15) : c === "telefone" ? telefone(cx - 6, cy - 11, 12, 22) : pessoa(cx, cy + 12, 24);
function canalGrande(c: CanalId, cx: number, cy: number): string {
  if (c === "mensagem") return balao(cx - 30, cy - 18, 60, 36);
  if (c === "email") return envelope(cx - 27, cy - 17, 54, 34);
  if (c === "telefone") return telefone(cx - 14, cy - 24, 28, 48);
  return pessoa(cx, cy + 28, 58);
}
// consequências (3º ato, estado 2): silhueta + "!" em coral, triângulo, relógio, quadro, vaga
function causaIcone(c: CausaId, cx: number, cy: number): string {
  if (c === "reclama") return pessoa(cx - 6, cy + 30, 46) + Rt("cs-sf", cx + 10, cy - 38, 34, 26, 7) + P("cs-sf", `M${cx + 16} ${cy - 12}L${cx + 13} ${cy - 5}L${cx + 23} ${cy - 12}`) + exclama(cx + 27, cy - 25, 22);
  if (c === "incendio") return P("cs-sf", `M${cx} ${cy - 28}L${cx + 31} ${cy + 23}H${cx - 31}Z`) + exclama(cx, cy + 2, 31);
  if (c === "prazo") {
    const [hx, hy] = pol(cx, cy, 15, 125);
    const [m1, m2] = pol(cx, cy, 14, 60);
    const [m3, m4] = pol(cx, cy, 25, 60);
    return Ci("cs-s", cx, cy, 22) + P("cs-s", `M${cx} ${cy}L${hx} ${hy}`) + ponto(cx, cy, 2.6) + `<g class="cs-ato cs-ato--quebra cs-brilho">${P("cs-s", `M${m1} ${m2}L${m3} ${m4}`)}</g>`;
  }
  if (c === "mostrar") return Rt("cs-sf", cx - 26, cy - 26, 52, 36, 3) + P("cs-t", `M${cx} ${cy + 10}V${cy + 24}M${cx - 10} ${cy + 24}H${cx + 10}`) + P("cs-t", `M${cx - 16} ${cy + 2}V${cy - 6}M${cx - 6} ${cy + 2}V${cy - 12}`) + `<g class="cs-ato cs-ato--quebra cs-brilho"><text class="cs-tx cs-i" x="${cx + 12}" y="${cy + 3}" text-anchor="middle" font-size="18">?</text></g>`;
  return pessoa(cx - 6, cy + 28, 46) + `<g class="cs-ato cs-ato--quebra cs-brilho">${P("cs-s", `M${cx + 20} ${cy - 24}V${cy - 6}M${cx + 11} ${cy - 15}H${cx + 29}`)}</g>`;
}
// a solução (3º ato, estado 3, menta): fila ordenada, ajuste sem programar, sino antes do prazo, painel vivo
function solucaoIcone(id: CenaId, cx: number, cy: number): string {
  if (id === "perda") return [-18, 0, 18].map((dy) => Ci("cs-s", cx - 18, cy + dy, 5.5) + P("cs-t", `M${cx - 21} ${cy + dy}L${cx - 19} ${cy + dy + 2.5}L${cx - 15} ${cy + dy - 2.5}`) + P("cs-t", `M${cx - 6} ${cy + dy}H${cx + 22}`)).join("");
  if (id === "complexidade") return P("cs-t", `M${cx - 22} ${cy - 10}H${cx + 22}M${cx - 22} ${cy + 10}H${cx + 22}`) + Ci("cs-sf", cx + 8, cy - 10, 6) + Ci("cs-sf", cx - 6, cy + 10, 6);
  if (id === "sla") return sinoTocando(cx, cy + 2, 19);
  return Rt("cs-sf", cx - 26, cy - 20, 52, 40, 4) + P("cs-t", `M${cx - 16} ${cy + 12}V${cy - 2}M${cx - 6} ${cy + 12}V${cy - 8}M${cx + 4} ${cy + 12}V${cy + 2}M${cx + 14} ${cy + 12}V${cy - 12}`) + ponto(cx + 18, cy - 13, 2.6);
}

// --------------------------------------------------------------------------
// a composição: 3 atos, função da largura, da cena e do estado
// --------------------------------------------------------------------------
const CANAIS_PADRAO: Record<CenaId, CanalId[]> = {
  perda: ["mensagem", "email", "pessoalmente", "telefone"],
  complexidade: ["email"],
  sla: ["email"],
  relatorio: ["email"],
};
const DESCRICAO: Record<CenaId, string> = {
  perda: "Os pedidos chegam por vários canais e caem numa bandeja sem fila; um deles escorrega pra fora.",
  complexidade: "A ferramenta atual travada: uma chave presa na engrenagem, e qualquer ajuste vira projeto.",
  sla: "Um relógio cujo ponteiro passou da marca do prazo, com o sino de aviso cortado.",
  relatorio: "Um retrovisor com o gráfico que só vai até o mês passado, e um vão até hoje.",
};

function montar(id: CenaId, w: number, o: OpcoesCena): { svg: string; placa: { x: number; y: number } } {
  const n = w < 600;
  const cx = n ? 240 : 320;
  const cy = 184;
  const R = n ? 82 : 96;
  const lx = n ? 78 : 118;
  const rx = n ? w - 76 : w - 108;
  const estado = o.estado;
  const canais = (o.canais?.length ? o.canais : CANAIS_PADRAO[id]).slice(0, 4);
  const g: string[] = [];
  const pid = `cs-g-${id}-${estado}-${w}`;
  g.push(`<defs><pattern id="${pid}" width="24" height="24" patternUnits="userSpaceOnUse"><circle class="cs-grade" cx="12" cy="12" r="1.1"/></pattern></defs>`);
  g.push(`<rect class="cs-fundo" width="${w}" height="${H}"/><rect width="${w}" height="${H}" fill="url(#${pid})"/>`);
  g.push(P("cs-base", `M26 306H${w - 26}`, false));
  let placa = { x: 3, y: 4 };

  // ---- 1º ato: hoje
  const ligaAnel = (x: number, y: number, ang: number) => {
    const [tx, ty] = pol(cx, cy, R, ang);
    return P("cs-t cs-tr", `M${f(x)} ${f(y)}Q${f((x + tx) / 2 + 10)} ${f(y)} ${tx} ${ty}`);
  };
  if (estado === 1) {
    if (id === "perda") {
      const ys = canais.length === 4 ? [60, 136, 206, 276] : canais.length === 3 ? [86, 176, 262] : [120, 236];
      let pecas = "";
      let ligas = "";
      canais.forEach((c, i) => {
        pecas += canalGrande(c, lx - 6, ys[i]);
        ligas += ligaAnel(lx + 30, ys[i] - (c === "pessoalmente" ? 10 : 0), -44 - i * 20);
      });
      g.push(ato("contexto", 0, pecas));
      g.push(`<g class="cs-ato cs-ato--contexto" style="--t:0.3">${ligas}</g>`);
    } else if (id === "complexidade") {
      g.push(ato("contexto", 0, ferramentaCaixa(lx - 48, 120, 96, 110) + P("cs-t cs-tr", `M${lx + 50} 190H${cx - R - 6}`)));
    } else if (id === "sla") {
      g.push(ato("contexto", 0, envelope(lx - 26, 104) + P("cs-t cs-tr", `M${lx} 146V170`) + setaBaixo(lx, 173) + chamado(lx - 42, 180) + P("cs-t cs-tr", `M${lx + 46} 206H${cx - R - 6}`)));
    } else {
      g.push(ato("contexto", 0, diretoria(lx - 44, 92, 88, 48) + P("cs-t cs-tr", `M${lx} 142V166`) + setaBaixo(lx, 169) + documentoPergunta(lx - 24, 176, 48, 60) + P("cs-t cs-tr", `M${lx + 28} 206H${cx - R - 6}`)));
    }
  } else {
    // a empresa: placa (HTML, por cima) + prédio na cor da marca; o "hoje" da cena vira janelas acesas
    // (os canais, a diretoria, a ferramenta trancada, o chamado com relógio), e dali sai a linha pro anel
    const bw = n ? 88 : 104;
    const bh = 162;
    const bx = lx - bw / 2;
    const by = 144;
    const pr = predio(bx, by, bw, bh, 3, 4);
    let janelas = "";
    let ligas = "";
    const ex = bx + bw + 2;
    if (id === "perda") {
      const slots: [number, number][] = [
        [0, 0],
        [2, 0],
        [0, 1],
        [2, 1],
      ];
      canais.forEach((c, i) => {
        const [jx, jy] = pr.janela(slots[i][0], slots[i][1]);
        janelas += canalPequeno(c, jx, jy);
        ligas += ligaAnel(ex, jy + (i % 2 ? 8 : 0), -46 - i * 22);
      });
    } else if (id === "relatorio") {
      for (let c = 0; c < 3; c++) {
        const [jx, jy] = pr.janela(c, 0);
        janelas += pessoa(jx, jy + 12, 22);
      }
      const [qx, qy] = pr.janela(1, 2);
      janelas += `<text class="cs-tx cs-i" x="${qx}" y="${f(qy + 6)}" text-anchor="middle" font-size="17">?</text>`;
      ligas = ligaAnel(ex, pr.janela(2, 1)[1], -78);
    } else if (id === "complexidade") {
      const [ax, ay] = pr.janela(1, 1);
      janelas += Rt("cs-sf", ax - 7, ay - 1, 14, 11, 2) + P("cs-t", `M${ax - 4} ${ay - 1}V${ay - 5}Q${ax - 4} ${ay - 10} ${ax} ${ay - 10}Q${ax + 4} ${ay - 10} ${ax + 4} ${ay - 5}V${ay - 1}`);
      const [tx, ty] = pr.janela(1, 2);
      janelas += Rt("cs-t", tx - 11, ty - 5, 22, 10, 5) + ponto(tx + 5, ty, 3);
      ligas = ligaAnel(ex, ay, -78);
    } else {
      const [e1, e2] = pr.janela(1, 0);
      janelas += envelope(e1 - 11, e2 - 8, 22, 15);
      const [c1, c2] = pr.janela(1, 1);
      const [h1, h2] = pol(c1, c2, 6, 120);
      janelas += Ci("cs-s", c1, c2, 9) + P("cs-t", `M${c1} ${c2}L${h1} ${h2}`) + ponto(c1, c2, 1.6);
      ligas = ligaAnel(ex, e2 + 10, -72);
    }
    g.push(ato("marca", 0, pr.svg + `<g class="cs-ato cs-ato--contexto">${janelas}</g>`));
    g.push(`<g class="cs-ato cs-ato--contexto" style="--t:0.25">${ligas}</g>`);
    placa = { x: f((bx / w) * 100), y: f((90 / H) * 100) };
  }

  // ---- 2º ato: onde quebra
  g.push(ato("quebra", 0.45, Ci("cs-s", cx, cy, R)));
  let centro = "";
  let x: Pt;
  if (id === "perda") {
    const [sx, sy] = pol(cx, cy, R - 6, 132);
    centro = bandeja(cx - 40, cy + 12, 80, 42) + miniChamado(cx - 54, cy - 40, 40, 24, -14) + miniChamado(cx - 16, cy - 52, 40, 24, 8) + miniChamado(cx + 10, cy - 26, 40, 24, 22) + miniChamado(cx - 30, cy - 14, 40, 24, -4) + miniChamado(sx - 20, sy - 12, 40, 24, 34);
    x = pol(cx, cy, R, 134);
  } else if (id === "complexidade") {
    const r = n ? 26 : 30;
    const gx = cx - 10;
    const gy = cy + 10;
    const [c1, c2] = pol(gx, gy, r + 6, 40);
    const [k1, k2] = pol(gx, gy, r + 62, 40);
    centro = engrenagem(gx, gy, r) + chave(c1, c2, k1, k2);
    x = pol(gx, gy, r + 10, 40);
  } else if (id === "sla") {
    const cr = n ? 52 : 60;
    const [bx, by] = pol(cx, cy, R * 0.62, -38);
    centro = relogio(cx, cy + 6, cr, 118, 58) + sinoCortado(bx, by, 15);
    x = pol(cx, cy + 6, cr, 58);
  } else {
    const rv = retrovisor(cx - 70, cy - 30, 140, 76);
    centro = rv.svg;
    x = rv.vao;
  }
  g.push(ato("contexto", 0.7, centro));
  g.push(xis(x[0], x[1], 1.0));

  // ---- 3º ato
  const causas = (o.causas ?? []).slice(0, 3);
  if (estado === 1 || (estado === 2 && !causas.length)) {
    g.push(`<g class="cs-ato cs-ato--dim" style="--t:1.2">${P("cs-t cs-tr cs-i", `M${cx + R + 6} ${cy}H${rx - 52}`, false)}${Ci("cs-s cs-tr cs-i", rx, cy, 46, false)}${ponto(rx - 12, cy)}${ponto(rx, cy)}${ponto(rx + 12, cy)}</g>`);
  } else if (estado === 2) {
    const pos: Pt[] = causas.length === 1 ? [[rx, cy]] : causas.length === 2 ? [[rx, cy - 58], [rx, cy + 58]] : [[rx - 6, cy - 74], [rx + 10, cy], [rx - 6, cy + 74]];
    const angs = causas.length === 1 ? [90] : causas.length === 2 ? [62, 112] : [56, 90, 122];
    let ligas = "";
    causas.forEach((_, i) => {
      const [a1, a2] = pol(cx, cy, R, angs[i]);
      const [px, py] = pos[i];
      ligas += P("cs-t cs-tr", `M${a1} ${a2}Q${f(cx + R + 40)} ${f(py)} ${f(px - 40)} ${f(py + (i === 1 && causas.length === 3 ? 0 : py < cy ? 8 : -8))}`);
    });
    g.push(`<g class="cs-ato cs-ato--causa" style="--t:1.2">${ligas}</g>`);
    g.push(ato("contexto", 1.3, causas.map((c, i) => causaIcone(c, pos[i][0], pos[i][1])).join("")));
  } else {
    const [a1, a2] = pol(cx, cy, R, 42);
    const qx = (cx + rx) / 2;
    const qy = cy - R - 22;
    const ang = (Math.atan2(cy - 54 - qy, rx - 8 - qx) * 180) / Math.PI + 90;
    const etiqueta = `<rect class="cs-etiqueta cs-i" x="${f(qx - 36)}" y="${f(qy - 1)}" width="88" height="18" rx="9"/><text class="cs-tx cs-i" x="${f(qx + 8)}" y="${f(qy + 12)}" text-anchor="middle">com a SysAid</text>`;
    g.push(ato("solucao", 1.2, P("cs-s cs-tr", `M${a1} ${a2}Q${f(qx)} ${f(qy)} ${f(rx - 8)} ${f(cy - 54)}`) + setaPonta(rx - 8, cy - 54, ang) + etiqueta));
    g.push(ato("solucao", 1.5, Ci("cs-s", rx, cy, 46) + solucaoIcone(id, rx, cy)));
  }

  return { svg: `<svg viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg">${g.join("")}</svg>`, placa };
}

// --------------------------------------------------------------------------
// o cartão
// --------------------------------------------------------------------------
export function cenaSysaid(id: CenaId, o: OpcoesCena): DadosCena {
  const largo = montar(id, 640, o);
  const estreito = montar(id, 480, o);
  const terceiro: AtoCena =
    o.estado === 3
      ? { rotulo: "Com a SysAid", texto: o.solucao ?? "", tom: "solucao", vazio: !o.solucao }
      : { rotulo: "O que isso causa", texto: o.estado === 2 ? o.causa ?? "" : "", tom: "causa", vazio: o.estado === 1 || !o.causa };
  const atos: AtoCena[] = [
    { rotulo: "Hoje", texto: o.hoje, tom: "contexto" },
    { rotulo: "Onde quebra", texto: o.quebra, tom: "quebra" },
    terceiro,
  ];
  const sufixo = o.estado === 1 ? " O terceiro ato ainda está vazio." : o.estado === 2 ? " À esquerda, a empresa; à direita, o que isso causa." : " À direita, em menta, o caminho com a SysAid.";
  const comEmpresa = o.estado >= 2;
  return {
    svg: largo.svg,
    proporcao: 640 / H,
    placa: largo.placa,
    estreito: { svg: estreito.svg, proporcao: 480 / H, placa: estreito.placa },
    descricao: DESCRICAO[id] + sufixo,
    atos,
    logo: comEmpresa ? o.logo ?? null : null,
    nome: comEmpresa ? o.empresa : undefined,
    cor: comEmpresa ? o.cor ?? null : null,
  };
}
