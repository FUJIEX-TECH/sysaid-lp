// ==========================================================================
// Qualifica v2 · busca genérica — as 4 CENAS da SysAid (13/11/2026, Severino).
// Briefing: clientes/sysaid/_growth/qualifica-fluxo-generico-conteudo-2026-11-13.md,
// seção 3 (regras comuns, uma cena por dor, versão com logo, checklist 3.7).
//
// Esquema técnico, não ilustração: traço fino de console, sem rosto, sem
// caricatura, sem marca de terceiro (canal é ícone genérico). Um único tom de
// alerta, só no ponto onde o problema quebra (o ✕). Menta só no caminho
// principal. Desenhado à mão aqui, nada gerado por IA na hora.
//
// Cada cena é uma função da largura: 640 × 360 (16:9, desktop e PDF) e
// 480 × 360 (4:3, celular), as mesmas peças recompostas. O SVG só tem classes
// cs-* (o tema pinta: escuro na tela, claro no papel) e NENHUM texto da pessoa:
// rótulos e nomes de bloco ("time de TI", "TI da Empresa") são HTML por cima,
// posicionados em % (tipo `cena` do núcleo).
// ==========================================================================

import type { DadosCena, LayoutCena, RotuloCena } from "../conversa-core/tipos";

const H = 360;
const r = (n: number) => Math.round(n * 10) / 10;

// --------------------------------------------------------------------------
// peças
// --------------------------------------------------------------------------
function fundo(w: number): string {
  let d = "";
  for (let x = 40; x < w; x += 40) d += `M${x} 0V${H}`;
  for (let y = 40; y < H; y += 40) d += `M0 ${y}H${w}`;
  return `<rect class="cs-fundo" x="0" y="0" width="${w}" height="${H}"/><path class="cs-grade" d="${d}"/>`;
}

function ponta(x: number, y: number, ang: number, cls = "cs-l", t = 6): string {
  const a1 = ang + Math.PI - 0.5;
  const a2 = ang + Math.PI + 0.5;
  return `<path class="${cls}" d="M${r(x + t * Math.cos(a1))} ${r(y + t * Math.sin(a1))}L${r(x)} ${r(y)}L${r(x + t * Math.cos(a2))} ${r(y + t * Math.sin(a2))}"/>`;
}
function seta(x1: number, y1: number, x2: number, y2: number, cls = "cs-l"): string {
  return `<path class="${cls}" d="M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}"/>${ponta(x2, y2, Math.atan2(y2 - y1, x2 - x1), cls.replace(/ cs-tr2?/, ""))}`;
}
function curva(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, cls = "cs-l", comPonta = true): string {
  return `<path class="${cls}" d="M${r(x1)} ${r(y1)}Q${r(cx)} ${r(cy)} ${r(x2)} ${r(y2)}"/>${comPonta ? ponta(x2, y2, Math.atan2(y2 - cy, x2 - cx), cls.replace(/ cs-tr2?/, "")) : ""}`;
}
function xis(cx: number, cy: number, s = 6.5): string {
  return `<circle class="cs-s2" cx="${r(cx)}" cy="${r(cy)}" r="${s + 5}"/><path class="cs-x" d="M${r(cx - s)} ${r(cy - s)}L${r(cx + s)} ${r(cy + s)}M${r(cx + s)} ${r(cy - s)}L${r(cx - s)} ${r(cy + s)}"/>`;
}
function ponto(cx: number, cy: number, cls = "cs-p", rr = 2.2): string {
  return `<circle class="${cls}" cx="${r(cx)}" cy="${r(cy)}" r="${rr}"/>`;
}
function linhas(x: number, y: number, larguras: number[], passo = 7, cls = "cs-f"): string {
  return `<path class="${cls}" d="${larguras.map((w, i) => `M${r(x)} ${r(y + i * passo)}H${r(x + w)}`).join("")}"/>`;
}
function caixa(x: number, y: number, w: number, h: number, cls = "cs-s", rx = 3): string {
  return `<rect class="${cls}" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${rx}"/>`;
}

