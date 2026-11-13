// conversa-core — testes das peças de 13/11/2026: múltipla escolha, horários com
// regras, condições novas (inclui, decisão do Jev), curinga no aoResponder, limpeza
// do que a etapa gravou ao corrigir, falas com rótulo, transcrição, cena desenhada,
// número em texto, mapa em linha, documento por seções e entrega no fim.
// Rodar: npm test.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { juntarMultipla, partesMultipla, textoMultipla, valoresMultipla, listaNatural, incluiValor } from "../selecao";
import { diasDisponiveis, formatarHorario, horasDisponiveis, juntarHorarios, primeiroDia, validarHorarios, formatarDia } from "../horarios";
import { avaliar } from "../condicoes";
import { criarMotor } from "../motor";
import { resolverCartao, svgSeguro, vistaCena, vistaNumero, resumoCartao } from "../cartoes";
import { montarMapa } from "../mapa";
import { resolverDocumento } from "../documento";
import { entregaLiberada, etapaDaEntrega, montagemIniciada } from "../entrega";
import type { CartaoConfig, ConfigConversa, Contexto, Gerado, RegrasHorario } from "../tipos";

const ctx = (respostas: Contexto["respostas"], extra: Partial<Contexto> = {}): Contexto => ({ origem: "x", variaveis: {}, respostas, ...extra });
const gerado = (id: string, para: Record<string, string>, dados: Record<string, string>, textos: Record<string, string> = {}): Gerado => ({ id, para, textos, dados, origem: "servidor" });

const BASE: ConfigConversa = {
  id: "teste",
  marca: { titulo: "T", rotuloRegiao: "Conversa" },
  totalPassos: 3,
  origens: { padrao: "x" },
  abertura: ["Oi."],
  etapas: [],
  pontuacao: { maximo: 0, criterios: [], extras: [], classes: [{ id: "x", minimo: 0 }], rotulos: [], rotaPorRotulo: {} },
  jev: { habilitado: false, endpoint: "", timeoutMs: 0 },
  textos: { enviando: "", erro: "", tentarDeNovo: "", legal: "", corrigirDica: "", passoAria: "" },
};

const SVG = '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg"><g><rect class="cs-s" x="10" y="10" width="40" height="30"/></g></svg>';

describe("múltipla escolha", () => {
  const ops = [
    { valor: "a", rotulo: "A" },
    { valor: "b", rotulo: "B" },
  ];
  test("junta valores, tira repetido e guarda o texto livre sem o separador", () => {
    assert.equal(juntarMultipla(["a", "b", "a"], " outra | coisa "), "a|b|outra / coisa");
    assert.deepEqual(partesMultipla("a|b|x"), ["a", "b", "x"]);
    assert.deepEqual(valoresMultipla("a|x|b", ops), ["a", "b"]);
    assert.equal(textoMultipla("a|x", ops), "x");
    assert.equal(incluiValor("a|b", "b"), true);
    assert.equal(incluiValor("ab", "a"), false);
  });
  test("lista natural", () => {
    assert.equal(listaNatural(["um"]), "um");
    assert.equal(listaNatural(["um", "dois"]), "um e dois");
    assert.equal(listaNatural(["um", "dois", "três"]), "um, dois e três");
  });
  test("condição inclui", () => {
    assert.equal(avaliar({ campo: "m", inclui: "b" }, ctx({ m: "a|b" })), true);
    assert.equal(avaliar({ campo: "m", inclui: "c" }, ctx({ m: "a|b" })), false);
  });
});

