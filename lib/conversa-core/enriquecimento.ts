// conversa-core — v2, lado do navegador: empresa pelo domínio do e-mail. Manda
// SÓ o domínio pro endpoint do cliente (nunca o e-mail), com timeout; falha =
// null, e a conversa segue com o chute pelo domínio (util.ts, sugerirEmpresa).
import type { Empresa, EmpresaConfig } from "./tipos";

export function dominioDe(email: string): string {
  const d = (email.split("@")[1] ?? "").toLowerCase().trim();
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d) ? d : "";
}

export async function pedirEmpresa(cfg: EmpresaConfig, dominio: string): Promise<Empresa | null> {
  if (!cfg.habilitado || !dominio) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), cfg.timeoutMs);
  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dominio }),
      signal: ctl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<Empresa>;
    if (!data || typeof data.nome !== "string" || !data.dominio) return null;
    return {
      dominio: data.dominio,
      nome: data.nome,
      site: data.site ?? `https://${dominio}`,
      logo: data.logo,
      descricao: data.descricao,
      redes: data.redes ?? {},
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial,
      cidade: data.cidade,
      uf: data.uf,
      desde: data.desde,
      porte: data.porte,
      atividade: data.atividade,
      origem: data.origem === "site" || data.origem === "cnpj" ? data.origem : "fallback",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
