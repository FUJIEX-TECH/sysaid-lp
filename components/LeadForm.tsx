"use client";

import { useEffect, useRef, useState } from "react";

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

export default function LeadForm({ variant = "hero", submitLabel }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utm = useRef<Record<string, string>>({});

  // captura UTMs + gclid da URL uma vez
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    utm.current = found;
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload: Record<string, string> = {
      email: String(fd.get("email") || ""),
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      company: String(fd.get("company") || ""),
      num_admins: String(fd.get("num_admins") || ""),
      website: String(fd.get("website") || ""), // honeypot
      page_url: window.location.href,
      referrer: document.referrer,
      ...utm.current,
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
          onInput={(e) => {
            // abre os demais campos ao digitar a primeira letra (nao no clique/foco)
            if (e.currentTarget.value.length > 0) setExpanded(true);
          }}
        />
        {!expanded && (
          <button type="submit" className="btn btn--primary">
            {submitLabel || "Agende uma demonstração"}
          </button>
        )}
      </div>

      <div className={`leadform__more ${expanded ? "is-open" : ""}`}>
        <input type="text" name="name" placeholder="Nome completo" aria-label="Nome" />
        <input type="text" name="company" placeholder="Empresa" aria-label="Empresa" />
        <input type="tel" name="phone" placeholder="Telefone / WhatsApp" aria-label="Telefone" />
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
