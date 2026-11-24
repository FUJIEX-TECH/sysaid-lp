// Qualifica v2 · regra do Fernando (18/11/2026): "não quero que fale de agenda, reunião no fim,
// nem de reunião alguma antes de chegar no fim". Nenhuma fala antes do passo de fechamento (as 2
// datas / "Quero orçamento" / "Converse comigo por WhatsApp") menciona reunião, agenda, horário,
// comercial ou especialista. Do fechamento em diante (e no documento entregue no fim) pode.
// Rodar: npm test. Linha que só aparece depois do fechamento leva o marcador "pos-fechamento".
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Contexto } from "../conversa-core/tipos";
import { CONSEQUENCIAS, DORES, perguntaPayoff, revelacao } from "./generica-sysaid";
import { FALA_PEDE, FALA_RECLAMA, REACAO_CUSTO_ANTERIOR, REACAO_CUSTO_GENERICA } from "./custo-sysaid";
import { CARTOES_GENERICA } from "./cartoes-generica-sysaid";
import { ABERTURA_ORIGENS, CHIPS_BRAND, CHIPS_COMPARATIVA, FRASE_CABECALHO_ORIGENS, OPCOES_MODULOS, PERGUNTA1_ORIGENS, PLACEHOLDER1_ORIGENS } from "./origens-sysaid";
import { SYSTEM_IMPLICACAO, SYSTEM_PALPITE, travaObjecao } from "./servidor-sysaid";

const PROIBIDO = /reuni[aã]o|reuni[oõ]es|\bagenda|hor[aá]rios?\b|comercial|especialista|no fim desta conversa|escolhe o hor/i;
const ler = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), "utf8");

