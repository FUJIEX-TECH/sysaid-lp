// Qualifica v2 · busca genérica — testes das leituras e contas da SysAid (13/11/2026).
// Rodar: npm test. Conferem também as regras do conteúdo do sysaid-growth: o que vai
// pro lead não diz que WhatsApp é canal, não tem "até 90%", plano, preço nem "incluso".
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { Contexto, Gerado } from "../conversa-core/tipos";
import { svgSeguro, vistaCena } from "../conversa-core/cartoes";
import { validarHorarios } from "../conversa-core/horarios";
import {
  CAPACIDADES,
  CONSEQUENCIAS,
  DORES,
  REGRAS_HORARIO,
  capacidadesDoCaso,
  conta,
  consequencias,
  dorAtual,
  dorP1,
  dorPrincipal,
  dores,
  opcoesPayoff,
  pedido,
  perguntaFerramenta,
  perguntaPayoff,
  resumoDuasLinhas,
  revelacao,
} from "./generica-sysaid";
import { cenaSysaid, type CenaId } from "./cenas-sysaid";
import { CARTOES_GENERICA, horasSysaid, itensComoResolve, itensDiretoria, maturidadeSysaid, etapasSysaid, rotulosCena } from "./cartoes-generica-sysaid";

const g = (id: string, para: Record<string, string>, dados: Record<string, string>, extra: Partial<Gerado> = {}): Gerado => ({ id, para, textos: {}, dados, origem: "servidor", ...extra });
const ctx = (respostas: Contexto["respostas"], gerados: Record<string, Gerado> = {}): Contexto => ({ origem: "generica", variaveis: {}, respostas, gerados });
const CHIP = (d: keyof typeof DORES) => DORES[d].chip!;

describe("leituras da conversa", () => {
  test("dor do passo 1: chip, Jev no texto livre (só enquanto a geração vale) ou a lista", () => {
    assert.equal(dorP1(ctx({ situacao_texto: CHIP("sla") })), "sla");
    const texto = "o pessoal pede tudo no zap e some";
    assert.equal(dorP1(ctx({ situacao_texto: texto }, { implicacao: g("implicacao", { situacao_texto: texto }, { dor: "perda" }) })), "perda");
    assert.equal(dorP1(ctx({ situacao_texto: "outro texto qualquer" }, { implicacao: g("implicacao", { situacao_texto: texto }, { dor: "perda" }) })), null);
    assert.equal(dorP1(ctx({ situacao_texto: "não sei bem", dor_lista: "relatorio" })), "relatorio");
  });
  test("'Não é bem isso' troca a dor pela relida; 'Tem mais' soma; o Jev escolhe a principal", () => {
    const r = { situacao_texto: CHIP("perda"), implicacao: "nao", dor_releitura: "na verdade o problema é o relatório" };
    assert.equal(dorAtual(ctx(r, { releitura: g("releitura", { dor_releitura: r.dor_releitura }, { dor: "relatorio" }) })), "relatorio");
    const mais = { situacao_texto: CHIP("perda"), implicacao: "mais", dores_mais: "sla|relatorio" };
    assert.deepEqual(dores(ctx(mais)), ["perda", "sla", "relatorio"]);
    assert.equal(dorPrincipal(ctx(mais)), "perda"); // sem Jev: a da vez
    const para = { situacao_texto: mais.situacao_texto, dor_lista: "", implicacao: "mais", dor_releitura: "", dor_lista2: "", implicacao2: "", dores_mais: "sla|relatorio", consequencias: "" };
    assert.equal(dorPrincipal(ctx(mais, { principal: g("principal", para, { principal: "sla" }) })), "sla");
  });
  test("consequência: marcada, ou a que o Jev leu no texto (o passo é pulado)", () => {
    assert.deepEqual(consequencias(ctx({ consequencias: "reclama|incendio|outra coisa" })), ["reclama", "incendio"]);
    const texto = "o chamado vence e o diretor vem cobrar";
    assert.deepEqual(consequencias(ctx({ situacao_texto: texto }, { implicacao: g("implicacao", { situacao_texto: texto }, { dor: "sla", consequencia: "reclama" }) })), ["reclama"]);
  });
  test("ferramenta: só pergunta quando ele disse que tem e não disse qual", () => {
    assert.equal(perguntaFerramenta(ctx({ situacao_texto: CHIP("complexidade") })), true);
    assert.equal(perguntaFerramenta(ctx({ situacao_texto: CHIP("sla") })), false);
    const texto = "o glpi é cheio de plugin e ninguém sabe atualizar";
    assert.equal(perguntaFerramenta(ctx({ situacao_texto: texto }, { implicacao: g("implicacao", { situacao_texto: texto }, { dor: "complexidade", situacao: "tem_ferramenta", ferramenta_nome: "GLPI" }) })), false);
  });
});

