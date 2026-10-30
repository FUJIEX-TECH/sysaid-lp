"use client";

import { useMemo } from "react";
import ConversaChat from "@/lib/conversa-core/ui/ConversaChat";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { criarPersistenciaLP } from "@/lib/diagnostico/persistencia";

// Diagnóstico ITSM (variante B do formulário da LP) = motor genérico
// (lib/conversa-core) + configuração da SysAid (lib/diagnostico/config-sysaid.ts)
// + gravação da LP (lib/diagnostico/persistencia.ts).
// Plano: clientes/sysaid/formulario-inteligente/diagnostico-itsm-plano.html.
// Eventos (GA4 por etapa) entram por `onEvento` na parte 2.

export default function DiagnosticoChat() {
  const persistencia = useMemo(() => criarPersistenciaLP(), []);
  return <ConversaChat config={configSysaid} persistencia={persistencia} />;
}
