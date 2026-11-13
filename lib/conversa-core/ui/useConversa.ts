"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { criarMotor } from "../motor";
import { comTimeout, novaSessao, pedirGeracao, rotularComJev } from "../jev";
import { lerSinais, sinaisDoCaminho } from "../origem";
import { dominioDe, pedirEmpresa } from "../enriquecimento";
import { avaliar } from "../condicoes";
import { montagemIniciada } from "../entrega";
import { juntarHorarios, validarHorarios, type Horario } from "../horarios";
import { juntarMultipla } from "../selecao";
import { aplicarMascara, normalizar, validarValor } from "../util";
import type { ConfigConversa, Contexto, Empresa, EtapaConfig, Evento, Gerado, GeracaoConfig, Medicao, Persistencia, Respostas, Sinais } from "../tipos";

// gatilho por digitação (o de sempre) ou por resposta (13/11/2026)
type GatilhoDigitacao = Extract<GeracaoConfig["gatilho"], { campo: string }>;
const porDigitacao = (g: GeracaoConfig): g is GeracaoConfig & { gatilho: GatilhoDigitacao } => "campo" in g.gatilho;

// ==========================================================================
// conversa-core — v2: o estado e as ações da conversa, sem interface. Serve o
// widget (ConversaChat, parte 1) e a tela cheia (ConversaTela, v2). Aqui moram:
// motor + contexto (origem pelos sinais da URL), gerações enquanto digita,
// empresa pelo domínio do e-mail, envio final com Jev e persistência, eventos.
// ==========================================================================

// "enviado" (12/11/2026): enviou e ficou na página, porque o mapa completo foi
// liberado aqui (config.entrega); sem entrega, o envio redireciona como sempre
export type Fim = null | "enviando" | "enviado" | "encerrado" | "erro";

export type UseConversaArgs = {
  config: ConfigConversa;
  persistencia: Persistencia;
  onEvento?: (e: Evento) => void;
  // a interface sabe mostrar o mapa liberado (tela cheia); o widget não, então
  // nele a `entrega` da config é ignorada e o envio redireciona como antes
  comEntrega?: boolean;
};