describe("a conta (horas do lead × 52 ÷ 8; volume pessoas × 1,3)", () => {
  test("4 a 8 h por semana, 51 a 200 pessoas, 1 a 2 técnicos", () => {
    const c = conta(ctx({ tempo: "4a8", usuarios: "200", tecnicos: "1-2" }))!;
    assert.equal(c.diasTexto, "26 a 52");
    assert.equal(c.hMesTexto, "17 a 35");
    assert.equal(c.semanaTime, "5% a 20%");
    assert.equal(c.volume, "66 a 260");
    assert.equal(c.horasConta, "4 a 8 h por semana");
  });
  test("faixas: até, mais de, relatório por mês, não dá pra medir", () => {
    assert.equal(conta(ctx({ tempo: "ate4", usuarios: "50" }))!.diasTexto, "até 26");
    assert.equal(conta(ctx({ tempo: "ate4", usuarios: "50" }))!.volume, "até 65");
    assert.equal(conta(ctx({ tempo: "mais16", usuarios: "mais" }))!.diasTexto, "mais de 104");
    assert.equal(conta(ctx({ tempo: "mais16", usuarios: "mais" }))!.volume, "mais de 1.300");
    assert.equal(conta(ctx({ tempo: "m4" }))!.diasTexto, "até 6");
    assert.equal(conta(ctx({ tempo: "m8" }))!.diasTexto, "12");
    assert.equal(conta(ctx({ tempo: "m16" }))!.diasTexto, "24 ou mais");
    assert.equal(conta(ctx({ tempo: "nm", usuarios: "1000" }))!.medido, false);
  });
  test("o cartão nunca tem minuto por chamado", () => {
    for (const tempo of ["ate4", "4a8", "8a16", "mais16", "m4", "m8", "m16", "nm"]) {
      const h = horasSysaid(ctx({ tempo, usuarios: "200", tecnicos: "3-10" }))!;
      assert.doesNotMatch(`${h.conta}`, /min/);
    }
    assert.equal(horasSysaid(ctx({ tempo: "nm", usuarios: "200" }))!.texto, "?");
  });
});

describe("frases montadas por código", () => {
  const base = { situacao_texto: CHIP("perda"), implicacao: "mais", dores_mais: "sla", consequencias: "reclama|incendio", nome: "Ana Lima", empresa: "Acme", tempo: "4a8", payoff: "reclama|incendio" };
  test("need-payoff com os fragmentos das dores, na ordem dor principal → outras", () => {
    assert.equal(perguntaPayoff(ctx(base)), "Ana, se os pedidos caíssem numa fila só, com dono, e o aviso viesse antes de o prazo estourar, o que isso mudaria pra você? Pode marcar mais de um.");
  });
  test("chips do need-payoff na ordem das consequências marcadas", () => {
    assert.deepEqual(opcoesPayoff(ctx({ consequencias: "mostrar|prazo" })).map((o) => o.valor), ["mostrar", "prazo", "reclama", "incendio", "contratar"]);
  });
  test("revelação repete as palavras dele e sempre diz que a SysAid atende", () => {
    const t = revelacao(ctx(base), "Acme");
    assert.match(t, /^Você disse que quer a diretoria parar de ouvir reclamação e o time sair do modo incêndio\./);
    assert.match(t, /A SysAid atende o que vocês precisam/);
    assert.match(revelacao(ctx({ payoff: "a fila andar sozinha" }), "Acme"), /Você disse: “a fila andar sozinha”/);
  });
  test("resumo de 2 linhas", () => {
    assert.equal(
      resumoDuasLinhas(ctx(base), "Acme"),
      "Hoje a Acme tem fila invisível, e isso come de 4 a 8 horas do time por semana, com o usuário reclamando com a diretoria. O que vocês querem é a diretoria parar de ouvir reclamação e o time sair do modo incêndio."
    );
  });
  test("pedido: reunião, orçamento (com horários) ou WhatsApp", () => {
    assert.equal(pedido({ reuniao: "2026-11-16T10:00|2026-11-17T14:00" }), "reuniao");
    assert.equal(pedido({ reuniao: "orcamento" }), null);
    assert.equal(pedido({ reuniao: "orcamento", reuniao_orcamento: "2026-11-16T10:00|2026-11-17T14:00" }), "orcamento");
    assert.equal(pedido({ reuniao: "orcamento", reuniao_orcamento: "whatsapp" }), "whatsapp");
  });
});

