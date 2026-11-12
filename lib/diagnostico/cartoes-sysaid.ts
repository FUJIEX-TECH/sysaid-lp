// ==========================================================================
// Qualifica v2 — cartões visuais da SysAid (CONFIGURAÇÃO, 12/11/2026).
//
// >>> PROVISÓRIO: 3 cartões de demonstração ligados nos passos atuais, só pro
// >>> Fernando ver o mecanismo funcionando. O roteiro final (quais visuais,
// >>> em que passo, com que texto e com que premissas) é do sysaid-growth, em
// >>> paralelo. As PREMISSAS dos números (chamados por pessoa, minutos perdidos)
// >>> são estimativas de demonstração e precisam de validação antes de ir ao ar.
//
// Cada cartão é declarado aqui e calculado por uma função PURA (contexto →
// dados), testada em cartoes-sysaid.test.ts. O núcleo (lib/conversa-core)
// valida, formata e desenha. Este arquivo não importa nada de React nem do
// resto da LP, pra rodar no teste sem navegador.
// ==========================================================================

import { arredondar, formatarNumero } from "../conversa-core/cartoes";
import type { CartaoConfig, Condicao, Contexto, DadosAntesDepois, DadosMedidor, DadosNumero, PassoFluxo } from "../conversa-core/tipos";

const NAO_SUPORTE: Condicao = { campo: "cliente_tipo", diferente: "suporte" };

// a situação de quem veio por comparativa e escreveu texto livre conta como "troca"
export function situacaoDe(ctx: Contexto): "sem" | "troca" | "cliente" | "pesquisa" | null {
  const r = ctx.respostas;
  if (r.ferramenta === "planilha") return "sem";
  const s = r.situacao;
  if (s === "sem" || s === "troca" || s === "cliente" || s === "pesquisa") return s;
  if (ctx.variaveis.concorrente && (r.situacao_texto ?? "").trim()) return "troca";
  return null;
}

// --------------------------------------------------------------------------
// 1. Medidor: onde a TI está hoje (depois do aprofundamento)
// --------------------------------------------------------------------------
export const NIVEIS_SYSAID: DadosMedidor["niveis"] = [
  { rotulo: "Reativo", texto: "O pedido chega por qualquer canal e depende de alguém lembrar." },
  { rotulo: "Registrado", texto: "Todo pedido vira chamado, mas sem prazo nem prioridade clara." },
  { rotulo: "Controlado", texto: "Fila única, SLA por tipo de chamado e alguém de olho no prazo." },
  { rotulo: "Automatizado", texto: "Aprovações, rotinas e autoatendimento rodam sozinhos." },
  { rotulo: "Com IA", texto: "A IA resolve o simples e sugere a resposta no resto." },
];

export function nivelSysaid(ctx: Contexto): DadosMedidor | null {
  const s = situacaoDe(ctx);
  const dor = ctx.respostas.dor;
  if (!s || s === "pesquisa") return null; // quem só pesquisa não tem "a sua TI" pra situar
  let atual: number;
  if (s === "sem") atual = 1;
  else if (s === "cliente") atual = 3;
  else atual = dor === "sla" || dor === "perda" || !dor || dor === "vaga" ? 2 : 3;
  let alvo = dor === "ia" ? 5 : Math.min(atual + 2, 4);
  if (alvo <= atual) alvo = Math.min(5, atual + 1);
  return { niveis: NIVEIS_SYSAID, atual, alvo, rotuloAtual: "hoje", rotuloAlvo: "dá pra chegar" };
}

