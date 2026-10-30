"use client";

import { useEffect, useRef, useState } from "react";
import "./tela.css";
import { useConversa } from "./useConversa";
import { avaliar } from "../condicoes";
import Resumo from "./Resumo";
import Porte from "./graficos/Porte";
import Mapa from "./graficos/Mapa";
import Empresa from "./graficos/Empresa";
import type { ConfigConversa, Contexto, EtapaConfig, Evento, PainelConfig, Persistencia } from "../tipos";
import type { Motor } from "../motor";

// ==========================================================================
// conversa-core — v2: a tela cheia. A conversa é a página: cabeçalho fino com
// progresso, a coluna da conversa rola com a janela, a coluna lateral (desktop)
// guarda o resumo que se escreve sozinho e os painéis "laterais" (ex.: o mapa
// que cresce a cada resposta). No celular tudo vira uma coluna e os painéis
// entram no fluxo depois da etapa que os dispara. Gráficos são gerados por
// código a partir das respostas (Porte, Mapa, Empresa); textos vêm da config.
// ==========================================================================

type Props = {
  config: ConfigConversa;
  persistencia: Persistencia;
  onEvento?: (e: Evento) => void;
  textos?: { empresaFonte?: string; empresaRotulos?: Parameters<typeof Empresa>[0]["rotulos"] };
};

const LARGO = "(min-width: 960px)";

