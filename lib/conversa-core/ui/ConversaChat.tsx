"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./conversa.css";
import { criarMotor } from "../motor";
import { comTimeout, novaSessao, pedirGeracao, rotularComJev } from "../jev";
import { aplicarMascara, normalizar, validarValor } from "../util";
import type { ConfigConversa, Contexto, EtapaConfig, Evento, Gerado, GeracaoConfig, Medicao, Persistencia, Respostas } from "../tipos";

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

  // --- gerações do servidor (parte 2) ------------------------------------------
  // sessão só pro teto de custo no servidor; gerados = o que já chegou e ainda vale
  const sessao = useRef<string>(novaSessao());
  const [gerados, setGerados] = useState<Record<string, Gerado>>({});
  const pendentes = useRef<Map<string, { chave: string; promessa: Promise<Gerado | null>; inicio: number; tentativa: number }>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // gerações que chegaram tarde demais (o fluxo seguiu com o texto fixo): ignoradas
  const descartados = useRef<Set<string>>(new Set());
  const medicao = useRef<Medicao>({ custoUsd: 0, chamadasLlm: 0, chamadasJev: 0, cacheHits: 0, fallbacks: 0 });

  function contabilizar(g: Gerado | null) {
    const m = medicao.current;
    if (!g?.medicao) {
      if (g === null) m.fallbacks += 1;
      return;
    }
    m.custoUsd += g.medicao.custoUsd;
    if (g.medicao.llm === "ok") m.chamadasLlm += 1;
    if (g.medicao.llm === "cache") m.cacheHits += 1;
    if (g.medicao.llm === "fallback") m.fallbacks += 1;
    if (g.medicao.jev === "ok") m.chamadasJev += 1;
  }

  const ctx = useMemo<Contexto>(
    () => motor.contexto(typeof window === "undefined" ? "/" : window.location.pathname, respostas, undefined, gerados),
    [motor, respostas, gerados]
  );

  // um gerado (ou pedido em andamento) já cobre este texto? (igual, ou o texto só
  // continuou a partir do trecho usado: ver geradoValido em condicoes.ts)
  function cobre(trecho: string | undefined, v: string, prefixoOk: boolean): boolean {
    if (!trecho) return false;
    const a = trecho.toLowerCase();
    const b = v.toLowerCase();
    return a === b || (prefixoOk && a.length >= 20 && b.startsWith(a));
  }

  function pedir(g: GeracaoConfig, etapa: EtapaConfig, v: string, tentativa = 1) {
    const promessa = pedirGeracao(g, sessao.current, ctx, { ...respostas, [etapa.id]: v });
    const p = { chave: v.toLowerCase(), promessa, inicio: Date.now(), tentativa };
    pendentes.current.set(g.id, p);
    promessa.then((r) => {
      contabilizar(r);
      if (pendentes.current.get(g.id)?.promessa !== promessa) return; // veio outro pedido depois
      pendentes.current.delete(g.id);
      if (descartados.current.has(`${g.id}|${p.chave}`)) return; // o fluxo já seguiu sem ele
      if (r) setGerados((atual) => ({ ...atual, [g.id]: r }));
      // falhou (Jev/LLM fora ou sobrecarregado) e a pessoa ainda está na tela:
      // uma segunda chance daqui a pouco, com o mesmo texto; depois disso, fallback
      else if (tentativa === 1) {
        const t = setTimeout(() => {
          if (!pendentes.current.has(g.id)) pedir(g, etapa, v, 2);
        }, 1500);
        timers.current.set(`${g.id}:retry`, t);
      }
    });
    return p;
  }

  // dispara a geração enquanto a pessoa digita o campo-gatilho (debounce); não
  // pede de novo enquanto o texto só cresce pouco a partir do trecho já pedido
  function aoDigitar(etapa: EtapaConfig, valor: string) {
    for (const g of config.geracoes ?? []) {
      if (g.gatilho.campo !== etapa.id) continue;
      const t = timers.current.get(g.id);
      if (t) clearTimeout(t);
      const v = valor.trim();
      if (v.length < g.gatilho.minCaracteres) continue;
      timers.current.set(
        g.id,
        setTimeout(() => {
          const passo = g.gatilho.passoCaracteres ?? 20;
          const p = pendentes.current.get(g.id);
          if (p && cobre(p.chave, v, true) && v.length - p.chave.length < passo) return;
          const ja = gerados[g.id];
          if (ja && cobre(ja.para[etapa.id], v, !!ja.paraPrefixo?.includes(etapa.id)) && v.length - ja.para[etapa.id].length < passo) return;
          pedir(g, etapa, v);
        }, g.gatilho.debounceMs)
      );
    }
  }

  // no Enter: se há geração em andamento que cobre este texto, espera até
  // `esperaMs`; passou disso, segue com o texto fixo (o que chegar depois é descartado)
  async function esperarGeracoes(etapa: EtapaConfig, valor: string): Promise<Record<string, Gerado>> {
    const chegou: Record<string, Gerado> = {};
    const v = valor.trim();
    for (const g of config.geracoes ?? []) {
      if (g.gatilho.campo !== etapa.id) continue;
      const t = timers.current.get(g.id);
      if (t) clearTimeout(t);
      const ja = gerados[g.id];
      if (ja && cobre(ja.para[etapa.id], v, !!ja.paraPrefixo?.includes(etapa.id))) continue; // já vale
      let p = pendentes.current.get(g.id);
      // nada em andamento que cubra o texto: pede agora, se ele é longo o bastante
      if (!(p && cobre(p.chave, v, true)) && v.length >= g.gatilho.minCaracteres) p = pedir(g, etapa, v);
      if (!p) continue;
      const t0 = Date.now();
      // a 1ª tentativa já falhou (servidor fora ou sobrecarregado): espera pouco pela 2ª
      const espera = p.tentativa > 1 ? Math.min(g.esperaMs, 400) : g.esperaMs;
      const r = await comTimeout(p.promessa, espera, null);
      pendentes.current.delete(g.id);
      const ms = Date.now() - p.inicio;
      if (r) {
        chegou[g.id] = r;
        emitir({ tipo: "geracao", id: g.id, resultado: "usado", ms });
      } else {
        // não chegou a tempo: o que vier depois (inclusive a 2ª tentativa) é ignorado
        descartados.current.add(`${g.id}|${p.chave}`);
        const retry = timers.current.get(`${g.id}:retry`);
        if (retry) clearTimeout(retry);
        emitir({ tipo: "geracao", id: g.id, resultado: Date.now() - t0 >= g.esperaMs ? "descartado" : "fallback", ms });
      }
    }
    return chegou;
  }

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
  async function responder(etapa: EtapaConfig, valor: string) {
    // etapa com gatilho de geração: espera (pouco) o servidor antes de seguir
    let geradosNovos = gerados;
    if (etapa.tipo === "texto" && config.geracoes?.some((g) => g.gatilho.campo === etapa.id)) {
      setDigitando(true);
      const chegou = await esperarGeracoes(etapa, valor);
      if (Object.keys(chegou).length) {
        geradosNovos = { ...gerados, ...chegou };
        setGerados(geradosNovos);
      }
    }
    const novo = motor.responder(respostas, etapa, valor, geradosNovos);
    const ctxNovo: Contexto = { ...ctx, respostas: novo, gerados: geradosNovos };
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
    const jev = await rotularComJev(config.jev, sessao.current, ctxFinal);
    if (jev.origem === "jev") medicao.current.chamadasJev += 1;
    else if (config.jev.habilitado) medicao.current.fallbacks += 1;
    const classificacao = motor.classificar(ctxFinal, jev);
    emitir({ tipo: "classificacao", classificacao });
    try {
      const r = await persistencia.enviar({ respostas, ctx: ctxFinal, classificacao, honeypot: hpRef.current?.value ?? "", medicao: { ...medicao.current } });
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
                    onChange={(ev) => {
                      setTexto(ev.target.value);
                      aoDigitar(atual, ev.target.value);
                    }}
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
                    onChange={(ev) => {
                      const v = aplicarMascara(atual.mascara, ev.target.value);
                      setTexto(v);
                      aoDigitar(atual, v);
                    }}
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