// balão de conversa (canal de mensagem, sem marca)
function balao(x: number, y: number, w: number, h: number): string {
  const d = `M${x + 6} ${y}H${x + w - 6}Q${x + w} ${y} ${x + w} ${y + 6}V${y + h - 6}Q${x + w} ${y + h} ${x + w - 6} ${y + h}H${x + 18}L${x + 7} ${y + h + 9}L${x + 9} ${y + h}H${x + 6}Q${x} ${y + h} ${x} ${y + h - 6}V${y + 6}Q${x} ${y} ${x + 6} ${y}Z`;
  return `<path class="cs-s" d="${d}"/>${linhas(x + 10, y + h * 0.36, [w - 22, w * 0.55], h * 0.3)}`;
}
function envelope(x: number, y: number, w: number, h: number): string {
  return `${caixa(x, y, w, h, "cs-s", 2)}<path class="cs-l" d="M${x} ${y + 1}L${x + w / 2} ${y + h * 0.56}L${x + w} ${y + 1}"/>`;
}
// silhueta geométrica: cabeça e ombro, sem rosto
function pessoa(cx: number, base: number, s: number, cls = "cs-s"): string {
  const ombro = `M${r(cx - s * 0.4)} ${r(base)}V${r(base - s * 0.16)}Q${r(cx - s * 0.4)} ${r(base - s * 0.44)} ${r(cx)} ${r(base - s * 0.44)}Q${r(cx + s * 0.4)} ${r(base - s * 0.44)} ${r(cx + s * 0.4)} ${r(base - s * 0.16)}V${r(base)}Z`;
  return `<circle class="${cls}" cx="${r(cx)}" cy="${r(base - s * 0.68)}" r="${r(s * 0.19)}"/><path class="${cls}" d="${ombro}"/>`;
}
function celular(x: number, y: number, w: number, h: number): string {
  return `${caixa(x, y, w, h, "cs-s", 5)}<path class="cs-f" d="M${x + w * 0.36} ${y + 5}H${x + w * 0.64}"/>${linhas(x + 6, y + h * 0.36, [w - 12, w - 18], 7)}<path class="cs-f" d="M${x - 5} ${y + h * 0.3}v${h * 0.22}M${x - 9} ${y + h * 0.34}v${h * 0.14}M${x + w + 5} ${y + h * 0.3}v${h * 0.22}M${x + w + 9} ${y + h * 0.34}v${h * 0.14}"/>`;
}
function pilha(x: number, y: number, w: number, h: number): string {
  return `${caixa(x + 9, y - 9, w, h, "cs-s2")}${caixa(x + 4.5, y - 4.5, w, h, "cs-s2")}${caixa(x, y, w, h)}${linhas(x + 8, y + h * 0.34, [w - 18, w * 0.5], h * 0.3)}`;
}
function bandeja(x: number, y: number, w: number, h: number): string {
  const d = `M${x} ${y + h * 0.42}L${x + w * 0.16} ${y}H${x + w * 0.84}L${x + w} ${y + h * 0.42}V${y + h}H${x}Z`;
  const slot = `M${x} ${y + h * 0.42}H${x + w * 0.3}L${x + w * 0.37} ${y + h * 0.66}H${x + w * 0.63}L${x + w * 0.7} ${y + h * 0.42}H${x + w}`;
  return `${envelope(x + w * 0.22, y - h * 0.32, w * 0.42, h * 0.38)}${envelope(x + w * 0.4, y - h * 0.18, w * 0.42, h * 0.36)}<path class="cs-s" d="${d}"/><path class="cs-l" d="${slot}"/>`;
}
function postit(x: number, y: number, s: number): string {
  return `<path class="cs-s" d="M${x} ${y}H${x + s}V${y + s * 0.72}L${x + s * 0.72} ${y + s}H${x}Z"/><path class="cs-l" d="M${x + s} ${y + s * 0.72}H${x + s * 0.72}V${y + s}"/>${linhas(x + 7, y + s * 0.26, [s - 16, s - 22, s * 0.4], s * 0.17)}`;
}
// posto de um técnico do time (cartão com a silhueta)
function posto(x: number, y: number, w: number, h: number, cls = "cs-s"): string {
  return `${caixa(x, y, w, h, cls)}${pessoa(x + 15, y + h - 6, 22, "cs-pf")}${linhas(x + 32, y + h * 0.38, [w - 44, w * 0.32], h * 0.26)}`;
}
// painel genérico de "ferramenta atual": abas, chaves, linhas de config, engrenagem
function painel(x: number, y: number, w: number, h: number, completo = true): string {
  let s = caixa(x, y, w, h);
  s += `<path class="cs-l" d="M${x} ${y + 20}H${x + w}"/>`;
  const abas = Math.max(1, Math.min(completo ? 4 : 3, Math.floor((w - 8) / 34)));
  for (let i = 0; i < abas; i++) s += caixa(x + 8 + i * 34, y + 6, 28, 9, i === 0 ? "cs-s" : "cs-s2", 2);
  const colX = x + 12;
  const cabem = Math.max(1, Math.min(completo ? 4 : 3, Math.floor((h - 30) / 22)));
  for (let i = 0; i < cabem; i++) {
    const yy = y + 34 + i * 22;
    s += `<rect class="cs-s2" x="${colX}" y="${yy}" width="22" height="11" rx="5.5"/>${ponto(i % 2 ? colX + 16 : colX + 6, yy + 5.5, "cs-p", 3.2)}`;
    s += linhas(colX + 32, yy + 5.5, [completo ? w * 0.34 : w * 0.28], 0);
  }
  if (completo) {
    s += `<path class="cs-f" d="M${x + w * 0.62} ${y + 30}V${y + h - 12}"/>`;
    s += linhas(x + w * 0.66, y + 38, [w * 0.26, w * 0.18, w * 0.24, w * 0.12], 12);
  }
  if (h >= 80) s += engrenagem(x + w - 22, y + h - 22, 9);
  return s;
}
function engrenagem(cx: number, cy: number, rr: number): string {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    d += `M${r(cx + rr * Math.cos(a))} ${r(cy + rr * Math.sin(a))}L${r(cx + (rr + 4) * Math.cos(a))} ${r(cy + (rr + 4) * Math.sin(a))}`;
  }
  return `<circle class="cs-s" cx="${cx}" cy="${cy}" r="${rr}"/><circle class="cs-l" cx="${cx}" cy="${cy}" r="${r(rr * 0.4)}"/><path class="cs-l" d="${d}"/>`;
}
function relogio(cx: number, cy: number, rr = 5): string {
  return `<circle class="cs-l" cx="${cx}" cy="${cy}" r="${rr}"/><path class="cs-l" d="M${cx} ${cy - rr * 0.55}V${cy}H${cx + rr * 0.5}"/>`;
}
// cartão de ajuste parado na fila (novo formulário, mudar fluxo...)
function ajuste(x: number, y: number, w: number, h: number): string {
  return `${caixa(x, y, w, h, "cs-s")}${linhas(x + 8, y + 11, [w - 30, w * 0.4], 8)}${relogio(x + w - 12, y + 12, 5)}<path class="cs-f cs-tr2" d="M${x + 8} ${y + h - 8}H${x + w - 8}"/>`;
}
// planilha com células "?" (o número montado à mão)
function planilha(x: number, y: number, w: number, h: number, cols: number, rows: number, buracos: [number, number][], comTexto: boolean): string {
  let s = caixa(x, y, w, h, "cs-s", 2);
  const cw = w / cols;
  const rh = h / rows;
  let d = "";
  for (let c = 1; c < cols; c++) d += `M${r(x + c * cw)} ${y}V${y + h}`;
  for (let k = 1; k < rows; k++) d += `M${x} ${r(y + k * rh)}H${x + w}`;
  s += `<path class="cs-f" d="${d}"/>`;
  s += `<path class="cs-l" d="M${x} ${r(y + rh)}H${x + w}"/>`;
  for (const [c, k] of buracos) {
    const cx = x + c * cw + cw / 2;
    const cy = y + k * rh + rh / 2;
    s += comTexto ? `<text class="cs-tx cs-tx-q" x="${r(cx)}" y="${r(cy + 4)}" text-anchor="middle">?</text>` : ponto(cx, cy, "cs-p", 2);
  }
  return s;
}
// sino com um corte: não houve aviso
function sinoCortado(cx: number, cy: number, s = 16): string {
  const d = `M${cx - s * 0.62} ${cy + s * 0.5}H${cx + s * 0.62}L${cx + s * 0.5} ${cy + s * 0.3}V${cy - s * 0.1}Q${cx + s * 0.5} ${cy - s * 0.62} ${cx} ${cy - s * 0.62}Q${cx - s * 0.5} ${cy - s * 0.62} ${cx - s * 0.5} ${cy - s * 0.1}V${cy + s * 0.3}Z`;
  return `<path class="cs-s" d="${d}"/><path class="cs-l" d="M${cx - s * 0.16} ${cy + s * 0.66}Q${cx} ${cy + s * 0.82} ${cx + s * 0.16} ${cy + s * 0.66}"/><path class="cs-l" d="M${cx - s * 0.85} ${cy - s * 0.85}L${cx + s * 0.85} ${cy + s * 0.85}"/>`;
}
// retrovisor: o gráfico só olha pra trás, com um vão até "hoje"
function retrovisor(x: number, y: number, w: number, h: number): { svg: string; vao: [number, number] } {
  const px = (t: number) => x + 14 + t * (w - 28);
  const base = y + h - 22;
  const pts: [number, number][] = [0, 0.12, 0.24, 0.36, 0.5, 0.62].map((t, i) => [px(t), base - [18, 30, 24, 40, 34, 48][i]]);
  const linha = pts.map((p, i) => `${i ? "L" : "M"}${r(p[0])} ${r(p[1])}`).join("");
  const ult = pts[pts.length - 1];
  const hoje = px(1);
  let s = `<rect class="cs-s" x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/>`;
  s += `<path class="cs-f" d="M${x + 14} ${base}H${x + w - 14}"/>`;
  s += `<path class="cs-a" d="${linha}"/>${pts.map((p) => ponto(p[0], p[1], "cs-af", 2.4)).join("")}`;
  s += `<path class="cs-f cs-tr" d="M${r(ult[0] + 6)} ${r(ult[1])}H${r(hoje - 14)}"/>`;
  s += `<path class="cs-f" d="M${r(ult[0])} ${base - 4}V${base + 4}M${r(hoje)} ${base - 4}V${base + 4}"/>`;
  return { svg: s, vao: [r((ult[0] + hoje) / 2 + 6), r(ult[1])] };
}

