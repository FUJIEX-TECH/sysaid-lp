"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { criarMotor } from "../motor";
import { comTimeout, novaSessao, pedirGeracao, rotularComJev } from "../jev";
import { lerSinais, sinaisDoCaminho } from "../origem";
import { dominioDe, pedirEmpresa } from "../enriquecimento";
import { aplicarMascara, normalizar, validarValor } from "../util";
import type { ConfigConversa, Contexto, Empresa, EtapaConfig, Evento, Gerado, GeracaoConfig, Medicao, Persistencia, Respostas, Sinais } from "../tipos";

// ==========================================================================
// conversa-core — v2: o estado e as ações da conversa, sem interface. Serve o
// widget (ConversaChat, parte 1) e a tela cheia (ConversaTela, v2). Aqui moram:
// motor + contexto (origem pelos sinais da URL), gerações enquanto digita,
// empresa pelo domínio do e-mail, envio final com Jev e persistência, eventos.
// ==========================================================================

export type Fim = null | "enviando" | "encerrado" | "erro";

export type UseConversaArgs = {
  config: ConfigConversa;
  persistencia: Persistencia;
  onEvento?: (e: Evento) => void;
};

export function useConversa({ config, persistencia, onEvento }: UseConversaArgs) {
  const motor = useMemo(() => criarMotor(config), [config]);
  const DIGITANDO_MS = config.digitandoMs ?? 300;

  const [respostas, setRespostas] = useState<Respostas>({});
  const [versao, setVersao] = useState(0); // muda a cada resposta/correção: reanima o "digitando"
  const [digitando, setDigitando] = useState(true);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [fim, setFim] = useState<Fim>(null);
  const [maisOpcoes, setMaisOpcoes] = useState(false);
  // de onde a pessoa veio (lido uma vez; no SSR, só o caminho raiz)
  const [sinais] = useState<Sinais>(() => (typeof window === "undefined" ? sinaisDoCaminho("/") : lerSinais(config.origens.lembrar)));
  // empresa pelo domínio do e-mail: undefined = não pedida; null = pedida e não veio
  const [empresa, setEmpresa] = useState<Empresa | null | undefined>(undefined);
  const dominioPedido = useRef<string>("");

  const inicio = useRef<number>(Date.now());
  const inicioEtapa = useRef<number>(Date.now());
  const hpRef = useRef<HTMLInputElement>(null);
  const emitir = useCallback((e: Evento) => onEvento?.(e), [onEvento]);

  // --- gerações do servidor (parte 2) ------------------------------------------
  const sessao = useRef<string>(novaSessao());
  const [gerados, setGerados] = useState<Record<string, Gerado>>({});
  const pendentes = useRef<Map<string, { chave: string; promessa: Promise<Gerado | null>; inicio: number; tentativa: number }>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
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

  const ctx = useMemo<Contexto>(() => motor.contexto(sinais, respostas, undefined, gerados, empresa ?? null), [motor, sinais, respostas, gerados, empresa]);

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
      if (pendentes.current.get(g.id)?.promessa !== promessa) return;
      pendentes.current.delete(g.id);
      if (descartados.current.has(`${g.id}|${p.chave}`)) return;
      if (r) setGerados((atual) => ({ ...atual, [g.id]: r }));
      else if (tentativa === 1) {
        const t = setTimeout(() => {
          if (!pendentes.current.has(g.id)) pedir(g, etapa, v, 2);
        }, 1500);
        timers.current.set(`${g.id}:retry`, t);
      }
    });
    return p;
  }

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

  async function esperarGeracoes(etapa: EtapaConfig, valor: string): Promise<Record<string, Gerado>> {
    const chegou: Record<string, Gerado> = {};
    const v = valor.trim();
    for (const g of config.geracoes ?? []) {
      if (g.gatilho.campo !== etapa.id) continue;
      const t = timers.current.get(g.id);
      if (t) clearTimeout(t);
      const ja = gerados[g.id];
      if (ja && cobre(ja.para[etapa.id], v, !!ja.paraPrefixo?.includes(etapa.id))) continue;
      let p = pendentes.current.get(g.id);
      if (!(p && cobre(p.chave, v, true)) && v.length >= g.gatilho.minCaracteres) p = pedir(g, etapa, v);
      if (!p) continue;
      const t0 = Date.now();
      const espera = p.tentativa > 1 ? Math.min(g.esperaMs, 400) : g.esperaMs;
      const r = await comTimeout(p.promessa, espera, null);
      pendentes.current.delete(g.id);
      const ms = Date.now() - p.inicio;
      if (r) {
        chegou[g.id] = r;
        emitir({ tipo: "geracao", id: g.id, resultado: "usado", ms });
      } else {
        descartados.current.add(`${g.id}|${p.chave}`);
        const retry = timers.current.get(`${g.id}:retry`);
        if (retry) clearTimeout(retry);
        emitir({ tipo: "geracao", id: g.id, resultado: Date.now() - t0 >= g.esperaMs ? "descartado" : "fallback", ms });
      }
    }
    return chegou;
  }

  // --- empresa pelo domínio (v2) ---------------------------------------------
  function pedirEmpresaSePrecisar(etapa: EtapaConfig, valor: string) {
    const cfg = config.empresa;
    if (!cfg?.habilitado || etapa.id !== cfg.campoEmail) return;
    const dominio = dominioDe(valor);
    if (!dominio || dominio === dominioPedido.current) return;
    dominioPedido.current = dominio;
    setEmpresa(undefined);
    pedirEmpresa(cfg, dominio).then((r) => {
      if (dominioPedido.current !== dominio) return; // a pessoa corrigiu o e-mail
      setEmpresa(r);
    });
  }

  const respondidas = useMemo(() => motor.etapasRespondidas(ctx), [motor, ctx]);
  const encerramento = useMemo(() => motor.encerramento(ctx), [motor, ctx]);
  const atual = useMemo<EtapaConfig | null>(() => (encerramento ? null : motor.proximaEtapa(ctx)), [motor, ctx, encerramento]);
  const atualResolvida = useMemo(() => (atual ? motor.resolver(atual, ctx) : null), [motor, atual, ctx]);

  useEffect(() => {
    emitir({ tipo: "inicio", origem: ctx.origem });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDigitando(true);
    const t = setTimeout(() => setDigitando(false), DIGITANDO_MS);
    return () => clearTimeout(t);
  }, [versao, DIGITANDO_MS]);

  // o prefill pode mudar depois que a pergunta apareceu (a empresa lida pelo
  // domínio chega e substitui o chute): se a pessoa ainda não mexeu no campo
  // (vazio ou igual ao prefill anterior), troca
  const prefillAnterior = useRef<string>("");
  useEffect(() => {
    if (!atual?.prefill || !atualResolvida) return;
    const novo = atualResolvida.prefill;
    if (novo && (texto === "" || texto === prefillAnterior.current) && texto !== novo) setTexto(novo);
    prefillAnterior.current = novo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atualResolvida?.prefill, atual?.id]);

  // --- responder / corrigir -------------------------------------------------
  async function responder(etapa: EtapaConfig, valor: string) {
    let geradosNovos = gerados;
    if (etapa.tipo === "texto" && config.geracoes?.some((g) => g.gatilho.campo === etapa.id)) {
      setDigitando(true);
      const chegou = await esperarGeracoes(etapa, valor);
      if (Object.keys(chegou).length) {
        geradosNovos = { ...gerados, ...chegou };
        setGerados(geradosNovos);
      }
    }
    pedirEmpresaSePrecisar(etapa, valor);
    const novo = motor.responder(respostas, etapa, valor, geradosNovos);
    const ctxNovo: Contexto = { ...ctx, respostas: novo, gerados: geradosNovos };
    const proxima = motor.proximaEtapa(ctxNovo);
    setRespostas(novo);
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

  function mudarTexto(etapa: EtapaConfig, bruto: string) {
    const v = aplicarMascara(etapa.mascara, bruto);
    setTexto(v);
    aoDigitar(etapa, v);
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

  const passoAtual = atual?.passo ?? config.totalPassos;
  const confirmando = !!(atualResolvida?.prefill && atual?.confirmarRotulo && texto === atualResolvida.prefill);

  return {
    motor,
    ctx,
    respostas,
    respondidas,
    atual,
    atualResolvida,
    encerramento,
    digitando,
    versao,
    texto,
    setTexto,
    erro,
    fim,
    maisOpcoes,
    setMaisOpcoes,
    empresa,
    passoAtual,
    confirmando,
    hpRef,
    responder,
    corrigir,
    enviarTexto,
    mudarTexto,
    enviar,
  };
}

export type Conversa = ReturnType<typeof useConversa>;
