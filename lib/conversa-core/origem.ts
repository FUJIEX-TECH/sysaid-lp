// conversa-core — v2: de onde a pessoa veio. O navegador lê os sinais (URL,
// UTMs, gclid, referrer, página de entrada); a configuração do cliente diz,
// por regras, qual origem e quais variáveis esses sinais significam. Nada aqui
// conhece campanha de ninguém: "movidesk" só existe na configuração da SysAid.
import type { Casamento, CondicaoOrigem, ConfigConversa, OrigemRegra, Sinais } from "./tipos";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"] as const;

type Lembrado = { entrada: string; utm: Record<string, string>; quando: number };
const LEMBRAR_TTL = 2 * 60 * 60 * 1000;

// Lê os sinais da página atual. Com `lembrar`, guarda no sessionStorage a 1ª
// página e os UTMs da sessão: o anúncio cai na LP, a pessoa clica e chega no
// chat sem os parâmetros, e mesmo assim sabemos de onde veio.
export function lerSinais(lembrar?: string): Sinais {
  const url = new URL(window.location.href);
  const parametros: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    if (v) parametros[k] = v.slice(0, 200);
  });
  const utm: Record<string, string> = {};
  for (const k of UTM) if (parametros[k]) utm[k] = parametros[k];

  let entrada = "";
  if (lembrar) {
    try {
      const bruto = sessionStorage.getItem(lembrar);
      const salvo: Lembrado | null = bruto ? JSON.parse(bruto) : null;
      const valido = salvo && Date.now() - salvo.quando < LEMBRAR_TTL ? salvo : null;
      if (valido) {
        entrada = valido.entrada;
        // a URL atual não tem campanha: vale a lembrada
        if (!Object.keys(utm).length) Object.assign(utm, valido.utm);
      }
      if (!valido || Object.keys(utm).length) {
        const novo: Lembrado = { entrada: valido?.entrada || url.pathname, utm, quando: valido?.quando ?? Date.now() };
        entrada = novo.entrada;
        sessionStorage.setItem(lembrar, JSON.stringify(novo));
      }
    } catch {
      // sem storage (modo privado etc.): só a página atual
    }
  }

  return {
    caminho: url.pathname,
    entrada,
    referrer: typeof document !== "undefined" ? document.referrer : "",
    ...utm,
    parametros,
  };
}

// sinais mínimos a partir de um caminho (compatibilidade com a parte 1, e SSR)
export function sinaisDoCaminho(pathname: string): Sinais {
  return { caminho: pathname, entrada: "", referrer: "", parametros: {} };
}

function normal(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function segmento(pathname: string): string {
  return pathname.replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
}

export function casa(c: Casamento | undefined, valor: string | undefined): boolean {
  if (c === undefined) return true;
  const v = normal(valor ?? "");
  if (typeof c === "string") return v === normal(c);
  if (Array.isArray(c)) return c.some((x) => v === normal(x));
  if ("contem" in c) {
    const lista = Array.isArray(c.contem) ? c.contem : [c.contem];
    return lista.some((x) => v.includes(normal(x)));
  }
  if ("regex" in c) {
    try {
      return new RegExp(c.regex, "i").test(valor ?? "");
    } catch {
      return false;
    }
  }
  return false;
}

export function casaOrigem(c: CondicaoOrigem, s: Sinais): boolean {
  const temCampanha = !!(s.utm_source || s.utm_medium || s.utm_campaign || s.utm_term || s.utm_content || s.gclid);
  if (c.semCampanha !== undefined && temCampanha === c.semCampanha) return false;
  if (c.gclid !== undefined && !!s.gclid !== c.gclid) return false;
  if (c.caminho !== undefined && !casa(c.caminho, segmento(s.caminho))) return false;
  if (c.entrada !== undefined && !casa(c.entrada, segmento(s.entrada))) return false;
  if (c.referrer !== undefined && !casa(c.referrer, s.referrer)) return false;
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    if (c[k] !== undefined && !casa(c[k], s[k])) return false;
  }
  if (c.parametro) {
    for (const [nome, cas] of Object.entries(c.parametro)) if (!casa(cas, s.parametros[nome])) return false;
  }
  return true;
}

function casaRegra(r: OrigemRegra, s: Sinais): boolean {
  if ("alguma" in r.quando) return r.quando.alguma.some((c) => casaOrigem(c, s));
  return casaOrigem(r.quando, s);
}

// Regras primeiro (a 1ª "base" que casa define a origem; as "acrescentar" só
// somam variáveis), depois o slug do caminho ou da página de entrada, depois o padrão.
export function resolverOrigem(cfg: ConfigConversa["origens"], s: Sinais): { origem: string; variaveis: Record<string, string | null>; regras: string[] } {
  let origem: string | null = null;
  const variaveis: Record<string, string | null> = {};
  const regras: string[] = [];
  for (const r of cfg.regras ?? []) {
    if (!casaRegra(r, s)) continue;
    const modo = r.modo ?? "base";
    if (modo === "base") {
      if (origem) continue;
      origem = r.origem ?? null;
    }
    regras.push(r.id);
    for (const [k, v] of Object.entries(r.variaveis ?? {})) if (variaveis[k] === undefined) variaveis[k] = v;
  }
  if (!origem && cfg.porSlug) {
    const o = cfg.porSlug[segmento(s.caminho)] ?? cfg.porSlug[segmento(s.entrada)];
    if (o) {
      origem = o.origem;
      for (const [k, v] of Object.entries(o.variaveis)) if (variaveis[k] === undefined) variaveis[k] = v;
    }
  }
  return { origem: origem ?? cfg.padrao, variaveis, regras };
}