function useLargo(): boolean {
  const [largo, setLargo] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(LARGO);
    const f = () => setLargo(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return largo;
}

function dadosPorte(config: ConfigConversa, ctx: Contexto, motor: Motor) {
  const cfg = config.porte;
  if (!cfg) return null;
  const vp = ctx.respostas[cfg.pessoas.campo];
  if (vp === undefined) return null;
  const pessoas = cfg.pessoas.valores[vp] ?? 0;
  const ve = ctx.respostas[cfg.equipe.campo];
  const equipe = ve === undefined ? 0 : cfg.equipe.valores[ve] ?? 0;
  const porGlifo = Math.max(1, Math.ceil(pessoas / 120));
  const razao = equipe > 0 ? Math.round(pessoas / equipe) : 0;
  const extras = { porGlifo, razao, pessoas, equipe };
  return {
    pessoas,
    equipe,
    rotuloPessoas: motor.texto(cfg.pessoas.rotulo, ctx, extras),
    rotuloEquipe: equipe > 0 ? motor.texto(cfg.equipe.rotulo, ctx, extras) : "",
    titulo: motor.texto(cfg.titulo, ctx, extras) || undefined,
    legenda: motor.texto(cfg.legenda, ctx, extras) || undefined,
  };
}

export default function ConversaTela({ config, persistencia, onEvento, textos }: Props) {
  const c = useConversa({ config, persistencia, onEvento });
  const { motor, ctx, respostas, respondidas, atual, atualResolvida, encerramento, digitando, versao, texto, erro, fim, maisOpcoes, setMaisOpcoes, passoAtual, confirmando, hpRef } = c;
  const largo = useLargo();
  const fluxoRef = useRef<HTMLDivElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  // rola até a pergunta nova e foca a entrada
  useEffect(() => {
    if (digitando && fim) return;
    fimRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    if (!digitando) {
      const foco = fluxoRef.current?.querySelector<HTMLElement>("[data-foco]");
      foco?.focus({ preventScroll: true });
    }
  }, [digitando, versao, erro, fim]);

  const resolvedor = motor.resolvedor(ctx);
  const paineis = (config.paineis ?? []).filter((p) => avaliar(p.quando, ctx, resolvedor));
  const lateral = largo ? paineis.filter((p) => p.lugar === "lateral") : [];
  const noFluxo = (etapaId: string) => paineis.filter((p) => p.apos === etapaId && (p.lugar !== "lateral" || !largo));

  function painel(p: PainelConfig) {
    const titulo = motor.texto(p.titulo, ctx) || undefined;
    if (p.tipo === "porte") {
      const d = dadosPorte(config, ctx, motor);
      return d ? <Porte key={p.id} {...d} titulo={titulo ?? d.titulo} /> : null;
    }
    if (p.tipo === "mapa") {
      const m = motor.mapaVisual(ctx);
      return m ? <Mapa key={p.id} mapa={m} titulo={titulo} /> : null;
    }
    if (p.tipo === "empresa") {
      const e = ctx.empresa;
      return e && e.origem !== "fallback" ? <Empresa key={p.id} empresa={e} titulo={titulo} fonte={textos?.empresaFonte} rotulos={textos?.empresaRotulos} /> : null;
    }
    if (p.tipo === "custom" && p.Componente) {
      const C = p.Componente;
      return <C key={p.id} respostas={respostas} ctx={ctx} />;
    }
    return null;
  }

  function par(e: EtapaConfig) {
    const valor = respostas[e.id] ?? "";
    const r = motor.resumo(e, valor, ctx);
    return (
      <div key={e.id} className="cvt__par">
        <p className="cvt__bot">{motor.resolver(e, ctx).texto}</p>
        <button
          type="button"
          className="cvt__eu"
          onClick={() => c.corrigir(e)}
          disabled={!!fim}
          title={config.textos.corrigirDica}
          aria-label={`Sua resposta: ${r}. ${config.textos.corrigirDica}`}
          data-corrigir={config.textos.corrigir ?? "corrigir"}
        >
          {r}
        </button>
        {noFluxo(e.id).map(painel)}
      </div>
    );
  }

  const total = config.totalPassos;
  const pct = Math.round(((Math.max(1, passoAtual) - 1) / total) * 100);
  const faltam = config.textos.faltam ? motor.texto(config.textos.faltam, ctx, { n: Math.max(0, total - passoAtual + 1) }) : "";

  return (
    <div className="cvt" style={config.tema as React.CSSProperties}>
      <header className="cvt__topo">
        <div className="cvt__marca">
          <span className="cvt__quem">{config.marca.titulo}</span>
          {config.marca.subtitulo && <span className="cvt__sub">{config.marca.subtitulo}</span>}
        </div>
        <div
          className="cvt__progresso"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Math.min(passoAtual, total)}
          aria-label={motor.texto(config.textos.passoAria, ctx, { passo: passoAtual, total })}
        >
          <span className="cvt__passo">
            {passoAtual} <em>de</em> {total}
            {faltam && <small>{faltam}</small>}
          </span>
          <span className="cvt__barra">
            <i style={{ width: `${fim === "enviando" ? 100 : pct}%` }} />
          </span>
        </div>
      </header>

      <div className="cvt__corpo">
        <main className="cvt__fluxo" ref={fluxoRef} role="log" aria-live="polite" aria-relevant="additions" aria-label={config.marca.rotuloRegiao}>
          <div className="cvt__abertura">
            {config.abertura.map((t, i) => (
              <p key={`ab${i}`} className={`cvt__bot ${i === 0 ? "cvt__bot--titulo" : ""}`}>
                {motor.texto(t, ctx)}
              </p>
            ))}
          </div>

          {respondidas.map(par)}

          {digitando && !fim && (
            <p className="cvt__bot cvt__digitando" aria-label="Digitando">
              <span /><span /><span />
            </p>
          )}

          {!digitando && atual && atualResolvida && !fim && (
            <div className="cvt__par cvt__par--atual">
              <p className="cvt__bot">{atualResolvida.texto}</p>
              {noFluxo(atual.id).map(painel)}

              {atual.tipo !== "texto" && atualResolvida.opcoes.length > 0 && (
                <div className="cvt__opcoes" role="group" aria-label={atualResolvida.texto}>
                  {(atual.mostrarPrimeiro && !maisOpcoes ? atualResolvida.opcoes.slice(0, atual.mostrarPrimeiro.quantidade) : atualResolvida.opcoes).map((o, i) => (
                    <button key={o.valor} type="button" className="cvt__opcao" data-foco={i === 0 ? "" : undefined} onClick={() => c.responder(atual, o.valor)}>
                      {o.rotulo}
                    </button>
                  ))}
                  {atual.mostrarPrimeiro && !maisOpcoes && atualResolvida.opcoes.length > atual.mostrarPrimeiro.quantidade && (
                    <button type="button" className="cvt__opcao cvt__opcao--mais" onClick={() => setMaisOpcoes(true)}>
                      {atual.mostrarPrimeiro.rotulo}
                    </button>
                  )}
                </div>
              )}

              {atual.tipo === "texto" && (
                <form
                  className="cvt__form"
                  noValidate
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    c.enviarTexto(atual, texto);
                  }}
                >
                  <label className="cvt__sr" htmlFor={`cvt-${atual.id}`}>
                    {atualResolvida.texto}
                  </label>
                  {atual.input === "textarea" ? (
                    <textarea
                      id={`cvt-${atual.id}`}
                      data-foco=""
                      rows={3}
                      value={texto}
                      placeholder={atualResolvida.placeholder || undefined}
                      onChange={(ev) => c.mudarTexto(atual, ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" && !ev.shiftKey) {
                          ev.preventDefault();
                          c.enviarTexto(atual, texto);
                        }
                      }}
                    />
                  ) : (
                    <input
                      id={`cvt-${atual.id}`}
                      data-foco=""
                      type={atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : "text"}
                      inputMode={atual.input === "tel" ? "tel" : atual.input === "email" ? "email" : "text"}
                      autoComplete={atual.autoComplete ?? (atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : "off")}
                      value={texto}
                      placeholder={atualResolvida.placeholder || undefined}
                      onChange={(ev) => c.mudarTexto(atual, ev.target.value)}
                    />
                  )}
                  <div className="cvt__acoes">
                    <button type="submit" className="cvt__enviar">
                      {confirmando ? atual.confirmarRotulo : config.textos.enviar ?? "Enviar"}
                    </button>
                    {atual.pular && (
                      <button type="button" className="cvt__pular" onClick={() => c.responder(atual, atual.pular!.valor)}>
                        {atual.pular.rotulo}
                      </button>
                    )}
                  </div>
                  {erro && (
                    <p className="cvt__erro" role="alert">
                      {erro}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          {fim === "enviando" && <p className="cvt__bot">{motor.texto(config.textos.enviando, ctx)}</p>}
          {fim === "erro" && (
            <p className="cvt__bot cvt__erro" role="alert">
              {motor.texto(config.textos.erro, ctx)}{" "}
              <button type="button" className="cvt__link" onClick={() => c.enviar()}>
                {config.textos.tentarDeNovo}
              </button>
            </p>
          )}
          {fim === "encerrado" && encerramento && (
            <p className="cvt__bot">
              {motor.texto(encerramento.texto, ctx)}
              {encerramento.link && (
                <>
                  {" "}
                  <a className="cvt__link" href={encerramento.link.href} target="_blank" rel="noopener noreferrer">
                    {encerramento.link.rotulo}
                  </a>
                </>
              )}
              {encerramento.complemento && <>{motor.texto(encerramento.complemento, ctx)}</>}
            </p>
          )}

          <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="cvt__hp" aria-hidden="true" />
          <p className="cvt__legal">{motor.texto(config.textos.legal, ctx)}</p>
          <div ref={fimRef} className="cvt__fim" aria-hidden="true" />
        </main>

        {largo && (config.resumo || lateral.length > 0) && (
          <aside className="cvt__lateral">
            {config.resumo && <Resumo config={config.resumo} ctx={ctx} motor={motor} />}
            {lateral.map(painel)}
          </aside>
        )}
      </div>
    </div>
  );
}
