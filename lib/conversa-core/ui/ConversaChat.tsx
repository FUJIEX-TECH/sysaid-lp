"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./conversa.css";
import { criarMotor } from "../motor";
import { rotularComJev } from "../jev";
import { aplicarMascara, normalizar, validarValor } from "../util";
import type { ConfigConversa, Contexto, EtapaConfig, Evento, Persistencia, Respostas } from "../tipos";

// ==========================================================================
// conversa-core — a interface genérica do chat: bolhas, "digitando", botões e
// texto, histórico, tocar numa bolha antiga refaz dali, celular primeiro,
// acessível. Tudo que é do cliente vem de `config` (perguntas, textos, tema,
// cena) e de `persistencia` (como gravar). Eventos saem por `onEvento`.
// ==========================================================================

type Props = {
  config: ConfigConversa;
  persistencia: Persistencia;
  onEvento?: (e: Evento) => void;
};

type Fim = null | "enviando" | "encerrado" | "erro";

export default function ConversaChat({ config, persistencia, onEvento }: Props) {
  const motor = useMemo(() => criarMotor(config), [config]);
  const DIGITANDO_MS = config.digitandoMs ?? 300;

  const [respostas, setRespostas] = useState<Respostas>({});
  const [versao, setVersao] = useState(0); // muda a cada resposta/correção: reanima o "digitando"
  const [digitando, setDigitando] = useState(true);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [fim, setFim] = useState<Fim>(null);
  const [maisOpcoes, setMaisOpcoes] = useState(false);

  const inicio = useRef<number>(Date.now());
  const inicioEtapa = useRef<number>(Date.now());
  const logRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef<HTMLInputElement>(null);
  const emitir = useCallback((e: Evento) => onEvento?.(e), [onEvento]);

  const ctx = useMemo<Contexto>(
    () => motor.contexto(typeof window === "undefined" ? "/" : window.location.pathname, respostas),
    [motor, respostas]
  );

  const respondidas = useMemo(() => motor.etapasRespondidas(ctx), [motor, ctx]);
  const encerramento = useMemo(() => motor.encerramento(ctx), [motor, ctx]);
  const atual = useMemo<EtapaConfig | null>(() => (encerramento ? null : motor.proximaEtapa(ctx)), [motor, ctx, encerramento]);
  const atualResolvida = useMemo(() => (atual ? motor.resolver(atual, ctx) : null), [motor, atual, ctx]);

  useEffect(() => {
    emitir({ tipo: "inicio", origem: ctx.origem });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "digitando" antes de cada bolha nova do bot
  useEffect(() => {
    setDigitando(true);
    const t = setTimeout(() => setDigitando(false), DIGITANDO_MS);
    return () => clearTimeout(t);
  }, [versao, DIGITANDO_MS]);

  // rola pro fim e foca a entrada quando a pergunta aparece
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (!digitando) {
      const foco = el?.querySelector<HTMLElement>("[data-foco]");
      foco?.focus({ preventScroll: true });
    }
  }, [digitando, versao, erro]);

  // --- responder / corrigir -------------------------------------------------
  function responder(etapa: EtapaConfig, valor: string) {
    const novo = motor.responder(respostas, etapa, valor);
    const ctxNovo: Contexto = { ...ctx, respostas: novo };
    const proxima = motor.proximaEtapa(ctxNovo);
    setRespostas(novo);
    // a próxima pergunta pode chegar com o campo pré-preenchido (ex.: empresa pelo domínio)
    setTexto(proxima?.prefill ? motor.variavel(ctxNovo, proxima.prefill) : "");
    setErro(null);
    setMaisOpcoes(false);
    setVersao((v) => v + 1);
    emitir({ tipo: "resposta", etapa: etapa.id, passo: etapa.passo, segundosNaEtapa: Math.round((Date.now() - inicioEtapa.current) / 1000) });
    inicioEtapa.current = Date.now();
    persistencia.aoResponder?.(etapa.id, novo, ctxNovo);
  }

  function corrigir(etapa: EtapaConfig) {
    if (fim) return;
    const novo = motor.refazerDesde(respostas, etapa.id);
    setRespostas(novo);
    setTexto(etapa.recuperarAoCorrigir ? (respostas[etapa.id] ?? "") : "");
    setErro(null);
    setVersao((v) => v + 1);
    inicioEtapa.current = Date.now();
    emitir({ tipo: "correcao", etapa: etapa.id });
  }

  function enviarTexto(etapa: EtapaConfig, bruto: string) {
    const v = bruto.trim();
    const e = validarValor(etapa.validar, v, ctx, config.validadores);
    if (e) {
      setErro(e);
      return;
    }
    responder(etapa, normalizar(etapa, v));
  }

  // --- envio final ------------------------------------------------------------
  const enviouRef = useRef(false);

  const enviar = useCallback(async () => {
    enviouRef.current = true;
    setFim("enviando");
    const segundosTotal = Math.round((Date.now() - inicio.current) / 1000);
    const ctxFinal: Contexto = { ...ctx, tempos: { segundosTotal } };
    const jev = await rotularComJev(config.jev, respostas);
    const classificacao = motor.classificar(ctxFinal, jev);
    emitir({ tipo: "classificacao", classificacao });
    try {
      const r = await persistencia.enviar({ respostas, ctx: ctxFinal, classificacao, honeypot: hpRef.current?.value ?? "" });
      emitir({ tipo: "envio", ok: r.ok });
      if (!r.ok) {
        enviouRef.current = false;
        setFim("erro");
        return;
      }
      if (r.redirecionar) window.location.href = r.redirecionar;
    } catch {
      emitir({ tipo: "envio", ok: false });
      enviouRef.current = false;
      setFim("erro");
    }
  }, [config.jev, ctx, emitir, motor, persistencia, respostas]);

  useEffect(() => {
    if (fim || digitando || enviouRef.current) return;
    if (encerramento) {
      setFim("encerrado");
      emitir({ tipo: "encerramento", id: encerramento.id });
      return;
    }
    if (atual !== null) return;
    enviar();
  }, [atual, digitando, fim, encerramento, enviar, emitir]);

  // --- render ---------------------------------------------------------------------
  const passoAtual = atual?.passo ?? config.totalPassos;
  const confirmando = !!(atualResolvida?.prefill && atual?.confirmarRotulo && texto === atualResolvida.prefill);
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
                onClick={() => corrigir(e)}
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
                  <button
                    key={o.valor}
                    type="button"
                    className="cv__opcao"
                    data-foco={i === 0 ? "" : undefined}
                    onClick={() => responder(atual, o.valor)}
                  >
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
                  enviarTexto(atual, texto);
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
                    onChange={(ev) => setTexto(ev.target.value)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !ev.shiftKey) {
                        ev.preventDefault();
                        enviarTexto(atual, texto);
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
                    onChange={(ev) => setTexto(aplicarMascara(atual.mascara, ev.target.value))}
                  />
                )}
                <div className="cv__acoes">
                  <button type="submit" className="cv__enviar">
                    {confirmando ? atual.confirmarRotulo : "Enviar"}
                  </button>
                  {atual.pular && (
                    <button type="button" className="cv__pular" onClick={() => responder(atual, atual.pular!.valor)}>
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
            <button type="button" className="cv__link" onClick={() => enviar()}>
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