export function useConversa({ config, persistencia, onEvento, comEntrega = false }: UseConversaArgs) {
  const motor = useMemo(() => criarMotor(config), [config]);
  const DIGITANDO_MS = config.digitandoMs ?? 300;
  // depois de um cartão visual, a próxima pergunta espera ele se desenhar
  const pausaCartao = useRef(0);

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

  // 13/11/2026: resposta por chip numa etapa de texto não pede geração quando a config diz (o texto do chip é fixo)
  function ehAtalho(etapa: EtapaConfig, valor: string, c: Contexto = ctx): boolean {
    return motor.resolver(etapa, c).atalhos.some((o) => o.valor === valor.trim());
  }

  function aoDigitar(etapa: EtapaConfig, valor: string) {
    for (const g of config.geracoes ?? []) {
      if (!porDigitacao(g) || g.gatilho.campo !== etapa.id) continue;
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
      if (!porDigitacao(g) || g.gatilho.campo !== etapa.id) continue;
      const t = timers.current.get(g.id);
      if (t) clearTimeout(t);
      if (g.gatilho.ignorarAtalhos && ehAtalho(etapa, v)) continue;
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
  function pedirEmpresaSePrecisar(etapa: EtapaConfig, valor: string): Promise<Empresa | null> | null {
    const cfg = config.empresa;
    if (!cfg?.habilitado || etapa.id !== cfg.campoEmail) return null;
    const dominio = dominioDe(valor);
    if (!dominio || dominio === dominioPedido.current) return null;
    dominioPedido.current = dominio;
    setEmpresa(undefined);
    return pedirEmpresa(cfg, dominio).then((r) => {
      if (dominioPedido.current !== dominio) return null; // a pessoa corrigiu o e-mail
      setEmpresa(r);
      return r;
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
    const extra = pausaCartao.current;
    pausaCartao.current = 0;
    const t = setTimeout(() => setDigitando(false), DIGITANDO_MS + extra);
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

  // 13/11/2026: geração disparada por resposta (sem a conversa esperar): pede com as
  // respostas novas; o que chegar entra nos gerados e vale enquanto o `para` bater
  const ultimoPorResposta = useRef<Map<string, number>>(new Map());
  function dispararAoResponder(etapaId: string, c: Contexto) {
    for (const g of config.geracoes ?? []) {
      const gat = g.gatilho;
      if ("campo" in gat || !gat.aoResponder.includes(etapaId)) continue;
      if (!avaliar(gat.quando, c, motor.resolvedor(c))) continue;
      const n = (ultimoPorResposta.current.get(g.id) ?? 0) + 1;
      ultimoPorResposta.current.set(g.id, n);
      const t0 = Date.now();
      pedirGeracao(g, sessao.current, c, c.respostas).then((r) => {
        contabilizar(r);
        if (ultimoPorResposta.current.get(g.id) !== n) return; // chegou outra mais nova
        emitir({ tipo: "geracao", id: g.id, resultado: r ? "usado" : "fallback", ms: Date.now() - t0 });
        if (r) setGerados((atual) => ({ ...atual, [g.id]: r }));
      });
    }
  }

  // quando cada etapa foi respondida (pra transcrição do registro)
  const momentos = useRef<Record<string, string>>({});

  // --- responder / corrigir -------------------------------------------------
  async function responder(etapa: EtapaConfig, valor: string) {
    let geradosNovos = gerados;
    if (etapa.tipo === "texto" && config.geracoes?.some((g) => porDigitacao(g) && g.gatilho.campo === etapa.id)) {
      setDigitando(true);
      const chegou = await esperarGeracoes(etapa, valor);
      if (Object.keys(chegou).length) {
        geradosNovos = { ...gerados, ...chegou };
        setGerados(geradosNovos);
      }
    }
    // v2 (11/11): com `empresa.esperaMs`, segura a próxima pergunta (mostrando
    // "digitando") até a empresa lida pelo domínio chegar, pra confirmar nome e
    // empresa de uma vez; passou o tempo, segue e a empresa entra quando vier
    let empresaNova: Empresa | null | undefined = empresa;
    const pedido = pedirEmpresaSePrecisar(etapa, valor);
    if (pedido && config.empresa?.esperaMs) {
      setDigitando(true);
      const r = await comTimeout<Empresa | null | undefined>(pedido, config.empresa.esperaMs, undefined);
      if (r !== undefined) empresaNova = r;
    }
    const ctxBase = motor.contexto(sinais, respostas, undefined, geradosNovos, empresaNova ?? null);
    const novo = motor.responder(respostas, etapa, valor, geradosNovos, ctxBase);
    const ctxNovo: Contexto = { ...ctxBase, respostas: novo };
    const proxima = motor.proximaEtapa(ctxNovo);
    // cartões visuais que entram depois desta resposta: avisa e dá tempo de desenhar
    const cartoesNovos = motor.cartoes(ctxNovo, etapa.id);
    if (cartoesNovos.length) pausaCartao.current = config.pausaCartaoMs ?? 900;
    momentos.current[etapa.id] = new Date().toISOString();
    setRespostas(novo);
    setTexto(proxima?.prefill ? motor.variavel(ctxNovo, proxima.prefill) : "");
    setErro(null);
    setMaisOpcoes(false);
    setVersao((v) => v + 1);
    emitir({ tipo: "resposta", etapa: etapa.id, passo: etapa.passo, segundosNaEtapa: Math.round((Date.now() - inicioEtapa.current) / 1000) });
    inicioEtapa.current = Date.now();
    dispararAoResponder(etapa.id, ctxNovo);
    persistencia.aoResponder?.(etapa.id, novo, ctxNovo, { sessao: sessao.current, transcricao: motor.transcricao(ctxNovo, momentos.current) });
    for (const cartao of cartoesNovos.filter((k) => !k.soNaEntrega)) emitir({ tipo: "cartao", id: cartao.id, etapa: etapa.id });
    if (config.entrega?.montagem?.apos === etapa.id) emitir({ tipo: "montagem", etapa: etapa.id });
  }

  // 13/11/2026: múltipla escolha (valores marcados + texto livre opcional)
  function enviarMultipla(etapa: EtapaConfig, valores: string[], textoLivre: string) {
    const m = etapa.multipla;
    const t = textoLivre.trim();
    const n = valores.length + (t ? 1 : 0);
    if (n < (m?.min ?? 1)) {
      setErro(m?.minMensagem ?? null);
      return;
    }
    const lista = m?.max ? valores.slice(0, m.max) : valores;
    responder(etapa, juntarMultipla(lista, t));
  }

  // 13/11/2026: horários (validados aqui com as regras da etapa; o servidor confere de novo)
  function enviarHorarios(etapa: EtapaConfig, lista: Horario[]) {
    const h = etapa.horarios;
    if (!h) return;
    const r = validarHorarios(lista, h, new Date());
    if (!r.ok) {
      setErro(h.mensagens[r.motivo]);
      return;
    }
    responder(etapa, juntarHorarios(r.horarios));
  }

  function corrigir(etapa: EtapaConfig) {
    if (fim) return;
    const novo = motor.refazerDesde(respostas, etapa.id);
    for (const k of Object.keys(momentos.current)) if (novo[k] === undefined) delete momentos.current[k];
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

  // 12/11/2026: com o mapa liberado aqui (config.entrega), o envio não tira a
  // pessoa da página: grava, fica "enviado" e o mapa completo aparece
  const entregaAqui = useCallback((c: Contexto) => comEntrega && !!config.entrega && motor.entregaLiberada(c, motor.proximaEtapa(c) === null), [comEntrega, config.entrega, motor]);

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
      const entregaFala = config.entrega?.fala && entregaAqui(ctxFinal) ? motor.texto(config.entrega.fala, ctxFinal).trim() : undefined;
      const transcricao = motor.transcricao(ctxFinal, momentos.current, { entrega: entregaFala });
      const r = await persistencia.enviar({ respostas, ctx: ctxFinal, classificacao, honeypot: hpRef.current?.value ?? "", medicao: { ...medicao.current }, sessao: sessao.current, transcricao });
      emitir({ tipo: "envio", ok: r.ok });
      if (!r.ok) {
        enviouRef.current = false;
        setFim("erro");
        return;
      }
      if (entregaAqui(ctxFinal)) setFim("enviado");
      else if (r.redirecionar) window.location.href = r.redirecionar;
    } catch {
      emitir({ tipo: "envio", ok: false });
      enviouRef.current = false;
      setFim("erro");
    }
  }, [config.jev, ctx, emitir, motor, persistencia, respostas, entregaAqui]);

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
  const montando = useMemo(() => montagemIniciada(config, respondidas.map((e) => e.id)), [config, respondidas]);
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
    emitir,
    responder,
    corrigir,
    enviarTexto,
    mudarTexto,
    enviar,
    // 13/11/2026
    enviarMultipla,
    enviarHorarios,
    setErro,
    montando,
    sessao: sessao.current,
  };
}

export type Conversa = ReturnType<typeof useConversa>;
