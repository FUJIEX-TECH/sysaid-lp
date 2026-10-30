// conversa-core/servidor — v2: lê a empresa pelo domínio do e-mail, sem chave
// paga: o site público da empresa (título, og:site_name, descrição, ícone,
// redes sociais, CNPJ no rodapé) e, se achou CNPJ, a BrasilAPI (razão social,
// cidade, abertura, porte). Timeout curto, cache por domínio, fallback no chute
// pelo domínio. Só roda no servidor (fetch de fora). Nunca recebe o e-mail.
//
// Proteção: só https, só hostname válido, sem IP, sem rede privada (checa o
// DNS antes), no máximo 300 KB de HTML, sem seguir pra fora de http(s).
import { lookup } from "node:dns/promises";
import type { Empresa } from "../tipos";
import { criarCache } from "./custo";

export type EmpresaServidorConfig = {
  habilitado: boolean;
  timeoutMs: number; // por requisição (site e CNPJ, cada uma)
  cache: { ttlMs: number; maximo: number };
  // fonte de ícone quando o site não declara um; {dominio} é trocado
  iconeFallback?: string; // ex.: "https://www.google.com/s2/favicons?domain={dominio}&sz=128"
  // consulta de CNPJ (BrasilAPI por padrão); vazio = não consulta
  cnpjUrl?: string; // ex.: "https://brasilapi.com.br/api/cnpj/v1/{cnpj}"
  userAgent?: string;
};

const HOST_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

function privado(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  return (
    p[0] === 10 ||
    p[0] === 127 ||
    p[0] === 0 ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 169 && p[1] === 254) ||
    p[0] >= 224
  );
}

async function hostSeguro(host: string): Promise<boolean> {
  if (!HOST_RE.test(host)) return false;
  if (/\.(local|internal|localhost|lan|home|arpa)$/.test(host)) return false;
  try {
    const r = await lookup(host, { all: true });
    return r.length > 0 && r.every((a) => !privado(a.address));
  } catch {
    return false;
  }
}

