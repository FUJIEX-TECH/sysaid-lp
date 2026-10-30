// ==========================================================================
// conversa-core — o motor: percorre as etapas da configuração na ordem, pula
// a etapa cujo `quando` é falso e para na primeira sem resposta. Corrigir uma
// bolha antiga = apagar a resposta daquela etapa e de todas as seguintes; o
// resto se recalcula sozinho. Nada aqui conhece cliente algum.
// ==========================================================================

import { avaliar, geradoValido, type Resolvedor } from "./condicoes";
import { montarMapa } from "./mapa";
import { resolverOrigem, sinaisDoCaminho } from "./origem";
import { pontuar, rotaDe, rotuloFinal } from "./pontuacao";
import { recomendar } from "./recomendacao";
import { renderTemplate, renderTexto } from "./texto";
import type {
  Classificacao,
  ConfigConversa,
  Contexto,
  Empresa,
  Encerramento,
  EtapaConfig,
  ListaOpcoes,
  Opcao,
  Opcoes,
  Respostas,
  RotuloJev,
  Sinais,
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
  // parte 1: só o caminho; v2: os sinais completos (UTMs, referrer, entrada)
  function origemDoCaminho(pathname: string): { origem: string; variaveis: Record<string, string | null> } {
    const o = resolverOrigem(config.origens, sinaisDoCaminho(pathname));
    return { origem: o.origem, variaveis: o.variaveis };
  }

  function contexto(
    sinaisOuCaminho: Sinais | string,
    respostas: Respostas,
    tempos?: Contexto["tempos"],
    gerados?: Contexto["gerados"],
    empresa?: Empresa | null
  ): Contexto {
    const sinais = typeof sinaisOuCaminho === "string" ? sinaisDoCaminho(sinaisOuCaminho) : sinaisOuCaminho;
    const o = resolverOrigem(config.origens, sinais);
    return { origem: o.origem, variaveis: o.variaveis, respostas, tempos, gerados, sinais, empresa };
  }

  // variáveis derivadas (config.variaveis), o mapa em texto, e as de v2:
  // {{resumo.<etapa>}} (a resposta como aparece na bolha), {{sinais.<x>}} (utm,
  // parâmetro) e {{empresa.<x>}} (empresa lida pelo domínio)
  function resolvedor(ctx: Contexto): Resolvedor {
    return (nome) => {
      const fn = config.variaveis?.[nome];
      if (fn) return fn(ctx);
      if (nome === "mapa" && config.recomendacao) {
        return recomendar(config.recomendacao, ctx, resolvedor(ctx))
          .map((n) => n.rotulo)
          .join(" → ");
      }
      if (nome.startsWith("resumo.")) {
        const id = nome.slice(7);
        const e = etapas.find((x) => x.id === id);
        const v = ctx.respostas[id];
        return e && v !== undefined ? resumo(e, v, ctx) : "";
      }
      if (nome.startsWith("sinais.")) {
        const k = nome.slice(7);
        const s = ctx.sinais;
        if (!s) return "";
        const direto = (s as unknown as Record<string, unknown>)[k];
        if (typeof direto === "string") return direto;
        return s.parametros[k] ?? "";
      }
      if (nome.startsWith("empresa.")) {
        const k = nome.slice(8);
        const e = ctx.empresa;
        if (!e) return "";
        const v = (e as unknown as Record<string, unknown>)[k];
        return typeof v === "string" ? v : "";
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

  // grava a resposta e aplica os efeitos declarados: "corrigir" refaz o porte;
  // "é isso" no palpite copia pra outro campo um dado decidido pelo Jev
  function responder(respostas: Respostas, etapa: EtapaConfig, valor: string, gerados?: Contexto["gerados"]): Respostas {
    const efeito = etapa.aoResponder?.find((a) => a.valor === valor);
    if (efeito && "refazerDesde" in efeito) return refazerDesde(respostas, efeito.refazerDesde);
    const novo: Respostas = { ...respostas, [etapa.id]: valor };
    if (efeito && "definir" in efeito) {
      const dado = gerados?.[efeito.definir.deGerado.id]?.dados?.[efeito.definir.deGerado.dado];
      if (dado) novo[efeito.definir.campo] = dado;
    }
    return novo;
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

  // texto/opções gerados no servidor, se a geração chegou e ainda vale
  function geradoDe(e: EtapaConfig, ctx: Contexto): { texto?: string; opcoes?: Opcao[] } {
    if (!e.gerado || !geradoValido(ctx, e.gerado.id)) return {};
    const g = ctx.gerados![e.gerado.id];
    const s = e.gerado.seIgual;
    if (s && (ctx.respostas[s.campo] === undefined || ctx.respostas[s.campo] !== g.dados?.[s.dado])) return {};
    const t = e.gerado.texto ? g.textos[e.gerado.texto] : undefined;
    const l = e.gerado.opcoes ? g.listas?.[e.gerado.opcoes] : undefined;
    // opções geradas ganham valores "a", "b", "c"...; as fixas (ex.: "Outro") vêm depois
    const opcoes = l && l.length ? l.map((rotulo, i) => ({ valor: String.fromCharCode(97 + i), rotulo })) : undefined;
    return { texto: t && t.trim() ? t : undefined, opcoes };
  }

  function resolver(e: EtapaConfig, ctx: Contexto): EtapaResolvida {
    const variante = varianteDe(e, ctx);
    const gerado = geradoDe(e, ctx);
    const fixas = variante?.opcoes ? lista(variante.opcoes) : opcoesDe(e.opcoes, ctx);
    // com opções geradas, das fixas só sobrevivem as "de escape" (valor fora de a..z de uma letra)
    const opcoes = gerado.opcoes ? [...gerado.opcoes, ...fixas.filter((o) => !/^[a-z]$/.test(o.valor))] : fixas;
    return {
      etapa: e,
      texto: gerado.texto ?? texto(variante?.texto ?? e.texto, ctx),
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
      rotulo: rotuloFinal(config.pontuacao, p, jev.rotulo),
      rotuloOrigem: jev.origem,
      jevDados: jev.dados,
      rota,
      segundos: ctx.tempos?.segundosTotal ?? 0,
    };
  }

  function mapa(ctx: Contexto) {
    return config.recomendacao ? recomendar(config.recomendacao, ctx, resolvedor(ctx)) : [];
  }

  // v2: o mapa visual (nós e ligações) a partir de config.mapa
  function mapaVisual(ctx: Contexto) {
    return montarMapa(config, ctx, resolvedor(ctx));
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
    mapaVisual,
    resolvedor,
  };
}

export type Motor = ReturnType<typeof criarMotor>;
