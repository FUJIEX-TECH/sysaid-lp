"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./diagnostico.css";
import {
  ETAPAS,
  abertura,
  encerradoPorSuporte,
  etapasRespondidas,
  origemDoCaminho,
  proximaEtapa,
  refazerDesde,
  sugerirEmpresa,
  LINK_SUPORTE,
  type Contexto,
  type Etapa,
  type Respostas,
} from "@/lib/diagnostico/fluxo";
import { pontuar, rotaDe } from "@/lib/diagnostico/pontuacao";
import { rotularComJev } from "@/lib/diagnostico/jev";
import { isCorporateEmail, CORPORATE_EMAIL_ERROR } from "@/lib/email-domains";
import CenaPlaceholder from "./CenaPlaceholder";

// Motor de conversa do Diagnóstico ITSM (variante B do formulário da LP).
// Plano: clientes/sysaid/formulario-inteligente/diagnostico-itsm-plano.html.
// Parte 1 da fatia 1 (28/10/2026): bolhas, "digitando" de 300 ms, botões e
// texto, histórico, corrigir bolha antiga (refaz dali), celular primeiro,
// acessível. Sem Jev nem LLM: textos fixos e pontuação por código.
// Gravação reaproveita /api/lead/partial e /api/lead (trava de e-mail
// corporativo e honeypot como estão).

const DIGITANDO_MS = 300;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid"] as const;

function getUtm(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) found[k] = v;
  }
  return found;
}

function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Fim = null | "enviando" | "suporte" | "erro";

