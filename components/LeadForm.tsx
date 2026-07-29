"use client";

import { useRef, useState } from "react";

type Props = {
  variant?: "hero" | "final";
  submitLabel?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

// domínios de webmail/gratuitos: nao da pra inferir empresa a partir deles
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "hotmail.com", "outlook.com", "live.com", "yahoo.com", "yahoo.com.br",
  "icloud.com", "uol.com.br", "bol.com.br", "terra.com.br", "globo.com", "ig.com.br",
  "msn.com", "aol.com", "protonmail.com", "me.com",
]);

// sugestao heuristica de nome de empresa a partir do dominio do e-mail
// corporativo. Nao é enriquecimento real (sem API paga) - so um chute
// editavel pra poupar digitação de quem tem e-mail corporativo.
function suggestCompanyFromEmail(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return "";
  const base = domain.split(".")[0];
  if (!base) return "";
  return base
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function getUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  return found;
}

export default function LeadForm({ variant = "hero", submitLabel }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState("");

  const leadId = useRef<number | null>(null);
  const savedEmail = useRef<string>("");
  const savedNamePhone = useRef<string>("");
  const utm = useRef<Record<string, string>>({});

  function ensureUtm() {
    if (Object.keys(utm.current).length === 0) utm.current = getUtm();
    return utm.current;
  }

  // etapa 1: grava o e-mail sozinho, silenciosamente, ao sair do campo
  async function saveEmailPartial(email: string) {
    if (!email || !email.includes("@") || email === savedEmail.current) return;
    savedEmail.current = email;
    try {
      const res = await fetch("/api/lead/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId.current ?? undefined,
          email,
          page_url: window.location.href,
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const data = await res.json();
      // o Neon devolve bigint como string ("13") - converter, senao o zod
      // do backend rejeita o proximo request (id teria que ser number)
      if (data?.id) leadId.current = Number(data.id);
    } catch {
      // captura silenciosa: nunca bloqueia o usuario se isso falhar
    }
  }

  // etapa 2: grava nome+telefone, silenciosamente, quando os dois estiverem preenchidos
  async function saveNamePhonePartial(name: string, phone: string) {
    const key = `${name}|${phone}`;
    if (!name || !phone || key === savedNamePhone.current) return;
    savedNamePhone.current = key;
    try {
      const res = await fetch("/api/lead/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId.current ?? undefined,
          name,
          phone,
          page_url: window.location.href,
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const data = await res.json();
      // o Neon devolve bigint como string ("13") - converter, senao o zod
      // do backend rejeita o proximo request (id teria que ser number)
      if (data?.id) leadId.current = Number(data.id);
    } catch {
      // idem: nao bloqueia
    }
  }

  // etapa 1: so grava silenciosamente (rede de seguranca se o usuario sumir
  // sem clicar em nada). Nao revela a etapa 2 - isso so acontece no clique.
  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const email = e.currentTarget.value.trim();
    if (email.includes("@")) saveEmailPartial(email);
  }

  // etapa 2: idem, so grava silenciosamente - nao revela a etapa 3 sozinho.
  function handleNamePhoneBlur(form: HTMLFormElement) {
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim() || "";
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value.trim() || "";
    if (name.length >= 2 && phone.length >= 8) saveNamePhonePartial(name, phone);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    // passo 1 -> 2: clicar em "Agendar" so revela nome+telefone (nao finaliza nada)
    if (step === 1) {
      const email = String(fd.get("email") || "").trim();
      if (!email.includes("@")) {
        setError("Informe um e-mail válido.");
        return;
      }
      await saveEmailPartial(email);
      setStep(2);
      return;
    }

    // passo 2 -> 3: revela empresa (com sugestao) + admins
    if (step === 2) {
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      if (name.length < 2 || phone.length < 8) {
        setError("Preencha nome e telefone para continuar.");
        return;
      }
      await saveNamePhonePartial(name, phone);
      if (!company) {
        const email = String(fd.get("email") || "").trim();
        const suggestion = suggestCompanyFromEmail(email);
        if (suggestion) setCompany(suggestion);
      }
      setStep(3);
      return;
    }

    // passo 3: finalizacao de verdade
    const payload: Record<string, unknown> = {
      id: leadId.current ?? undefined,
      email: String(fd.get("email") || ""),
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      company: String(fd.get("company") || ""),
      num_admins: String(fd.get("num_admins") || ""),
      website: String(fd.get("website") || ""), // honeypot
      page_url: window.location.href,
      referrer: document.referrer,
      ...ensureUtm(),
    };

    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError("Não foi possível enviar. Confira os campos e tente de novo.");
        setSending(false);
        return;
      }
      // marca o envio para a /obrigado disparar a conversao, e redireciona
      sessionStorage.setItem("sysaid_lead", "1");
      window.location.href = "/obrigado";
    } catch {
      setError("Erro de conexão. Tente novamente em instantes.");
      setSending(false);
    }
  }

  return (
    <form
      className={`leadform leadform--${variant}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {/* honeypot invisivel */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />

      <div className="leadform__row">
        <input
          type="email"
          name="email"
          required
          placeholder="Seu e-mail corporativo"
          aria-label="E-mail corporativo"
          onBlur={handleEmailBlur}
        />
        {step === 1 && (
          <button type="submit" className="btn btn--primary">
            {submitLabel || "Agende uma demonstração"}
          </button>
        )}
      </div>

      {error && step === 1 && <p className="leadform__error">{error}</p>}

      <div className={`leadform__more ${step >= 2 ? "is-open" : ""}`}>
        <input
          type="text"
          name="name"
          placeholder="Nome completo"
          aria-label="Nome"
          onBlur={(e) => handleNamePhoneBlur(e.currentTarget.form as HTMLFormElement)}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Telefone / WhatsApp"
          aria-label="Telefone"
          onBlur={(e) => handleNamePhoneBlur(e.currentTarget.form as HTMLFormElement)}
        />
        {error && step === 2 && <p className="leadform__error">{error}</p>}
        {step === 2 && (
          <button type="submit" className="btn btn--primary btn--block">
            Continuar
          </button>
        )}
      </div>

      <div className={`leadform__more ${step >= 3 ? "is-open" : ""}`}>
        <input
          type="text"
          name="company"
          placeholder="Empresa"
          aria-label="Empresa"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <select name="num_admins" aria-label="Número de administradores de TI" defaultValue="">
          <option value="" disabled>
            Nº de administradores de TI
          </option>
          <option value="1-2">1 a 2</option>
          <option value="3-10">3 a 10</option>
          <option value="+10">Mais de 10</option>
        </select>

        {error && <p className="leadform__error">{error}</p>}

        <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
          {sending ? "Enviando..." : submitLabel || "Agende uma demonstração"}
        </button>
        <p className="leadform__legal">
          Ao enviar, você concorda em ser contatado pela SysAid. Sem spam.
        </p>
      </div>
    </form>
  );
}
