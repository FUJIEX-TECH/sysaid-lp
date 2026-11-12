// Testes dos cartões de demonstração da SysAid (cartoes-sysaid.ts, PROVISÓRIOS).
// Rodar: npm test. Conferem a conta e a leitura de cada resposta, e que os três
// passam pela validação do núcleo (o cartão aparece de verdade).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ANTES_SEM, CARTOES_SYSAID, antesDepoisSysaid, horasPerdidasSysaid, nivelSysaid, situacaoDe } from "./cartoes-sysaid";
import { resolverCartao } from "../conversa-core/cartoes";
import type { Contexto } from "../conversa-core/tipos";

const ctx = (respostas: Contexto["respostas"], variaveis: Contexto["variaveis"] = {}): Contexto => ({ origem: "generica", variaveis, respostas });

describe("situação", () => {
  test("chip, planilha e comparativa com texto livre", () => {
    assert.equal(situacaoDe(ctx({ situacao: "sem" })), "sem");
    assert.equal(situacaoDe(ctx({ situacao: "troca", ferramenta: "planilha" })), "sem");
    assert.equal(situacaoDe(ctx({ situacao_texto: "usamos e o SLA estoura" }, { concorrente: "Movidesk" })), "troca");
    assert.equal(situacaoDe(ctx({ situacao_texto: "texto livre" })), null);
  });
});

describe("medidor de nível", () => {
  test("sem ferramenta começa no 1 e mira o 3", () => {
    const m = nivelSysaid(ctx({ situacao: "sem", dor: "perda" }))!;
    assert.deepEqual([m.atual, m.alvo], [1, 3]);
  });
  test("ferramenta que não segura SLA fica no 2; relatório no 3; IA mira o 5", () => {
    assert.deepEqual([nivelSysaid(ctx({ situacao: "troca", dor: "sla" }))!.atual, nivelSysaid(ctx({ situacao: "troca", dor: "sla" }))!.alvo], [2, 4]);
    assert.deepEqual([nivelSysaid(ctx({ situacao: "troca", dor: "relatorio" }))!.atual, nivelSysaid(ctx({ situacao: "troca", dor: "relatorio" }))!.alvo], [3, 4]);
    assert.equal(nivelSysaid(ctx({ situacao: "troca", dor: "ia" }))!.alvo, 5);
    assert.equal(nivelSysaid(ctx({ situacao: "cliente", dor: "automacao" }))!.atual, 3);
  });
  test("quem só pesquisa, ou sem situação, não ganha o cartão", () => {
    assert.equal(nivelSysaid(ctx({ situacao: "pesquisa", dor: "sla" })), null);
    assert.equal(nivelSysaid(ctx({ dor: "sla" })), null);
  });
});

describe("horas perdidas por mês (premissas provisórias)", () => {
  test("51 a 200 pessoas, sem ferramenta: ~125 chamados × 15 min", () => {
    const n = horasPerdidasSysaid(ctx({ situacao: "sem", usuarios: "200", tecnicos: "3-10" }))!;
    assert.equal(n.valor, 30); // 31,25 h → 30
    assert.deepEqual(n.faixa, [20, 45]);
    assert.equal(n.unidade, "h/mês");
    assert.match(n.conta!, /125 chamados por mês × 15 min/);
    assert.match(n.conta!, /0,2 técnico em tempo integral/);
  });
  test("mais de 1.000 pessoas trocando de ferramenta: ~2.000 × 8 min", () => {
    const n = horasPerdidasSysaid(ctx({ situacao: "troca", usuarios: "mais", tecnicos: "+10" }))!;
    assert.equal(n.valor, 270);
    assert.deepEqual(n.faixa, [190, 370]);
    assert.match(n.conta!, /2\.000 chamados/);
    assert.match(n.conta!, /1,7 técnico/);
  });
  test("porte pequeno não fala em técnico equivalente (menos de 0,1)", () => {
    const n = horasPerdidasSysaid(ctx({ situacao: "troca", usuarios: "50", tecnicos: "1-2" }))!;
    assert.equal(n.valor, 5);
    assert.doesNotMatch(n.conta!, /tempo integral/);
  });
  test("sem porte ou sem técnicos, não tem conta", () => {
    assert.equal(horasPerdidasSysaid(ctx({ situacao: "sem", usuarios: "200" })), null);
    assert.equal(horasPerdidasSysaid(ctx({ situacao: "sem", tecnicos: "1-2" })), null);
  });
});

describe("antes e depois", () => {
  test("sem ferramenta usa o caminho do WhatsApp e da planilha", () => {
    const a = antesDepoisSysaid(ctx({ situacao: "sem", dor: "perda" }))!;
    assert.deepEqual(a.antes.passos, ANTES_SEM);
    assert.equal(a.depois.titulo, "Com a SysAid");
  });
  test("dor de relatório troca os dois lados; dor vaga cai no SLA", () => {
    assert.match(antesDepoisSysaid(ctx({ situacao: "troca", dor: "relatorio" }))!.antes.passos[2].texto, /planilha/);
    assert.match(antesDepoisSysaid(ctx({ situacao: "troca", dor: "vaga" }))!.antes.passos[2].texto, /SLA estoura/);
  });
  test("cliente da SysAid não ganha antes/depois", () => {
    assert.equal(antesDepoisSysaid(ctx({ situacao: "cliente", dor: "ia" })), null);
  });
});

describe("os três passam pela validação do núcleo", () => {
  test("conversa típica: todos aparecem e o texto fecha", () => {
    const c = ctx({ situacao: "troca", dor: "sla", aprof: "a", usuarios: "1000", tecnicos: "3-10", prazo: "tri" });
    const prontos = CARTOES_SYSAID.map((k) => resolverCartao(k, c));
    assert.deepEqual(prontos.map((p) => p?.tipo), ["medidor", "numero", "antesDepois"]);
    const horas = prontos[1]!;
    assert.equal(horas.tipo === "numero" && horas.vista.texto, "80"); // 600 × 8 / 60
    assert.equal(horas.fala, "Fiz uma conta rápida com o que você me contou:"); // {{saudacao}} vazio sem nome
  });
  test("suporte não vê cartão nenhum", () => {
    const c = ctx({ situacao: "cliente", cliente_tipo: "suporte", usuarios: "200", tecnicos: "1-2" });
    assert.deepEqual(CARTOES_SYSAID.map((k) => resolverCartao(k, c)), [null, null, null]);
  });
});
