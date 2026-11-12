// conversa-core — utilitários genéricos (validação, máscara, chute de empresa).
import type { Contexto, EtapaConfig, Validacao } from "./tipos";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarValor(
  regras: Validacao[] | undefined,
  valor: string,
  ctx: Contexto,
  custom?: Record<string, (valor: string, ctx: Contexto) => string | null>
): string | null {
  for (const r of regras ?? []) {
    if (r.regra === "email" && !EMAIL_RE.test(valor.trim())) return r.mensagem;
    if (r.regra === "minCaracteres" && valor.trim().length < r.valor) return r.mensagem;
    if (r.regra === "minDigitos" && valor.replace(/\D/g, "").length < r.valor) return r.mensagem;
    if (r.regra === "telefoneBR" && !telefoneBRValido(valor, { celular: r.celular })) return r.mensagem;
    if (r.regra === "custom") {
      const fn = custom?.[r.nome];
      const erro = fn ? fn(valor, ctx) : null;
      if (erro) return erro;
    }
  }
  return null;
}

export function normalizar(etapa: EtapaConfig, valor: string): string {
  const v = valor.trim();
  return etapa.normalizar === "minusculas" ? v.toLowerCase() : v;
}

// --------------------------------------------------------------------------
// Telefone do Brasil (12/11/2026): DDD + número, sem o +55 e sem o 0 da
// operadora. Fixo: 10 dígitos, número começa de 2 a 5. Celular: 11 dígitos,
// começa com 9. DDD tem que existir (lista da Anatel).
// --------------------------------------------------------------------------
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

// só os dígitos nacionais: tira +55 (quando vem com "+" ou passa de 11 dígitos) e zeros na frente
export function digitosTelefoneBR(v: string): string {
  let d = (v ?? "").replace(/\D/g, "");
  if ((/^\s*\+/.test(v ?? "") || d.length > 11) && d.startsWith("55")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  return d;
}

export function telefoneBRValido(v: string, opts: { celular?: boolean } = {}): boolean {
  const d = digitosTelefoneBR(v);
  if (d.length !== 10 && d.length !== 11) return false;
  if (!DDDS.has(Number(d.slice(0, 2)))) return false;
  const numero = d.slice(2);
  if (/^(\d)\1+$/.test(numero) || /^9?(\d)\1+$/.test(numero)) return false; // 99999-9999, 9 1111-1111
  if (d.length === 11) return numero[0] === "9";
  if (opts.celular) return false;
  return /^[2-5]/.test(numero);
}

export function aplicarMascara(mascara: EtapaConfig["mascara"], v: string): string {
  if (mascara !== "telefone_br") return v;
  const d = digitosTelefoneBR(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// chute editável do nome da empresa pelo domínio do e-mail
export function sugerirEmpresa(email: string): string {
  const dominio = email.split("@")[1]?.toLowerCase().trim();
  if (!dominio) return "";
  const base = dominio.split(".")[0];
  if (!base) return "";
  return base
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function primeiroNome(nome: string | undefined): string {
  return (nome ?? "").trim().split(/\s+/)[0] ?? "";
}

// v2: nome da pessoa pela parte local do e-mail ("mariana.costa@" → "Mariana Costa").
// Só sugere quando parece nome: separador entre as partes, ou uma palavra só
// com 4+ letras. Caixas de função (contato, ti, suporte...) e números não viram nome.
const CAIXAS = new Set([
  "contato", "comercial", "vendas", "suporte", "atendimento", "sac", "admin", "administrativo", "info", "informacoes",
  "financeiro", "fiscal", "nfe", "faturamento", "compras", "rh", "dp", "marketing", "diretoria", "gerencia", "ti",
  "sistemas", "infra", "helpdesk", "servicedesk", "noreply", "no-reply", "naoresponda", "webmaster", "ouvidoria", "juridico",
  "contabilidade", "operacoes", "logistica", "qualidade", "projetos", "equipe", "time", "geral", "recepcao", "secretaria",
]);

export function sugerirNome(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase().trim();
  if (!local) return "";
  const semMais = local.split("+")[0];
  const partes = semMais
    .split(/[._-]+/)
    .map((p) => p.replace(/[^a-zà-ú]/gi, ""))
    .filter((p) => p.length >= 2 && !CAIXAS.has(p));
  if (!partes.length) return "";
  if (partes.length === 1 && partes[0].length < 4) return "";
  if (partes.length === 1 && !/[._-]/.test(semMais) && /^[a-z]{1,2}[a-z]+$/.test(partes[0]) && partes[0].length > 12) return "";
  return partes
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