// --------------------------------------------------------------------------
// as cenas
// --------------------------------------------------------------------------
type Slot = { x: number; y: number; lado?: RotuloCena["lado"]; alerta?: boolean };
type Bloco = { id: string; x: number; y: number; lado?: RotuloCena["lado"] };
// slots: onde fica o rótulo (composição larga); marcas: onde fica o marcador numerado (estreita, com legenda)
type Desenho = { svg: string; slots: Slot[]; marcas?: Slot[]; blocos: Bloco[]; placa?: { x: number; y: number } };
const pct = (v: number, total: number) => (v / total) * 100;

const svg = (w: number, grupos: string[]) => `<svg viewBox="0 0 ${w} ${H}" xmlns="http://www.w3.org/2000/svg">${grupos.map((g) => `<g>${g}</g>`).join("")}</svg>`;

// Cena 1 · Fila invisível: pedido chegando de todo lado e nenhum lugar onde vira fila
function cenaFila(w: number): Desenho {
  const estreito = w < 600;
  const xc = estreito ? 162 : 236; // montes soltos
  const xt = w - (estreito ? 132 : 154); // time de TI
  const tw = estreito ? 104 : 120;
  // entradas, à esquerda, em altura irregular
  const ent =
    balao(28, 46, estreito ? 56 : 64, 36) + envelope(32, 128, estreito ? 50 : 56, 36) + pessoa(estreito ? 56 : 60, 262, 58) + celular(estreito ? 40 : 46, 286, 28, 48);
  // montes soltos no centro, em vez de fila
  const montes = pilha(xc, 64, estreito ? 56 : 64, 40) + bandeja(xc + (estreito ? 44 : 58), 176, estreito ? 66 : 76, 44) + postit(xc - (estreito ? 4 : 2), 258, 46);
  // linhas dos pedidos (cada uma chega num monte diferente, em ângulos diferentes)
  const xBal = estreito ? 92 : 100;
  const pedidos =
    curva(xBal, 62, xc - 30, 50, xc - 3, 80) +
    curva(estreito ? 90 : 96, 152, xc - 24, 196, xc + (estreito ? 40 : 54), 200) +
    curva(estreito ? 82 : 86, 238, xc - 40, 248, xc - 8, 276) +
    curva(76, 300, xc - 10, 330, xc + (estreito ? 60 : 76), 222);
  // o ponto de quebra: um pedido que termina no vazio
  const xp = estreito ? 122 : 150;
  const perdido = `<path class="cs-l cs-tr" d="M${estreito ? 90 : 96} ${136}Q${xp - 10} ${120} ${xp} ${116}"/>${xis(xp + 12, 114)}`;
  // dos montes pro time: linhas que se cruzam (quem vê primeiro atende)
  const yT = [104, 160, 216];
  const xm = xc + (estreito ? 60 : 72);
  const cruzadas =
    seta(xm, 72, xt - 6, yT[2] + 20, "cs-f") +
    seta(xc + (estreito ? 110 : 134), 200, xt - 6, yT[0] + 20, "cs-f") +
    seta(xc + 44, 280, xt - 6, yT[1] + 20, "cs-f") +
    seta(xc + 44, 266, xt - 6, yT[0] + 30, "cs-f");
  const time = yT.map((y) => posto(xt, y, tw, 40)).join("");
  // embaixo, o contador da fila que não existe (só o desenho; o "?" não é número)
  const cont = `<path class="cs-f" d="M${xt} ${290}H${xt + tw}"/><text class="cs-tx" x="${xt}" y="${310}">fila</text><text class="cs-tx cs-tx-q" x="${xt + tw}" y="${312}" text-anchor="end">?</text>`;
  return {
    svg: svg(w, [fundo(w), ent, montes, pedidos + perdido, cruzadas, time + cont]),
    slots: [
      { x: pct(28, w), y: 6.5, lado: "direita" },
      { x: pct(92, w), y: 61, lado: "direita" },
      { x: pct(xp + 28, w), y: 31.5, lado: "direita", alerta: true },
    ],
    marcas: [
      { x: pct(28 + (estreito ? 56 : 64), w), y: pct(46, H) },
      { x: pct(estreito ? 78 : 82, w), y: pct(214, H) },
      { x: pct(xp + 34, w), y: pct(114, H), alerta: true },
    ],
    blocos: [{ id: "time", x: pct(xt, w), y: 23.5, lado: "direita" }],
  };
}