// --------------------------------------------------------------------------
// 2. Número grande: horas por mês perdidas com chamado fora de controle
//    (depois do nº de técnicos). PREMISSAS PROVISÓRIAS:
//    - pessoas atendidas: o meio de cada faixa da resposta
//    - ~1 chamado por pessoa atendida por mês
//    - minutos perdidos por chamado (procurar, cobrar status, refazer):
//      sem ferramenta 15, ferramenta que não dá conta 8, já é SysAid 4
//    - faixa: de 70% a 140% do valor central (a conta é estimativa)
// --------------------------------------------------------------------------
export const PESSOAS_MEIO: Record<string, number> = { "50": 35, "200": 125, "1000": 600, mais: 2000 };
export const CHAMADOS_POR_PESSOA = 1;
export const MINUTOS_PERDIDOS: Record<"sem" | "troca" | "cliente" | "pesquisa", number> = { sem: 15, troca: 8, cliente: 4, pesquisa: 8 };
const HORAS_MES_TECNICO = 160;

export function horasPerdidasSysaid(ctx: Contexto): DadosNumero | null {
  const pessoas = PESSOAS_MEIO[ctx.respostas.usuarios ?? ""];
  if (!pessoas || ctx.respostas.tecnicos === undefined) return null;
  const s = situacaoDe(ctx) ?? "troca";
  const minutos = MINUTOS_PERDIDOS[s];
  const chamados = pessoas * CHAMADOS_POR_PESSOA;
  const bruto = (chamados * minutos) / 60;
  const valor = Math.max(1, arredondar(bruto));
  const faixa: [number, number] = [Math.max(1, arredondar(bruto * 0.7)), Math.max(2, arredondar(bruto * 1.4))];
  const tecnico = bruto / HORAS_MES_TECNICO;
  const equivalente =
    tecnico >= 0.1 ? ` Dá mais ou menos ${formatarNumero(tecnico, { casas: tecnico < 10 ? 1 : 0 })} ${tecnico >= 1.95 ? "técnicos" : "técnico"} em tempo integral.` : "";
  return {
    valor,
    faixa,
    unidade: "h/mês",
    conta: `≈ ${formatarNumero(chamados)} chamados por mês × ${minutos} min perdidos em cada (procurar, cobrar, refazer).${equivalente}`,
  };
}

// --------------------------------------------------------------------------
// 3. Antes / depois: o caminho do chamado hoje e com a SysAid (depois do prazo).
//    O "depois" usa o que a LP já diz da plataforma (fila única, SLA com alerta,
//    portal, automação, painel, Copilot), sem número de resultado.
// --------------------------------------------------------------------------
const p = (texto: string, marca = false): PassoFluxo => ({ texto, marca });

export const ANTES_SEM: PassoFluxo[] = [p("Pedido chega por WhatsApp, e-mail ou no corredor"), p("Alguém anota numa planilha, quando lembra", true), p("Ninguém sabe o prazo de cada um", true), p("O usuário cobra e a TI apaga incêndio")];

const ANTES_POR_DOR: Record<string, PassoFluxo[]> = {
  sla: [p("Chamado entra na ferramenta"), p("Fila sem prioridade clara"), p("SLA estoura sem alerta", true), p("O gestor descobre depois", true)],
  perda: [p("Pedido chega por vários canais"), p("Parte nunca vira chamado", true), p("Some no meio do caminho", true), p("O usuário abre de novo")],
  relatorio: [p("Chamados ficam na ferramenta"), p("O gestor pede os números"), p("Alguém exporta e monta planilha", true), p("O relatório chega atrasado", true)],
  automacao: [p("Pedido repetido chega todo dia"), p("Técnico faz tudo na mão", true), p("Aprovação corre por e-mail", true), p("A fila cresce no fim do mês")],
  ativos: [p("Máquinas e licenças numa planilha"), p("Ninguém sabe quem está com o quê", true), p("Licença vence sem aviso", true)],
  ia: [p("A mesma dúvida chega todo dia"), p("Técnico responde a mesma coisa", true), p("O simples ocupa a fila", true)],
  custo: [p("Cada técnico novo pesa na conta", true), p("Módulos cobrados à parte", true), p("A conta sobe e a operação não melhora")],
  esm: [p("RH e facilities recebem por e-mail e WhatsApp"), p("Cada área com um controle", true), p("Sem prazo nem histórico", true)],
};

