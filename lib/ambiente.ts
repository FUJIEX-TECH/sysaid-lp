// ==========================================================================
// Envio de teste x envio de produção.
// O banco Neon é um só (dev = prod), mas RD Station e o e-mail de notificação
// não podem receber lead de teste. Um envio é "de teste" quando vem do
// endereço provisório do site novo (stg.sysaid.com.br, atrás do Cloudflare
// Access), de preview da Cloudflare (*.workers.dev), de preview da Vercel
// (*.vercel.app) ou de máquina local. A detecção usa o cabeçalho Origin (o
// browser manda em todo POST cross-origin) e, como reforço, o host do page_url
// que o próprio formulário envia. A linha fica gravada normalmente, com o
// page_url do stg/local, e rdstation_status='failed' com o motivo, pra ser
// fácil de achar e ignorar no /admin.
// ==========================================================================

const TEST_HOST_PATTERNS: RegExp[] = [
  /^stg\.sysaid\.com\.br$/i,
  /\.workers\.dev$/i,
  /\.vercel\.app$/i,
  /^localhost(:\d+)?$/i,
  /^127\.0\.0\.1(:\d+)?$/i,
  /^192\.168\.\d+\.\d+(:\d+)?$/i,
];

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

export function isTestHost(host: string | null): boolean {
  if (!host) return false;
  return TEST_HOST_PATTERNS.some((re) => re.test(host));
}

// Devolve o host de teste detectado (pra registrar o motivo) ou null quando é produção.
export function detectTestEnvironment(
  origin: string | null,
  pageUrl: string | null | undefined
): string | null {
  const fromOrigin = hostOf(origin);
  if (isTestHost(fromOrigin)) return fromOrigin;
  const fromPage = hostOf(pageUrl);
  if (isTestHost(fromPage)) return fromPage;
  return null;
}
