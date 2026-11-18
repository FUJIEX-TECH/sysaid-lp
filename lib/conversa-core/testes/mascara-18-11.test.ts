// conversa-core — termos escondidos no documento entregue (18/11/2026). Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mascararMapa, mascararTexto } from "../mascara";
import { resolverDocumento } from "../documento";
import type { ConfigConversa, Contexto, MascaraConfig } from "../tipos";

const CFG: MascaraConfig = { termos: ["Alfa Desk", "Beta"], por: "a ferramenta atual", contracoes: { o: "a ferramenta atual", do: "da ferramenta atual", "o nosso": "a nossa ferramenta atual" } };
const m = (t: string, termos = CFG.termos as string[]) => mascararTexto(t, termos, CFG);

describe("mascarar termos", () => {
  test("palavra inteira, sem caixa nem acento, espaço flexível, com a contração", () => {
    assert.equal(m("Usamos o Alfa Desk, mas é caro."), "Usamos a ferramenta atual, mas é caro.");
    assert.equal(m("o suporte do ALFADESK some"), "o suporte da ferramenta atual some");
    assert.equal(m("trocar o nosso alfa-desk"), "trocar a nossa ferramenta atual");
    assert.equal(m("usamos Bêta hoje"), "usamos a ferramenta atual hoje");
    assert.equal(m("Beta é lento."), "A ferramenta atual é lento.");
  });
  test("falso positivo: termo dentro de outra palavra fica", () => {
    assert.equal(m("o alfabeto e a betoneira"), "o alfabeto e a betoneira");
    assert.equal(m("betas e alfa"), "betas e alfa");
  });
  test("dois termos seguidos viram um só", () => {
    assert.equal(m("usamos o Beta e o Alfa Desk"), "usamos a ferramenta atual");
  });
  test("sem termo, sem mudança", () => {
    assert.equal(mascararTexto("o Beta", [], CFG), "o Beta");
  });
  test("mapa: nós e ligações", () => {
    const mapa = mascararMapa({ nos: [{ id: "a", tipo: "atual", texto: "Beta hoje", nota: "onde" }], arestas: [], progresso: { cheios: 1, total: 1 }, completo: true }, (t) => m(t));
    assert.equal(mapa.nos[0].texto, "A ferramenta atual hoje");
  });
  test("documento: todo texto das seções; termos podem vir do contexto", () => {
    const config = {
      id: "t", marca: { titulo: "T", rotuloRegiao: "C" }, totalPassos: 1, origens: { padrao: "x" }, abertura: [], etapas: [],
      pontuacao: { maximo: 0, criterios: [], extras: [], classes: [{ id: "x", minimo: 0 }], rotulos: [], rotaPorRotulo: {} },
      jev: { habilitado: false, endpoint: "", timeoutMs: 0 }, textos: { enviando: "", erro: "", tentarDeNovo: "", legal: "", corrigirDica: "", passoAria: "" },
      entrega: {
        titulo: "x", botaoPdf: "x",
        mascarar: { ...CFG, termos: (c: Contexto) => [c.respostas.ferramenta ?? ""] },
        documento: { secoes: [
          { id: "a", tipo: "texto", titulo: "Sobre o Gama", texto: "Hoje: {{f}}" },
          { id: "b", tipo: "itens", itens: (c: Contexto) => [{ titulo: "Dor", nota: `Nas suas palavras: “${c.respostas.texto}”` }] },
        ] },
      },
      variaveis: { f: (c: Contexto) => c.respostas.ferramenta ?? "" },
    } as unknown as ConfigConversa;
    const ctx: Contexto = { origem: "x", variaveis: {}, respostas: { ferramenta: "Gama", texto: "o Gama trava" } };
    const doc = resolverDocumento(config, ctx, (n) => config.variaveis?.[n]?.(ctx), []);
    assert.equal(doc?.secoes[0].titulo, "Sobre a ferramenta atual");
    assert.equal(doc?.secoes[0].texto, "Hoje: a ferramenta atual");
    assert.equal(doc?.secoes[1].itens[0].nota, "Nas suas palavras: “a ferramenta atual trava”");
  });
});