async function buscar(url: string, timeoutMs: number, ua: string, maxBytes: number): Promise<{ texto: string; urlFinal: string } | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: "follow",
      headers: { "User-Agent": ua, Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5", "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5" },
    });
    if (!res.ok || !res.body) return null;
    if (!/^https?:/.test(res.url)) return null;
    const reader = res.body.getReader();
    const partes: Uint8Array[] = [];
    let total = 0;
    while (total < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      partes.push(value);
      total += value.length;
    }
    reader.cancel().catch(() => {});
    const junto = new Uint8Array(total);
    let off = 0;
    for (const p of partes) {
      junto.set(p.subarray(0, Math.min(p.length, total - off)), off);
      off += p.length;
      if (off >= total) break;
    }
    return { texto: new TextDecoder("utf-8", { fatal: false }).decode(junto), urlFinal: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function attr(tag: string, nome: string): string | undefined {
  const m = tag.match(new RegExp(`\\s${nome}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return (m?.[1] ?? m?.[2] ?? m?.[3])?.trim();
}

function metas(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const chave = attr(tag, "property") ?? attr(tag, "name");
    const conteudo = attr(tag, "content");
    if (chave && conteudo && out[chave.toLowerCase()] === undefined) out[chave.toLowerCase()] = decodificar(conteudo);
  }
  return out;
}

function decodificar(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "SysAid | ITSM com IA" → "SysAid"; "Home - Empresa X" → "Empresa X"
function nomeDoTitulo(titulo: string): string {
  const partes = titulo
    .split(/\s[|–—\-:·•]\s|\s\|\s|\s-\s/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!partes.length) return "";
  const genericos = /^(home|início|inicio|página inicial|pagina inicial|bem[- ]vindo|welcome|site oficial|oficial)$/i;
  const candidatos = partes.filter((p) => !genericos.test(p) && p.length <= 48);
  if (!candidatos.length) return partes[0].slice(0, 48);
  return candidatos.sort((a, b) => a.length - b.length)[0];
}

function absoluta(href: string, base: string): string | undefined {
  try {
    const u = new URL(href, base);
    return /^https?:$/.test(u.protocol) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

function icone(html: string, base: string): string | undefined {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  let melhor: { url: string; peso: number } | null = null;
  for (const tag of links) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (!href) continue;
    let peso = 0;
    if (rel.includes("apple-touch-icon")) peso = 3;
    else if (rel.includes("icon")) {
      const tam = parseInt((attr(tag, "sizes") ?? "0").split("x")[0], 10) || 0;
      const svg = /svg/i.test(attr(tag, "type") ?? "") || /\.svg(\?|$)/i.test(href);
      peso = svg ? 2.5 : tam >= 96 ? 2 : tam >= 32 ? 1 : 0.5;
    } else continue;
    const url = absoluta(href, base);
    if (url && (!melhor || peso > melhor.peso)) melhor = { url, peso };
  }
  return melhor?.url;
}

function redes(html: string): Empresa["redes"] {
  const r: Empresa["redes"] = {};
  const hrefs = Array.from(html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)).map((m) => m[1]);
  for (const h of hrefs) {
    const l = h.toLowerCase();
    if (!r.instagram && /instagram\.com\/[a-z0-9._]{2,}/.test(l) && !/\/(p|reel|explore)\//.test(l)) r.instagram = absoluta(h, "https://instagram.com");
    if (!r.linkedin && /linkedin\.com\/(company|school)\/[a-z0-9._-]{2,}/.test(l)) r.linkedin = absoluta(h, "https://linkedin.com");
    if (!r.facebook && /facebook\.com\/[a-z0-9.]{3,}/.test(l) && !/\/(sharer|share|dialog|plugins)/.test(l)) r.facebook = absoluta(h, "https://facebook.com");
    if (!r.youtube && /youtube\.com\/(@|c\/|channel\/|user\/)[a-z0-9._-]{2,}/.test(l)) r.youtube = absoluta(h, "https://youtube.com");
  }
  return r;
}

function cnpjNoHtml(html: string): string | undefined {
  const m = html.match(/\b(\d{2})\.?(\d{3})\.?(\d{3})\/?(\d{4})-?(\d{2})\b/);
  if (!m) return undefined;
  const digitos = m.slice(1).join("");
  return cnpjValido(digitos) ? digitos : undefined;
}

function cnpjValido(c: string): boolean {
  if (!/^\d{14}$/.test(c) || /^(\d)\1+$/.test(c)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = base.split("").reduce((a, d, i) => a + Number(d) * pesos[i], 0);
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(c.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(c[12]) && d2 === Number(c[13]);
}

// "RD GESTAO E SISTEMAS S.A." → "RD Gestao e Sistemas S.A." (siglas e tipos societários ficam em caixa alta)
function capitalizar(s: string): string {
  const minusculas = new Set(["de", "da", "do", "das", "dos", "e", "em", "a", "o"]);
  const siglas = /^(s\.?a\.?|ltda\.?|me|epp|eireli|s\/a|sa|s\.s\.|cia\.?)$/i;
  return s
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const l = w.toLowerCase();
      if (i > 0 && minusculas.has(l)) return l;
      if (siglas.test(l)) return w.toUpperCase();
      if (w.length <= 2 && w === w.toUpperCase() && /^[A-Z]+$/.test(w)) return w;
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(" ");
}

// porte da Receita: "DEMAIS" é "nem micro nem pequena", não vale mostrar
const PORTES: Record<string, string> = { "MICRO EMPRESA": "Microempresa", ME: "Microempresa", "EMPRESA DE PEQUENO PORTE": "Pequeno porte", EPP: "Pequeno porte" };

// chute pelo domínio (o mesmo de util.ts, repetido aqui pra não importar do lado do navegador)
function chutePeloDominio(dominio: string): string {
  const base = dominio.split(".")[0];
  return base
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function criarLeitorDeEmpresa(cfg: EmpresaServidorConfig) {
  const cache = criarCache<Empresa>(cfg.cache.ttlMs, cfg.cache.maximo);
  const ua = cfg.userAgent ?? "Mozilla/5.0 (compatible; QualificaBot/1.0; +https://fujiextech.com)";

  async function cnpj(digitos: string): Promise<Partial<Empresa> | null> {
    if (!cfg.cnpjUrl) return null;
    const r = await buscar(cfg.cnpjUrl.replace("{cnpj}", digitos), cfg.timeoutMs, ua, 64 * 1024);
    if (!r) return null;
    try {
      const j = JSON.parse(r.texto) as Record<string, unknown>;
      const str = (k: string) => (typeof j[k] === "string" ? (j[k] as string).trim() : "");
      const abertura = str("data_inicio_atividade");
      return {
        razaoSocial: str("razao_social") ? capitalizar(str("razao_social")) : undefined,
        nome: str("nome_fantasia") ? capitalizar(str("nome_fantasia")) : undefined,
        cidade: str("municipio") ? capitalizar(str("municipio")) : undefined,
        uf: str("uf") || undefined,
        desde: abertura ? abertura.slice(0, 4) : undefined,
        porte: PORTES[str("porte").toUpperCase()],
        atividade: str("cnae_fiscal_descricao") ? str("cnae_fiscal_descricao").charAt(0).toUpperCase() + str("cnae_fiscal_descricao").slice(1).toLowerCase() : undefined,
      };
    } catch {
      return null;
    }
  }

  async function ler(dominioBruto: string): Promise<Empresa> {
    const dominio = dominioBruto.toLowerCase().trim();
    const fallback: Empresa = { dominio, nome: chutePeloDominio(dominio), site: `https://${dominio}`, redes: {}, origem: "fallback" };
    if (!cfg.habilitado) return fallback;
    const emCache = cache.get(dominio);
    if (emCache) return emCache;
    if (!(await hostSeguro(dominio))) return fallback;

    // www. primeiro (a maioria dos sites redireciona pra lá); depois a raiz
    const pagina = (await buscar(`https://www.${dominio}/`, cfg.timeoutMs, ua, 300 * 1024)) ?? (await buscar(`https://${dominio}/`, cfg.timeoutMs, ua, 300 * 1024));
    const empresa: Empresa = { ...fallback };
    if (pagina) {
      const html = pagina.texto;
      const m = metas(html);
      const titulo = decodificar(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      const nome = m["og:site_name"] || (m["og:title"] ? nomeDoTitulo(m["og:title"]) : "") || nomeDoTitulo(titulo);
      if (nome && nome.length <= 60) empresa.nome = nome;
      const desc = m["description"] || m["og:description"];
      if (desc) empresa.descricao = desc.slice(0, 180);
      empresa.site = pagina.urlFinal.replace(/\/$/, "");
      empresa.logo = icone(html, pagina.urlFinal);
      empresa.redes = redes(html);
      empresa.origem = "site";
      const digitos = cnpjNoHtml(html);
      if (digitos) {
        empresa.cnpj = digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        const c = await cnpj(digitos);
        if (c) {
          Object.assign(empresa, Object.fromEntries(Object.entries(c).filter(([k, v]) => v !== undefined && k !== "nome")));
          if (c.nome && (!nome || nome.length < 3)) empresa.nome = c.nome;
          empresa.origem = "cnpj";
        }
      }
    }
    if (!empresa.logo && cfg.iconeFallback) empresa.logo = cfg.iconeFallback.replace("{dominio}", encodeURIComponent(dominio));
    cache.set(dominio, empresa);
    return empresa;
  }

  return { ler, cfg };
}

export type LeitorDeEmpresa = ReturnType<typeof criarLeitorDeEmpresa>;