// Cena 2 · Ferramenta que virou projeto: a ferramenta existe, o time trabalha em volta dela
function cenaFerramenta(w: number): Desenho {
  const estreito = w < 600;
  const px = estreito ? 96 : 150;
  const pw = estreito ? 214 : 248;
  const py = 132;
  const ph = 132;
  // o caminho principal entrando na ferramenta, em menta
  const entrada = `${pessoa(36, 214, 46, "cs-pf")}${seta(58, 196, px - 4, 196, "cs-a")}`;
  const ferramenta = painel(px, py, pw, ph, !estreito);
  // a fila de ajustes parados, em cima, travada na entrada
  const aw = estreito ? 62 : 78;
  const gap = estreito ? 8 : 12;
  const ax = px + (estreito ? 16 : 34);
  const ajustes = [0, 1, 2].map((i) => ajuste(ax + i * (aw + gap), 30, aw, 40)).join("");
  const filaX = ax + 1.5 * (aw + gap) - gap / 2;
  const travada = `<path class="cs-l cs-tr" d="M${r(filaX)} 76V${py - 4}"/>${xis(filaX, 101)}`;
  // à direita, uma silhueta só, ligada ao painel por uma linha grossa: só ela mexe
  const sx = w - (estreito ? 44 : 64);
  const so = `${pessoa(sx, 230, 56)}<path class="cs-l" style="stroke-width:3.2" d="M${px + pw + 2} 198H${sx - 26}"/>`;
  // embaixo, o desvio "por fora": e-mail e planilha, direto ao time, e a maioria passa por ali
  const yb = 312;
  const desvio = `<path class="cs-l cs-tr" d="M50 222Q54 ${yb} 110 ${yb}H${w - 96}"/>${ponta(w - 96, yb, 0)}<path class="cs-f cs-tr" d="M58 226Q64 ${yb - 12} 116 ${yb - 12}H${w - 104}"/><path class="cs-f cs-tr" d="M66 230Q74 ${yb + 12} 122 ${yb + 12}H${w - 104}"/>${envelope(estreito ? 150 : 200, yb - 13, 34, 24)}${planilha(estreito ? 196 : 262, yb - 15, 42, 28, 3, 3, [], false)}${posto(w - 90, yb - 20, 80, 38)}`;
  return {
    svg: svg(w, [fundo(w), entrada, ferramenta, ajustes + travada, so, desvio]),
    slots: [
      { x: pct(filaX + 22, w), y: 28, lado: "direita", alerta: true },
      { x: pct(sx + 34, w), y: pct(150, H), lado: "esquerda" },
      { x: pct(px + 4, w), y: pct(283, H), lado: "direita" },
    ],
    marcas: [
      { x: pct(filaX + 24, w), y: pct(101, H), alerta: true },
      { x: pct(sx + 22, w), y: pct(230 - 52, H) },
      { x: pct(estreito ? 136 : 186, w), y: pct(yb, H) },
    ],
    blocos: [
      { id: "ferramenta", x: pct(px, w), y: pct(py - 11, H), lado: "direita" },
      { id: "time", x: pct(w - 90, w), y: pct(yb - 31, H), lado: "direita" },
    ],
  };
}

