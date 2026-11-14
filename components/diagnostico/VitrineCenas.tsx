"use client";

import { Fragment, useMemo } from "react";
import "@/lib/conversa-core/ui/tela.css";
import "./qualifica.css";
import Cartao from "@/lib/conversa-core/ui/graficos/Cartao";
import Montagem from "@/lib/conversa-core/ui/Montagem";
import { criarMotor, resolverCartao, type CartaoConfig, type CartaoPronto, type Contexto } from "@/lib/conversa-core";
import { cenaSysaid, type CausaId, type CenaId, type EstadoCena } from "@/lib/diagnostico/cenas-sysaid";
import { CONSEQUENCIAS, DORES } from "@/lib/diagnostico/generica-sysaid";
import { CARTOES_GENERICA, atosDaDor, solucaoTexto } from "@/lib/diagnostico/cartoes-generica-sysaid";
import { configSysaidGenerica } from "@/lib/diagnostico/config-sysaid-generica";

// Vitrine (só dev): cada cena (14/11/2026: nos 3 estados da direção A) e cada
// cartão novo num bloco próprio (data-vitrine), na largura da conversa (desktop)
// e na do celular (390), pra sair um print por arquivo. Textos dos atos: os
// fixos da dor; empresa de exemplo: Fujiex (logo pelo ícone do Google, cor da
// marca #162cb6, que o núcleo clareia pro fundo escuro).

const CENAS: CenaId[] = ["perda", "complexidade", "sla", "relatorio"];
const NOME_CENA: Record<CenaId, string> = { perda: "fila invisível", complexidade: "ferramenta que virou projeto", sla: "prazo sem alarme", relatorio: "gestão pelo retrovisor" };
const LOGO = { src: "https://www.google.com/s2/favicons?domain=fujiextech.com&sz=128", alt: "Fujiex" };
const CTX_VAZIO: Contexto = { origem: "generica", variaveis: {}, respostas: {} };

function cartaoCena(id: CenaId, estado: EstadoCena, comEmpresa: "logo" | "nome" | null, causas: CausaId[] = ["reclama", "incendio"]): CartaoPronto | null {
  const k: CartaoConfig = {
    id: `cena-${id}-e${estado}${comEmpresa ? `-${comEmpresa}` : ""}-c${causas.length}`,
    tipo: "cena",
    apos: "-",
    rotulo: estado === 1 ? "O seu atendimento hoje" : estado === 2 ? "O atendimento da Fujiex hoje" : "O caminho na Fujiex",
    calcular: () =>
      cenaSysaid(id, {
        estado,
        ...atosDaDor(CTX_VAZIO, id, false),
        causa: estado === 2 ? causas.slice(0, 2).map((c) => CONSEQUENCIAS[c].triste.toLowerCase()).join(" · ") : undefined,
        causas,
        solucao: estado === 3 ? solucaoTexto(id) : undefined,
        empresa: comEmpresa ? "Fujiex" : undefined,
        logo: comEmpresa === "logo" ? LOGO : null,
        cor: comEmpresa ? "#162cb6" : null,
      }),
  };
  return resolverCartao(k, CTX_VAZIO);
}

const CTX_EXEMPLO: Contexto = {
  origem: "generica",
  variaveis: {},
  respostas: {
    situacao_texto: DORES.sla.chip!,
    implicacao: "sim",
    consequencias: "reclama|incendio",
    nome: "Mariana Costa",
    empresa: "Fujiex",
    papel: "influencia",
    usuarios: "200",
    tecnicos: "1-2",
    tempo: "4a8",
    payoff: "reclama|incendio",
  },
};

function Bloco({ id, titulo, children, estreito }: { id: string; titulo: string; children: React.ReactNode; estreito?: boolean }) {
  return (
    <section data-vitrine={id} style={{ width: estreito ? 390 : 620, padding: estreito ? "16px 16px 20px" : "20px 0 24px", boxSizing: "border-box" }}>
      <p className="cvt__bot-rotulo" style={{ marginBottom: 10 }}>{titulo}</p>
      {children}
    </section>
  );
}