const DEPOIS_POR_DOR: Record<string, PassoFluxo[]> = {
  sla: [p("Portal, e-mail e Teams numa fila só"), p("Prioridade e SLA definidos na entrada"), p("Alerta antes de estourar e escalonamento automático", true), p("Painel do gestor em tempo real")],
  perda: [p("Todo pedido vira chamado, de qualquer canal", true), p("Fila única, com responsável"), p("O usuário acompanha pelo portal")],
  relatorio: [p("Tudo registrado na mesma fila"), p("Painel de volume, SLA e carga por técnico", true), p("O gestor vê sem pedir planilha")],
  automacao: [p("Catálogo de serviços no portal"), p("Aprovações e rotinas em fluxo automático", true), p("Técnico fica com o que precisa dele")],
  ativos: [p("Inventário de máquinas e licenças", true), p("Cada chamado ligado ao equipamento"), p("Aviso antes de a licença vencer")],
  ia: [p("Portal com respostas da base de conhecimento"), p("A IA resolve o simples sozinha", true), p("Técnico recebe a resposta sugerida")],
  custo: [p("Chamados, ativos e automação na mesma plataforma", true), p("A IA resolve o simples antes de virar chamado"), p("Painel com volume e tempo por tipo de chamado")],
  esm: [p("Cada área com o seu catálogo no mesmo portal", true), p("Prazo e histórico em todo pedido"), p("Fluxos que cruzam áreas, como admissão")],
};

export function antesDepoisSysaid(ctx: Contexto): DadosAntesDepois | null {
  const s = situacaoDe(ctx);
  if (!s || s === "cliente") return null; // cliente já está no "depois": o cartão não faz sentido
  const dor = ctx.respostas.dor && ctx.respostas.dor !== "vaga" ? ctx.respostas.dor : s === "sem" ? "perda" : "sla";
  const antes = s === "sem" && (dor === "perda" || dor === "sla") ? ANTES_SEM : ANTES_POR_DOR[dor] ?? ANTES_POR_DOR.sla;
  const depois = DEPOIS_POR_DOR[dor] ?? DEPOIS_POR_DOR.sla;
  return { antes: { titulo: "Hoje", passos: antes }, depois: { titulo: "Com a SysAid", passos: depois } };
}

// --------------------------------------------------------------------------
// A declaração (o que entra, onde e com que texto). PROVISÓRIO: ver topo.
// --------------------------------------------------------------------------
export const CARTOES_SYSAID: CartaoConfig[] = [
  {
    id: "nivel",
    tipo: "medidor",
    apos: "aprof",
    quando: NAO_SUPORTE,
    fala: "Pelo que você contou, dá pra situar a sua TI nesta escada:",
    rotulo: "Nível de maturidade",
    titulo: "Onde a sua central de TI está hoje",
    legenda: "Leitura a partir das suas respostas. O mapa no fim mostra o caminho de um degrau pro outro.",
    calcular: nivelSysaid,
  },
  {
    id: "horas",
    tipo: "numero",
    apos: "tecnicos",
    quando: NAO_SUPORTE,
    fala: "Fiz uma conta rápida com o que você me contou{{saudacao}}:",
    rotulo: "Estimativa",
    titulo: "Horas que a equipe perde por mês com chamado fora de controle",
    legenda: "Conta com premissas de mercado: cerca de 1 chamado por pessoa atendida por mês. A faixa mostra de quanto a quanto isso costuma variar.",
    calcular: horasPerdidasSysaid,
  },
  {
    id: "antes-depois",
    tipo: "antesDepois",
    apos: "prazo",
    quando: NAO_SUPORTE,
    fala: "Olhando o caminho de um chamado, a diferença fica assim:",
    rotulo: "Antes e depois",
    titulo: "Como o chamado anda hoje, e como passa a andar",
    calcular: antesDepoisSysaid,
  },
];