// Cena 3 · Prazo sem alarme: o prazo passa em silêncio e o gestor sabe pelo usuário
function cenaPrazo(w: number): Desenho {
  const estreito = w < 600;
  const x0 = 28;
  const xFim = estreito ? 300 : 420;
  const xp = estreito ? 210 : 300; // a linha do prazo
  const yEixo = 262;
  let eixo = `<path class="cs-l" d="M${x0} ${yEixo}H${xFim}"/>${ponta(xFim, yEixo, 0)}`;
  for (let x = x0 + 30; x < xFim - 10; x += estreito ? 30 : 40) eixo += `<path class="cs-f" d="M${x} ${yEixo - 4}V${yEixo + 4}"/>`;
  const prazo = `<path class="cs-l" d="M${xp} 118V${yEixo + 10}"/>`;
  // três chamados: dois fecham antes do prazo, um atravessa sem nenhum sinal
  const barras =
    `<rect class="cs-at" style="opacity:.55" x="${x0 + 14}" y="160" width="${xp - x0 - (estreito ? 90 : 120)}" height="13" rx="2"/>` +
    `<rect class="cs-at" style="opacity:.55" x="${x0 + 46}" y="190" width="${xp - x0 - (estreito ? 76 : 96)}" height="13" rx="2"/>` +
    `<rect class="cs-s" x="${x0 + 76}" y="220" width="${xFim - x0 - (estreito ? 100 : 130)}" height="13" rx="2"/>`;
  const quebra = xis(xp, 226.5);
  // em cima, o sino cortado: ninguém foi avisado
  const sino = sinoCortado(xp, 74, 22);
  // depois do prazo: usuário → você → diretoria (a cobrança chega antes do sistema)
  const ux = estreito ? 352 : 486;
  const vx = estreito ? 410 : 566;
  const dx = estreito ? 392 : 538;
  const usuario = pessoa(ux, 332, 50);
  const voce = `${caixa(vx - 34, 186, 68, 52)}${pessoa(vx, 232, 40, "cs-pf")}`;
  const diretoria = `${caixa(dx - 46, 34, 92, 48)}${[0, 1, 2].map((i) => pessoa(dx - 24 + i * 24, 78, 30, "cs-pf")).join("")}`;
  const cobranca = curva(ux + 18, 300, ux + 48, 290, vx - 30, 236, "cs-l") + curva(vx, 182, vx + (estreito ? 4 : 10), 130, dx + 10, 88, "cs-l");
  return {
    svg: svg(w, [fundo(w), eixo + prazo, barras, sino, quebra, usuario + voce + diretoria, cobranca]),
    slots: [
      { x: pct(xp + 16, w), y: pct(150, H), lado: "direita", alerta: true },
      { x: pct(ux - 30, w), y: pct(304, H), lado: "esquerda" },
      { x: pct(dx - 56, w), y: pct(54, H), lado: "esquerda" },
    ],
    marcas: [
      { x: pct(xp + 18, w), y: pct(226.5 - 18, H), alerta: true },
      { x: pct(ux + 32, w), y: pct(300, H) },
      { x: pct(dx - 58, w), y: pct(58, H) },
    ],
    blocos: [
      { id: "prazo", x: pct(xp - 8, w), y: 31, lado: "esquerda" },
      { id: "usuario", x: pct(ux + 30, w), y: 95, lado: "direita" },
      { id: "voce", x: pct(vx - 34, w), y: pct(186 - 12, H), lado: "direita" },
      { id: "diretoria", x: pct(dx - 46, w), y: pct(18, H), lado: "direita" },
    ],
  };
}

