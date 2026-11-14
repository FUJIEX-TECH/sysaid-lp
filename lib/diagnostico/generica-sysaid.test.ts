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
import { CARTOES_GENERICA, horasSysaid, itensComoResolve, itensDiretoria, maturidadeSysaid, etapasSysaid, atosDaDor, causaTexto, solucaoTexto } from "./cartoes-generica-sysaid";

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

describe("cenas (direção A, 14/11/2026: três atos)", () => {
  const IDS: CenaId[] = ["perda", "complexidade", "sla", "relatorio"];
  const base = { hoje: "pedido chega por whatsapp", quebra: "aqui o pedido se perde" };
  const empresa = { empresa: "Acme", logo: { src: "https://acme.com/i.png", alt: "Acme" }, cor: "#162cb6" };
  test("4 cenas × 3 estados, larga e estreita: SVG conferido, traço que se desenha, 3 atos, menta só no 3º", () => {
    for (const id of IDS) {
      for (const estado of [1, 2, 3] as const) {
        const d = cenaSysaid(id, { ...base, estado, causa: "o usuário reclama com a diretoria", causas: ["reclama", "incendio"], solucao: solucaoTexto(id), ...empresa });
        assert.ok(svgSeguro(d.svg), `${id} e${estado} largo`);
        assert.ok(d.estreito && svgSeguro(d.estreito.svg), `${id} e${estado} estreito`);
        assert.match(d.svg, /pathLength="1"/);
        assert.equal(/cs-ato--solucao/.test(d.svg), estado === 3, `${id} e${estado}: menta só no 3º estado`);
        assert.equal(/cs-ato--marca/.test(d.svg), estado >= 2, `${id} e${estado}: a empresa só a partir do 2º`);
        const v = vistaCena(d)!;
        assert.ok(v, id);
        assert.equal(v.atos.length, 3);
        assert.equal(v.atos[0].tom, "contexto");
        assert.equal(v.atos[1].tom, "quebra");
        assert.equal(v.atos[2].vazio, estado === 1);
        assert.equal(v.atos[2].tom, estado === 3 ? "solucao" : "causa");
        assert.equal(v.rotulos.length, 0, "nada de rótulo por cima do desenho");
        assert.equal(v.estreito?.legenda, false);
        if (estado >= 2) {
          assert.equal(v.nome, "Acme");
          assert.ok(v.logo);
          assert.ok(v.cor && v.cor !== "#162cb6", "a cor da marca escura é clareada pro fundo escuro");
        } else {
          assert.equal(v.logo, null);
          assert.equal(v.cor, undefined);
        }
      }
    }
  });
  test("nenhum texto da pessoa nem da empresa entra no SVG: vai nos atos (HTML, o React escapa)", () => {
    const d = cenaSysaid("perda", { estado: 2, hoje: "<b>pede no zap</b>", quebra: "some na mesa", causa: "x", causas: ["reclama"], empresa: "Acme <script>", cor: "#ff0000" });
    assert.doesNotMatch(d.svg, /pede no zap|some na mesa|Acme/);
    assert.doesNotMatch(d.estreito!.svg, /pede no zap|Acme/);
    assert.equal(d.atos![0].texto, "<b>pede no zap</b>");
    assert.equal(d.nome, "Acme <script>");
  });
  test("3º ato no estado 2: sem consequência marcada fica tracejado; 1, 2 e 3 consequências cabem", () => {
    for (const n of [0, 1, 2, 3]) {
      const causas = (["reclama", "incendio", "prazo"] as const).slice(0, n);
      const d = cenaSysaid("sla", { estado: 2, ...base, causas: [...causas], causa: n ? "x" : undefined, empresa: "Acme" });
      assert.ok(svgSeguro(d.svg));
      assert.equal(/cs-ato--dim/.test(d.svg), n === 0, `${n} consequências`);
    }
  });
  test("atos da dor: Haiku quando vale e é da mesma dor (1ª anotação = hoje, última = onde quebra); senão os fixos", () => {
    const texto = "o chamado vence e eu só sei pelo usuário";
    const imp = g("implicacao", { situacao_texto: texto }, { dor: "sla" }, { listas: { anotacoes: ["chamado vence", "usuário liga", "sei pelo usuário"] } });
    assert.deepEqual(atosDaDor(ctx({ situacao_texto: texto }, { implicacao: imp }), "sla", true), { hoje: "chamado vence", quebra: "sei pelo usuário" });
    assert.deepEqual(atosDaDor(ctx({ situacao_texto: texto }, { implicacao: imp }), "perda", true), { hoje: "pedido chega por whatsapp, e-mail e pessoalmente", quebra: "aqui o pedido se perde" });
    assert.deepEqual(atosDaDor(ctx({ situacao_texto: CHIP("sla") }), "sla", false), { hoje: "o chamado entra e ninguém acompanha o prazo", quebra: "o prazo estoura sem ninguém ver" });
    assert.equal(atosDaDor(ctx({}), "ativos", false).quebra, DORES.ativos.rotulosChip[2]);
  });
  test("a solução (estado 3) vem só da lista fechada C1–C10 e nunca fala em WhatsApp; a causa usa os chips", () => {
    const todas = Object.values(CAPACIDADES).map((c) => c.necessidade.toLowerCase());
    for (const d of Object.keys(DORES) as (keyof typeof DORES)[]) {
      const s = solucaoTexto(d);
      assert.ok(todas.includes(s.toLowerCase()), `${d}: ${s}`);
      assert.doesNotMatch(s, /whatsapp/i);
    }
    assert.equal(causaTexto(ctx({ consequencias: "reclama|incendio|prazo" })), "o usuário reclama com a diretoria · o time vive apagando incêndio");
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
