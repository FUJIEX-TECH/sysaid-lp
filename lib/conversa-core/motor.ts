// ==========================================================================
// conversa-core — o motor: percorre as etapas da configuração na ordem, pula
// a etapa cujo `quando` é falso e para na primeira sem resposta. Corrigir uma
// bolha antiga = apagar a resposta daquela etapa e de todas as seguintes; o
// resto se recalcula sozinho. Nada aqui conhece cliente algum.
// ==========================================================================

import { avaliar, type Resolvedor } from "./condicoes";
import { pontuar, rotaDe } from "./pontuacao";
import { recomendar } from "./recomendacao";
import { renderTemplate, renderTexto } from "./texto";
import type {
  Classificacao,
  ConfigConversa,
  Contexto,
  Encerramento,
  EtapaConfig,
  ListaOpcoes,
  Opcao,
  Opcoes,
  Respostas,
  RotuloJev,
} from "./tipos";

export type EtapaResolvida = {
  etapa: EtapaConfig;
  texto: string;
  opcoes: Opcao[];
  placeholder: string;
  prefill: string;
};

export function criarMotor(config: ConfigConversa) {
  const etapas = config.etapas;

  // --- contexto -------------------------------------------------------------
  function origemDoCaminho(pathname: string): { origem: string; variaveis: Record<string, string | null> } {
    const slug = pathname.replace(/^\/+|\/+$/g, "").split("/")[0].toLowerCase();
    const o = slug ? config.origens.porSlug[slug] : undefined;
    if (o) return { origem: o.origem, variaveis: { ...o.variaveis } };
    return { origem: config.origens.padrao, variaveis: {} };
  }

  function contexto(pathname: string, respostas: Respostas, tempos?: Contexto["tempos"]): Contexto {
    return { ...origemDoCaminho(pathname), respostas, tempos };
  }

  // variáveis derivadas (config.variaveis) + o mapa, se houver recomendação
  function resolvedor(ctx: Contexto): Resolvedor {
    return (nome) => {
      const fn = config.variaveis?.[nome];
      if (fn) return fn(ctx);
      if (nome === "mapa" && config.recomendacao) {
        return recomendar(config.recomendacao, ctx, resolvedor(ctx))
          .map((n) => n.rotulo)
          .join(" → ");
      }
      return undefined;
    };
  }

  function variavel(ctx: Contexto, nome: string): string {
    const v = resolvedor(ctx)(nome);
    if (typeof v === "string") return v;
    return ctx.variaveis[nome] ?? "";
  }

  function texto(t: Parameters<typeof renderTexto>[0], ctx: Contexto, extras?: Record<string, string | number>): string {
    return renderTexto(t, ctx, resolvedor(ctx), extras);
  }

  // --- etapas ---------------------------------------------------------------
  function aplica(e: EtapaConfig, ctx: Contexto): boolean {
    return avaliar(e.quando, ctx, resolvedor(ctx));
  }

  function proximaEtapa(ctx: Contexto): EtapaConfig | null {
    for (const e of etapas) {
      if (!aplica(e, ctx)) continue;
      if (ctx.respostas[e.id] === undefined) return e;
    }
    return null;
  }

  function etapasRespondidas(ctx: Contexto): EtapaConfig[] {
    return etapas.filter((e) => aplica(e, ctx) && ctx.respostas[e.id] !== undefined);
  }

  function refazerDesde(respostas: Respostas, id: string): Respostas {
    const idx = etapas.findIndex((e) => e.id === id);
    if (idx < 0) return { ...respostas };
    const novo: Respostas = { ...respostas };
    etapas.slice(idx).forEach((e) => {
      delete novo[e.id];
    });
    return novo;
  }

  // grava a resposta e aplica os efeitos declarados (ex.: "corrigir" refaz o porte)
  function responder(respostas: Respostas, etapa: EtapaConfig, valor: string): Respostas {
    const efeito = etapa.aoResponder?.find((a) => a.valor === valor);
    if (efeito) return refazerDesde(respostas, efeito.refazerDesde);
    return { ...respostas, [etapa.id]: valor };
  }

  function encerramento(ctx: Contexto): Encerramento | null {
    return config.encerramentos?.find((e) => avaliar(e.quando, ctx, resolvedor(ctx))) ?? null;
  }

  // --- opções ---------------------------------------------------------------
  function lista(l: ListaOpcoes): Opcao[] {
    if (Array.isArray(l)) return l;
    return config.catalogos?.[l.catalogo] ?? [];
  }

  function opcoesDe(o: Opcoes | undefined, ctx: Contexto): Opcao[] {
    if (!o) return [];
    if (Array.isArray(o) || "catalogo" in o) return lista(o);
    const caso = o.casos.find((c) => avaliar(c.quando, ctx, resolvedor(ctx)));
    return lista(caso ? caso.opcoes : o.padrao);
  }

  function varianteDe(e: EtapaConfig, ctx: Contexto) {
    if (!e.variantes) return undefined;
    const v = ctx.respostas[e.variantes.porCampo];
    return v !== undefined ? e.variantes.casos[v] : undefined;
  }

  function resolver(e: EtapaConfig, ctx: Contexto): EtapaResolvida {
    const variante = varianteDe(e, ctx);
    const opcoes = variante?.opcoes ? lista(variante.opcoes) : opcoesDe(e.opcoes, ctx);
    return {
      etapa: e,
      texto: texto(variante?.texto ?? e.texto, ctx),
      opcoes,
      placeholder: texto(e.placeholder, ctx),
      prefill: e.prefill ? variavel(ctx, e.prefill) : "",
    };
  }

  // como a resposta aparece na bolha da pessoa
  function resumo(e: EtapaConfig, valor: string, ctx: Contexto): string {
    if (e.resumo?.porValor && valor in e.resumo.porValor) return e.resumo.porValor[valor];
    if (e.resumo?.template) return renderTemplate(e.resumo.template, ctx, resolvedor(ctx), { valor });
    if (e.tipo === "texto") {
      const v = valor.trim();
      if (!v && e.pular) return e.pular.rotulo;
      return v;
    }
    const opcao = resolver(e, ctx).opcoes.find((o) => o.valor === valor);
    return opcao?.rotulo ?? valor;
  }

  // --- classificação ----------------------------------------------------------
  function classificar(ctx: Contexto, jev: RotuloJev): Classificacao {
    const p = pontuar(config.pontuacao, ctx, resolvedor(ctx));
    const rota = rotaDe(config.pontuacao, p, jev.rotulo);
    return {
      ...p,
      rotulo: jev.rotulo ?? p.rotuloCodigo,
      rotuloOrigem: jev.origem,
      rota,
      segundos: ctx.tempos?.segundosTotal ?? 0,
    };
  }

  function mapa(ctx: Contexto) {
    return config.recomendacao ? recomendar(config.recomendacao, ctx, resolvedor(ctx)) : [];
  }

  return {
    config,
    contexto,
    origemDoCaminho,
    variavel,
    texto,
    proximaEtapa,
    etapasRespondidas,
    refazerDesde,
    responder,
    encerramento,
    resolver,
    resumo,
    classificar,
    mapa,
  };
}

export type Motor = ReturnType<typeof criarMotor>;
