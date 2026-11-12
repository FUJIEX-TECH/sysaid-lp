// conversa-core — testes das funções puras dos cartões visuais, do mapa liberado
// e do telefone do Brasil (12/11/2026). Rodar: npm test (sem navegador, sem
// dependência: node:test + type stripping do Node).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  arredondar,
  formatarNumero,
  resolverCartao,
  resolverCartoes,
  tetoRedondo,
  vistaAntesDepois,
  vistaBarras,
  vistaLinhaTempo,
  vistaMedidor,
  vistaNumero,
} from "../cartoes";
import { dataHoje, entregaLiberada, etapaDaEntrega } from "../entrega";
import { criarMotor } from "../motor";
import { aplicarMascara, telefoneBRValido, validarValor } from "../util";
import type { CartaoConfig, ConfigConversa, Contexto, Gerado } from "../tipos";

const ctx = (respostas: Contexto["respostas"], extra: Partial<Contexto> = {}): Contexto => ({ origem: "x", variaveis: {}, respostas, ...extra });

const BASE: ConfigConversa = {
  id: "teste",
  marca: { titulo: "T", rotuloRegiao: "Conversa" },
  totalPassos: 3,
  origens: { padrao: "x" },
  abertura: [],
  etapas: [
    { id: "a", passo: 1, tipo: "escolha", texto: "A?", opcoes: [{ valor: "1", rotulo: "um" }] },
    { id: "b", passo: 2, tipo: "texto", texto: "B?" },
    { id: "tel", passo: 3, tipo: "texto", input: "tel", texto: "Telefone?", pular: { rotulo: "Agora não", valor: "pulou" } },
  ],
  pontuacao: { maximo: 0, criterios: [], extras: [], classes: [{ id: "x", minimo: 0 }], rotulos: [], rotaPorRotulo: {} },
  jev: { habilitado: false, endpoint: "", timeoutMs: 0 },
  textos: { enviando: "", erro: "", tentarDeNovo: "", legal: "", corrigirDica: "", passoAria: "" },
};

describe("números", () => {
  test("formatarNumero: milhar, casas, moeda, prefixo e sufixo (pt-BR)", () => {
    assert.equal(formatarNumero(1234.4), "1.234");
    assert.equal(formatarNumero(1234.5, { casas: 1 }), "1.234,5");
    assert.match(formatarNumero(12400, { estilo: "moeda" }), /^R\$\s12\.400$/);
    assert.equal(formatarNumero(96, { prefixo: "≈ ", sufixo: " h" }), "≈ 96 h");
    assert.equal(formatarNumero(Number.NaN), "");
  });
  test("arredondar não finge precisão", () => {
    assert.equal(arredondar(8.75), 9);
    assert.equal(arredondar(16.6), 17);
    assert.equal(arredondar(31.25), 30);
    assert.equal(arredondar(96.4), 95);
    assert.equal(arredondar(266.7), 270);
    assert.equal(arredondar(1234), 1250);
  });
  test("tetoRedondo dá a escala da régua", () => {
    assert.equal(tetoRedondo(0), 1);
    assert.equal(tetoRedondo(7), 10);
    assert.equal(tetoRedondo(23), 25);
    assert.equal(tetoRedondo(161), 200);
    assert.equal(tetoRedondo(2.3), 2.5);
  });
});

