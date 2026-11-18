// Origem do clique (UTM + gclid) guardada no navegador.
// Antes, o formulário e o widget liam a UTM só da URL da página em que o lead
// era enviado: quem chegava por /topdesk?utm_... e navegava pra home perdia a
// origem no banco e no RD (caso Sertrading, 18/11/2026: clique pago na TopDesk,
// lead gravado em "/" sem campanha). Agora a UTM do pouso fica guardada por
// 30 dias e vale enquanto a URL atual não trouxer outra.

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

export function getUtm(): Record<string, string> {
  const found = fromUrl();
  if (Object.keys(found).length > 0) return found;
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