// Cena 4 · Gestão pelo retrovisor: a diretoria pede o número e ele só existe olhando pra trás
function cenaRetrovisor(w: number): Desenho {
  const estreito = w < 600;
  const cx = estreito ? 150 : 230;
  // no alto, a diretoria com a pergunta descendo até você
  const dir = `${caixa(cx - 70, 22, 140, 46)}${[0, 1, 2].map((i) => pessoa(cx - 34 + i * 34, 64, 30, "cs-pf")).join("")}`;
  const voce = `${caixa(cx - 34, 116, 68, 50)}${pessoa(cx, 162, 40, "cs-pf")}`;
  const pede = seta(cx, 70, cx, 112, "cs-l");
  // no centro, fontes soltas exportando pra uma planilha com "?"
  const fx = 24;
  const fontes = `${painel(fx, 196, estreito ? 64 : 76, 52, false)}${bandeja(fx + 4, 290, estreito ? 56 : 64, 36)}`;
  const gx = estreito ? 120 : 150;
  const gw = estreito ? 120 : 150;
  const grade = planilha(gx, 214, gw, 104, 4, 5, [[1, 2], [3, 1], [2, 4], [0, 3]], !estreito);
  const exporta = curva(fx + (estreito ? 66 : 78), 222, gx - 20, 214, gx - 4, 240, "cs-l") + curva(fx + (estreito ? 62 : 70), 312, gx - 24, 316, gx - 4, 296, "cs-l") + seta(cx, 168, cx, 208, "cs-f");
  // à direita, o gráfico dentro do retrovisor, com o vão até "hoje"
  const rx = estreito ? 262 : 410;
  const rw = estreito ? 196 : 200;
  const rv = retrovisor(rx, 150, rw, 120);
  const vao = xis(rv.vao[0], rv.vao[1]);
  const liga = curva(gx + gw + 4, 250, rx - 30, 250, rx - 4, 222, "cs-f");
  return {
    svg: svg(w, [fundo(w), dir, pede + voce, fontes, grade + exporta, rv.svg + liga, vao]),
    slots: [
      { x: pct(cx + 76, w), y: 12.5, lado: "direita" },
      { x: pct(gx + gw / 2, w), y: 93.5, lado: "centro" },
      { x: pct(rx + rw, w), y: pct(150 - 18, H), lado: "esquerda", alerta: true },
    ],
    marcas: [
      { x: pct(cx + 70, w), y: pct(22, H) },
      { x: pct(gx + gw, w), y: pct(214, H) },
      { x: pct(rv.vao[0] - 26, w), y: pct(rv.vao[1] - 16, H), alerta: true },
    ],
    blocos: [
      { id: "diretoria", x: ((cx - 70) / w) * 100, y: 3, lado: "direita" },
      { id: "voce", x: ((cx + 40) / w) * 100, y: 38, lado: "direita" },
      { id: "passado", x: ((rx + 14) / w) * 100, y: 80.5, lado: "direita" },
      { id: "hoje", x: ((rx + rw - 14) / w) * 100, y: 80.5, lado: "esquerda" },
    ],
  };
}

