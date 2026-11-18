// Qualifica v2 · objeção de custo da SysAid (18/11/2026). Rodar: npm test.
// Os dois casos (reclamação e pedido de preço), os falsos positivos, o custo como dor
// registrada, o "como resolvemos" sem número e a trava da fala do Haiku.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Contexto, Gerado } from "../conversa-core/tipos";
import { detectarCusto, FALA_PEDE_REUNIAO, FALA_RECLAMA } from "./custo-sysaid";
import { DORES, derivados, dores, dorPrincipal, notasGenerica, objecaoCusto, revelacao } from "./generica-sysaid";
import { itensComoResolve, itensDiretoria, itensOQuePesa, PERGUNTAS_DIRETORIA } from "./cartoes-generica-sysaid";
import { travaObjecao } from "./servidor-sysaid";

const g = (id: string, para: Record<string, string>, dados: Record<string, string>, textos: Record<string, string> = {}): Gerado => ({ id, para, textos, dados, origem: "servidor" });
const ctx = (respostas: Contexto["respostas"], gerados: Record<string, Gerado> = {}): Contexto => ({ origem: "generica", variaveis: {}, respostas, gerados });
const CHIP = (d: keyof typeof DORES) => DORES[d].chip!;
const SEM_PRECO = /\d|r\$|reais|%|\bplanos?\b|desconto|incluso|pre[çc]o|até\s/i;

describe("detector de custo", () => {
  test("reclamação da ferramenta de hoje", () => {
    for (const t of [
      "o GLPI até funciona mas a licença tá muito cara",
      "pagamos uma fortuna no Movidesk",
      "a mensalidade só sobe todo ano",
      "orçamento apertado esse ano, precisamos cortar custos",
      "a ferramenta é cara demais pro que entrega",
      "o valor da renovação subiu muito",
      "cobram por fora cada módulo",
      "a conta só sobe e o time não usa metade",
      "hoje pagamos R$ 4 mil por mês",
    ])
      assert.equal(detectarCusto(t), "reclama", t);
  });
  test("pedido de preço", () => {
    for (const t of ["quanto custa?", "Qual o valor da SysAid?", "me passa os preços", "quero um orçamento", "preço?", "e o investimento?", "quanto sai pra 10 técnicos"])
      assert.equal(detectarCusto(t), "pede", t);
  });
  test("falso positivo: valor como importância, custo em tempo, licença vencida, cobrar o time", () => {
    for (const t of [
      "quero valorizar o trabalho do time",
      "a diretoria não vê o valor que a TI entrega",
      "isso custa muito tempo do time",
      "as licenças vencem sem ninguém ver",
      "o usuário cobra muito o time no corredor",
      "só um cara sabe mexer na ferramenta",
      "o time não dá conta e a fila sobe",
      "o chamado vence e o diretor vem cobrar",
      "a gente quer agregar valor ao negócio",
    ])
      assert.equal(detectarCusto(t), null, t);
  });
});

describe("objeção de custo na busca genérica", () => {
  const reclama = { situacao_texto: CHIP("perda"), implicacao: "sim", consequencias: "reclama|e a licença do sistema de hoje tá muito cara" };
  test("reclamação: vira dor registrada (por último), nas palavras dele, e aparece no como resolvemos sem número", () => {
    const c = ctx(reclama);
    assert.deepEqual(objecaoCusto(c), { reclama: "e a licença do sistema de hoje tá muito cara", pede: null, etapas: ["consequencias"] });
    assert.deepEqual(dores(c), ["perda", "custo"]);
    assert.equal(dorPrincipal(c), "perda");
    const pesa = itensOQuePesa(c).find((i) => i.titulo === "Custo que pesa no orçamento");
    assert.ok(pesa?.nota?.includes("“e a licença do sistema de hoje tá muito cara”"));
    const resolve = itensComoResolve(c);
    const inv = resolve[resolve.length - 1];
    assert.equal(inv.titulo, "Um investimento mais acessível");
    assert.match(inv.texto ?? "", /mais acessível/);
    assert.match(inv.texto ?? "", /reunião com o Marcelo Rosin/);
    assert.equal(inv.nota, "por causa de: custo que pesa no orçamento");
    for (const i of [...resolve, ...itensDiretoria(c, "Acme"), ...itensOQuePesa(c), ...PERGUNTAS_DIRETORIA]) assert.doesNotMatch(`${i.titulo} ${i.texto ?? ""}`, SEM_PRECO, i.titulo);
    assert.match(revelacao(c, "Acme"), /mais acessível/);
    const d = derivados(c);
    assert.deepEqual(d.sinais, ["objeção de custo"]);
    assert.match(notasGenerica(c), /Objeção de custo \(reclamou\)/);
  });
  test("custo como dor principal: a linha do investimento abre a lista", () => {
    const t = "a licença do sistema tá cara demais";
    const c = ctx({ situacao_texto: t }, { implicacao: g("implicacao", { situacao_texto: t }, { dor: "custo" }) });
    assert.equal(dorPrincipal(c), "custo");
    assert.equal(itensComoResolve(c)[0].titulo, "Um investimento mais acessível");
  });
  test("pedido de preço: não vira dor, mas a resposta entra no como resolvemos", () => {
    const c = ctx({ situacao_texto: CHIP("sla"), implicacao: "e quanto custa a SysAid?" });
    assert.deepEqual(objecaoCusto(c), { reclama: null, pede: "e quanto custa a SysAid?", etapas: ["implicacao"] });
    assert.deepEqual(dores(c), ["sla"]);
    const inv = itensComoResolve(c).at(-1);
    assert.equal(inv?.nota, "você perguntou do investimento");
    assert.deepEqual(derivados(c).sinais, ["objeção de custo"]);
  });
  test("chip e falso positivo não registram nada", () => {
    assert.equal(derivados(ctx({ situacao_texto: CHIP("complexidade"), implicacao: "sim" })).objecao_custo, null);
    const c = ctx({ situacao_texto: CHIP("perda"), implicacao: "quero valorizar o time e mostrar o que entregamos" });
    assert.equal(derivados(c).objecao_custo, null);
    assert.deepEqual(derivados(c).sinais, []);
  });
});

describe("falas da objeção", () => {
  test("as fixas passam na mesma trava do Haiku", () => {
    assert.ok(travaObjecao(FALA_RECLAMA, "reclama"));
    assert.ok(travaObjecao(FALA_PEDE_REUNIAO, "pede"));
  });
  test("trava: sem número, preço, plano, desconto, concorrente ou pergunta; com as palavras certas", () => {
    assert.ok(travaObjecao("Licença cara pesa no orçamento da TI. A SysAid costuma ser mais acessível e atender melhor o que vocês precisam.", "reclama"));
    assert.equal(travaObjecao("A SysAid costuma ser mais acessível, a partir de R$ 50 por técnico.", "reclama"), false);
    assert.equal(travaObjecao("A SysAid costuma ser mais acessível que o Movidesk.", "reclama"), false);
    assert.equal(travaObjecao("A SysAid costuma ser mais acessível no plano Completo.", "reclama"), false);
    assert.equal(travaObjecao("A SysAid economiza até 30% no custo.", "reclama"), false);
    assert.equal(travaObjecao("Custo pesa. A SysAid atende melhor.", "reclama"), false); // sem "mais acessível"
    assert.equal(travaObjecao("O investimento depende do time. Quer a proposta?", "pede"), false);
    assert.equal(travaObjecao("O preço depende do time.", "pede"), false);
  });
});
