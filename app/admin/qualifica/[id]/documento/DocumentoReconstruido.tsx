"use client";

import { useMemo } from "react";
import "@/lib/conversa-core/ui/tela.css";
import "@/components/diagnostico/qualifica.css";
import Documento from "@/lib/conversa-core/ui/Documento";
import Entrega from "@/lib/conversa-core/ui/Entrega";
import { criarMotor, dataHoje, type Contexto, type Empresa, type Gerado, type Sinais } from "@/lib/conversa-core";
import { FLUXOS } from "@/lib/diagnostico/escolher-config";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";

type Dados = { respostas?: Record<string, string>; gerados?: Record<string, Gerado>; empresa?: Empresa | null; sinais?: Sinais | null };

// reconstrução do documento no /admin: mesma config, mesmo motor, mesmo componente
export default function DocumentoReconstruido({ fluxo, dados, criadoEm }: { fluxo: string; dados: Dados; criadoEm: string }) {
  const config = FLUXOS[fluxo] ?? configSysaid;
  const motor = useMemo(() => criarMotor(config), [config]);
  const ctx: Contexto = useMemo(
    () => motor.contexto(dados.sinais ?? "/diagnostico", dados.respostas ?? {}, undefined, dados.gerados ?? {}, dados.empresa ?? null),
    [motor, dados]
  );
  const hoje = dataHoje(config.idioma, new Date(criadoEm));
  const cartoes = motor.cartoes(ctx);
  const imprimir = () => {
    const anterior = document.title;
    const nome = motor.texto(config.entrega?.pdf?.arquivo, ctx, { hoje }).trim();
    if (nome) document.title = nome;
    window.addEventListener("afterprint", () => (document.title = anterior), { once: true });
    window.print();
  };
  return (
    <div className="cvt cvt--entregue" data-modo={config.modo ?? "claro"} data-estilo={config.estilo ?? "editorial"} style={config.tema as React.CSSProperties}>
      <div className="cvt__entrega" style={{ paddingTop: 24 }}>
        {config.entrega?.documento ? (
          <Documento config={config} motor={motor} ctx={ctx} cartoes={cartoes} hoje={hoje} onPdf={imprimir} />
        ) : config.entrega ? (
          <Entrega config={config} motor={motor} ctx={ctx} mapa={motor.mapaVisual(ctx)} cartoes={cartoes} hoje={hoje} onPdf={imprimir} />
        ) : (
          <p className="cvt__bot">Este fluxo não tem documento.</p>
        )}
      </div>
    </div>
  );
}
