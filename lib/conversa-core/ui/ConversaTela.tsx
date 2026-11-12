"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import "./tela.css";
import { useConversa } from "./useConversa";
import { avaliar } from "../condicoes";
import { dataHoje, etapaDaEntrega } from "../entrega";
import Resumo from "./Resumo";
import Entrega from "./Entrega";
import Porte from "./graficos/Porte";
import Mapa from "./graficos/Mapa";
import Empresa from "./graficos/Empresa";
import Cartao from "./graficos/Cartao";
import type { ConfigConversa, Contexto, EtapaConfig, Evento, PainelConfig, Persistencia } from "../tipos";
import type { Motor } from "../motor";

// ==========================================================================
// conversa-core — v2: a tela cheia. A conversa é a página: cabeçalho fino com
// logo/presença/progresso, a coluna da conversa rola com a janela, a coluna
// lateral (desktop) guarda o resumo que se escreve sozinho e os painéis
// "laterais" (ex.: o mapa que cresce a cada resposta). No celular tudo vira
// uma coluna e os painéis entram no fluxo depois da etapa que os dispara.
// Gráficos são gerados por código a partir das respostas (Porte, Mapa,
// Empresa); textos vêm da config.
// Estilo (config.estilo): "editorial" = fala com filete e título grande na
// abertura; "chat" = balões, abertura em balões curtos que entram em
// sequência, chips de resposta rápida, botão de enviar dentro do campo e o
// erro de validação como fala do bot. Formas pelos tokens --cv-radius-*.
// 12/11/2026: cartões visuais (config.cartoes) entram na conversa depois da
// etapa que os dispara; e o mapa liberado (config.entrega): depois da etapa que
// destrava (padrão: o telefone), uma seção larga embaixo da conversa com o mapa
// completo, o resumo, os cartões e "Baixar em PDF" (impressão do navegador,
// folha clara pelo @media print do tela.css). Até lá a lateral é o teaser.
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

