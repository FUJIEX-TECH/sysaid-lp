// 25/11/2026 — rótulo do mapa no PDF com concorrente escondido e nome curto do Jira. Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mascaraDoMapa, mascararMapa } from "../conversa-core/mascara";
import type { ConfigConversa, Contexto } from "../conversa-core/tipos";
import { MASCARA_PDF } from "./generica-sysaid";
import { nomeCurtoConcorrente } from "./origens-sysaid";

const config = { entrega: { titulo: "x", mascarar: MASCARA_PDF } } as unknown as ConfigConversa;
const ctx: Contexto = { origem: "comparativa", variaveis: { concorrente: "Movidesk" }, respostas: {} };
const x = mascaraDoMapa(config, ctx);

describe("mapa do PDF com o concorrente escondido", () => {
  test("empresa · concorrente hoje → empresa · ferramenta atual", () => {
    assert.equal(x("Fujiex · Movidesk hoje"), "Fujiex · ferramenta atual");
  });
  test("só o concorrente → Ferramenta atual", () => {
    assert.equal(x("Movidesk hoje"), "Ferramenta atual");
  });
  test("texto sem concorrente não muda (nem o 'hoje')", () => {
    assert.equal(x("E-mail, planilha e WhatsApp hoje"), "E-mail, planilha e WhatsApp hoje");
  });
  test("nota e frase seguem com a contração", () => {
    const mapa = mascararMapa({ nos: [{ id: "a", tipo: "atual", texto: "Fujiex · Movidesk hoje", nota: "o suporte do Movidesk some" }], arestas: [], progresso: { cheios: 1, total: 1 }, completo: true }, x);
    assert.equal(mapa.nos[0].texto, "Fujiex · ferramenta atual");
    assert.equal(mapa.nos[0].nota, "o suporte da ferramenta atual some");
  });
});

describe("nome curto do concorrente", () => {
  test("Jira curto, os outros iguais", () => {
    assert.equal(nomeCurtoConcorrente("Jira Service Management"), "Jira");
    assert.equal(nomeCurtoConcorrente("Movidesk"), "Movidesk");
    assert.equal(nomeCurtoConcorrente(undefined), "");
  });
});
