"use client";

import { Fragment, useMemo } from "react";
import "@/lib/conversa-core/ui/tela.css";
import "./qualifica.css";
import Cartao from "@/lib/conversa-core/ui/graficos/Cartao";
import { criarMotor, resolverCartao, type CartaoConfig, type CartaoPronto, type Contexto } from "@/lib/conversa-core";
import { CARTOES_SYSAID } from "@/lib/diagnostico/cartoes-sysaid";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";

// Vitrine (só dev): os 3 cartões de demonstração da SysAid com uma conversa de
// exemplo + 2 exemplos ILUSTRATIVOS dos tipos que o roteiro ainda não usa
// (barras e linha do tempo). Primeiro na largura da conversa (como no chat),
// depois em duas colunas (como no mapa liberado).

const CTX: Contexto = {
  origem: "generica",
  variaveis: {},
  respostas: { situacao: "troca", dor: "sla", aprof: "a", usuarios: "1000", tecnicos: "3-10", prazo: "tri", nome: "Mariana Costa" },
};

const ILUSTRATIVOS: CartaoConfig[] = [
  {
    id: "barras-exemplo",
    tipo: "barras",
    apos: "-",
    fala: "Comparando com o caminho do mapa:",
    rotulo: "Comparação (exemplo de vitrine)",
    titulo: "Horas por mês com chamado fora de controle",
    legenda: "Números ilustrativos, só pra mostrar o tipo de cartão.",
    calcular: () => ({
      itens: [
        { rotulo: "Hoje", valor: 80, nota: "fila sem prioridade e SLA sem alerta" },
        { rotulo: "Com fila única e SLA com alerta", valor: 35, destaque: true },
      ],
      formato: { sufixo: " h" },
      diferenca: true,
    }),
  },
  {
    id: "linha-exemplo",
    tipo: "linhaTempo",
    apos: "-",
    fala: "E o primeiro passo, em etapas:",
    rotulo: "Linha do tempo (exemplo de vitrine)",
    titulo: "Como a virada costuma acontecer",
    legenda: "Etapas ilustrativas, só pra mostrar o tipo de cartão.",
    calcular: () => ({
      etapas: [
        { quando: "Semana 1", titulo: "Fila única", texto: "Portal, e-mail e Teams caindo no mesmo lugar." },
        { quando: "Semanas 2 e 3", titulo: "SLA e prioridade", texto: "Prazo por tipo e alerta antes de estourar." },
        { quando: "Mês 2", titulo: "Automação", texto: "Aprovações e rotinas em fluxo." },
        { quando: "Mês 3", titulo: "IA no atendimento", texto: "O simples resolvido antes de virar chamado." },
      ],
      atual: 1,
    }),
  },
];

export default function VitrineCartoes() {
  const prontos = useMemo(() => {
    const motor = criarMotor(configSysaid);
    const resolvedor = motor.resolvedor(CTX);
    return [...CARTOES_SYSAID, ...ILUSTRATIVOS].map((c) => resolverCartao(c, CTX, resolvedor)).filter((c): c is CartaoPronto => !!c);
  }, []);
  return (
    <div className="cvt" data-modo={configSysaid.modo ?? "claro"} data-estilo={configSysaid.estilo ?? "editorial"} style={configSysaid.tema as React.CSSProperties}>
      <div className="cvt__corpo">
        <main className="cvt__fluxo">
          <div className="cvt__abertura">
            <p className="cvt__bot cvt__bot--titulo">Vitrine dos cartões visuais</p>
            <p className="cvt__bot">Os 5 tipos do núcleo no tema da SysAid. Os 3 primeiros são os de demonstração ligados na conversa (provisórios); barras e linha do tempo são exemplos ilustrativos.</p>
          </div>
          {prontos.map((k) => (
            <Fragment key={k.id}>
              {k.fala && <p className="cvt__bot">{k.fala}</p>}
              <Cartao cartao={k} />
            </Fragment>
          ))}
        </main>
      </div>
      <div className="cvt__entrega">
        <section className="cven" style={{ animation: "none" }}>
          <p className="cven__rotulo">Como entram no mapa liberado (duas colunas)</p>
          <div className="cven__cartoes">
            {prontos.map((k) => (
              <Cartao key={`e-${k.id}`} cartao={k} estatico />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
