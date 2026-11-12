"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ConversaTela from "@/lib/conversa-core/ui/ConversaTela";
import ConversionPing from "@/components/ConversionPing";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { criarPersistenciaLP } from "@/lib/diagnostico/persistencia";
import type { Evento } from "@/lib/conversa-core";

const TEXTOS = {
  // sem linha de fonte no cartão da empresa: o chat não anuncia de onde tirou o dado (regra do Fernando, 11/11/2026)
  empresaRotulos: { site: "Site", razaoSocial: "Razão social", cidade: "Cidade", desde: "Desde", porte: "Porte", atividade: "Atividade" },
};

// 12/11/2026: com o mapa liberado na própria tela (config.entrega), a pessoa não
// passa mais pela /obrigado. A conversão (Google Ads "Lead - Formulário LP" e
// GA4 generate_lead) dispara aqui mesmo, com o mesmo ConversionPing e a mesma
// trava: só existe a marca "sysaid_lead" no sessionStorage se o envio gravou e
// não caiu no honeypot (persistencia.ts). Monta só quando o envio deu certo E o
// mapa foi liberado; se um dia o envio redirecionar, a /obrigado cuida.
export default function QualificaTelaInner() {
  const persistencia = useMemo(() => criarPersistenciaLP(), []);
  const [converter, setConverter] = useState(false);
  const marcas = useRef({ envio: false, entrega: false });
  const onEvento = useCallback((e: Evento) => {
    if (process.env.NODE_ENV !== "production") console.log("[qualifica]", e.tipo, e);
    if (e.tipo === "envio" && e.ok) marcas.current.envio = true;
    if (e.tipo === "entrega") marcas.current.entrega = true;
    if (marcas.current.envio && marcas.current.entrega) setConverter(true);
  }, []);
  return (
    <>
      <ConversaTela config={configSysaid} persistencia={persistencia} onEvento={onEvento} textos={TEXTOS} />
      {converter && <ConversionPing />}
    </>
  );
}
