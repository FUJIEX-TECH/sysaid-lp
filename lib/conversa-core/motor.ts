// ==========================================================================
// conversa-core — o motor: percorre as etapas da configuração na ordem, pula
// a etapa cujo `quando` é falso e para na primeira sem resposta. Corrigir uma
// bolha antiga = apagar a resposta daquela etapa e de todas as seguintes; o
// resto se recalcula sozinho. Nada aqui conhece cliente algum.
// ==========================================================================

import { avaliar, geradoValido, type Resolvedor } from "./condicoes";
import { resolverCartoes, resumoCartao } from "./cartoes";
import { entregaLiberada } from "./entrega";
import { formatarHorario, lerHorarios } from "./horarios";
import { partesMultipla } from "./selecao";
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
  Turno,
} from "./tipos";
import type { CartaoPronto } from "./cartoes";

export type EtapaResolvida = {
  etapa: EtapaConfig;
  falas: { rotulo?: string; texto: string }[]; // 13/11/2026: balões antes da pergunta
  rotulo: string; // 13/11/2026: linha pequena em cima da pergunta
  texto: string;
  nota: string; // 13/11/2026: linha pequena embaixo do campo
  opcoes: Opcao[];
  atalhos: Opcao[]; // chips de resposta rápida numa etapa de texto
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
      // 12/11/2026: texto escrito no servidor, {{gerado.<id>.<chave>}} (vazio se a geração não vale mais)
      if (nome.startsWith("gerado.")) {
        const [id, chave] = nome.slice(7).split(".");
        if (!id || !chave || !geradoValido(ctx, id)) return "";
        return ctx.gerados?.[id]?.textos?.[chave] ?? "";
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
      // 13/11/2026: o que a etapa gravou noutro campo (aoResponder.definir) sai junto
      for (const a of e.aoResponder ?? []) if ("definir" in a) delete novo[a.definir.campo];
    });
    return novo;
  }

  // grava a resposta e aplica os efeitos declarados (todos os que casam com o
  // valor): "corrigir" refaz o porte; "é isso" no palpite copia pra outro campo
  // um dado decidido pelo Jev; um chip grava um valor fixo; "sim" na confirmação
  // copia uma variável (precisa do `ctx`, pra resolver nome sugerido, empresa lida)
  function responder(respostas: Respostas, etapa: EtapaConfig, valor: string, gerados?: Contexto["gerados"], ctx?: Contexto): Respostas {
    // 13/11/2026: `valor: "*"` casa com qualquer resposta
    const efeitos = etapa.aoResponder?.filter((a) => a.valor === valor || a.valor === "*") ?? [];
    const refazer = efeitos.find((a) => "refazerDesde" in a && a.valor === valor);
    if (refazer && "refazerDesde" in refazer) return refazerDesde(respostas, refazer.refazerDesde);
    const novo: Respostas = { ...respostas, [etapa.id]: valor };
    for (const efeito of efeitos) {
      if (!("definir" in efeito)) continue;
      const d = efeito.definir;
      if ("deGerado" in d) {
        // 13/11/2026: só copia se a geração ainda vale pra estas respostas (senão um texto
        // antigo, já corrigido, passaria o dado dele pra resposta nova)
        const base: Contexto = ctx ? { ...ctx, respostas: novo, gerados: gerados ?? ctx.gerados } : { origem: "", variaveis: {}, respostas: novo, gerados };
        const dado = geradoValido(base, d.deGerado.id) ? gerados?.[d.deGerado.id]?.dados?.[d.deGerado.dado] : undefined;
        if (dado) novo[d.campo] = dado;
      } else if ("valor" in d) {
        novo[d.campo] = d.valor;
      } else if ("deVariavel" in d && ctx) {
        const v = variavel({ ...ctx, respostas: novo, gerados: gerados ?? ctx.gerados }, d.deVariavel).trim();
        if (v) novo[d.campo] = v;
      }
    }
    return novo;
  }

  function encerramento(ctx: Contexto): Encerramento | null {
    return config.encerramentos?.find((e) => avaliar(e.quando, ctx, resolvedor(ctx))) ?? null;
  }

  // --- opções ---------------------------------------------------------------
  function lista(l: ListaOpcoes, ctx?: Contexto): Opcao[] {
    if (Array.isArray(l)) return l;
    if ("calcular" in l) {
      if (!ctx) return [];
      try {
        const r = l.calcular(ctx);
        return Array.isArray(r) ? r.filter((o) => o && typeof o.valor === "string" && typeof o.rotulo === "string") : [];
      } catch {
        return []; // erro na função da config: sem opções (a etapa ainda aceita texto, se tiver)
      }
    }
    return config.catalogos?.[l.catalogo] ?? [];
  }

  function opcoesDe(o: Opcoes | undefined, ctx: Contexto): Opcao[] {
    if (!o) return [];
    if (Array.isArray(o) || "catalogo" in o || "calcular" in o) return lista(o, ctx);
    const caso = o.casos.find((c) => avaliar(c.quando, ctx, resolvedor(ctx)));
    return lista(caso ? caso.opcoes : o.padrao, ctx);
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
    const fixas = variante?.opcoes ? lista(variante.opcoes, ctx) : opcoesDe(e.opcoes, ctx);
    // com opções geradas, das fixas só sobrevivem as "de escape" (valor fora de a..z de uma letra)
    const opcoes = gerado.opcoes ? [...gerado.opcoes, ...fixas.filter((o) => !/^[a-z]$/.test(o.valor))] : fixas;
    return {
      etapa: e,
      falas: (e.falas ?? [])
        .map((f) => (typeof f === "object" && "texto" in f ? (avaliar(f.quando, ctx, resolvedor(ctx)) ? { rotulo: texto(f.rotulo, ctx).trim() || undefined, texto: texto(f.texto, ctx).trim() } : { texto: "" }) : { texto: texto(f, ctx).trim() }))
        .filter((f) => f.texto),
      rotulo: texto(e.rotulo, ctx).trim(),
      texto: gerado.texto ?? texto(variante?.texto ?? e.texto, ctx),
      nota: texto(e.nota, ctx).trim(),
      opcoes,
      // chips de atalho: texto livre, múltipla e horários (13/11/2026: ex. "Quero orçamento" ao lado dos horários)
      atalhos: e.tipo === "escolha" || e.tipo === "info" ? [] : opcoesDe(e.atalhos, ctx),
      placeholder: texto(e.placeholder, ctx),
      prefill: e.prefill ? variavel(ctx, e.prefill) : "",
    };
  }

  // como a resposta aparece na bolha da pessoa
  function resumo(e: EtapaConfig, valor: string, ctx: Contexto): string {
    if (e.resumo?.porValor && valor in e.resumo.porValor) return e.resumo.porValor[valor];
    if (e.resumo?.template) return renderTemplate(e.resumo.template, ctx, resolvedor(ctx), { valor });
    // 13/11/2026: chips de atalho valem em qualquer tipo (ex.: "Quero orçamento" num passo de horários)
    const atalho = e.atalhos ? opcoesDe(e.atalhos, ctx).find((o) => o.valor === valor) : undefined;
    if (atalho && e.tipo !== "texto") return atalho.rotulo;
    if (e.tipo === "multipla") {
      const ops = resolver(e, ctx).opcoes;
      return partesMultipla(valor)
        .map((p) => ops.find((o) => o.valor === p)?.rotulo ?? `“${p}”`)
        .join(" · ");
    }
    if (e.tipo === "horarios") {
      const idioma = config.idioma ?? "pt-BR";
      const lista = lerHorarios(valor).map((h) => formatarHorario(h, idioma));
      return lista.length ? lista.join(" · ") : valor;
    }
    if (e.tipo === "texto") {
      const v = valor.trim();
      if (!v && e.pular) return e.pular.rotulo;
      // respondeu por um chip: mostra o rótulo do chip
      const chip = e.atalhos ? opcoesDe(e.atalhos, ctx).find((o) => o.valor === v) : undefined;
      return chip?.rotulo ?? v;
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

  // 12/11/2026: cartões visuais das etapas respondidas (ou só os de uma etapa)
  function cartoes(ctx: Contexto, soDaEtapa?: string) {
    const ids = soDaEtapa ? (aplicaRespondida(soDaEtapa, ctx) ? [soDaEtapa] : []) : etapasRespondidas(ctx).map((e) => e.id);
    return resolverCartoes(config, ctx, ids, resolvedor(ctx));
  }
  function aplicaRespondida(id: string, ctx: Contexto): boolean {
    const e = etapas.find((x) => x.id === id);
    return !!e && aplica(e, ctx) && ctx.respostas[id] !== undefined;
  }

  // 13/11/2026: a conversa como aconteceu, pro registro do cliente: abertura, e por
  // etapa respondida as falas e a pergunta, o que foi oferecido (opções, chips), a
  // resposta (crua e como apareceu), os painéis e os cartões que entraram depois.
  // `momentos` = quando cada etapa foi respondida (ISO), se a interface guardou.
  function transcricao(ctx: Contexto, momentos: Record<string, string> = {}, extras: { cartoes?: CartaoPronto[]; entrega?: string } = {}): Turno[] {
    const turnos: Turno[] = [];
    for (const t of config.abertura) {
      const x = texto(t, ctx).trim();
      if (x) turnos.push({ quem: "bot", tipo: "abertura", texto: x });
    }
    const cartoesTodos = extras.cartoes ?? cartoes(ctx);
    for (const e of etapasRespondidas(ctx)) {
      const r = resolver(e, ctx);
      for (const f of r.falas) turnos.push({ quem: "bot", tipo: "fala", etapa: e.id, texto: f.rotulo ? `[${f.rotulo}] ${f.texto}` : f.texto });
      const oferecidas = [...r.opcoes, ...r.atalhos].map((o) => o.rotulo);
      turnos.push({ quem: "bot", tipo: "pergunta", etapa: e.id, texto: r.rotulo ? `[${r.rotulo}] ${r.texto}` : r.texto, oferecidas: oferecidas.length ? oferecidas : undefined });
      const valor = ctx.respostas[e.id] ?? "";
      const viaChip = r.atalhos.some((o) => o.valor === valor);
      const via: Turno["via"] =
        e.pular && valor === e.pular.valor ? "pular" : viaChip ? "chip" : e.tipo === "escolha" || e.tipo === "info" ? "opcao" : e.tipo === "multipla" ? "multipla" : e.tipo === "horarios" ? "horarios" : "texto";
      turnos.push({ quem: "pessoa", tipo: "resposta", etapa: e.id, texto: resumo(e, valor, ctx), valor, via, em: momentos[e.id] });
      for (const p of config.paineis ?? []) {
        if (p.apos !== e.id || !avaliar(p.quando, ctx, resolvedor(ctx))) continue;
        const nome = p.tipo === "empresa" ? ctx.empresa?.nome : undefined;
        turnos.push({ quem: "bot", tipo: "painel", etapa: e.id, texto: [texto(p.titulo, ctx), p.tipo, nome].filter(Boolean).join(" · ") });
      }
      for (const k of cartoesTodos.filter((c) => c.apos === e.id && !c.soNaEntrega)) {
        if (k.fala) turnos.push({ quem: "bot", tipo: "fala", etapa: e.id, texto: k.fala });
        turnos.push({ quem: "bot", tipo: "cartao", etapa: e.id, texto: k.titulo ?? k.rotulo ?? k.tipo, cartao: { id: k.id, tipo: k.tipo, titulo: k.titulo, rotulo: k.rotulo, detalhe: resumoCartao(k) } });
      }
    }
    if (extras.entrega) turnos.push({ quem: "bot", tipo: "entrega", texto: extras.entrega });
    return turnos;
  }

  // 12/11/2026: o mapa completo já foi liberado? (entrega.ts)
  function entregaLiberadaEm(ctx: Contexto, completa?: boolean) {
    return entregaLiberada(config, ctx, { variavel: resolvedor(ctx), respondidas: etapasRespondidas(ctx).map((e) => e.id), completa });
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
    cartoes,
    entregaLiberada: entregaLiberadaEm,
    resolvedor,
    transcricao,
  };
}

export type Motor = ReturnType<typeof criarMotor>;
