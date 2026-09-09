// ==========================================================================
// Domínios de e-mail que NÃO qualificam como corporativo.
// Fonte única: usada no client (LeadForm) e no server (validation/Zod).
// Antes essa lista vivia hardcoded dentro do LeadForm.tsx e só servia pra
// heurística de nome de empresa; agora ela também barra o lead.
// ==========================================================================

// Webmail gratuito: pessoa física, não dá pra inferir empresa nem qualificar.
export const FREE_EMAIL_DOMAINS = new Set([
  // Google
  "gmail.com", "googlemail.com",
  // Microsoft
  "hotmail.com", "hotmail.com.br", "outlook.com", "outlook.com.br",
  "live.com", "live.com.br", "msn.com",
  // Yahoo
  "yahoo.com", "yahoo.com.br", "ymail.com", "rocketmail.com",
  // Apple
  "icloud.com", "me.com", "mac.com",
  // Provedores BR
  "uol.com.br", "bol.com.br", "terra.com.br", "globo.com", "globomail.com",
  "ig.com.br", "r7.com", "oi.com.br", "pop.com.br", "superig.com.br",
  "click21.com.br", "itelefonica.com.br", "brturbo.com.br", "veloxmail.com.br",
  "zipmail.com.br", "ibest.com.br",
  // Internacionais
  "aol.com", "protonmail.com", "proton.me", "pm.me", "zoho.com",
  "gmx.com", "gmx.net", "mail.com", "tutanota.com", "yandex.com",
  "hey.com", "fastmail.com", "hushmail.com",
]);

// E-mail descartável / temporário: nunca deve entrar no CRM.
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "temp-mail.org", "throwaway.email", "yopmail.com", "sharklasers.com",
  "dispostable.com", "trashmail.com", "getnada.com", "maildrop.cc",
  "fakeinbox.com", "mytemp.email", "moakt.com", "emailondeck.com",
  "spamgourmet.com", "mailnesia.com", "tempr.email", "discard.email",
]);

export function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase().trim() || "";
}

export function isFreeEmail(email: string): boolean {
  return FREE_EMAIL_DOMAINS.has(getEmailDomain(email));
}

export function isDisposableEmail(email: string): boolean {
  return DISPOSABLE_EMAIL_DOMAINS.has(getEmailDomain(email));
}

/**
 * E-mail corporativo = tem domínio, não é webmail gratuito e não é descartável.
 * Não valida formato (isso é papel do Zod .email() no server e do type=email
 * no client); assume que já passou por lá.
 */
export function isCorporateEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain || !domain.includes(".")) return false;
  return !FREE_EMAIL_DOMAINS.has(domain) && !DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

// Mensagem única, usada no client e no server, pra não divergir o texto.
export const CORPORATE_EMAIL_ERROR =
  "Use seu e-mail corporativo (não aceitamos Gmail, Hotmail, Outlook e similares).";
