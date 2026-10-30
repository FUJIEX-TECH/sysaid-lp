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

export function aplicarMascara(mascara: EtapaConfig["mascara"], v: string): string {
  if (mascara !== "telefone_br") return v;
  const d = v.replace(/\D/g, "").slice(0, 11);
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