// seta pra cima do botão de enviar dentro do campo (estilo chat)
function IconeEnviar() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M10 16V4.5M10 4.5 5.5 9M10 4.5 14.5 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ConversaTela({ config, persistencia, onEvento, textos }: Props) {
  const c = useConversa({ config, persistencia, onEvento, comEntrega: true });
  const { motor, ctx, respostas, respondidas, atual, atualResolvida, encerramento, digitando, versao, texto, erro, fim, maisOpcoes, setMaisOpcoes, passoAtual, confirmando, hpRef } = c;
  const largo = useLargo();
  const fluxoRef = useRef<HTMLDivElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const chat = config.estilo === "chat";

  // estilo chat: a abertura entra balão a balão, com "digitando" entre eles e
  // antes da primeira pergunta (aberturaN vai até total + 1)
  const totalAbertura = config.abertura.length;
  const [aberturaN, setAberturaN] = useState(chat ? 0 : totalAbertura + 1);
  useEffect(() => {
    if (aberturaN > totalAbertura) return;
    const reduzido = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setAberturaN((n) => n + 1), reduzido ? 0 : config.aberturaMs ?? 650);
    return () => clearTimeout(t);
  }, [aberturaN, totalAbertura, config.aberturaMs]);
  const aberturaPronta = aberturaN > totalAbertura;
  const aberturaVisivel = config.abertura.slice(0, Math.min(aberturaN, totalAbertura));

  // rola até a pergunta nova e foca a entrada (com o mapa liberado no fim, quem rola é a entrega)
  useEffect(() => {
    if ((digitando && fim) || fim === "enviado") return;
    fimRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    if (!digitando && aberturaPronta) {
      const foco = fluxoRef.current?.querySelector<HTMLElement>("[data-foco]");
      foco?.focus({ preventScroll: true });
    }
  }, [digitando, versao, erro, fim, aberturaN, aberturaPronta]);

  // cartões visuais das etapas respondidas (funções puras da config, validadas no núcleo)
  const cartoes = useMemo(() => motor.cartoes(ctx), [motor, ctx]);
  const cartoesDe = (etapaId: string) => cartoes.filter((k) => k.apos === etapaId);

  // mapa liberado: só depois da etapa que destrava; no fim da conversa, só
  // depois de gravar (enviado), pra não piscar enquanto envia
  const entrega = config.entrega;
  const liberada = !!entrega && motor.entregaLiberada(ctx, atual === null && !encerramento);
  const mostrarEntrega = liberada && (fim === "enviado" || (fim === null && atual !== null));
  const [hoje] = useState(() => dataHoje(config.idioma));
  const entregaRef = useRef<HTMLHeadingElement>(null);
  const entregaAvisada = useRef(false);
  useEffect(() => {
    if (!mostrarEntrega) return;
    const t = setTimeout(() => {
      entregaRef.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "smooth" });
      entregaRef.current?.focus({ preventScroll: true });
    }, 120);
    if (!entregaAvisada.current) {
      entregaAvisada.current = true;
      c.emitir({ tipo: "entrega", etapa: etapaDaEntrega(config) });
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarEntrega]);

  function baixarPdf() {
    c.emitir({ tipo: "pdf" });
    const anterior = document.title;
    const nome = motor.texto(entrega?.pdf?.arquivo, ctx, { hoje }).trim();
    let voltou = false;
    const volta = () => {
      if (voltou) return;
      voltou = true;
      document.title = anterior;
      window.removeEventListener("afterprint", volta);
    };
    if (nome) document.title = nome; // vira o nome sugerido do arquivo no "Salvar como PDF"
    window.addEventListener("afterprint", volta);
    window.print();
  }

  const resolvedor = motor.resolvedor(ctx);
  const paineis = (config.paineis ?? []).filter((p) => avaliar(p.quando, ctx, resolvedor));
  const lateral = largo ? paineis.filter((p) => p.lugar === "lateral") : [];
  const noFluxo = (etapaId: string) => paineis.filter((p) => p.apos === etapaId && (p.lugar !== "lateral" || !largo));

  // mapa em montagem (11/11/2026): textos "montando"/"pronto" da config; no celular
  // (sem lateral) um selo fixo embaixo mostra a barra e abre o mapa numa folha,
  // até o cartão entrar na própria conversa (etapa `apos` do painel)
  const progressoMapa = config.mapa?.progresso ? { montando: motor.texto(config.mapa.progresso.montando, ctx), pronto: motor.texto(config.mapa.progresso.pronto, ctx) } : undefined;
  const painelMapaLateral = paineis.find((p) => p.tipo === "mapa" && p.lugar === "lateral");
  const mapaInline = !!painelMapaLateral?.apos && (atual?.id === painelMapaLateral.apos || respostas[painelMapaLateral.apos] !== undefined);
  const mapaSelo = !largo && painelMapaLateral && !mapaInline && !fim && !liberada && aberturaPronta ? motor.mapaVisual(ctx) : null;
  // teaser: antes de liberar, os lugares em `entrega.teaser.ocultar` aparecem prontos mas fechados
  const fechados = entrega?.teaser?.ocultar?.length && !liberada ? { tipos: entrega.teaser.ocultar, rotulo: entrega.teaser.rotulo ?? "" } : undefined;
  const [seloAberto, setSeloAberto] = useState(false);
  useEffect(() => {
    setSeloAberto(false);
  }, [versao]);

  function painel(p: PainelConfig) {
    const titulo = motor.texto(p.titulo, ctx) || undefined;
    if (p.tipo === "porte") {
      const d = dadosPorte(config, ctx, motor);
      return d ? <Porte key={p.id} {...d} titulo={titulo ?? d.titulo} /> : null;
    }
    if (p.tipo === "mapa") {
      const m = motor.mapaVisual(ctx);
      if (!m) return null;
      const lateralLiberada = mostrarEntrega && p.lugar === "lateral" && largo && entrega?.verCompleto;
      return (
        <Fragment key={p.id}>
          <Mapa mapa={m} titulo={titulo} progresso={progressoMapa} fechados={fechados} />
          {lateralLiberada && (
            <button type="button" className="cvt__ver-completo" onClick={() => entregaRef.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "smooth" })}>
              {entrega!.verCompleto}
            </button>
          )}
        </Fragment>
      );
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
        {cartoesDe(e.id).map((k) => (
          <Fragment key={k.id}>
            {k.fala && <p className="cvt__bot">{k.fala}</p>}
            <Cartao cartao={k} />
          </Fragment>
        ))}
        {/* entrega no meio da conversa (a etapa que destrava não é a última): a fala fica aqui */}
        {mostrarEntrega && fim === null && entrega?.fala && e.id === etapaDaEntrega(config) && <p className="cvt__bot">{motor.texto(entrega.fala, ctx, { hoje })}</p>}
      </div>
    );
  }

  const total = config.totalPassos;
  const pct = Math.round(((Math.max(1, passoAtual) - 1) / total) * 100);
  const faltam = config.textos.faltam ? motor.texto(config.textos.faltam, ctx, { n: Math.max(0, total - passoAtual + 1) }) : "";

  // cabeçalho, tudo pela config: logo do cliente (link quando tem href; altura pelo
  // token --cv-logo-altura), título/subtítulo opcionais, presença ("online"/
  // "digitando"), frase por origem e progresso (contagem + barra, só a barra fina
  // na borda de baixo, ou nada). O conteúdo alinha com a coluna da conversa.
  const logo = config.marca.logo;
  const logoEstilo = logo?.altura ? ({ "--cv-logo-altura": `${logo.altura}px` } as React.CSSProperties) : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  const logoImg = logo ? <img src={logo.src} alt={logo.alt} /> : null;
  const cab = config.cabecalho ?? {};
  const mostrarTitulo = cab.titulo !== false;
  const mostrarSub = cab.subtitulo !== false && !!config.marca.subtitulo;
  const progresso = cab.progresso ?? "contagem-e-barra";
  const comContagem = progresso === "contagem" || progresso === "contagem-e-barra";
  const comBarra = progresso === "barra" || progresso === "contagem-e-barra";
  const digitandoAgora = (digitando || !aberturaPronta) && !fim;
  const estado = !cab.estado
    ? ""
    : fim === "enviando"
      ? cab.estado.enviando ?? cab.estado.online
      : fim === "encerrado"
        ? cab.estado.encerrado ?? cab.estado.online
        : digitandoAgora
          ? cab.estado.digitando
          : cab.estado.online;
  const frase = cab.frase ? motor.texto(cab.frase, ctx) : "";
  const progressoAria = {
    role: "progressbar" as const,
    "aria-valuemin": 0,
    "aria-valuemax": total,
    "aria-valuenow": Math.min(passoAtual, total),
    "aria-label": motor.texto(config.textos.passoAria, ctx, { passo: passoAtual, total }),
  };
  const larguraBarra = `${fim === "enviando" ? 100 : pct}%`;
  const rotuloEnviar = confirmando && atual?.confirmarRotulo ? atual.confirmarRotulo : config.textos.enviar ?? "Enviar";

  return (
    <div className={`cvt${mapaSelo ? " cvt--com-selo" : ""}${mostrarEntrega ? " cvt--entregue" : ""}`} data-modo={config.modo ?? "claro"} data-estilo={config.estilo ?? "editorial"} style={config.tema as React.CSSProperties}>
      <header className="cvt__topo">
        <div className="cvt__topo-inner">
          <div className="cvt__topo-linha">
            <div className="cvt__marca">
              {logo &&
                (logo.href ? (
                  <a className="cvt__logo" href={logo.href} aria-label={logo.hrefRotulo} style={logoEstilo}>
                    {logoImg}
                  </a>
                ) : (
                  <span className="cvt__logo" style={logoEstilo}>
                    {logoImg}
                  </span>
                ))}
              {(mostrarTitulo || mostrarSub) && (
                <div className="cvt__titulos">
                  {mostrarTitulo && <span className="cvt__quem">{config.marca.titulo}</span>}
                  {mostrarSub && <span className="cvt__sub">{config.marca.subtitulo}</span>}
                </div>
              )}
              {estado && (
                <span className={`cvt__estado${digitandoAgora ? " cvt__estado--digitando" : ""}`} aria-hidden="true">
                  {estado}
                </span>
              )}
            </div>
            {frase && <p className="cvt__frase">{frase}</p>}
            {comContagem && (
              <div className="cvt__progresso" {...progressoAria}>
                <span className="cvt__passo">
                  {passoAtual} <em>de</em> {total}
                  {faltam && <small>{faltam}</small>}
                </span>
                {comBarra && (
                  <span className="cvt__barra">
                    <i style={{ width: larguraBarra }} />
                  </span>
                )}
              </div>
            )}
            {!comContagem && comBarra && (
              <span className="cvt__barra cvt__barra--fina" {...progressoAria}>
                <i style={{ width: larguraBarra }} />
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="cvt__corpo">
        <main className="cvt__fluxo" ref={fluxoRef} role="log" aria-live="polite" aria-relevant="additions" aria-label={config.marca.rotuloRegiao}>
          <div className="cvt__abertura">
            {aberturaVisivel.map((t, i) => (
              <p key={`ab${i}`} className={`cvt__bot ${!chat && i === 0 ? "cvt__bot--titulo" : ""}`}>
                {motor.texto(t, ctx)}
              </p>
            ))}
          </div>

          {aberturaPronta && respondidas.map(par)}

          {digitandoAgora && (
            <p className="cvt__bot cvt__digitando" aria-label="Digitando">
              <span />
              <span />
              <span />
            </p>
          )}

          {aberturaPronta && !digitando && atual && atualResolvida && !fim && (
            <div className="cvt__par cvt__par--atual" data-etapa={atual.id}>
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
                <>
                  {/* respostas rápidas: chips da etapa, o "confirmar" do prefill e o "pular" (no estilo chat) */}
                  {(atualResolvida.atalhos.length > 0 || (chat && ((confirmando && !!atual.confirmarRotulo) || !!atual.pular))) && (
                    <div className="cvt__opcoes cvt__opcoes--atalhos" role="group" aria-label={atualResolvida.texto}>
                      {chat && confirmando && atual.confirmarRotulo && (
                        <button type="button" className="cvt__opcao cvt__opcao--confirmar" onClick={() => c.enviarTexto(atual, texto)}>
                          {atual.confirmarRotulo}
                        </button>
                      )}
                      {atualResolvida.atalhos.map((o) => (
                        <button key={o.valor} type="button" className="cvt__opcao" onClick={() => c.responder(atual, o.valor)}>
                          {o.rotulo}
                        </button>
                      ))}
                      {chat && atual.pular && (
                        <button type="button" className="cvt__opcao cvt__opcao--mais" onClick={() => c.responder(atual, atual.pular!.valor)}>
                          {atual.pular.rotulo}
                        </button>
                      )}
                    </div>
                  )}
                  {chat && erro && (
                    <p className="cvt__bot cvt__bot--aviso" role="alert">
                      {erro}
                    </p>
                  )}
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
                    <div className={`cvt__campo${atual.input === "textarea" ? " cvt__campo--area" : ""}`}>
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
                      {chat && (
                        <button type="submit" className="cvt__enviar cvt__enviar--icone" aria-label={rotuloEnviar} title={rotuloEnviar}>
                          <IconeEnviar />
                        </button>
                      )}
                    </div>
                    {!chat && (
                      <div className="cvt__acoes">
                        <button type="submit" className="cvt__enviar">
                          {rotuloEnviar}
                        </button>
                        {atual.pular && (
                          <button type="button" className="cvt__pular" onClick={() => c.responder(atual, atual.pular!.valor)}>
                            {atual.pular.rotulo}
                          </button>
                        )}
                      </div>
                    )}
                    {!chat && erro && (
                      <p className="cvt__erro" role="alert">
                        {erro}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          )}

          {(fim === "enviando" || (fim === "enviado" && mostrarEntrega)) && <p className="cvt__bot">{motor.texto(config.textos.enviando, ctx)}</p>}
          {mostrarEntrega && fim === "enviado" && entrega?.fala && <p className="cvt__bot">{motor.texto(entrega.fala, ctx, { hoje })}</p>}
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

      {/* fora do corpo: a lateral sticky não pode descer por cima do mapa liberado */}
      {mostrarEntrega && (
        <div className="cvt__entrega">
          <Entrega ref={entregaRef} config={config} motor={motor} ctx={ctx} mapa={motor.mapaVisual(ctx)} cartoes={cartoes} hoje={hoje} onPdf={baixarPdf} />
        </div>
      )}

      {mapaSelo && painelMapaLateral && (
        <div className="cvt__selo">
          {seloAberto && (
            <div className="cvt__folha" id="cvt-folha-mapa">
              <Mapa mapa={mapaSelo} titulo={motor.texto(painelMapaLateral.titulo, ctx) || undefined} progresso={progressoMapa} fechados={fechados} />
            </div>
          )}
          <button type="button" className="cvt__selo-botao" aria-expanded={seloAberto} aria-controls="cvt-folha-mapa" onClick={() => setSeloAberto((v) => !v)}>
            <span className="cvm__estado">{progressoMapa ? (mapaSelo.completo ? progressoMapa.pronto : progressoMapa.montando) : motor.texto(painelMapaLateral.titulo, ctx)}</span>
            <span className="cvm__barra" aria-hidden="true">
              <i style={{ width: `${mapaSelo.progresso.total ? Math.round((mapaSelo.progresso.cheios / mapaSelo.progresso.total) * 100) : 0}%` }} />
            </span>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
