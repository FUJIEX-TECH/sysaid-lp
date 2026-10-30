"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import LeadForm from "./LeadForm";

// Porta de entrada do teste A/B do formulário (plano do Diagnóstico ITSM).
// A = formulário atual (LeadForm), renderizado no servidor como sempre.
// B = Qualifica v2 (30/10/2026): convite pra conversa em página própria
//     (/diagnostico), só quando a URL tem ?v=b (flag local de teste).
// chat = o widget da parte 1 dentro do hero (?v=chat), mantido pra comparação.
// Sem JavaScript, ou sem a flag, a pessoa vê o formulário atual.
// O sorteio 50/50 (decisão 6 do plano) não existe ainda: entra só com OK.

const DiagnosticoChat = dynamic(() => import("./diagnostico/DiagnosticoChat"), { ssr: false });
const ChatConvite = dynamic(() => import("./diagnostico/ChatConvite"), { ssr: false });

type Props = {
  variant?: "hero" | "final";
  submitLabel?: string;
};

export default function LeadEntry(props: Props) {
  const [variante, setVariante] = useState<"a" | "b" | "chat">("a");

  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("v");
      if (v === "b") setVariante("b");
      else if (v === "chat") setVariante("chat");
    } catch {
      // fica na A
    }
  }, []);

  if (variante === "b") return <ChatConvite />;
  if (variante === "chat") return <DiagnosticoChat />;
  return <LeadForm {...props} />;
}
