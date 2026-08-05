"use client";

import { useEffect, useRef, useState } from "react";

// Widget flutuante com cara de chat online, mas que na pratica e o mesmo
// formulario progressivo de leads (mesmos endpoints /api/lead e
// /api/lead/partial). Cada resposta vira uma "mensagem" do usuario e o
// bot conduz a proxima pergunta. A conversao do Google Ads e disparada
// direto no sucesso do envio (nao depende da /obrigado).

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "hotmail.com", "outlook.com", "live.com", "yahoo.com", "yahoo.com.br",
  "icloud.com", "uol.com.br", "bol.com.br", "terra.com.br", "globo.com", "ig.com.br",
  "msn.com", "aol.com", "protonmail.com", "me.com",
]);

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

// dispara a conversao do Google Ads + evento GA4 no sucesso do widget
function fireConversion() {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  const id = process.env.NEXT_PUBLIC_GADS_CONVERSION_ID;
  const label = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL;
  let tries = 0;
  const send = () => {
    if (typeof w.gtag === "function") {
      if (id && label) w.gtag("event", "conversion", { send_to: `${id}/${label}` });
      w.gtag("event", "generate_lead", { method: "chat_widget" });
    } else if (tries++ < 40) {
      setTimeout(send, 100);
    }
  };
  send();
}

type Msg = { from: "bot" | "user"; text: string };
type Step = "email" | "name" | "phone" | "company" | "admins" | "done";

const STEP_PROMPTS: Record<Exclude<Step, "done">, string> = {
  email: "Oi! 👋 Que bom te ver por aqui. Quer ver o SysAid funcionando na sua TI? Me passa seu e-mail corporativo que eu já inicio seu atendimento.",
  name: "Perfeito! E qual é o seu nome?",
  phone: "Prazer! 😊 Qual o melhor telefone ou WhatsApp pra gente falar com você?",
  company: "Anotado. De qual empresa você fala?",
  admins: "Última pergunta: quantos administradores de TI tem o seu time?",
};

