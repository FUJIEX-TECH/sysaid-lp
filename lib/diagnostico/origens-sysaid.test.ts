// Qualifica v2 · conversa por campanha (24/11/2026, pedido do Fernando): a origem é lida dos
// sinais (página, ?de=, termo, campanha, referrer, gclid), a 1ª pergunta e os chips são do
// assunto da campanha, e o resto do fluxo (ferramenta, revelação, documento, máscara do PDF)
// lê a origem. Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { resolverOrigem } from "../conversa-core/origem";
import { renderTexto } from "../conversa-core/texto";
import { avaliar } from "../conversa-core/condicoes";
import { mascararTexto } from "../conversa-core/mascara";
import type { Contexto, Sinais } from "../conversa-core/tipos";
import {
  ABERTURA_ORIGENS,
  CHIPS_BRAND,
  CHIPS_COMPARATIVA,
  CHIP_BRAND_MODULOS,
  CHIP_BRAND_SUPORTE,
  CONCORRENTES,
  FRASE_CABECALHO_ORIGENS,
  ORIGENS_SYSAID,
  OPCOES_MODULOS,
  PERGUNTA1_ORIGENS,
  atalhosPorOrigem,
  chipsDaOrigem,
  chipsMolde,
  rotuloOrigem,
} from "./origens-sysaid";
import {
  CAPACIDADES,
  CHIP_DOR,
  DORES,
  MASCARA_PDF,
  OPCOES_DOR_CHIP,
  TODAS_DORES,
  capacidadesDoCaso,
  clienteSysaid,
  derivados,
  dorP1,
  ferramentaNome,
  notasGenerica,
  opcoesDorOrigem,
  opcoesDoresMais,
  pediuPreco,
  perguntaFerramenta,
  perguntaPayoff,
  resumoDuasLinhas,
  revelacao,
  temFerramenta,
  termosPdf,
} from "./generica-sysaid";
import { itensComoResolve, itensOQuePesa, maturidadeSysaid, etapasSysaid } from "./cartoes-generica-sysaid";

const sinais = (s: Partial<Sinais>): Sinais => ({ caminho: "/diagnostico", entrada: "", referrer: "", parametros: {}, ...s });
const origem = (s: Partial<Sinais>) => resolverOrigem(ORIGENS_SYSAID, sinais(s));
const ctxDe = (s: Partial<Sinais>, respostas: Contexto["respostas"] = {}): Contexto => {
  const o = origem(s);
  return { origem: o.origem, variaveis: o.variaveis, respostas, sinais: sinais(s) };
};
const PROIBIDO = /reuni[aã]o|reuni[oõ]es|\bagenda|hor[aá]rios?\b|comercial|especialista/i;
const PRECO = /r\$|\breais\b|\bdesconto\b|\d+\s*%|\bplano (b[aá]sico|completo|enterprise)\b|\bincluso\b|at[ée] 90/i;
const MOVIDESK = { parametros: { de: "movidesk" } };
const TOPDESK = { utm_source: "google", utm_medium: "cpc", utm_campaign: "[FJX] Conquista", utm_term: "topdesk", gclid: "x" };
const BRAND = { utm_source: "google", utm_medium: "cpc", utm_campaign: "[FJX] Brand", utm_term: "sysaid", gclid: "y" };

