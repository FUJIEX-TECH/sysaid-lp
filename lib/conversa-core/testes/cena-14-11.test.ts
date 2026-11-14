// conversa-core — 14/11/2026: a cena em três atos (atos embaixo do desenho, cor
// da marca com regra de contraste, pausa por cartão) e as funções puras de cor.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { resolverCartao, resumoCartao, vistaCena } from "../cartoes";
import { corDaMarcaUsavel, corDominante, corHex, luminancia } from "../cor";
import type { CartaoConfig, Contexto } from "../tipos";

const SVG = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><g class="cs-ato cs-ato--marca"><rect class="cs-s cs-d" pathLength="1" width="1" height="1"/></g></svg>';
const ctx = (respostas: Contexto["respostas"]): Contexto => ({ origem: "x", variaveis: {}, respostas });

describe("cena em três atos", () => {
  test("atos: até 3, rótulo e texto aparados, tom conhecido, texto vazio = cartão tracejado", () => {
    const v = vistaCena({
      svg: SVG,
      descricao: "x",
      atos: [
        { rotulo: " Hoje ", texto: " pedido no zap " },
        { rotulo: "Onde quebra", texto: "some", tom: "quebra" },
        { rotulo: "O que isso causa", texto: "", tom: "causa" },
        { rotulo: "quarto", texto: "não entra" },
        // @ts-expect-error tom desconhecido vira contexto
        { rotulo: "x", texto: "y", tom: "roxo" },
      ],
    })!;
    assert.equal(v.atos.length, 3);
    assert.deepEqual(v.atos[0], { rotulo: "Hoje", texto: "pedido no zap", tom: "contexto", vazio: false });
    assert.equal(v.atos[1].tom, "quebra");
    assert.equal(v.atos[2].vazio, true);
    assert.equal(v.animacao, true);
    assert.equal(vistaCena({ svg: SVG, descricao: "x", animacao: "nenhuma" })!.animacao, false);
    assert.deepEqual(vistaCena({ svg: SVG, descricao: "x" })!.atos, []);
  });
  test("cor da marca: passa pela regra de contraste; cinza, branco e lixo caem fora", () => {
    assert.equal(vistaCena({ svg: SVG, descricao: "x", cor: "#6bd9b9" })!.cor, "#6bd9b9");
    assert.equal(vistaCena({ svg: SVG, descricao: "x", cor: "#777777" })!.cor, undefined);
    assert.equal(vistaCena({ svg: SVG, descricao: "x", cor: "#fff" })!.cor, undefined);
    assert.equal(vistaCena({ svg: SVG, descricao: "x", cor: "azul" })!.cor, undefined);
    assert.equal(vistaCena({ svg: SVG, descricao: "x", cor: null })!.cor, undefined);
  });
  test("o cartão leva a pausa própria e o resumo traz os atos", () => {
    const k: CartaoConfig = {
      id: "cena",
      tipo: "cena",
      apos: "p1",
      pausaMs: 2200,
      calcular: () => ({ svg: SVG, descricao: "Fila", atos: [{ rotulo: "Hoje", texto: "pedido no zap" }, { rotulo: "Onde quebra", texto: "some", tom: "quebra" }, { rotulo: "Causa", texto: "", tom: "causa" }] }),
    };
    const pronto = resolverCartao(k, ctx({ p1: "x" }))!;
    assert.equal(pronto.pausaMs, 2200);
    assert.match(resumoCartao(pronto), /Hoje: “pedido no zap”; Onde quebra: “some”/);
    assert.doesNotMatch(resumoCartao(pronto), /Causa/);
  });
});

describe("cor (funções puras)", () => {
  test("corHex normaliza #rgb, #rrggbb e #rrggbbaa; recusa o resto", () => {
    assert.equal(corHex("#ABC"), "#aabbcc");
    assert.equal(corHex(" #162CB6 "), "#162cb6");
    assert.equal(corHex("#162cb6ff"), "#162cb6");
    assert.equal(corHex("rgb(1,2,3)"), null);
    assert.equal(corHex(12), null);
  });
  test("corDaMarcaUsavel: saturada e escura clareia; clara demais, cinza, preto e branco caem fora", () => {
    const azul = corDaMarcaUsavel("#162cb6")!;
    assert.ok(azul.clareada);
    assert.notEqual(azul.hex, "#162cb6");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(azul.hex.slice(i, i + 2), 16));
    assert.ok(luminancia(r, g, b) >= 0.14);
    assert.ok(b > r && b > g, "continua azul");
    assert.deepEqual(corDaMarcaUsavel("#6bd9b9"), { hex: "#6bd9b9", clareada: false });
    assert.deepEqual(corDaMarcaUsavel("#ff8a80"), { hex: "#ff8a80", clareada: false });
    assert.equal(corDaMarcaUsavel("#777777"), null);
    assert.equal(corDaMarcaUsavel("#000000"), null);
    assert.equal(corDaMarcaUsavel("#ffffff"), null);
    assert.equal(corDaMarcaUsavel("#fdf6e3"), null);
    assert.equal(corDaMarcaUsavel("#05070a"), null, "quase preto não clareia o bastante em 3 passos e cai fora");
  });
  test("corDominante: ignora transparente, branco e cinza; pega a caixa mais cheia", () => {
    const px: number[] = [];
    const add = (r: number, g: number, b: number, a: number, n: number) => {
      for (let i = 0; i < n; i++) px.push(r, g, b, a);
    };
    add(255, 255, 255, 255, 400); // fundo branco
    add(22, 44, 182, 255, 60); // azul da marca
    add(120, 120, 120, 255, 100); // cinza
    add(200, 30, 30, 0, 500); // transparente
    const hex = corDominante(px)!;
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    assert.ok(b > 150 && r < 60, hex);
    assert.equal(corDominante([255, 255, 255, 255, 0, 0, 0, 255]), null);
  });
});
