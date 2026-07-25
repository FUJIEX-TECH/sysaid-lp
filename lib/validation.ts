import { z } from "zod";

// Espelha os campos do formulario sys_LP (WPForms 2070):
// email (gatilho, obrigatorio), nome e telefone obrigatorios, empresa opcional,
// numero de administradores (select). UTMs + gclid capturados da URL.
export const leadSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(8, "Telefone inválido").max(40),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  num_admins: z.enum(["1-2", "3-10", "+10"]).optional().or(z.literal("")),

  // atribuicao (ocultos)
  utm_source: z.string().max(255).optional().or(z.literal("")),
  utm_medium: z.string().max(255).optional().or(z.literal("")),
  utm_campaign: z.string().max(255).optional().or(z.literal("")),
  utm_content: z.string().max(255).optional().or(z.literal("")),
  utm_term: z.string().max(255).optional().or(z.literal("")),
  gclid: z.string().max(512).optional().or(z.literal("")),

  page_url: z.string().max(1000).optional().or(z.literal("")),
  referrer: z.string().max(1000).optional().or(z.literal("")),

  // honeypot anti-spam: aceita qualquer valor aqui; a rota descarta em silencio
  // se vier preenchido (nao barrar na validacao pra nao "ensinar" o bot).
  website: z.string().max(512).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

// normaliza "" -> null para gravar limpo no banco
export function nullify(v: string | undefined | null): string | null {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t.length ? t : null;
}