describe("vistas (validação do que a config devolve)", () => {
  test("número: faixa fora de ordem, régua e marca", () => {
    const v = vistaNumero({ valor: 96, faixa: [140, 64], unidade: " h/mês " })!;
    assert.equal(v.texto, "96");
    assert.equal(v.unidade, "h/mês");
    assert.equal(v.escala, 200); // 140 × 1,15 = 161 → 200
    assert.equal(v.marca, 48);
    assert.deepEqual([v.faixa!.min, v.faixa!.max, v.faixa!.inicio, v.faixa!.fim], [64, 140, 32, 70]);
    assert.equal(vistaNumero({ valor: Number.POSITIVE_INFINITY }), null);
  });
  test("número: valor fora da faixa alarga a faixa", () => {
    const v = vistaNumero({ valor: 300, faixa: [64, 140] })!;
    assert.equal(v.faixa!.max, 300);
  });
  test("barras: filtra item ruim, escala pelo maior e calcula a diferença", () => {
    const v = vistaBarras({ itens: [{ rotulo: "Hoje", valor: 96 }, { rotulo: "", valor: 3 }, { rotulo: "Depois", valor: 40, destaque: true }, { rotulo: "x", valor: -1 }], diferenca: true })!;
    assert.equal(v.itens.length, 2);
    assert.equal(v.itens[0].pct, 100);
    assert.equal(v.itens[1].pct, 41.7);
    assert.equal(v.itens[1].destaque, true);
    assert.equal(v.diferenca!.texto, "−58%");
    assert.equal(vistaBarras({ itens: [{ rotulo: "a", valor: 0 }, { rotulo: "b", valor: 5 }], diferenca: true })!.diferenca, undefined);
    assert.equal(vistaBarras({ itens: [] }), null);
  });
  test("barras: máximo da config vale quando é maior", () => {
    assert.equal(vistaBarras({ itens: [{ rotulo: "a", valor: 50 }], maximo: 200 })!.itens[0].pct, 25);
  });
  test("medidor: prende atual e alvo na escada, alturas de 28% a 100%", () => {
    const niveis = ["1", "2", "3", "4", "5"].map((rotulo) => ({ rotulo }));
    const v = vistaMedidor({ niveis, atual: 9, alvo: 2 })!;
    assert.equal(v.atual, 5);
    assert.equal(v.alvo, undefined);
    const w = vistaMedidor({ niveis, atual: 0, alvo: 4 })!;
    assert.equal(w.atual, 1);
    assert.equal(w.alvo, 4);
    assert.deepEqual(w.niveis.map((n) => n.altura), [28, 46, 64, 82, 100]);
    assert.equal(vistaMedidor({ niveis: [{ rotulo: "só um" }], atual: 1 }), null);
  });
  test("linha do tempo: pelo menos 2 etapas; destaque só dentro da lista", () => {
    assert.equal(vistaLinhaTempo({ etapas: [{ quando: "1", titulo: "a" }] }), null);
    const v = vistaLinhaTempo({ etapas: [{ quando: "S1", titulo: "a" }, { quando: "S2", titulo: "b" }], atual: 7 })!;
    assert.equal(v.etapas.length, 2);
    assert.equal(v.atual, undefined);
  });
  test("antes/depois: os dois lados precisam de passo", () => {
    assert.equal(vistaAntesDepois({ antes: { titulo: "Hoje", passos: [] }, depois: { titulo: "Depois", passos: [{ texto: "x" }] } }), null);
    const v = vistaAntesDepois({ antes: { titulo: " Hoje ", passos: [{ texto: " a ", marca: true }, { texto: "" }] }, depois: { titulo: "Depois", passos: [{ texto: "b" }] } })!;
    assert.deepEqual(v.antes, { titulo: "Hoje", passos: [{ texto: "a", marca: true }] });
  });
});

describe("resolver cartões", () => {
  const numero = (id: string, apos: string, extra: Partial<CartaoConfig> = {}): CartaoConfig =>
    ({ id, tipo: "numero", apos, titulo: "{{valor}} {{unidade}} (de {{min}} a {{max}})", calcular: () => ({ valor: 96, faixa: [64, 140], unidade: "h/mês" }), ...extra }) as CartaoConfig;

  test("só entra depois da etapa respondida, na ordem da conversa", () => {
    const config: ConfigConversa = { ...BASE, cartoes: [numero("depois-de-b", "b"), numero("depois-de-a", "a")] };
    const r = ctx({ a: "1", b: "x" });
    assert.deepEqual(resolverCartoes(config, r, ["a"]).map((c) => c.id), ["depois-de-a"]);
    assert.deepEqual(resolverCartoes(config, r, ["a", "b"]).map((c) => c.id), ["depois-de-a", "depois-de-b"]);
  });
  test("textos usam os valores calculados", () => {
    const c = resolverCartao(numero("n", "a"), ctx({ a: "1" }))!;
    assert.equal(c.titulo, "96 h/mês (de 64 a 140)");
    assert.equal(c.naEntrega, true);
  });
  test("condição falsa, cálculo nulo ou com erro: o cartão some, sem quebrar", () => {
    const config: ConfigConversa = {
      ...BASE,
      cartoes: [
        numero("cond", "a", { quando: { campo: "a", igual: "2" } }),
        numero("nulo", "a", { calcular: () => null } as Partial<CartaoConfig>),
        numero("erro", "a", { calcular: () => { throw new Error("bug na config"); } } as Partial<CartaoConfig>),
        numero("ok", "a"),
      ],
    };
    assert.deepEqual(resolverCartoes(config, ctx({ a: "1" }), ["a"]).map((c) => c.id), ["ok"]);
  });
  test("texto do servidor (gerado) vale só enquanto a geração vale", () => {
    const g: Gerado = { id: "g", para: { a: "1" }, textos: { t: "Escrito pelo servidor" }, origem: "servidor" };
    const cfg = numero("n", "a", { gerado: { id: "g", titulo: "t" } });
    assert.equal(resolverCartao(cfg, ctx({ a: "1" }, { gerados: { g } }))!.titulo, "Escrito pelo servidor");
    assert.equal(resolverCartao(cfg, ctx({ a: "2" }, { gerados: { g } }))!.titulo, "96 h/mês (de 64 a 140)");
  });
  test("motor: cartões das etapas respondidas e {{gerado.<id>.<chave>}}", () => {
    const config: ConfigConversa = { ...BASE, cartoes: [numero("n", "a", { fala: "Olha: {{gerado.g.t}}" })] };
    const m = criarMotor(config);
    const g: Gerado = { id: "g", para: { a: "1" }, textos: { t: "isto" }, origem: "servidor" };
    const c = m.contexto("/", { a: "1" }, undefined, { g });
    assert.equal(m.cartoes(c)[0].fala, "Olha: isto");
    assert.equal(m.cartoes(c, "a").length, 1);
    assert.equal(m.cartoes(c, "b").length, 0);
    assert.equal(m.cartoes(m.contexto("/", {})).length, 0);
  });
});