// --------------------------------------------------------------------------
// montagem do cartão: desenho + rótulos (palavras da pessoa) + nomes de bloco
// --------------------------------------------------------------------------
export type CenaId = "perda" | "complexidade" | "sla" | "relatorio";
const DESENHOS: Record<CenaId, (w: number) => Desenho> = { perda: cenaFila, complexidade: cenaFerramenta, sla: cenaPrazo, relatorio: cenaRetrovisor };
const DESCRICAO: Record<CenaId, string> = {
  perda: "Pedidos chegando por mensagem, e-mail, pessoalmente e telefone, espalhados em montes soltos até o time de TI, sem uma fila; um pedido se perde no caminho.",
  complexidade: "A ferramenta atual no centro, com uma fila de ajustes parados em cima, uma única pessoa que sabe mexer nela e a maioria dos pedidos passando por fora, por e-mail e planilha.",
  sla: "Uma linha do tempo com o prazo: dois chamados fecham antes, um atravessa o prazo sem aviso; o usuário cobra você, e a cobrança sobe até a diretoria.",
  relatorio: "A diretoria pede números a você; os dados saem de várias fontes pra uma planilha montada à mão, e o gráfico só mostra até o mês passado.",
};
const BLOCOS: Record<string, string> = {
  time: "time de TI",
  ferramenta: "ferramenta atual",
  prazo: "prazo",
  usuario: "usuário",
  voce: "você",
  diretoria: "diretoria",
  passado: "mês passado",
  hoje: "hoje",
};