export default function VitrineCenas() {
  const cfg = configSysaidGenerica;
  const cenas = useMemo(
    () =>
      CENAS.map((id) => ({
        id,
        e1: cartaoCena(id, 1, null),
        e2logo: cartaoCena(id, 2, "logo"),
        e2nome: cartaoCena(id, 2, "nome"),
        e2tres: cartaoCena(id, 2, "logo", ["reclama", "incendio", "contratar"]),
        e2uma: cartaoCena(id, 2, "logo", ["mostrar"]),
        e3: cartaoCena(id, 3, "logo"),
      })),
    []
  );
  const cartoes = useMemo(() => {
    const motor = criarMotor(cfg);
    const res = motor.resolvedor(CTX_EXEMPLO);
    return CARTOES_GENERICA.filter((c) => ["horas", "maturidade", "etapas"].includes(c.id))
      .map((c) => resolverCartao(c, CTX_EXEMPLO, res))
      .filter((c): c is CartaoPronto => !!c);
  }, [cfg]);
  return (
    <div className="cvt" data-modo={cfg.modo ?? "claro"} data-estilo={cfg.estilo ?? "editorial"} style={{ ...(cfg.tema as React.CSSProperties), display: "block", padding: "24px 32px" }}>
      <p className="cvt__bot cvt__bot--titulo">Vitrine · cenas e cartões da busca genérica</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 48px", alignItems: "flex-start" }}>
        {cenas.map((c) => (
          <Fragment key={c.id}>
            <Bloco id={`cena-${c.id}-e1-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 1 (depois da dor) · desktop`}>
              {c.e1 && <Cartao cartao={c.e1} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e1-390`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 1 · celular`} estreito>
              {c.e1 && <Cartao cartao={c.e1} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e2-logo-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 2 (empresa + consequências) · desktop`}>
              {c.e2logo && <Cartao cartao={c.e2logo} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e2-logo-390`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 2 · celular`} estreito>
              {c.e2logo && <Cartao cartao={c.e2logo} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e2-nome-390`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 2 · sem logo (só o nome) · celular`} estreito>
              {c.e2nome && <Cartao cartao={c.e2nome} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e2-3causas-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 2 · 3 consequências · desktop`}>
              {c.e2tres && <Cartao cartao={c.e2tres} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e2-1causa-390`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 2 · 1 consequência · celular`} estreito>
              {c.e2uma && <Cartao cartao={c.e2uma} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e3-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 3 (com a SysAid) · desktop`}>
              {c.e3 && <Cartao cartao={c.e3} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-e3-390`} titulo={`Cena · ${NOME_CENA[c.id]} · estado 3 · celular`} estreito>
              {c.e3 && <Cartao cartao={c.e3} estatico />}
            </Bloco>
          </Fragment>
        ))}
        {cartoes.map((k) => (
          <Fragment key={k.id}>
            <Bloco id={`cartao-${k.id}-1440`} titulo={`Cartão · ${k.id} · desktop`}>
              <Cartao cartao={k} estatico />
            </Bloco>
            <Bloco id={`cartao-${k.id}-390`} titulo={`Cartão · ${k.id} · celular`} estreito>
              <Cartao cartao={k} estatico />
            </Bloco>
          </Fragment>
        ))}
        <Bloco id="cartao-montagem-1440" titulo="Montando o documento · desktop">
          <Montagem rotulo="Montando o documento da Fujiex" pronto="Documento da Fujiex pronto" itens={["O caso da Fujiex", "A conta de horas", "Como a SysAid resolve cada ponto", "Por onde começar"]} duracaoMs={4000} concluido={false} />
        </Bloco>
        <Bloco id="cartao-montagem-390" titulo="Montando o documento · celular" estreito>
          <Montagem rotulo="Montando o documento da Fujiex" pronto="Documento da Fujiex pronto" itens={["O caso da Fujiex", "A conta de horas", "Como a SysAid resolve cada ponto", "Por onde começar"]} duracaoMs={4000} concluido={false} />
        </Bloco>
      </div>
    </div>
  );
}
