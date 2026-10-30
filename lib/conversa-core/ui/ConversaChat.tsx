"use client";

import { useEffect, useRef } from "react";
import "./conversa.css";
import { useConversa } from "./useConversa";
import type { ConfigConversa, Evento, Persistencia } from "../tipos";

// ==========================================================================
// conversa-core — o widget (parte 1): bolhas, "digitando", botões e texto,
// histórico que rola numa caixa, tocar numa bolha antiga refaz dali, celular
// primeiro, acessível. Desde a v2 o estado e as ações vêm de useConversa
// (compartilhados com a tela cheia, ConversaTela). Tudo que é do cliente vem
// de `config` e de `persistencia`; eventos saem por `onEvento`.
// ==========================================================================

type Props = {
  config: ConfigConversa;
  persistencia: Persistencia;
  onEvento?: (e: Evento) => void;
};

export default function ConversaChat({ config, persistencia, onEvento }: Props) {
  const c = useConversa({ config, persistencia, onEvento });
  const { motor, ctx, respostas, respondidas, atual, atualResolvida, encerramento, digitando, versao, texto, erro, fim, maisOpcoes, setMaisOpcoes, passoAtual, confirmando, hpRef } = c;
  const logRef = useRef<HTMLDivElement>(null);

  // rola pro fim e foca a entrada quando a pergunta aparece
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (!digitando) {
      const foco = el?.querySelector<HTMLElement>("[data-foco]");
      foco?.focus({ preventScroll: true });
    }
  }, [digitando, versao, erro]);

  const Cena = config.Cena;

  return (
    <div className="cv" role="region" aria-label={config.marca.rotuloRegiao} style={config.tema as React.CSSProperties}>
      {Cena && <Cena respostas={respostas} ctx={ctx} />}

      <div className="cv__topo">
        <span className="cv__quem">{config.marca.titulo}</span>
        <span className="cv__passo" aria-label={motor.texto(config.textos.passoAria, ctx, { passo: passoAtual, total: config.totalPassos })}>
          {passoAtual}/{config.totalPassos}
        </span>
      </div>

      <div className="cv__log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
        {config.abertura.map((t, i) => (
          <p key={`ab${i}`} className="cv__bolha cv__bolha--bot">
            {motor.texto(t, ctx)}
          </p>
        ))}

        {respondidas.map((e) => {
          const valor = respostas[e.id] ?? "";
          const r = motor.resumo(e, valor, ctx);
          return (
            <div key={e.id} className="cv__par">
              <p className="cv__bolha cv__bolha--bot">{motor.resolver(e, ctx).texto}</p>
              <button
                type="button"
                className="cv__bolha cv__bolha--eu"
                onClick={() => c.corrigir(e)}
                disabled={!!fim}
                title={config.textos.corrigirDica}
                aria-label={`Sua resposta: ${r}. ${config.textos.corrigirDica}`}
              >
                {r}
              </button>
            </div>
          );
        })}

        {digitando && !fim && (
          <p className="cv__bolha cv__bolha--bot cv__digitando" aria-label="Digitando">
            <span /><span /><span />
          </p>
        )}

        {!digitando && atual && atualResolvida && !fim && (
          <div className="cv__par cv__par--atual">
            <p className="cv__bolha cv__bolha--bot">{atualResolvida.texto}</p>

            {atual.tipo !== "texto" && atualResolvida.opcoes.length > 0 && (
              <div className="cv__opcoes" role="group" aria-label={atualResolvida.texto}>
                {(atual.mostrarPrimeiro && !maisOpcoes
                  ? atualResolvida.opcoes.slice(0, atual.mostrarPrimeiro.quantidade)
                  : atualResolvida.opcoes
                ).map((o, i) => (
                  <button key={o.valor} type="button" className="cv__opcao" data-foco={i === 0 ? "" : undefined} onClick={() => c.responder(atual, o.valor)}>
                    {o.rotulo}
                  </button>
                ))}
                {atual.mostrarPrimeiro && !maisOpcoes && atualResolvida.opcoes.length > atual.mostrarPrimeiro.quantidade && (
                  <button type="button" className="cv__opcao cv__opcao--mais" onClick={() => setMaisOpcoes(true)}>
                    {atual.mostrarPrimeiro.rotulo}
                  </button>
                )}
              </div>
            )}

            {atual.tipo === "texto" && (
              <form
                className="cv__form"
                noValidate
                onSubmit={(ev) => {
                  ev.preventDefault();
                  c.enviarTexto(atual, texto);
                }}
              >
                <label className="cv__sr" htmlFor={`cv-${atual.id}`}>
                  {atualResolvida.texto}
                </label>
                {atual.input === "textarea" ? (
                  <textarea
                    id={`cv-${atual.id}`}
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
                    id={`cv-${atual.id}`}
                    data-foco=""
                    type={atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : "text"}
                    inputMode={atual.input === "tel" ? "tel" : atual.input === "email" ? "email" : "text"}
                    autoComplete={atual.autoComplete ?? (atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : "off")}
                    value={texto}
                    placeholder={atualResolvida.placeholder || undefined}
                    onChange={(ev) => c.mudarTexto(atual, ev.target.value)}
                  />
                )}
                <div className="cv__acoes">
                  <button type="submit" className="cv__enviar">
                    {confirmando ? atual.confirmarRotulo : config.textos.enviar ?? "Enviar"}
                  </button>
                  {atual.pular && (
                    <button type="button" className="cv__pular" onClick={() => c.responder(atual, atual.pular!.valor)}>
                      {atual.pular.rotulo}
                    </button>
                  )}
                </div>
                {erro && (
                  <p className="cv__erro" role="alert">
                    {erro}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        {fim === "enviando" && <p className="cv__bolha cv__bolha--bot">{motor.texto(config.textos.enviando, ctx)}</p>}
        {fim === "erro" && (
          <p className="cv__bolha cv__bolha--bot cv__erro" role="alert">
            {motor.texto(config.textos.erro, ctx)}{" "}
            <button type="button" className="cv__link" onClick={() => c.enviar()}>
              {config.textos.tentarDeNovo}
            </button>
          </p>
        )}
        {fim === "encerrado" && encerramento && (
          <p className="cv__bolha cv__bolha--bot">
            {motor.texto(encerramento.texto, ctx)}
            {encerramento.link && (
              <>
                {" "}
                <a className="cv__link" href={encerramento.link.href} target="_blank" rel="noopener noreferrer">
                  {encerramento.link.rotulo}
                </a>
              </>
            )}
            {encerramento.complemento && <>{motor.texto(encerramento.complemento, ctx)}</>}
          </p>
        )}
      </div>

      {/* honeypot invisível */}
      <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="cv__hp" aria-hidden="true" />

      <p className="cv__legal">{motor.texto(config.textos.legal, ctx)}</p>
    </div>
  );
}