export type OpcoesCena = {
  rotulos: string[]; // 2 ou 3, na ordem dos slots (palavras da pessoa ou do chip)
  empresa?: string; // versão com logo: blocos "TI da X", "diretoria da X"
  logo?: { src: string; alt: string } | null;
};

function layout(id: CenaId, w: number, o: OpcoesCena): LayoutCena {
  const d = DESENHOS[id](w);
  const legenda = w < 600; // 4:3 no celular: marcador numerado + legenda embaixo
  const nomeBloco = (b: string) => {
    if (o.empresa && (b === "time" || b === "voce")) return `TI da ${o.empresa}`;
    if (o.empresa && b === "diretoria" && id === "relatorio") return `diretoria da ${o.empresa}`;
    return BLOCOS[b];
  };
  const rotulos: RotuloCena[] = [
    ...d.blocos.map((b) => ({ texto: nomeBloco(b.id), x: b.x, y: b.y, lado: b.lado, tipo: "bloco" as const })),
    ...o.rotulos.slice(0, d.slots.length).map((t, i) => {
      const s = legenda && d.marcas ? d.marcas[i] : d.slots[i];
      return { texto: t, x: s.x, y: s.y, lado: s.lado, alerta: d.slots[i].alerta, tipo: "anotacao" as const };
    }),
  ];
  return { svg: d.svg, proporcao: w / H, rotulos, placa: d.placa, legenda };
}

export function cenaSysaid(id: CenaId, o: OpcoesCena): DadosCena {
  const largo = layout(id, 640, o);
  const estreito = layout(id, 480, o);
  return {
    svg: largo.svg,
    proporcao: largo.proporcao,
    rotulos: largo.rotulos,
    descricao: DESCRICAO[id],
    logo: o.logo ?? null,
    nome: o.empresa,
    faixa: o.empresa ? { texto: `atendimento da ${o.empresa} hoje` } : undefined,
    estreito,
  };
}
