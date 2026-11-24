// Trava de e-mail do SERVIDOR (rotas /api/lead*). Soma à regra do client a
// lista pública de ~10 mil domínios descartáveis (lib/disposable-domains.ts),
// que não vai pro navegador por causa do tamanho.
// Motivo (07/11/2026): em 04/11 um "lead completo" com e-mail uorak.com
// (descartável, vindo de site parceiro do Google) passou pela trava, disparou a
// conversão do Google Ads e treinou o Maximizar conversões.
import { getEmailDomain, isCorporateEmail } from "./email-domains";
import { DISPOSABLE_DOMAINS_FULL } from "./disposable-domains";

/** Domínio ou qualquer domínio-pai está na lista (pega a.b.uorak.com). */
export function isDisposableDomainFull(domain: string): boolean {
  const partes = domain.toLowerCase().split(".");
  for (let i = 0; i < partes.length - 1; i++) {
    if (DISPOSABLE_DOMAINS_FULL.has(partes.slice(i).join("."))) return true;
  }
  return false;
}

export function isCorporateEmailServer(email: string): boolean {
  if (!isCorporateEmail(email)) return false;
  return !isDisposableDomainFull(getEmailDomain(email));
}