export default function DiagnosticoChat() {
  const [respostas, setRespostas] = useState<Respostas>({});
  const [versao, setVersao] = useState(0); // muda a cada resposta/correção: reanima o "digitando"
  const [digitando, setDigitando] = useState(true);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [fim, setFim] = useState<Fim>(null);
  const [maisDores, setMaisDores] = useState(false);

  const inicio = useRef<number>(Date.now());
  const leadId = useRef<number | null>(null);
  const utm = useRef<Record<string, string> | null>(null);
  const salvoEmail = useRef("");
  const salvoContato = useRef("");
  const logRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef<HTMLInputElement>(null);

  const ctx = useMemo<Contexto>(() => {
    const { origem, concorrente } = origemDoCaminho(typeof window === "undefined" ? "/" : window.location.pathname);
    return { origem, concorrente, respostas };
  }, [respostas]);

  const respondidas = useMemo(() => etapasRespondidas(ctx), [ctx]);
  const atual = useMemo<Etapa | null>(() => (encerradoPorSuporte(respostas) ? null : proximaEtapa(ctx)), [ctx, respostas]);

  function ensureUtm() {
    if (!utm.current) utm.current = getUtm();
    return utm.current;
  }

  // "digitando" de 300 ms antes de cada bolha nova do bot
  useEffect(() => {
    setDigitando(true);
    const t = setTimeout(() => setDigitando(false), DIGITANDO_MS);
    return () => clearTimeout(t);
  }, [versao]);

  // rola pro fim e foca a entrada quando a pergunta aparece
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    if (!digitando) {
      const foco = el?.querySelector<HTMLElement>("[data-foco]");
      foco?.focus({ preventScroll: true });
    }
  }, [digitando, versao, erro]);

  // --- gravação silenciosa (mesmo fluxo da LP) ---------------------------
  const salvarParcial = useCallback(async (campos: Record<string, string>) => {
    try {
      const res = await fetch("/api/lead/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId.current ?? undefined,
          ...campos,
          page_url: window.location.href,
          referrer: document.referrer,
          ...ensureUtm(),
        }),
      });
      const data = await res.json();
      if (data?.id) leadId.current = Number(data.id);
    } catch {
      // nunca bloqueia a conversa
    }
  }, []);

  // --- responder / corrigir -------------------------------------------------
  function responder(etapa: Etapa, valor: string) {
    const novo: Respostas = { ...respostas, [etapa.id]: valor };
    setRespostas(novo);
    // empresa chega pré-preenchida com o chute pelo domínio ("É essa a sua empresa?")
    setTexto(etapa.id === "telefone" ? sugerirEmpresa(novo.email ?? "") : "");
    setErro(null);
    setMaisDores(false);
    setVersao((v) => v + 1);

    if (etapa.id === "email" && valor !== salvoEmail.current) {
      salvoEmail.current = valor;
      salvarParcial({ email: valor });
    }
    if (etapa.id === "telefone" && novo.nome) {
      const chave = `${novo.nome}|${valor}`;
      if (chave !== salvoContato.current) {
        salvoContato.current = chave;
        salvarParcial({ name: novo.nome, phone: valor });
      }
    }
  }

  function corrigir(id: keyof Respostas) {
    if (fim) return;
    const novo = refazerDesde(respostas, id);
    setRespostas(novo);
    setTexto(id === "empresa" ? (respostas.empresa ?? "") : id === "dor_texto" ? (respostas.dor_texto ?? "") : "");
    setErro(null);
    setVersao((v) => v + 1);
  }

  function enviarTexto(etapa: Etapa, bruto: string) {
    const v = bruto.trim();
    if (etapa.validar) {
      const e = etapa.validar(v, ctx);
      if (e) {
        setErro(e);
        return;
      }
    }
    if (etapa.id === "email") {
      // trava de 09/09/2026: só e-mail corporativo avança (o servidor confere de novo)
      if (!isCorporateEmail(v)) {
        setErro(CORPORATE_EMAIL_ERROR);
        return;
      }
      responder(etapa, v.toLowerCase());
      return;
    }
    responder(etapa, v);
  }

  // --- envio final ------------------------------------------------------------
  const enviouRef = useRef(false);

  const enviar = useCallback(async () => {
    enviouRef.current = true;
    setFim("enviando");
    const segundosTotal = Math.round((Date.now() - inicio.current) / 1000);
    const pontuacao = pontuar(respostas, { segundosTotal });
    const jev = await rotularComJev(respostas); // 800 ms de timeout, fallback null
    const rota = rotaDe(pontuacao, jev.rotulo);
    const diag = {
      variante: "b",
      origem: ctx.origem,
      concorrente: ctx.concorrente,
      respostas,
      pontos: pontuacao.pontos,
      detalhe: pontuacao.detalhe,
      classe: pontuacao.classe,
      rotulo: jev.rotulo ?? pontuacao.rotuloCodigo,
      rotulo_origem: jev.origem,
      rota,
      segundos: segundosTotal,
    };
    if (process.env.NODE_ENV !== "production") console.log("[diagnostico] classificação", diag);

    const payload = {
      id: leadId.current ?? undefined,
      email: respostas.email ?? "",
      name: respostas.nome ?? "",
      phone: respostas.telefone ?? "",
      company: respostas.empresa ?? "",
      num_admins: respostas.tecnicos ?? "",
      website: hpRef.current?.value ?? "", // honeypot
      page_url: window.location.href,
      referrer: document.referrer,
      ...ensureUtm(),
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        enviouRef.current = false;
        setFim("erro");
        return;
      }
      // diagnóstico em colunas próprias: só grava quando DIAGNOSTICO_PERSIST=true
      // no servidor (ambiente local/teste; migração não aplicada em produção)
      if (data.id && !data.hp) {
        try {
          await fetch("/api/diagnostico", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: Number(data.id), diag }),
          });
        } catch {
          // enfeite: nunca segura o redirect
        }
      }
      // mesma regra da LP: envio descartado pelo honeypot não vira conversão
      if (!data.hp) sessionStorage.setItem("sysaid_lead", "1");
      window.location.href = "/obrigado";
    } catch {
      enviouRef.current = false;
      setFim("erro");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respostas, ctx]);

  useEffect(() => {
    if (fim || digitando || enviouRef.current) return;
    if (encerradoPorSuporte(respostas)) {
      setFim("suporte");
      return;
    }
    if (atual !== null) return;
    enviar();
  }, [atual, digitando, fim, respostas, enviar]);

  // --- render ---------------------------------------------------------------------
  const sugestaoEmpresa = atual?.id === "empresa" ? sugerirEmpresa(respostas.email ?? "") : "";
  const valorTexto = texto;
  const numeroAtual = atual?.pergunta ?? 7;

  return (
    <div className="diag" role="region" aria-label="Diagnóstico ITSM em 2 minutos">
      <CenaPlaceholder respostas={respostas} />

      <div className="diag__topo">
        <span className="diag__quem">SysAid · Diagnóstico ITSM</span>
        <span className="diag__passo" aria-label={`Pergunta ${numeroAtual} de 7`}>
          {numeroAtual}/7
        </span>
      </div>

      <div className="diag__log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
        {abertura(ctx).map((t, i) => (
          <p key={`ab${i}`} className="diag__bolha diag__bolha--bot">
            {t}
          </p>
        ))}

        {respondidas.map((e) => {
          const valor = respostas[e.id] ?? "";
          return (
            <div key={e.id} className="diag__par">
              <p className="diag__bolha diag__bolha--bot">{e.texto(ctx)}</p>
              <button
                type="button"
                className="diag__bolha diag__bolha--eu"
                onClick={() => corrigir(e.id)}
                disabled={!!fim}
                title="Tocar pra corrigir esta resposta"
                aria-label={`Sua resposta: ${e.resumo(valor, ctx)}. Tocar pra corrigir.`}
              >
                {e.resumo(valor, ctx)}
              </button>
            </div>
          );
        })}

        {digitando && !fim && (
          <p className="diag__bolha diag__bolha--bot diag__digitando" aria-label="Digitando">
            <span /><span /><span />
          </p>
        )}

        {!digitando && atual && !fim && (
          <div className="diag__par diag__par--atual">
            <p className="diag__bolha diag__bolha--bot">{atual.texto(ctx)}</p>

            {atual.tipo !== "texto" && atual.opcoes && (
              <div className="diag__opcoes" role="group" aria-label={atual.texto(ctx)}>
                {(atual.id === "dor" && !maisDores ? atual.opcoes(ctx).slice(0, 4) : atual.opcoes(ctx)).map((o, i) => (
                  <button
                    key={o.valor}
                    type="button"
                    className="diag__opcao"
                    data-foco={i === 0 ? "" : undefined}
                    onClick={() => responder(atual, o.valor)}
                  >
                    {o.rotulo}
                  </button>
                ))}
                {atual.id === "dor" && !maisDores && (
                  <button type="button" className="diag__opcao diag__opcao--mais" onClick={() => setMaisDores(true)}>
                    Mais opções
                  </button>
                )}
              </div>
            )}

            {atual.tipo === "texto" && (
              <form
                className="diag__form"
                noValidate
                onSubmit={(ev) => {
                  ev.preventDefault();
                  enviarTexto(atual, valorTexto);
                }}
              >
                <label className="diag__sr" htmlFor={`diag-${atual.id}`}>
                  {atual.texto(ctx)}
                </label>
                {atual.input === "textarea" ? (
                  <textarea
                    id={`diag-${atual.id}`}
                    data-foco=""
                    rows={3}
                    value={valorTexto}
                    placeholder={atual.placeholder?.(ctx)}
                    onChange={(ev) => setTexto(ev.target.value)}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" && !ev.shiftKey) {
                        ev.preventDefault();
                        enviarTexto(atual, valorTexto);
                      }
                    }}
                  />
                ) : (
                  <input
                    id={`diag-${atual.id}`}
                    data-foco=""
                    type={atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : "text"}
                    inputMode={atual.input === "tel" ? "tel" : atual.input === "email" ? "email" : "text"}
                    autoComplete={
                      atual.input === "email" ? "email" : atual.input === "tel" ? "tel" : atual.id === "nome" ? "name" : atual.id === "empresa" ? "organization" : "off"
                    }
                    value={valorTexto}
                    placeholder={atual.placeholder?.(ctx)}
                    onChange={(ev) => setTexto(atual.input === "tel" ? mascaraTelefone(ev.target.value) : ev.target.value)}
                  />
                )}
                <div className="diag__acoes">
                  <button type="submit" className="btn btn--primary diag__enviar">
                    {atual.id === "empresa" && sugestaoEmpresa && valorTexto === sugestaoEmpresa ? "Sim, é essa" : "Enviar"}
                  </button>
                  {atual.pular && (
                    <button type="button" className="diag__pular" onClick={() => responder(atual, atual.pular!.valor)}>
                      {atual.pular.rotulo}
                    </button>
                  )}
                </div>
                {erro && (
                  <p className="diag__erro" role="alert">
                    {erro}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        {fim === "enviando" && (
          <p className="diag__bolha diag__bolha--bot">
            Perfeito{respostas.nome ? `, ${respostas.nome.split(" ")[0]}` : ""}. Estou mandando o seu mapa e já te levo pra confirmação.
          </p>
        )}
        {fim === "erro" && (
          <p className="diag__bolha diag__bolha--bot diag__erro" role="alert">
            Não consegui enviar agora. Confira o e-mail e tente de novo em instantes.{" "}
            <button type="button" className="diag__link" onClick={() => enviar()}>
              Tentar de novo
            </button>
          </p>
        )}
        {fim === "suporte" && (
          <p className="diag__bolha diag__bolha--bot">
            Pra suporte, o caminho mais rápido é o portal:{" "}
            <a className="diag__link" href={LINK_SUPORTE} target="_blank" rel="noopener noreferrer">
              abrir o suporte SysAid
            </a>
            . Se quiser conhecer módulos novos, toque na sua resposta acima pra mudar.
          </p>
        )}
      </div>

      {/* honeypot invisível, igual ao LeadForm */}
      <input ref={hpRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="diag__hp" aria-hidden="true" />

      <p className="diag__legal">
        Ao enviar, você concorda em ser contatado pela SysAid. Sem spam.
      </p>
    </div>
  );
}
