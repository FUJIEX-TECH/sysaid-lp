"use client";

import { Fragment, useMemo } from "react";
import "@/lib/conversa-core/ui/tela.css";
import "./qualifica.css";
import Cartao from "@/lib/conversa-core/ui/graficos/Cartao";
import Montagem from "@/lib/conversa-core/ui/Montagem";
import { criarMotor, resolverCartao, type CartaoConfig, type CartaoPronto, type Contexto } from "@/lib/conversa-core";
import { cenaSysaid, type CenaId } from "@/lib/diagnostico/cenas-sysaid";
import { DORES } from "@/lib/diagnostico/generica-sysaid";
import { CARTOES_GENERICA } from "@/lib/diagnostico/cartoes-generica-sysaid";
import { configSysaidGenerica } from "@/lib/diagnostico/config-sysaid-generica";

// Vitrine (só dev): cada cena e cada cartão novo num bloco próprio
// (data-vitrine), na largura da conversa (desktop) e na do celular (390), pra
// sair um print por arquivo. Os rótulos das cenas são os fixos do chip.

const CENAS: CenaId[] = ["perda", "complexidade", "sla", "relatorio"];
const NOME_CENA: Record<CenaId, string> = { perda: "fila invisível", complexidade: "ferramenta que virou projeto", sla: "prazo sem alarme", relatorio: "gestão pelo retrovisor" };
const LOGO = { src: "https://www.google.com/s2/favicons?domain=fujiextech.com&sz=128", alt: "Fujiex" };

function cartaoCena(id: CenaId, comEmpresa: "logo" | "nome" | null): CartaoPronto | null {
  const k: CartaoConfig = {
    id: `cena-${id}${comEmpresa ? `-${comEmpresa}` : ""}`,
    tipo: "cena",
    apos: "-",
    rotulo: comEmpresa ? undefined : "O seu atendimento hoje",
    calcular: () =>
      cenaSysaid(id, {
        rotulos: DORES[id].rotulosChip,
        empresa: comEmpresa ? "Fujiex" : undefined,
        logo: comEmpresa === "logo" ? LOGO : null,
      }),
  };
  return resolverCartao(k, { origem: "generica", variaveis: {}, respostas: {} });
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
    () => CENAS.map((id) => ({ id, simples: cartaoCena(id, null), logo: cartaoCena(id, "logo"), nome: cartaoCena(id, "nome") })),
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
            <Bloco id={`cena-${c.id}-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · desktop`}>
              {c.simples && <Cartao cartao={c.simples} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-390`} titulo={`Cena · ${NOME_CENA[c.id]} · celular`} estreito>
              {c.simples && <Cartao cartao={c.simples} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-logo-1440`} titulo={`Cena · ${NOME_CENA[c.id]} · com logo · desktop`}>
              {c.logo && <Cartao cartao={c.logo} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-logo-390`} titulo={`Cena · ${NOME_CENA[c.id]} · com logo · celular`} estreito>
              {c.logo && <Cartao cartao={c.logo} estatico />}
            </Bloco>
            <Bloco id={`cena-${c.id}-nome-390`} titulo={`Cena · ${NOME_CENA[c.id]} · sem logo (só o nome) · celular`} estreito>
              {c.nome && <Cartao cartao={c.nome} estatico />}
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