describe("mapa liberado (entrega)", () => {
  const comEntrega: ConfigConversa = { ...BASE, entrega: { titulo: "Mapa", botaoPdf: "PDF" } };
  test("padrão: a última etapa de telefone destrava", () => {
    assert.equal(etapaDaEntrega(comEntrega), "tel");
    assert.equal(etapaDaEntrega(BASE), null);
    assert.equal(etapaDaEntrega({ ...comEntrega, entrega: { ...comEntrega.entrega!, apos: "b" } }), "b");
  });
  test("contato pulado ou vazio não destrava; respondido destrava", () => {
    assert.equal(entregaLiberada(comEntrega, ctx({ a: "1" })), false);
    assert.equal(entregaLiberada(comEntrega, ctx({ tel: "pulou" })), false);
    assert.equal(entregaLiberada(comEntrega, ctx({ tel: "  " })), false);
    assert.equal(entregaLiberada(comEntrega, ctx({ tel: "(11) 98765-4321" })), true);
    assert.equal(entregaLiberada(BASE, ctx({ tel: "(11) 98765-4321" })), false);
  });
  test("etapa que já não vale (fora das respondidas) e condição extra", () => {
    assert.equal(entregaLiberada(comEntrega, ctx({ tel: "(11) 98765-4321" }), { respondidas: ["a"] }), false);
    const cond: ConfigConversa = { ...comEntrega, entrega: { ...comEntrega.entrega!, quando: { campo: "a", igual: "1" } } };
    assert.equal(entregaLiberada(cond, ctx({ tel: "(11) 98765-4321" })), false);
    assert.equal(entregaLiberada(cond, ctx({ a: "1", tel: "(11) 98765-4321" })), true);
  });
  test("sem telefone e sem `apos`: libera no fim da conversa", () => {
    const semTel: ConfigConversa = { ...comEntrega, etapas: BASE.etapas.slice(0, 2) };
    assert.equal(entregaLiberada(semTel, ctx({ a: "1", b: "x" })), false);
    assert.equal(entregaLiberada(semTel, ctx({ a: "1", b: "x" }), { completa: true }), true);
  });
  test("data de hoje no idioma da config", () => {
    assert.equal(dataHoje("pt-BR", new Date(2026, 10, 12)), "12/11/2026");
  });
});

describe("telefone do Brasil", () => {
  test("celular e fixo válidos, com e sem +55 e 0", () => {
    for (const v of ["(11) 98765-4321", "11987654321", "+55 11 98765-4321", "5511987654321", "011 98765-4321", "(21) 3456-7890", "(55) 99123-4567"]) {
      assert.equal(telefoneBRValido(v), true, v);
    }
  });
  test("recusa DDD que não existe, dígito errado, tamanho errado e número repetido", () => {
    for (const v of ["(10) 98765-4321", "(20) 3456-7890", "(11) 88765-4321", "(11) 8765-4321", "(11) 9876-543", "(11) 99999-9999", "(11) 91111-1111", "(11) 3333-3333", "abc", ""]) {
      assert.equal(telefoneBRValido(v), false, v);
    }
  });
  test("só celular, quando a regra pede", () => {
    assert.equal(telefoneBRValido("(21) 3456-7890", { celular: true }), false);
    assert.equal(telefoneBRValido("(21) 99876-5432", { celular: true }), true);
  });
  test("máscara tira o +55 e o 0", () => {
    assert.equal(aplicarMascara("telefone_br", "+55 11 98765-4321"), "(11) 98765-4321");
    assert.equal(aplicarMascara("telefone_br", "11987654321"), "(11) 98765-4321");
    assert.equal(aplicarMascara("telefone_br", "1134567890"), "(11) 3456-7890");
    assert.equal(aplicarMascara("telefone_br", "011 3456 7890"), "(11) 3456-7890");
  });
  test("regra de validação telefoneBR devolve a mensagem da config", () => {
    const regras = [{ regra: "telefoneBR" as const, mensagem: "Confere o número?" }];
    assert.equal(validarValor(regras, "(10) 98765-4321", ctx({})), "Confere o número?");
    assert.equal(validarValor(regras, "(11) 98765-4321", ctx({})), null);
  });
});