describe("origem lida dos sinais (regras da SysAid)", () => {
  test("comparativa: página, página de entrada, ?de=, termo, conteúdo, campanha e referrer", () => {
    assert.equal(origem({ caminho: "/movidesk" }).variaveis.concorrente, "Movidesk");
    assert.equal(origem({ entrada: "/topdesk" }).variaveis.concorrente, "TOPdesk");
    assert.equal(origem(MOVIDESK).origem, "comparativa");
    assert.equal(origem({ utm_term: "sair do top desk", gclid: "g" }).variaveis.slug, "topdesk");
    assert.equal(origem({ utm_content: "freshdesk-rsa" }).variaveis.concorrente, "Freshdesk");
    assert.equal(origem({ utm_campaign: "conquista-glpi" }).variaveis.concorrente, "GLPI");
    assert.equal(origem({ referrer: "https://itsm.sysaid.com.br/manageengine?x=1" }).variaveis.concorrente, "ManageEngine ServiceDesk Plus");
    for (const c of CONCORRENTES) assert.equal(origem({ parametros: { de: c.slug } }).variaveis.concorrente, c.nome, c.slug);
  });
  test("marca, paga genérica, intenção de preço e canal", () => {
    const b = origem(BRAND);
    assert.equal(b.origem, "brand");
    assert.equal(b.variaveis.canal, "busca pela SysAid");
    assert.equal(origem({ parametros: { de: "brand" } }).origem, "brand");
    const g = origem({ gclid: "abc" });
    assert.equal(g.origem, "generica");
    assert.equal(g.variaveis.canal, "anúncio no Google");
    const p = origem({ utm_term: "movidesk preço", utm_medium: "cpc" });
    assert.equal(p.origem, "comparativa");
    assert.equal(p.variaveis.intencao, "preco");
    assert.equal(origem({ utm_term: "sistema de chamados preço", utm_medium: "cpc" }).variaveis.intencao, "preco");
    assert.equal(origem({}).origem, "generica");
    assert.equal(origem({}).variaveis.canal, "acesso direto");
    assert.equal(origem({ referrer: "https://www.google.com/" }).variaveis.canal, "busca orgânica");
  });
  test("caso Sertrading: só o gclid guardado (cookie do Google) = clique pago, sem inventar concorrente", () => {
    const o = origem({ caminho: "/diagnostico", gclid: "do-cookie" });
    assert.equal(o.origem, "generica");
    assert.equal(o.variaveis.concorrente, undefined);
  });
  test("rótulo da origem", () => {
    assert.equal(rotuloOrigem("comparativa", { concorrente: "Movidesk" }), "Comparativa · Movidesk");
    assert.equal(rotuloOrigem("brand"), "Marca (busca pela SysAid)");
    assert.equal(rotuloOrigem("generica", { intencao: "preco" }), "Busca genérica · preço");
  });
});

