// conversa-core — reações (18/11/2026): um assunto trazido em qualquer passo ganha
// uma fala logo depois da resposta, uma vez por tipo; chip não conta; o servidor
// confirma (ou cancela) e escreve; a transcrição registra. Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { criarMotor } from "../motor";
import { chaveReacao, decidirReacao, textoLivre } from "../reacoes";
import type { ConfigConversa, Contexto, Gerado, ReacaoConfig } from "../tipos";

const ctx = (respostas: Contexto["respostas"], gerados: Record<string, Gerado> = {}): Contexto => ({ origem: "x", variaveis: {}, respostas, gerados });
const gerado = (id: string, para: Record<string, string>, dados: Record<string, string>, textos: Record<string, string> = {}): Gerado => ({ id, para, textos, dados, origem: "servidor" });

const REACAO: ReacaoConfig = {
  id: "assunto",
  detectar: (t) => (/\bazul\b/i.test(t) ? "cor" : /\bquanto\b/i.test(t) ? "pergunta" : null),
  falas: {
    cor: { rotulo: "Sobre a cor", texto: "Anotado: {{trecho}}." },
    pergunta: { texto: "Isso sai no fim." },
  },
  geracao: { endpoint: "/x", chave: "fala", esperaMs: 100, timeoutMs: 100 },
};

const CONFIG: ConfigConversa = {
  id: "teste",
  marca: { titulo: "T", rotuloRegiao: "Conversa" },
  totalPassos: 3,
  origens: { padrao: "x" },
  abertura: ["Oi."],
  etapas: [
    { id: "p1", passo: 1, tipo: "texto", texto: "Qual o problema?", atalhos: [{ valor: "o azul de sempre", rotulo: "O azul de sempre" }] },
    { id: "p2", passo: 2, tipo: "multipla", texto: "O que pesa?", opcoes: [{ valor: "a", rotulo: "Alfa" }], multipla: { confirmar: "Continuar" } },
    { id: "p3", passo: 3, tipo: "texto", texto: "Mais alguma coisa?" },
    { id: "p4", passo: 3, tipo: "escolha", texto: "Escolhe", opcoes: [{ valor: "azul", rotulo: "azul" }] },
  ],
  reacoes: [REACAO],
  pontuacao: { maximo: 0, criterios: [], extras: [], classes: [{ id: "x", minimo: 0 }], rotulos: [], rotaPorRotulo: {} },
  jev: { habilitado: false, endpoint: "", timeoutMs: 0 },
  textos: { enviando: "", erro: "", tentarDeNovo: "", legal: "", corrigirDica: "", passoAria: "" },
};
const motor = criarMotor(CONFIG);

describe("reações", () => {
  test("texto livre: o de texto que não é chip e a parte livre da múltipla", () => {
    const [p1, p2, , p4] = CONFIG.etapas;
    const of = (e: (typeof CONFIG.etapas)[number]) => motor.resolver(e, ctx({}));
    assert.equal(textoLivre(p1, "o azul de sempre", of(p1)), "");
    assert.equal(textoLivre(p1, "é tudo azul aqui", of(p1)), "é tudo azul aqui");
    assert.equal(textoLivre(p2, "a|tudo azul", of(p2)), "tudo azul");
    assert.equal(textoLivre(p2, "a", of(p2)), "");
    assert.equal(textoLivre(p4, "azul", of(p4)), "");
  });
  test("a fala entra depois da etapa em que apareceu, uma vez por tipo, com o trecho", () => {
    const c = ctx({ p1: "é tudo azul aqui", p2: "a|azul de novo", p3: "e quanto fica?" });
    const r = motor.reacoes(c);
    assert.deepEqual(
      r.map((x) => [x.etapa, x.tipo, x.rotulo, x.texto, x.origem]),
      [
        ["p1", "cor", "Sobre a cor", "Anotado: é tudo azul aqui.", "local"],
        ["p3", "pergunta", undefined, "Isso sai no fim.", "local"],
      ]
    );
  });
  test("chip e opção não provocam reação", () => {
    assert.deepEqual(motor.reacoes(ctx({ p1: "o azul de sempre", p2: "a", p3: "nada", p4: "azul" })), []);
  });
  test("o servidor decide enquanto vale: cancela o falso positivo, troca o tipo, escreve a fala", () => {
    const k = chaveReacao("assunto", "p1");
    const cancela = { [k]: gerado(k, { p1: "é tudo azul aqui" }, { tipo: "nenhuma" }) };
    assert.deepEqual(motor.reacoes(ctx({ p1: "é tudo azul aqui" }, cancela)), []);
    const escreve = { [k]: gerado(k, { p1: "é tudo azul aqui" }, { tipo: "cor" }, { fala: "Azul pesa, anotei." }) };
    const r = motor.reacoes(ctx({ p1: "é tudo azul aqui" }, escreve));
    assert.equal(r[0].texto, "Azul pesa, anotei.");
    assert.equal(r[0].origem, "servidor");
    // resposta do servidor de outro texto (a pessoa corrigiu): volta o detector local
    const velho = { [k]: gerado(k, { p1: "texto antigo" }, { tipo: "nenhuma" }) };
    assert.equal(motor.reacoes(ctx({ p1: "é tudo azul aqui" }, velho))[0].texto, "Anotado: é tudo azul aqui.");
    // servidor confirmou sem texto (Haiku fora): fala fixa
    const semTexto = { [k]: gerado(k, { p1: "é tudo azul aqui" }, { tipo: "cor" }) };
    assert.equal(motor.reacoes(ctx({ p1: "é tudo azul aqui" }, semTexto))[0].texto, "Anotado: é tudo azul aqui.");
  });
  test("detector com erro não reage", () => {
    const r: ReacaoConfig = { ...REACAO, detectar: () => { throw new Error("x"); } };
    assert.equal(decidirReacao(r, ctx({ p1: "azul" }), CONFIG.etapas[0], "azul"), null);
  });
  test("a transcrição registra a reação logo depois da resposta", () => {
    const t = motor.transcricao(ctx({ p1: "é tudo azul aqui" }));
    const i = t.findIndex((x) => x.tipo === "resposta" && x.etapa === "p1");
    assert.equal(t[i + 1].texto, "[Sobre a cor] Anotado: é tudo azul aqui.");
    assert.deepEqual(t[i + 1].reacao, { id: "assunto", tipo: "cor" });
  });
});
