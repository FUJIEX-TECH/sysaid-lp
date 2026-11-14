// conversa-core — cor da marca da empresa lida (14/11/2026). Funções puras, sem
// DOM: o servidor acha a cor no site (theme-color) e o navegador pode achar no
// logo; aqui só se decide se ela SERVE pra pintar o desenho no fundo escuro
// (e no papel claro) ou se cai no fallback. Regra: tem que ter saturação (cinza,
// preto e branco não são "cor da marca"), não pode ser quase branca, e se for
// escura demais clareia misturando com branco até 3 passos; não deu, descarta.

export function corHex(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  const m3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s);
  if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`.toLowerCase();
  const m6 = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
  return m6 ? `#${m6[1]}`.toLowerCase() : null;
}

function rgbDe(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
function hexDe(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("")}`;
}
// luminância relativa (WCAG), 0 a 1
export function luminancia(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
// saturação (HSL), 0 a 1
function saturacao(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const l = (max + min) / 2;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

export type CorMarca = { hex: string; clareada: boolean };

// a cor como vai pintar o desenho, ou null (= fallback na cor do contexto)
export function corDaMarcaUsavel(v: unknown): CorMarca | null {
  const hex = corHex(v);
  if (!hex) return null;
  let [r, g, b] = rgbDe(hex);
  if (saturacao(r, g, b) < 0.18) return null;
  let L = luminancia(r, g, b);
  if (L > 0.78) return null;
  let clareada = false;
  for (let i = 0; i < 3 && L < 0.14; i++) {
    r += (255 - r) * 0.28;
    g += (255 - g) * 0.28;
    b += (255 - b) * 0.28;
    L = luminancia(r, g, b);
    clareada = true;
  }
  // clarear mistura com branco e lava a cor: quase preto vira cinza, e cinza não é marca
  if (L < 0.14 || saturacao(r, g, b) < 0.18) return null;
  return { hex: hexDe(r, g, b), clareada };
}

// a cor dominante de uma lista de pixels RGBA (o navegador manda os pixels do
// logo): ignora transparente, quase branco e quase preto, agrupa em caixas de
// 32 níveis e devolve a caixa mais cheia (média dos pixels dela). Pura, testável.
export function corDominante(pixels: ArrayLike<number>): string | null {
  const caixas = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 128) continue;
    const r = pixels[i],
      g = pixels[i + 1],
      b = pixels[i + 2];
    if (saturacao(r, g, b) < 0.25) continue; // branco, preto e cinza não contam
    const L = luminancia(r, g, b);
    if (L > 0.85 || L < 0.02) continue;
    const k = ((r >> 5) << 10) | ((g >> 5) << 5) | (b >> 5);
    const c = caixas.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    c.n++;
    c.r += r;
    c.g += g;
    c.b += b;
    caixas.set(k, c);
  }
  let melhor: { n: number; r: number; g: number; b: number } | null = null;
  for (const c of caixas.values()) if (!melhor || c.n > melhor.n) melhor = c;
  if (!melhor || melhor.n < 12) return null;
  return hexDe(melhor.r / melhor.n, melhor.g / melhor.n, melhor.b / melhor.n);
}