describe("a 1ª pergunta e os chips de cada origem", () => {
  const pergunta = (s: Partial<Sinais>) => renderTexto(PERGUNTA1_ORIGENS, ctxDe(s));
  const abertura = (s: Partial<Sinais>) => ABERTURA_ORIGENS.map((t) => renderTexto(t, ctxDe(s)));
  const chips = (s: Partial<Sinais>) => {
    const c = ctxDe(s);
    const a = atalhosPorOrigem(OPCOES_DOR_CHIP.map((o) => ({ valor: o.rotulo, rotulo: o.rotulo })));
    const caso = a.casos.find((x) => avaliar(x.quando, c));
    return (caso ? caso.opcoes : a.padrao).map((o) => o.rotulo);
  };
  test("Movidesk: pergunta no assunto, 4 chips das dores de quem sai dele", () => {
    assert.equal(pergunta(MOVIDESK), "O que está pesando no Movidesk hoje?");
    assert.deepEqual(abertura(MOVIDESK), ["Oi. Pensando em sair do Movidesk?", "O que está pesando aí tem jeito. No fim você leva o documento do seu caso: o que muda saindo do Movidesk e por onde começar."]);
    assert.deepEqual(chips(MOVIDESK), CHIPS_COMPARATIVA.movidesk.map((c) => c.texto));
    assert.equal(chips(MOVIDESK).length, 4);
    assert.equal(renderTexto(FRASE_CABECALHO_ORIGENS, ctxDe(MOVIDESK)), "O que muda se você sair do Movidesk.");
  });
  test("TOPdesk e Freshdesk têm chips próprios; os demais herdam o molde com o nome", () => {
    assert.equal(pergunta(TOPDESK), "O que está pesando no TOPdesk hoje?");
    assert.deepEqual(chips(TOPDESK), CHIPS_COMPARATIVA.topdesk.map((c) => c.texto));
    assert.deepEqual(chips({ parametros: { de: "freshdesk" } }), CHIPS_COMPARATIVA.freshdesk.map((c) => c.texto));
    const molde = chipsMolde("ServiceDesk Plus");
    assert.deepEqual(chipsDaOrigem("comparativa", "manageengine"), molde);
    assert.match(molde[0].texto, /ServiceDesk Plus/);
    for (const c of CONCORRENTES) assert.equal(chipsDaOrigem("comparativa", c.slug).length, 4, c.slug);
  });
  test("Brand: pergunta aberta, chips de suporte, módulos novos, outra ferramenta e sem fila", () => {
    assert.equal(pergunta(BRAND), "Como está o atendimento de TI aí hoje?");
    assert.deepEqual(chips(BRAND), [CHIP_BRAND_SUPORTE, CHIP_BRAND_MODULOS, ...CHIPS_BRAND.map((c) => c.texto)]);
    assert.equal(abertura(BRAND)[0], "Oi, que bom ter você por aqui.");
  });
  test("preço: a abertura e a pergunta reconhecem a intenção; comparativa + preço cita o concorrente", () => {
    const p = { utm_term: "movidesk preço", utm_medium: "cpc" };
    assert.equal(abertura(p)[0], "Oi. Veio ver o que muda na conta saindo do Movidesk?");
    assert.equal(pergunta(p), "O que está pesando no Movidesk hoje?");
    const g = { utm_term: "sistema de chamados valor", utm_medium: "cpc" };
    assert.equal(pergunta(g), "Antes do investimento: qual é o maior problema no atendimento de TI aí hoje?");
    assert.equal(pediuPreco(ctxDe(g)), true);
    assert.equal(pediuPreco(ctxDe(MOVIDESK)), false);
  });
  test("genérica: a pergunta e os chips de sempre", () => {
    assert.equal(pergunta({ gclid: "z" }), "Qual é o maior problema no atendimento de TI aí hoje?");
    assert.deepEqual(chips({ gclid: "z" }), OPCOES_DOR_CHIP.map((o) => o.rotulo));
  });
  test("todo chip de origem aponta pra uma dor real (capacidades C1–C10) e está no CHIP_DOR", () => {
    for (const [slug, lista] of Object.entries(CHIPS_COMPARATIVA)) {
      for (const c of lista) {
        assert.ok(TODAS_DORES.includes(c.dor), `${slug}: ${c.dor}`);
        assert.equal(CHIP_DOR[c.texto], c.dor, c.texto);
        for (const cap of DORES[c.dor].capacidades) assert.ok(CAPACIDADES[cap], cap);
      }
    }
    for (const c of CHIPS_BRAND) assert.equal(CHIP_DOR[c.texto], c.dor);
    for (const o of OPCOES_MODULOS) assert.ok(TODAS_DORES.includes(o.valor as (typeof TODAS_DORES)[number]));
  });
  test("nenhum chip, abertura, pergunta ou texto da dor nova fala de reunião, preço ou acusa o concorrente", () => {
    const textos = [
      ...Object.values(CHIPS_COMPARATIVA).flat().map((c) => c.texto),
      ...CHIPS_BRAND.map((c) => c.texto),
      ...CONCORRENTES.flatMap((c) => [...abertura({ parametros: { de: c.slug } }), pergunta({ parametros: { de: c.slug } })]),
      DORES.suporte.nomeFala,
      DORES.suporte.implicacao,
      DORES.suporte.fragmento,
    ];
    for (const t of textos) {
      assert.doesNotMatch(t, PROIBIDO, t);
      assert.doesNotMatch(t, PRECO, t);
      assert.doesNotMatch(t, /\b(ruim|péssim|pior|lixo|fraco)\b/i, t);
    }
  });
});