// textos (com espaço) entre aspas ou crases do trecho, sem comentário e sem linha marcada
function literais(trecho: string): string[] {
  const linhas = trecho
    .split("\n")
    .filter((l) => !/pos-fechamento/.test(l))
    .map((l) => l.replace(/^\s*\/\/.*$/, "").replace(/\s\/\/\s.*$/, ""))
    .join("\n");
  return (linhas.match(/"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g) ?? []).map((s) => s.slice(1, -1)).filter((s) => /\s/.test(s));
}
function entre(texto: string, de: string, ate: string): string {
  const i = texto.indexOf(de);
  const j = texto.indexOf(ate, i + de.length);
  assert.ok(i >= 0 && j > i, `trecho ${de} … ${ate} não achado`);
  return texto.slice(i, j);
}
const semReuniao = (lista: string[], onde: string) => {
  assert.ok(lista.filter(Boolean).length >= 2, `${onde}: nada lido (o recorte quebrou?)`);
  const ruins = lista.filter((t) => PROIBIDO.test(t));
  assert.deepEqual(ruins, [], `${onde}: fala antes do fechamento cita reunião/agenda/horário/comercial/especialista`);
};
const ctx = (respostas: Contexto["respostas"]): Contexto => ({ origem: "generica", variaveis: {}, respostas });

describe("nada de reunião antes do fechamento (regra do Fernando, 18/11/2026)", () => {
  test("busca genérica: abertura, variáveis, etapas até o fechamento, painéis e mapa", () => {
    const f = ler("./config-sysaid-generica.ts");
    semReuniao(literais(entre(f, "abertura:", 'id: "reuniao",')), "config-sysaid-generica (até o fechamento)");
    semReuniao(literais(entre(f, "paineis: [", "cartoes: CARTOES_GENERICA")), "config-sysaid-generica (painéis e mapa)");
  });
  test("o recorte pega fala com reunião (prova do teste)", () => {
    const falso = 'texto: "O próximo passo é a reunião com o especialista.",\n  outro: "Vamos achar o caminho.",';
    assert.deepEqual(literais(falso).filter((t) => PROIBIDO.test(t)), ["O próximo passo é a reunião com o especialista."]);
    const velha = "A SysAid atende o que vocês precisam. O que for bem específico do cenário, o nosso especialista avalia com você na reunião.";
    assert.ok(PROIBIDO.test(velha));
  });
  test("fluxo de sempre (comparativa, marca, preço): tudo antes da entrega", () => {
    semReuniao(literais(entre(ler("./config-sysaid.ts"), "", "  entrega: {")), "config-sysaid");
    semReuniao(literais(ler("./cartoes-sysaid.ts")), "cartoes-sysaid");
  });
  test("textos montados por código que aparecem antes do fechamento", () => {
    const comCusto = ctx({ situacao_texto: DORES.perda.chip, implicacao: "e a licença tá muito cara", payoff: "incendio" });
    const comPreco = ctx({ situacao_texto: DORES.sla.chip, implicacao: "quanto custa?", payoff: "reclama" });
    const textos = [
      revelacao(comCusto, "Acme"),
      revelacao(comPreco, ""),
      perguntaPayoff(comCusto),
      ...Object.values(DORES).flatMap((d) => [d.chip ?? "", d.nome, d.nomeFala, d.implicacao, d.fragmento, ...d.rotulosChip, d.situacaoCurta]),
      ...Object.values(CONSEQUENCIAS).flatMap((c) => [c.triste, c.feliz, c.forma, c.curta]),
      ...CARTOES_GENERICA.filter((k) => !k.soNaEntrega).flatMap((k) => [k.fala, k.rotulo, k.titulo].map((t) => (typeof t === "string" ? t : ""))),
    ];
    semReuniao(textos, "generica-sysaid / cartões da conversa");
  });
  test("conversa por campanha (24/11/2026): chips, aberturas, perguntas e placeholders de toda origem", () => {
    const casos = (t: unknown): string[] => (typeof t === "string" ? [t] : [(t as { padrao: string }).padrao, ...(t as { casos: { texto: string }[] }).casos.map((c) => c.texto)]);
    const textos = [
      ...Object.values(CHIPS_COMPARATIVA).flat().map((c) => c.texto),
      ...CHIPS_BRAND.map((c) => c.texto),
      ...OPCOES_MODULOS.map((o) => o.rotulo),
      ...ABERTURA_ORIGENS.flatMap(casos),
      ...casos(FRASE_CABECALHO_ORIGENS),
      ...casos(PERGUNTA1_ORIGENS),
      ...casos(PLACEHOLDER1_ORIGENS),
    ];
    semReuniao(textos, "origens-sysaid");
    semReuniao(literais(entre(ler("./origens-sysaid.ts"), "// 2. Chips", "export function rotuloOrigem")), "origens-sysaid (arquivo)");
  });
  test("reações de custo: falas fixas sem reunião e a trava do Haiku reprova reunião", () => {
    for (const r of [REACAO_CUSTO_GENERICA, REACAO_CUSTO_ANTERIOR])
      semReuniao(Object.values(r.falas).flatMap((f) => [String(f.texto), String(f.rotulo ?? "")]), `reação ${r.id}`);
    semReuniao([FALA_RECLAMA, FALA_PEDE], "falas fixas");
    assert.equal(travaObjecao("Licença cara pesa. A SysAid costuma ser mais acessível e atender melhor o que vocês precisam, e isso dá pra ver na reunião.", "reclama"), false);
    assert.equal(travaObjecao("O investimento depende do time, então a proposta sai na conversa com o comercial.", "pede"), false);
    assert.equal(travaObjecao("O investimento depende do time. A proposta sai com o especialista.", "pede"), false);
    assert.equal(travaObjecao("O investimento depende do time. Você escolhe o horário depois.", "pede"), false);
  });
  test("prompts do Haiku que falam antes do fechamento não pedem reunião", () => {
    for (const [nome, p] of [
      ["SYSTEM_IMPLICACAO", SYSTEM_IMPLICACAO],
      ["SYSTEM_PALPITE", SYSTEM_PALPITE],
    ])
      assert.doesNotMatch(p.replace(/condi[çc][ãa]o comercial/gi, ""), /reuni[aã]o|agenda|especialista/i, nome);
  });
});