const PLACEHOLDERS: Record<Exclude<Step, "done">, string> = {
  email: "seu@empresa.com.br",
  name: "Seu nome",
  phone: "(11) 99999-9999",
  company: "Nome da empresa",
  admins: "",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [step, setStep] = useState<Step>("email");
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: STEP_PROMPTS.email }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leadId = useRef<number | null>(null);
  const data = useRef<{ email: string; name: string; phone: string; company: string }>({
    email: "", name: "", phone: "", company: "",
  });
  const utm = useRef<Record<string, string>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function ensureUtm() {
    if (Object.keys(utm.current).length === 0) utm.current = getUtm();
    return utm.current;
  }

  // marca a origem como widget na propria URL gravada (o hash nao muda a
  // coluna "Página" do admin, mas fica visivel no detalhe do lead)
  function widgetUrl() {
    return window.location.href.split("#")[0] + "#chat-widget";
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing, open]);

  useEffect(() => {
    if (open) {
      setUnread(false);
      inputRef.current?.focus();
    }
  }, [open, step]);

  function botSay(text: string, next?: Step) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text }]);
      if (next) setStep(next);
    }, 700);
  }

  async function savePartial(fields: Record<string, string>) {
    try {
      const res = await fetch("/api/lead/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId.current ?? undefined,
          ...fields,
          page_url: widgetUrl(),
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const json = await res.json();
      if (json?.id) leadId.current = Number(json.id);
    } catch {
      // captura silenciosa: nunca trava o chat
    }
  }

  async function finalize(numAdmins: string) {
    setMsgs((m) => [...m, { from: "user", text: numAdmins === "" ? "Prefiro não dizer" : numAdmins }]);
    setTyping(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId.current ?? undefined,
          email: data.current.email,
          name: data.current.name,
          phone: data.current.phone,
          company: data.current.company,
          num_admins: numAdmins,
          website: "",
          page_url: widgetUrl(),
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const json = await res.json();
      setTyping(false);
      if (!res.ok || !json.ok) {
        setMsgs((m) => [...m, { from: "bot", text: "Ops, algo falhou ao registrar. Pode tentar de novo?" }]);
        return;
      }
      fireConversion();
      setStep("done");
      setMsgs((m) => [
        ...m,
        { from: "bot", text: `Prontinho, ${data.current.name.split(" ")[0]}! ✅ Um especialista da SysAid vai te chamar em breve pra liberar seu teste. Fica de olho no e-mail e no telefone.` },
      ]);
    } catch {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: "Erro de conexão. Tenta de novo em instantes?" }]);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = input.trim();
    if (!value) return;

    if (step === "email") {
      if (!value.includes("@") || !value.includes(".")) {
        setError("Me passa um e-mail válido pra continuar 🙂");
        return;
      }
      data.current.email = value;
      setMsgs((m) => [...m, { from: "user", text: value }]);
      setInput("");
      savePartial({ email: value });
      botSay(STEP_PROMPTS.name, "name");
      return;
    }

    if (step === "name") {
      if (value.length < 2) {
        setError("Pode me dizer seu nome?");
        return;
      }
      data.current.name = value;
      setMsgs((m) => [...m, { from: "user", text: value }]);
      setInput("");
      botSay(STEP_PROMPTS.phone, "phone");
      return;
    }

    if (step === "phone") {
      if (value.replace(/\D/g, "").length < 8) {
        setError("Esse telefone parece incompleto. Confere pra mim?");
        return;
      }
      data.current.phone = value;
      setMsgs((m) => [...m, { from: "user", text: value }]);
      setInput("");
      savePartial({ name: data.current.name, phone: value });
      const suggestion = suggestCompanyFromEmail(data.current.email);
      setInput(suggestion);
      botSay(STEP_PROMPTS.company, "company");
      return;
    }

    if (step === "company") {
      data.current.company = value;
      setMsgs((m) => [...m, { from: "user", text: value }]);
      setInput("");
      savePartial({ company: value });
      botSay(STEP_PROMPTS.admins, "admins");
      return;
    }
  }

  return (
    <div className={`chatw ${open ? "chatw--open" : ""}`}>
      {open && (
        <div className="chatw__panel" role="dialog" aria-label="Fale com a SysAid">
          <div className="chatw__head">
            <div className="chatw__avatar" aria-hidden="true">S</div>
            <div>
              <strong>SysAid Brasil</strong>
              <span className="chatw__status">
                <i className="chatw__dot" /> Online agora
              </span>
            </div>
            <button
              className="chatw__close"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
            >
              ×
            </button>
          </div>

          <div className="chatw__body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chatw__msg chatw__msg--${m.from}`}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="chatw__msg chatw__msg--bot chatw__typing">
                <span /><span /><span />
              </div>
            )}
            {step === "admins" && !typing && (
              <div className="chatw__chips">
                {["1-2", "3-10", "+10"].map((opt) => (
                  <button key={opt} className="chatw__chip" onClick={() => finalize(opt)}>
                    {opt === "1-2" ? "1 a 2" : opt === "3-10" ? "3 a 10" : "Mais de 10"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="chatw__error">{error}</p>}

          {step !== "admins" && step !== "done" && (
            <form className="chatw__composer" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type={step === "email" ? "email" : step === "phone" ? "tel" : "text"}
                value={input}
                placeholder={PLACEHOLDERS[step]}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Sua resposta"
              />
              <button type="submit" aria-label="Enviar mensagem">➤</button>
            </form>
          )}
        </div>
      )}

      <button
        className="chatw__fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar chat" : "Abrir chat com a SysAid"}
      >
        {open ? (
          <span className="chatw__fab-x">×</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <path
                d="M12 3C7 3 3 6.6 3 11c0 2.2 1 4.2 2.7 5.6-.1 1-.5 2.1-1.4 3 1.8-.1 3.3-.7 4.4-1.4 1 .3 2.1.5 3.3.5 5 0 9-3.6 9-8s-4-8-9-8Z"
                fill="currentColor"
              />
            </svg>
            {unread && <span className="chatw__badge">1</span>}
          </>
        )}
      </button>
    </div>
  );
}
