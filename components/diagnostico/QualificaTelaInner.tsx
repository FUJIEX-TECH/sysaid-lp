"use client";

import { useMemo } from "react";
import ConversaTela from "@/lib/conversa-core/ui/ConversaTela";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { criarPersistenciaLP } from "@/lib/diagnostico/persistencia";
import type { Evento } from "@/lib/conversa-core";

const TEXTOS = {
  empresaFonte: "Dados públicos do site da empresa e da Receita Federal. Se não for essa, é só corrigir o nome.",
  empresaRotulos: { site: "Site", razaoSocial: "Razão social", cidade: "Cidade", desde: "Desde", porte: "Porte", atividade: "Atividade" },
};

export default function QualificaTelaInner() {
  const persistencia = useMemo(() => criarPersistenciaLP(), []);
  const onEvento = useMemo(
    () => (process.env.NODE_ENV !== "production" ? (e: Evento) => console.log("[qualifica]", e.tipo, e) : undefined),
    []
  );
  return <ConversaTela config={configSysaid} persistencia={persistencia} onEvento={onEvento} textos={TEXTOS} />;
}
