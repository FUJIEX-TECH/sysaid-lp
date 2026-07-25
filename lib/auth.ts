import crypto from "crypto";

export const ADMIN_COOKIE = "sysaid_admin";

// Token de sessao derivado da senha (server-only). Quem nao sabe a senha
// nao consegue forjar o cookie. Simples e suficiente para um painel interno.
export function sessionToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update("sysaid-admin::" + pw).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

export function verifyCookie(value: string | undefined): boolean {
  if (!value || !process.env.ADMIN_PASSWORD) return false;
  return safeEqual(value, sessionToken());
}