describe("o documento só fala da lista fechada (C1–C10)", () => {
  const PROIBIDO = /whatsapp|90\s*%|\bplano\b|pre[çc]o|inclus[oa]|em tempo real|\+\s*400/i;
  test("capacidades: nenhuma promete WhatsApp, 90%, plano, preço, incluso ou tempo real", () => {
    for (const c of Object.values(CAPACIDADES)) assert.doesNotMatch(`${c.necessidade} ${c.comoResolve}`, PROIBIDO, c.id);
  });
  test("fragmentos, consequências e need-payoffs também não", () => {
    for (const d of Object.values(DORES)) assert.doesNotMatch(d.fragmento, PROIBIDO);
    for (const c of Object.values(CONSEQUENCIAS)) assert.doesNotMatch(`${c.feliz} ${c.forma}`, PROIBIDO);
  });
  test("como resolve: até 5, sem repetir, ordem dor principal → outras → need-payoffs", () => {
    const c = ctx({ situacao_texto: CHIP("sla"), implicacao: "mais", dores_mais: "relatorio", payoff: "contratar" });
    const caps = capacidadesDoCaso(c).map((x) => x.cap.id);
    assert.deepEqual(caps, ["C2", "C1", "C3", "C5", "C6"]);
    assert.equal(itensComoResolve(c).length, 5);
  });
  test("página da diretoria: implicação, conta, o que querem, como resolve, proposta", () => {
    const i = itensDiretoria(ctx({ situacao_texto: CHIP("relatorio"), tempo: "m8", payoff: "mostrar", empresa: "Acme" }), "Acme");
    assert.deepEqual(i.map((x) => x.titulo), ["O que acontece hoje", "O que isso custa", "O que a equipe quer", "Como a SysAid resolve", "O que a equipe propõe"]);
  });
  test("maturidade e etapas (só no documento)", () => {
    assert.equal(maturidadeSysaid(ctx({ situacao_texto: CHIP("perda") }))!.atual, 1);
    assert.equal(maturidadeSysaid(ctx({ situacao_texto: CHIP("sla") }))!.atual, 2);
    const e = etapasSysaid(ctx({ situacao_texto: CHIP("complexidade"), consequencias: "incendio", usuarios: "mais" }))!;
    assert.equal(e.etapas[1].titulo, CAPACIDADES.C4.necessidade);
    assert.match(e.etapas[2].texto!, /problema parar de voltar/);
    assert.ok(CARTOES_GENERICA.filter((k) => k.soNaEntrega).map((k) => k.id).includes("maturidade"));
  });
});

describe("cenas", () => {
  const IDS: CenaId[] = ["perda", "complexidade", "sla", "relatorio"];
  test("as 4 cenas, larga e estreita, com e sem logo, passam na conferência do SVG", () => {
    for (const id of IDS) {
      for (const o of [{ rotulos: DORES[id].rotulosChip }, { rotulos: DORES[id].rotulosChip, empresa: "Acme", logo: { src: "https://acme.com/i.png", alt: "Acme" } }]) {
        const d = cenaSysaid(id, o);
        assert.ok(svgSeguro(d.svg), `${id} largo`);
        assert.ok(d.estreito && svgSeguro(d.estreito.svg), `${id} estreito`);
        const v = vistaCena(d)!;
        assert.ok(v, id);
        assert.equal(v.estreito?.legenda, true);
        assert.ok(v.rotulos.filter((r) => r.tipo === "anotacao").length >= 2);
      }
    }
  });
  test("nenhum texto da pessoa entra no SVG (só classes e formas)", () => {
    const d = cenaSysaid("perda", { rotulos: ["<b>pede no zap</b>"], empresa: "Acme <script>" });
    assert.doesNotMatch(d.svg, /pede no zap|Acme/);
    assert.match(d.rotulos!.map((r) => r.texto).join(" "), /TI da Acme <script>/); // vai como texto do HTML (o React escapa)
  });
  test("versão com logo: blocos com o nome da empresa e a faixa", () => {
    const d = cenaSysaid("relatorio", { rotulos: DORES.relatorio.rotulosChip, empresa: "Acme" });
    const blocos = d.rotulos!.filter((r) => r.tipo === "bloco").map((r) => r.texto);
    assert.ok(blocos.includes("diretoria da Acme"));
    assert.ok(blocos.includes("TI da Acme"));
    assert.equal(d.faixa?.texto, "atendimento da Acme hoje");
  });
  test("prazo sem alarme: o 3º rótulo ('a reclamação sobe') só com a consequência marcada", () => {
    assert.equal(rotulosCena(ctx({ situacao_texto: CHIP("sla") }), "sla", false).length, 2);
    assert.equal(rotulosCena(ctx({ situacao_texto: CHIP("sla"), consequencias: "reclama" }), "sla", false).length, 3);
  });
  test("rótulos do Haiku só valem com a geração da mesma dor", () => {
    const texto = "o chamado vence e eu só sei pelo usuário";
    const imp = g("implicacao", { situacao_texto: texto }, { dor: "sla" }, { listas: { anotacoes: ["chamado vence", "sei pelo usuário"] } });
    assert.deepEqual(rotulosCena(ctx({ situacao_texto: texto }, { implicacao: imp }), "sla", true), ["chamado vence", "sei pelo usuário"]);
    assert.deepEqual(rotulosCena(ctx({ situacao_texto: texto }, { implicacao: imp }), "perda", true), DORES.perda.rotulosChip);
  });
});

describe("horários (as mesmas regras no navegador e no servidor)", () => {
  test("sexta 13/11/2026: começa na segunda 16/11, pula o feriado de 20/11", () => {
    const agora = new Date("2026-11-13T20:00:00Z");
    assert.equal(validarHorarios("2026-11-16T09:00|2026-11-23T17:30", REGRAS_HORARIO, agora).ok, true);
    assert.equal(validarHorarios("2026-11-20T10:00|2026-11-23T10:00", REGRAS_HORARIO, agora).ok, false);
    assert.equal(validarHorarios("2026-11-16T18:00|2026-11-17T10:00", REGRAS_HORARIO, agora).ok, false);
  });
});
