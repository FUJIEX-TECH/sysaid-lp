// Origem do clique (UTM + gclid) guardada no navegador.
// Antes, o formulário e o widget liam a UTM só da URL da página em que o lead
// era enviado: quem chegava por /topdesk?utm_... e navegava pra home perdia a
// origem no banco e no RD (caso Sertrading, 18/11/2026: clique pago na TopDesk,
// lead gravado em "/" sem campanha). Agora a UTM do pouso fica guardada por
// 30 dias e vale enquanto a URL atual não trouxer outra.
// Sem nada na URL nem guardado, o gclid vem do cookie _gcl_aw que a tag do
// Google grava em .sysaid.com.br (conferido em 19/11/2026: o clique que cai no
// site da SysAid, ex. sitelink "Clientes", deixa o cookie legível aqui). Só o
// gclid: a origem (utm_source) não é inventada.

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

const STORAGE_KEY = "sysaid_utm";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

function fromUrl(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  return found;
}

// chamado em toda página (GlobalRuntime): a UTM nova substitui a guardada
export function rememberUtm(): void {
  const found = fromUrl();
  if (Object.keys(found).length === 0) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ t: Date.now(), v: found }));
  } catch {
    // modo privado / storage bloqueado: segue só com a URL
  }
}

// _gcl_aw = "GCL.<segundos>.<gclid>"; vale dentro dos mesmos 30 dias
export function gclidFromCookie(cookie: string, now = Date.now()): string | null {
  const m = cookie.match(/(?:^|;\s*)_gcl_aw=GCL\.(\d+)\.([A-Za-z0-9_-]+)/);
  if (!m) return null;
  const t = Number(m[1]) * 1000;
  if (!t || now - t > TTL_MS || t - now > TTL_MS) return null;
  return m[2];
}

function fromStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const { t, v } = JSON.parse(raw) as { t: number; v: Record<string, string> };
    if (!t || Date.now() - t > TTL_MS || !v) return {};
    const clean: Record<string, string> = {};
    for (const k of UTM_KEYS) if (typeof v[k] === "string" && v[k]) clean[k] = v[k];
    return clean;
  } catch {
    return {};
  }
}

export function getUtm(): Record<string, string> {
  const found = fromUrl();
  if (Object.keys(found).length > 0) return found;
  const stored = fromStorage();
  if (Object.keys(stored).length > 0) return stored;
  try {
    const g = gclidFromCookie(document.cookie);
    return g ? { gclid: g } : {};
  } catch {
    return {};
  }
}