describe("o fluxo lê a origem: ferramenta, outras dores, revelação, documento e PDF", () => {
  const chipMovidesk = CHIPS_COMPARATIVA.movidesk[0].texto;
  const conversa = {
    situacao_texto: chipMovidesk,
    implicacao: "sim",
    consequencias: "incendio|contratar",
    email: "ana@acme.com.br",
    nome: "Ana Souza",
    empresa: "Acme",
    papel: "influencia",
    cargo: "Coordenadora de TI",
    usuarios: "200",
    tecnicos: "3-10",
    tempo: "4a8",
    payoff: "incendio",
    telefone: "11999990001",
    reuniao: "2026-12-01T10:00|2026-12-02T14:00",
  };
  const c = ctxDe(MOVIDESK, conversa);
  test("o chip do Movidesk vira a dor; a ferramenta é o concorrente e o passo da ferramenta some", () => {
    assert.equal(dorP1(c), "complexidade");
    assert.equal(temFerramenta(c), "sim");
    assert.equal(ferramentaNome(c), "Movidesk");
    assert.equal(perguntaFerramenta(c), false);
    // sem origem, o mesmo chip de "ferramenta dá trabalho" ainda pergunta qual é
    const g = ctxDe({ gclid: "z" }, { situacao_texto: DORES.complexidade.chip! });
    assert.equal(perguntaFerramenta(g), true);
  });
  test("'Tem mais' oferece as outras dores do concorrente, sem repetir a da vez", () => {
    const mais = opcoesDoresMais(c);
    assert.ok(!mais.some((o) => o.valor === "complexidade"));
    assert.deepEqual(mais.slice(0, 3).map((o) => o.valor), ["relatorio", "suporte", "custo"]);
    assert.ok(mais.every((o) => TODAS_DORES.includes(o.valor as (typeof TODAS_DORES)[number])));
    assert.deepEqual(opcoesDorOrigem(ctxDe({ gclid: "z" })), OPCOES_DOR_CHIP);
  });
  test("need-payoff, revelação e resumo seguem iguais à genérica (sem reunião antes do fechamento)", () => {
    assert.match(perguntaPayoff(c), /^Ana, se mudar um fluxo não virasse projeto/);
    assert.doesNotMatch(revelacao(c, "Acme"), PROIBIDO);
    assert.match(revelacao(c, "Acme"), /A SysAid atende o que vocês precisam/);
    assert.match(resumoDuasLinhas(c, "Acme"), /^Hoje a Acme tem ferramenta que virou projeto/);
    assert.ok(capacidadesDoCaso(c).some((x) => x.cap.id === "C4"));
    assert.ok(itensComoResolve(c).length >= 3);
    assert.ok(maturidadeSysaid(c) && etapasSysaid(c));
  });
  test("o documento esconde o concorrente da campanha; tela e /admin ficam crus", () => {
    const termos = termosPdf(c);
    assert.ok(termos.includes("Movidesk"));
    const m = (t: string) => mascararTexto(t, termos, MASCARA_PDF);
    assert.equal(m(chipMovidesk), "Qualquer ajuste na ferramenta atual vira projeto");
    assert.equal(m("Hoje a Acme usa o Movidesk"), "Hoje a Acme usa a ferramenta atual");
    assert.doesNotMatch(itensOQuePesa(c).map((i) => m(`${i.titulo} ${i.texto} ${i.nota ?? ""}`)).join(" "), /movidesk/i);
    assert.match(notasGenerica(c), /^Qualifica v2 · Comparativa · Movidesk/);
  });
  test("ficha do /admin: origem, concorrente, termo e canal", () => {
    const d = derivados(ctxDe(TOPDESK, { situacao_texto: CHIPS_COMPARATIVA.topdesk[3].texto, tempo: "nm" }));
    assert.equal(d.origem, "comparativa");
    assert.equal(d.concorrente, "TOPdesk");
    assert.equal(d.termo, "topdesk");
    assert.equal(d.campanha, "[FJX] Conquista");
    assert.equal(d.canal, "anúncio no Google");
    assert.equal(d.origem_rotulo, "Comparativa · TOPdesk");
    assert.equal(d.dor_principal, "suporte");
    assert.equal(d.ferramenta, "TOPdesk");
  });
  test("marca: suporte encerra; módulos novos é cliente e escolhe o que evoluir", () => {
    const sup = ctxDe(BRAND, { situacao_texto: CHIP_BRAND_SUPORTE });
    assert.equal(dorP1(sup), null);
    const mod = ctxDe(BRAND, { situacao_texto: CHIP_BRAND_MODULOS, dor_lista: "esm" });
    assert.equal(clienteSysaid(mod), true);
    assert.equal(dorP1(mod), "esm");
    assert.ok((derivados(mod).sinais as string[]).includes("já é cliente SysAid"));
    const outra = ctxDe(BRAND, { situacao_texto: CHIPS_BRAND[0].texto });
    assert.equal(dorP1(outra), "complexidade");
    assert.equal(perguntaFerramenta(outra), true);
  });
  test("preço pela campanha: a revelação trata o custo sem número e a ficha marca", () => {
    const p = ctxDe({ utm_term: "topdesk preço", utm_medium: "cpc", gclid: "k" }, { situacao_texto: CHIPS_COMPARATIVA.topdesk[2].texto, payoff: "contratar" });
    const r = revelacao(p, "Acme");
    assert.match(r, /mais acessível/);
    assert.doesNotMatch(r, PRECO);
    assert.doesNotMatch(r, PROIBIDO);
    assert.ok((derivados(p).sinais as string[]).includes("veio por termo de preço"));
  });
});
