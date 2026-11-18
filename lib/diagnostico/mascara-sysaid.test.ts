// Qualifica v2 · concorrente escondido no PDF (decisão do Fernando, 18/11/2026). Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mascararTexto } from "../conversa-core/mascara";
import type { Contexto, Gerado } from "../conversa-core/tipos";
import { CONCORRENTES_PDF, DORES, MASCARA_PDF, termosConcorrente, termosPdf } from "./generica-sysaid";
import { itensOQuePesa, itensCausa, itensDiretoria } from "./cartoes-generica-sysaid";

const ctx = (respostas: Contexto["respostas"], gerados: Record<string, Gerado> = {}): Contexto => ({ origem: "generica", variaveis: {}, respostas, gerados });
const m = (t: string, c: Contexto = ctx({})) => mascararTexto(t, termosPdf(c), MASCARA_PDF);

describe("concorrente escondido no PDF", () => {
  test("a frase do lead: antes e depois", () => {
    assert.equal(m("Usamos o Movidesk, mas a licença tá muito cara pro que entrega e os pedidos ainda se perdem no e-mail."), "Usamos a ferramenta atual, mas a licença tá muito cara pro que entrega e os pedidos ainda se perdem no e-mail.");
  });
  test("lista fechada, sem diferenciar caixa e acento, palavra inteira", () => {
    assert.equal(m("o GLPI e o jira travam"), "a ferramenta atual travam");
    assert.equal(m("saímos do TOP DESK"), "saímos da ferramenta atual");
    assert.equal(m("pagamos caro no ServiceNow"), "pagamos caro na ferramenta atual");
    assert.equal(m("a licença do Jira Service Management subiu"), "a licença da ferramenta atual subiu");
    assert.equal(m("ManageEngine ServiceDesk Plus é pesado"), "A ferramenta atual é pesado");
    assert.equal(m("usamos ZENDESK e freshdesk"), "usamos a ferramenta atual");
    assert.equal(m("o mílvus não dá conta"), "a ferramenta atual não dá conta");
  });
  test("o nome que o lead deu no campo (Outra) e o que o Jev leu", () => {
    const c = ctx({ ferramenta: "outra", ferramenta_outra: "HelpCenter X" });
    assert.equal(m("o HelpCenter X é lento", c), "a ferramenta atual é lento");
    const t = "o deskzinho da empresa é ruim";
    const j = ctx({ situacao_texto: t }, { implicacao: { id: "implicacao", para: { situacao_texto: t }, textos: {}, dados: { ferramenta_nome: "Deskzinho" }, origem: "servidor" } });
    assert.equal(m(t, j), "a ferramenta atual da empresa é ruim");
  });
  test("SysAid nunca; nome genérico do campo não vira termo", () => {
    assert.ok(!CONCORRENTES_PDF.some((x) => /sysaid/i.test(x)));
    assert.equal(m("já usamos a SysAid"), "já usamos a SysAid");
    assert.deepEqual(termosConcorrente(["SysAid", "Outra", "planilha", "outra ferramenta", "e-mail"]), CONCORRENTES_PDF);
  });
  test("falso positivo: palavras comuns ficam", () => {
    for (const t of ["a jirafa", "o chamado ficou pendente na fila", "ivantes", "GLPIs antigos", "a gente usa planilha"]) assert.equal(m(t), t, t);
  });
  test("itens do PDF que trazem o texto do lead (o que pesa, o que causa, diretoria)", () => {
    const c = ctx({ situacao_texto: DORES.perda.chip, implicacao: "sim", consequencias: "reclama|e o Movidesk cobra por fora", payoff: "incendio|sair do Jira" });
    const tudo = [...itensOQuePesa(c), ...itensCausa(c), ...itensDiretoria(c, "Acme")].map((i) => [i.titulo, i.texto ?? "", i.nota ?? ""].map((x) => m(x, c)).join(" ")).join(" ");
    assert.doesNotMatch(tudo, /movidesk|jira/i);
    assert.match(tudo, /ferramenta atual/);
  });
});