describe("horários", () => {
  const regras: RegrasHorario = { quantidade: 2, dias: 5, janela: { inicio: "09:00", fim: "18:00" }, intervaloMin: 30, feriados: ["2026-11-20"] };
  // sexta, 13/11/2026, 16h em Brasília (19h UTC)
  const sexta = new Date("2026-11-13T19:00:00Z");
  test("a partir do próximo dia útil, sem fim de semana nem feriado", () => {
    assert.equal(primeiroDia(regras, sexta), "2026-11-16");
    assert.deepEqual(diasDisponiveis(regras, sexta), ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-23"]);
  });
  test("o dia vira no fuso da config (23h30 de sexta em Brasília ainda é sexta)", () => {
    assert.equal(primeiroDia(regras, new Date("2026-11-14T02:30:00Z")), "2026-11-16");
    // domingo à noite em Brasília: o próximo dia útil é segunda
    assert.equal(primeiroDia(regras, new Date("2026-11-16T01:00:00Z")), "2026-11-16");
  });
  test("janela: das 9h até antes das 18h, de 30 em 30", () => {
    const h = horasDisponiveis(regras);
    assert.equal(h[0], "09:00");
    assert.equal(h[h.length - 1], "17:30");
    assert.equal(h.length, 18);
  });
  test("valida: completo, dentro das regras e sem repetir", () => {
    assert.deepEqual(validarHorarios("2026-11-16T10:00|2026-11-17T14:30", regras, sexta), {
      ok: true,
      horarios: [
        { data: "2026-11-16", hora: "10:00" },
        { data: "2026-11-17", hora: "14:30" },
      ],
    });
    assert.deepEqual(validarHorarios("2026-11-16T10:00", regras, sexta), { ok: false, motivo: "incompleto" });
    assert.deepEqual(validarHorarios("2026-11-14T10:00|2026-11-16T10:00", regras, sexta), { ok: false, motivo: "invalido" }); // sábado
    assert.deepEqual(validarHorarios("2026-11-20T10:00|2026-11-16T10:00", regras, sexta), { ok: false, motivo: "invalido" }); // feriado
    assert.deepEqual(validarHorarios("2026-11-16T18:00|2026-11-17T10:00", regras, sexta), { ok: false, motivo: "invalido" }); // fora da janela
    assert.deepEqual(validarHorarios("2026-11-16T10:15|2026-11-17T10:00", regras, sexta), { ok: false, motivo: "invalido" }); // fora do intervalo
    assert.deepEqual(validarHorarios("2026-11-13T17:00|2026-11-17T10:00", regras, sexta), { ok: false, motivo: "invalido" }); // hoje
    assert.deepEqual(validarHorarios("2026-11-16T10:00|2026-11-16T10:00", regras, sexta), { ok: false, motivo: "repetido" });
    assert.deepEqual(validarHorarios("lixoT10:00|2026-11-16T<b>", regras, sexta), { ok: false, motivo: "invalido" });
  });
  test("formata em português", () => {
    assert.equal(formatarDia("2026-11-16"), "seg, 16/11");
    assert.equal(formatarHorario({ data: "2026-11-17", hora: "14:30" }), "ter, 17/11 às 14h30");
    assert.equal(juntarHorarios([{ data: "2026-11-16", hora: "10:00" }]), "2026-11-16T10:00");
  });
});

describe("motor: curinga, decisão do Jev, limpeza ao corrigir, falas, transcrição", () => {
  const config: ConfigConversa = {
    ...BASE,
    etapas: [
      {
        id: "p1",
        passo: 1,
        tipo: "texto",
        texto: "Qual o problema?",
        atalhos: [{ valor: "chip perda", rotulo: "chip perda" }],
        aoResponder: [
          { valor: "chip perda", definir: { campo: "dor", valor: "perda" } },
          { valor: "*", definir: { campo: "dor", deGerado: { id: "imp", dado: "dor" } } },
        ],
      },
      { id: "consequencia", passo: 2, tipo: "multipla", quando: { nao: { decisao: "imp", dado: "consequencia", igual: "sim" } }, texto: "O que pesa?", opcoes: [{ valor: "a", rotulo: "Alfa" }, { valor: "b", rotulo: "Beta" }], multipla: { confirmar: "Continuar" } },
      { id: "reuniao", passo: 3, tipo: "horarios", falas: [{ rotulo: "Resumindo", texto: "Hoje é {{dor}}." }, "Sem rótulo."], rotulo: "Próximo passo", texto: "Escolhe dois horários:", nota: "Dias úteis.", atalhos: [{ valor: "orcamento", rotulo: "Quero orçamento" }] },
    ],
  };
  const motor = criarMotor(config);

  test("chip grava o valor fixo; texto livre copia o dado do Jev só se a geração vale", () => {
    const c0 = ctx({});
    const r1 = motor.responder({}, config.etapas[0], "chip perda", {}, c0);
    assert.equal(r1.dor, "perda");
    const g = { imp: gerado("imp", { p1: "meu texto longo de teste" }, { dor: "sla" }) };
    const r2 = motor.responder({}, config.etapas[0], "meu texto longo de teste", g, c0);
    assert.equal(r2.dor, "sla");
    // geração de outro texto (a pessoa corrigiu): não copia
    const r3 = motor.responder({}, config.etapas[0], "outro texto qualquer", g, c0);
    assert.equal(r3.dor, undefined);
  });
  test("corrigir apaga também o que a etapa gravou noutro campo", () => {
    const r = motor.refazerDesde({ p1: "chip perda", dor: "perda", consequencia: "a" }, "p1");
    assert.deepEqual(r, {});
  });
  test("decisão do Jev pula a etapa (e só enquanto a geração vale)", () => {
    const g = { imp: gerado("imp", { p1: "texto" }, { consequencia: "sim" }) };
    assert.equal(motor.proximaEtapa(ctx({ p1: "texto" }, { gerados: g }))?.id, "reuniao");
    assert.equal(motor.proximaEtapa(ctx({ p1: "outro" }, { gerados: g }))?.id, "consequencia");
  });
  test("resumo da múltipla e dos horários, atalho em etapa de horários", () => {
    const c = ctx({ p1: "chip perda", dor: "perda" });
    assert.equal(motor.resumo(config.etapas[1], "a|b|outra coisa", c), "Alfa · Beta · “outra coisa”");
    assert.equal(motor.resumo(config.etapas[2], "2026-11-16T10:00|2026-11-17T14:30", c), "seg, 16/11 às 10h · ter, 17/11 às 14h30");
    assert.equal(motor.resumo(config.etapas[2], "orcamento", c), "Quero orçamento");
    assert.deepEqual(motor.resolver(config.etapas[2], c).atalhos.map((o) => o.valor), ["orcamento"]);
  });
  test("falas com rótulo, rótulo e nota da pergunta", () => {
    const r = motor.resolver(config.etapas[2], ctx({ dor: "perda" }));
    assert.deepEqual(r.falas, [{ rotulo: "Resumindo", texto: "Hoje é perda." }, { texto: "Sem rótulo." }]);
    assert.equal(r.rotulo, "Próximo passo");
    assert.equal(r.nota, "Dias úteis.");
  });
  test("transcrição: abertura, pergunta com o que foi oferecido, resposta crua e como apareceu", () => {
    const c = ctx({ p1: "chip perda", dor: "perda", consequencia: "a|outra" });
    const t = motor.transcricao(c, { p1: "2026-11-13T19:00:00.000Z" }, { entrega: "Pronto." });
    assert.equal(t[0].tipo, "abertura");
    const p = t.find((x) => x.etapa === "p1" && x.tipo === "pergunta")!;
    assert.deepEqual(p.oferecidas, ["chip perda"]);
    const r = t.find((x) => x.etapa === "p1" && x.tipo === "resposta")!;
    assert.equal(r.via, "chip");
    assert.equal(r.em, "2026-11-13T19:00:00.000Z");
    const m = t.find((x) => x.etapa === "consequencia" && x.tipo === "resposta")!;
    assert.equal(m.via, "multipla");
    assert.equal(m.texto, "Alfa · “outra”");
    assert.equal(t[t.length - 1].tipo, "entrega");
  });
});

describe("cena desenhada", () => {
  test("SVG: aceita o desenho da config, recusa script, evento, link e imagem externa", () => {
    assert.equal(svgSeguro(SVG), true);
    assert.equal(svgSeguro("<svg><g/></svg>"), false); // sem viewBox
    assert.equal(svgSeguro(SVG.replace("<g>", "<script>alert(1)</script><g>")), false);
    assert.equal(svgSeguro(SVG.replace("<rect", '<rect onload="x()"')), false);
    assert.equal(svgSeguro(SVG.replace("<rect", '<a href="https://x"><rect')), false);
    assert.equal(svgSeguro(SVG.replace("<rect", "<image")), false);
    assert.equal(svgSeguro(SVG.replace('class="cs-s"', 'style="fill:url(https://x/y)"')), false);
  });
  test("rótulos: até 4 anotações, presos entre 0 e 100; blocos à parte; logo só https ou caminho local", () => {
    const v = vistaCena({
      svg: SVG,
      descricao: "Pedidos chegando de todo lado",
      rotulos: [
        { texto: "um", x: -5, y: 120 },
        { texto: "dois", x: 10, y: 10 },
        { texto: "três", x: 10, y: 10 },
        { texto: "quatro", x: 10, y: 10 },
        { texto: "cinco", x: 10, y: 10 },
        { texto: "time de TI", x: 50, y: 50, tipo: "bloco" },
        { texto: "  ", x: 1, y: 1 },
      ],
      logo: { src: "javascript:alert(1)", alt: "x" },
      estreito: { svg: SVG, proporcao: 4 / 3, rotulos: [{ texto: "um", x: 20, y: 20 }] },
      faixa: { texto: "atendimento da Acme hoje" },
    })!;
    assert.equal(v.rotulos.filter((r) => r.tipo === "anotacao").length, 4);
    assert.equal(v.rotulos.filter((r) => r.tipo === "bloco").length, 1);
    const um = v.rotulos.find((r) => r.texto === "um")!;
    assert.deepEqual([um.x, um.y], [0, 100]);
    assert.equal(v.logo, null);
    assert.equal(v.estreito?.proporcao, 4 / 3);
    assert.equal(v.faixa?.texto, "atendimento da Acme hoje");
    assert.equal(vistaCena({ svg: "<div/>", descricao: "x" }), null);
  });
  test("cartão de cena resolve, entra no resumo e respeita soNaEntrega", () => {
    const k: CartaoConfig = { id: "cena", tipo: "cena", apos: "p1", soNaEntrega: true, titulo: "Hoje", calcular: () => ({ svg: SVG, descricao: "Fila", rotulos: [{ texto: "pedido no zap", x: 10, y: 10 }] }) };
    const pronto = resolverCartao(k, ctx({ p1: "x" }))!;
    assert.equal(pronto.soNaEntrega, true);
    assert.equal(pronto.naEntrega, true);
    assert.match(resumoCartao(pronto), /pedido no zap/);
  });
});

describe("número em texto (faixa ou ?)", () => {
  test("texto no lugar do número, sem contagem; régua pode sair", () => {
    const v = vistaNumero({ valor: 39, texto: "26 a 52", unidade: "dias", regua: false })!;
    assert.equal(v.texto, "26 a 52");
    assert.equal(v.fixo, true);
    assert.equal(v.regua, false);
    assert.equal(vistaNumero({ valor: 0, texto: "  " }), null);
    assert.equal(vistaNumero({ valor: 10 })!.fixo, false);
  });
});

describe("mapa em linha", () => {
  test("N lugares na ordem, vazio com o rótulo do lugar, ligações com rótulo", () => {
    const config: ConfigConversa = {
      ...BASE,
      mapa: {
        lugares: [
          { id: "onde", tipo: "atual", vazio: "Onde vocês estão", texto: "{{empresa}}", quando: { campo: "empresa", definido: true } },
          { id: "pesa", tipo: "problema", vazio: "O que pesa", texto: "fila invisível", quando: { campo: "dor", definido: true }, aresta: "hoje" },
          { id: "resolve", tipo: "destino", vazio: "Como resolve", texto: "Fila única" },
        ],
      },
    };
    const m = montarMapa(config, ctx({ dor: "perda" }), () => undefined)!;
    assert.equal(m.linear, true);
    assert.deepEqual(m.nos.map((n) => [n.id, n.vazio ?? false]), [["onde", true], ["pesa", false], ["resolve", false]]);
    assert.equal(m.arestas[0].rotulo, "hoje");
    assert.deepEqual(m.progresso, { cheios: 2, total: 3 });
    assert.equal(m.completo, false);
  });
});

describe("documento e entrega no fim", () => {
  const cartao: CartaoConfig = { id: "horas", tipo: "numero", apos: "p1", soNaEntrega: true, calcular: () => ({ valor: 10 }) };
  const config: ConfigConversa = {
    ...BASE,
    etapas: [
      { id: "p1", passo: 1, tipo: "texto", texto: "?" },
      { id: "papel", passo: 2, tipo: "escolha", texto: "?", opcoes: [{ valor: "decide", rotulo: "Eu decido" }] },
      { id: "tel", passo: 3, tipo: "texto", input: "tel", texto: "?" },
    ],
    cartoes: [cartao],
    entrega: {
      noFim: true,
      titulo: "Documento",
      botaoPdf: "PDF",
      montagem: { apos: "tel", rotulo: "Montando", pronto: "Pronto" },
      documento: {
        preparadoPara: "Preparado para a {{empresa}}",
        cliente: "{{empresa}}",
        logoCliente: true,
        secoes: [
          { id: "caso", tipo: "texto", titulo: "O caso", texto: "Data {{hoje}}" },
          { id: "conta", tipo: "cartoes", cartoes: ["horas", "nao-existe"] },
          { id: "itens", tipo: "itens", colunas: ["Precisa", "Resolve"], itens: (c) => (c.respostas.p1 ? [{ titulo: "Fila", texto: "C1" }, { titulo: " " }] : []) },
          { id: "quebra", tipo: "itens", itens: () => { throw new Error("x"); } },
          { id: "diretoria", tipo: "texto", novaPagina: true, quando: { campo: "papel", diferente: "decide" }, texto: "Pra diretoria" },
          { id: "vazia", tipo: "texto" },
        ],
      },
    },
  };
  const motor = criarMotor(config);
  test("seções: quando, itens protegidos, cartões só os que existem, nova página", () => {
    const c = ctx({ p1: "x", papel: "levanta", empresa: "Acme" }, { empresa: { dominio: "acme.com", nome: "Acme", site: "https://acme.com", logo: "https://acme.com/i.png", redes: {}, origem: "site" } });
    const d = resolverDocumento(config, c, motor.resolvedor(c), motor.cartoes(c), { hoje: "13/11/2026" })!;
    assert.equal(d.preparadoPara, "Preparado para a Acme");
    assert.deepEqual(d.cliente, { nome: "Acme", logo: { src: "https://acme.com/i.png", alt: "Acme" } });
    assert.deepEqual(d.secoes.map((s) => s.id), ["caso", "conta", "itens", "diretoria"]);
    assert.equal(d.secoes[0].texto, "Data 13/11/2026");
    assert.deepEqual(d.secoes[1].cartoes.map((k) => k.id), ["horas"]);
    assert.equal(d.secoes[2].itens.length, 1);
    assert.equal(d.secoes[3].novaPagina, true);
    const decide = ctx({ p1: "x", papel: "decide" });
    assert.deepEqual(resolverDocumento(config, decide, motor.resolvedor(decide), [], {})!.secoes.map((s) => s.id), ["caso", "itens"]);
  });
  test("entrega no fim: libera só com a conversa completa; montagem depois do telefone", () => {
    assert.equal(etapaDaEntrega(config), null);
    const c = ctx({ p1: "x", papel: "decide", tel: "11999990000" });
    assert.equal(entregaLiberada(config, c, { completa: false }), false);
    assert.equal(entregaLiberada(config, c, { completa: true }), true);
    assert.equal(montagemIniciada(config, ["p1", "papel"]), false);
    assert.equal(montagemIniciada(config, ["p1", "papel", "tel"]), true);
  });
});
