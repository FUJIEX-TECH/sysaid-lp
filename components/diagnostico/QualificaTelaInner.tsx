"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ConversaTela from "@/lib/conversa-core/ui/ConversaTela";
import ConversionPing from "@/components/ConversionPing";
import { lerSinais, type Evento } from "@/lib/conversa-core";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { configSysaidGenerica } from "@/lib/diagnostico/config-sysaid-generica";
import { escolherConfig } from "@/lib/diagnostico/escolher-config";
import { derivados, notasGenerica } from "@/lib/diagnostico/generica-sysaid";
import { criarPersistenciaLP } from "@/lib/diagnostico/persistencia";

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
// 13/11/2026: a configuração sai da origem (escolher-config.ts): busca genérica
// = fluxo novo com documento; comparativa, marca e preço = fluxo de sempre.
// A conversa inteira vai pro /admin/qualifica (persistência).
export default function QualificaTelaInner() {
  const config = useMemo(() => escolherConfig(lerSinais(configSysaid.origens.lembrar)), []);
  const persistencia = useMemo(
    () =>
      config.id === configSysaidGenerica.id
        ? criarPersistenciaLP({ fluxo: config.id, notas: (_r, ctx) => notasGenerica(ctx), derivados })
        : criarPersistenciaLP({ fluxo: config.id }),
    [config]
  );
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
      <ConversaTela config={config} persistencia={persistencia} onEvento={onEvento} textos={TEXTOS} />
      {converter && <ConversionPing />}
    </>
  );
}
