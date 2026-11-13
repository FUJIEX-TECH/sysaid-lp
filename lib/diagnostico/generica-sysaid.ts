// ==========================================================================
// Qualifica v2 · busca genérica (13/11/2026) — DADOS e LEITURAS da SysAid.
// Fonte dos textos: clientes/sysaid/_growth/qualifica-fluxo-generico-conteudo-2026-11-13.md
// (sysaid-growth, 13/11/2026): lista fechada de capacidades C1–C10 (seção 1),
// dor → capacidades (1.2), consequência → need-payoff (1.3, pares um a um),
// falas (seção 2), nomes das dores (seção 4). Dono do conteúdo: sysaid-growth.
//
// Regras que este arquivo garante:
// - o "como a SysAid resolve" e as necessidades só saem de CAPACIDADES;
// - nenhum texto diz que o WhatsApp é canal da SysAid (C1 fala de e-mail, portal e Teams);
// - nada de "até 90%", plano, preço ou "incluso";
// - número só do lead (horas que ele informou) ou com fonte (1,3 chamado por pessoa por mês, HDI/MetricNet 2020).
//
// Só funções puras e imports relativos (roda no teste sem navegador e no servidor).
// ==========================================================================

import { geradoValido } from "../conversa-core/condicoes";
import { formatarNumero } from "../conversa-core/cartoes";
import { formatarHorario, lerHorarios } from "../conversa-core/horarios";
import { listaNatural, partesMultipla } from "../conversa-core/selecao";
import type { Contexto, Opcao, RegrasHorario } from "../conversa-core/tipos";

// --------------------------------------------------------------------------
// 1. Capacidades (lista fechada, seção 1 do arquivo de conteúdo). A coluna
//    "Plano no Brasil" é só do comercial e NÃO entra aqui (nunca vai pro lead).
// --------------------------------------------------------------------------
export type CapacidadeId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" | "C10";
export type Capacidade = { id: CapacidadeId; necessidade: string; curto: string; comoResolve: string };

export const CAPACIDADES: Record<CapacidadeId, Capacidade> = {
  C1: {
    id: "C1",
    necessidade: "Todo pedido numa fila só",
    curto: "Fila única",
    comoResolve:
      "Pedido que chega por e-mail, pelo portal ou pelo Microsoft Teams (na versão em nuvem) vira chamado na mesma fila, mesmo quando quem escreve não tem cadastro. A IA classifica, prioriza e encaminha cada chamado pro grupo certo, e cada um ganha dono, prioridade e histórico.",
  },
  C2: {
    id: "C2",
    necessidade: "Prazo com aviso antes de estourar",
    curto: "Prazo com aviso",
    comoResolve:
      "Cada tipo de chamado tem prazo (SLA) contado em horário útil. Regras de escalonamento avisam o responsável e o gestor antes do vencimento, no tempo que vocês definirem, e podem reatribuir o chamado parado ou subir a prioridade de quem espera demais.",
  },
  C3: {
    id: "C3",
    necessidade: "Os números prontos pra diretoria",
    curto: "Números prontos",
    comoResolve:
      "Painéis e relatórios prontos mostram volume de chamados, cumprimento de prazo, tempo de resolução e de onde vêm os pedidos, sem exportar pra planilha. Dá pra ajustar os relatórios prontos ou criar os seus, e a análise de BI integrada aprofunda os indicadores.",
  },
  C4: {
    id: "C4",
    necessidade: "Mudar um fluxo sem programar",
    curto: "Fluxos sem programar",
    comoResolve:
      "Os fluxos de atendimento, com aprovações e tarefas em sequência, são montados na tela, arrastando etapas, a partir de modelos prontos alinhados à ITIL. Pedido repetido ganha fluxo próprio e anda sozinho até alguém precisar agir.",
  },
  C5: {
    id: "C5",
    necessidade: "O usuário resolve o simples sozinho",
    curto: "Portal e base de conhecimento",
    comoResolve:
      "Portal de autoatendimento com catálogo de serviços: o usuário abre o pedido no lugar certo, acompanha o andamento sem cobrar o técnico e consulta a base de conhecimento. Ao descrever o problema, o portal mostra os artigos que já respondem aquilo.",
  },
  C6: {
    id: "C6",
    necessidade: "IA que tria e responde o que se repete",
    curto: "IA na triagem",
    comoResolve:
      "O SysAid Copilot lê o pedido, classifica, prioriza e encaminha; sugere a resposta ao técnico; e, no portal, no Teams e no e-mail, responde a dúvida comum antes de ela ocupar alguém. Agentes de IA prontos cuidam de tarefas repetitivas.",
  },
  C7: {
    id: "C7",
    necessidade: "Saber qual máquina está com quem",
    curto: "Ativos e inventário",
    comoResolve:
      "A descoberta varre a rede e, com um agente leve nas máquinas, traz hardware e software sozinha e mantém o inventário atualizado. Cada ativo mostra os chamados em que apareceu, e a CMDB liga os itens aos serviços que dependem deles. Licenças e contratos ficam no mesmo lugar.",
  },
  C8: {
    id: "C8",
    necessidade: "Outras áreas atendendo do mesmo jeito",
    curto: "Outras áreas (ESM)",
    comoResolve:
      "RH, Facilities e Financeiro ganham espaços próprios na mesma plataforma, cada um com formulários, prazos, fluxos e portal. O dado de uma área fica restrito a quem tem permissão nela (o técnico de TI não vê o dado do RH), e um pedido como a admissão aciona as áreas em sequência.",
  },
  C9: {
    id: "C9",
    necessidade: "O mesmo problema parar de voltar",
    curto: "Problemas e mudanças",
    comoResolve:
      "Chamados repetidos viram um problema com causa a investigar, ligado aos incidentes que ele gera. Mudanças passam por aprovação, e a CMDB mostra antes o que depende do item, pra a mudança planejada não virar o incidente de amanhã.",
  },
  C10: {
    id: "C10",
    necessidade: "Implantação e suporte em português",
    curto: "Implantação em português",
    comoResolve:
      "A SysAid Brasil acompanha a implantação e dá suporte em português. O escopo da implantação (filas, prazos, fluxos, o que trazer da ferramenta ou da planilha de hoje) é desenhado com o time de vocês.",
  },
};

// --------------------------------------------------------------------------
// 2. Dores (seções 1.2, 2 e 4). As 4 do chip têm cena própria; as de texto
//    livre usam a cena 1 (fila invisível), com os rótulos do lead.
// --------------------------------------------------------------------------
export type DorId = "perda" | "complexidade" | "sla" | "relatorio" | "ativos" | "automacao" | "custo" | "ia" | "esm";
export const DORES_CHIP: DorId[] = ["perda", "complexidade", "sla", "relatorio"];
export const TODAS_DORES: DorId[] = ["perda", "complexidade", "sla", "relatorio", "ativos", "automacao", "custo", "ia", "esm"];

type Dor = {
  chip?: string; // o texto do chip (passo 1)
  nome: string; // nome da dor (mapa, PDF)
  nomeFala: string; // "O nome disso" (passo 3)
  implicacao: string; // implicação de reserva (o Haiku reescreve com as palavras do lead)
  capacidades: CapacidadeId[];
  fragmento: string; // need-payoff: "se {{fragmento}}"
  cena: "perda" | "complexidade" | "sla" | "relatorio";
  rotulosChip: string[]; // rótulos fixos da cena (palavras do chip / briefing)
  situacaoCurta: string; // nó "onde vocês estão" antes do e-mail
};

export const DORES: Record<DorId, Dor> = {
  perda: {
    chip: "Pedido chega por WhatsApp, e-mail e pessoalmente, e se perde",
    nome: "fila invisível",
    nomeFala:
      "A gente chama isso de fila invisível: o pedido existe, mas fora de um lugar onde dá pra contar, priorizar e cobrar prazo. Quem sente primeiro é o usuário, e depois a diretoria.",
    implicacao: "Se o pedido chega por WhatsApp, e-mail e pessoalmente, imagino que parte do dia vai em procurar, repassar e cobrar pedido, e o mais urgente fura a fila.",
    capacidades: ["C1", "C5", "C6"],
    fragmento: "os pedidos caíssem numa fila só, com dono",
    cena: "perda",
    rotulosChip: ["pedido no whatsapp", "pedem pessoalmente", "aqui o pedido se perde"],
    situacaoCurta: "Pedidos sem fila",
  },
  complexidade: {
    chip: "A ferramenta que usamos dá mais trabalho do que resolve",
    nome: "ferramenta que virou projeto",
    nomeFala:
      "A gente chama isso de ferramenta que virou projeto: ela até faz, mas cada ajuste depende de uma pessoa ou de semanas. O comum é o time usar só o básico e resolver o resto por fora.",
    implicacao: "Se qualquer ajuste de fluxo, formulário ou relatório vira projeto, imagino que o time contorna a ferramenta em vez de usar, e o que devia ser automático continua na mão.",
    capacidades: ["C4", "C10", "C3"],
    fragmento: "mudar um fluxo não virasse projeto",
    cena: "complexidade",
    rotulosChip: ["qualquer ajuste vira projeto", "só uma pessoa sabe mexer", "o time resolve por fora"],
    situacaoCurta: "Ferramenta atual",
  },
  sla: {
    chip: "O prazo estoura sem ninguém ver",
    nome: "prazo sem alarme",
    nomeFala:
      "A gente chama isso de prazo sem alarme: o prazo (o SLA) existe, mas ninguém é avisado antes de estourar. O comum é o gestor ficar sabendo pelo usuário, não pelo sistema.",
    implicacao: "Se o prazo estoura sem ninguém ver, imagino que o time descobre o atraso quando o usuário reclama, e o dia vira apagar incêndio.",
    capacidades: ["C2", "C1", "C3"],
    fragmento: "o aviso viesse antes de o prazo estourar",
    cena: "sla",
    rotulosChip: ["o prazo estoura sem ninguém ver", "a gente sabe pelo usuário", "a reclamação sobe"],
    situacaoCurta: "Atendimento de TI hoje",
  },
  relatorio: {
    chip: "Não tenho os números que a diretoria pede",
    nome: "gestão pelo retrovisor",
    nomeFala:
      "A gente chama isso de gestão pelo retrovisor: o número chega tarde, ou só sai depois de exportar e montar na planilha. O comum é a TI defender equipe e orçamento sem dado na mão.",
    implicacao: "Se a diretoria pede números que não saem prontos, imagino que alguém exporta e monta na planilha à mão, e quando fica pronto já passou a hora de agir.",
    capacidades: ["C3", "C1", "C2"],
    fragmento: "os números da diretoria saíssem prontos",
    cena: "relatorio",
    rotulosChip: ["a diretoria pede", "montado na planilha", "o número chega depois"],
    situacaoCurta: "Atendimento de TI hoje",
  },
  ativos: {
    nome: "inventário de memória",
    nomeFala: "A gente chama isso de inventário de memória: quem sabe onde está cada máquina é uma pessoa, não um sistema. O comum é descobrir licença vencida só quando dá problema.",
    implicacao: "Se ninguém sabe ao certo qual máquina está com quem, imagino que cada chamado começa perguntando isso pro usuário, e licença vence sem ninguém ver.",
    capacidades: ["C7", "C1"],
    fragmento: "cada máquina já viesse ligada ao chamado",
    cena: "perda",
    rotulosChip: ["qual máquina é essa", "inventário na cabeça", "licença venceu"],
    situacaoCurta: "Atendimento de TI hoje",
  },
  automacao: {
    nome: "trabalho de esteira",
    nomeFala: "A gente chama isso de trabalho de esteira: tarefa que se repete igual toda semana, feita por quem devia estar no que só ele resolve.",
    implicacao: "Se senha, acesso e cadastro são feitos à mão, imagino que técnico bom passa o dia em pedido que é sempre igual.",
    capacidades: ["C4", "C5", "C6"],
    fragmento: "o pedido repetido andasse sozinho",
    cena: "perda",
    rotulosChip: ["pedido sempre igual", "tudo feito à mão", "fila que não anda"],
    situacaoCurta: "Atendimento de TI hoje",
  },
  custo: {
    nome: "custo por fora",
    nomeFala: "A gente chama isso de custo por fora: o preço de entrada parece certo, mas o que a operação precisa vai entrando à parte.",
    implicacao: "Se a conta só sobe, imagino que cada coisa que a operação precisa vai entrando como item à parte ou plano de cima.",
    capacidades: ["C5", "C6", "C10"],
    fragmento: "a demanda crescesse sem o time ter que crescer junto",
    cena: "perda",
    rotulosChip: ["a conta só sobe", "item à parte", "a demanda cresce"],
    situacaoCurta: "Ferramenta atual",
  },
  ia: {
    nome: "deflexão",
    nomeFala: "O nome técnico é deflexão: resolver antes de virar chamado. Pergunta repetida é o que primeiro sai da fila quando o usuário tem onde se resolver sozinho.",
    implicacao: "Se boa parte do que chega é pergunta repetida, imagino que a fila enche de coisa que não precisava ocupar um técnico.",
    capacidades: ["C6", "C5"],
    fragmento: "a pergunta repetida nem chegasse no técnico",
    cena: "perda",
    rotulosChip: ["pergunta repetida", "a fila enche", "técnico ocupado à toa"],
    situacaoCurta: "Atendimento de TI hoje",
  },
  esm: {
    nome: "ESM",
    nomeFala: "O nome técnico é ESM, gestão de serviços corporativos: levar o jeito de atender da TI pro RH, Facilities e Financeiro.",
    implicacao: "Se outras áreas também recebem pedidos, imagino que RH e Facilities atendem por e-mail e planilha, cada um do seu jeito.",
    capacidades: ["C8", "C5"],
    fragmento: "as outras áreas atendessem do mesmo jeito",
    cena: "perda",
    rotulosChip: ["pedido pro rh", "cada área do seu jeito", "sem prazo nem histórico"],
    situacaoCurta: "Atendimento de TI hoje",
  },
};

export const CHIP_DOR: Record<string, DorId> = Object.fromEntries(DORES_CHIP.map((d) => [DORES[d].chip!, d]));
export const OPCOES_DOR_CHIP: Opcao[] = DORES_CHIP.map((d) => ({ valor: d, rotulo: DORES[d].chip! }));

// --------------------------------------------------------------------------
// 3. Consequência → need-payoff (seção 1.3, pares um a um)
// --------------------------------------------------------------------------
export type ConsequenciaId = "reclama" | "incendio" | "prazo" | "mostrar" | "contratar";
export const CONSEQUENCIAS_IDS: ConsequenciaId[] = ["reclama", "incendio", "prazo", "mostrar", "contratar"];
type Consequencia = {
  triste: string; // chip do passo 3
  feliz: string; // chip do need-payoff (passo 8)
  forma: string; // dentro da frase ("Você disse que quer ...")
  resumo: string; // no resumo de 2 linhas ("..., com ...")
  curta: string; // nó do mapa
  capacidades: CapacidadeId[];
};
export const CONSEQUENCIAS: Record<ConsequenciaId, Consequencia> = {
  reclama: {
    triste: "O usuário reclama com a diretoria",
    feliz: "A diretoria para de ouvir reclamação",
    forma: "a diretoria parar de ouvir reclamação",
    resumo: "com o usuário reclamando com a diretoria",
    curta: "Reclamação na diretoria",
    capacidades: ["C1", "C2", "C5"],
  },
  incendio: {
    triste: "O time vive apagando incêndio",
    feliz: "O time sai do modo incêndio",
    forma: "o time sair do modo incêndio",
    resumo: "com o time vivendo de apagar incêndio",
    curta: "Time apagando incêndio",
    capacidades: ["C2", "C9", "C6"],
  },
  prazo: {
    triste: "Já perdemos prazo que importava",
    feliz: "Nenhum prazo importante escapa",
    forma: "nenhum prazo importante escapar",
    resumo: "com prazo importante já perdido",
    curta: "Prazo importante perdido",
    capacidades: ["C2"],
  },
  mostrar: {
    triste: "Não consigo mostrar o que o time entrega",
    feliz: "Consigo mostrar o que o time entrega",
    forma: "mostrar o que o time entrega",
    resumo: "sem conseguir mostrar o que o time entrega",
    curta: "Entrega do time invisível",
    capacidades: ["C3"],
  },
  contratar: {
    triste: "O time não dá conta sem contratar",
    feliz: "O time dá conta sem contratar",
    forma: "o time dar conta sem contratar",
    resumo: "com o time no limite sem contratar",
    curta: "Time no limite",
    capacidades: ["C5", "C6", "C4"],
  },
};
export const OPCOES_CONSEQUENCIA: Opcao[] = CONSEQUENCIAS_IDS.map((c) => ({ valor: c, rotulo: CONSEQUENCIAS[c].triste }));

// --------------------------------------------------------------------------
// 4. Leituras da conversa (funções puras do contexto). Os ids das etapas são os
//    de config-sysaid-generica.ts; os das gerações, os de /api/qualifica/gerar.
// --------------------------------------------------------------------------
const dado = (ctx: Contexto, id: string, k: string): string | undefined => (geradoValido(ctx, id) ? ctx.gerados?.[id]?.dados?.[k] : undefined);
const ehDor = (v: unknown): v is DorId => typeof v === "string" && (TODAS_DORES as string[]).includes(v);
const ehConsequencia = (v: unknown): v is ConsequenciaId => typeof v === "string" && (CONSEQUENCIAS_IDS as string[]).includes(v);

// a dor do passo 1: chip, Jev no texto livre, ou a lista "pra eu não chutar"
export function dorP1(ctx: Contexto): DorId | null {
  const r = ctx.respostas;
  const chip = CHIP_DOR[(r.situacao_texto ?? "").trim()];
  if (chip) return chip;
  if (ehDor(r.dor_lista)) return r.dor_lista;
  const jev = dado(ctx, "implicacao", "dor");
  return ehDor(jev) ? jev : null;
}

// a dor "da vez": a do passo 1, ou a relida depois do "Não é bem isso"
export function dorAtual(ctx: Contexto): DorId | null {
  const r = ctx.respostas;
  if (r.implicacao === "nao") {
    if (ehDor(r.dor_lista2)) return r.dor_lista2;
    const jev = dado(ctx, "releitura", "dor");
    if (ehDor(jev)) return jev;
    return null;
  }
  return dorP1(ctx);
}

// todas as dores, na ordem: a da vez, as do "Tem mais", a que o Jev leu no comentário
export function dores(ctx: Contexto): DorId[] {
  const a = dorAtual(ctx);
  const mais = partesMultipla(ctx.respostas.dores_mais).filter(ehDor);
  const comentario = dado(ctx, "comentario", "outra_dor");
  const lista = [a, ...mais, ehDor(comentario) ? comentario : null].filter((x): x is DorId => !!x);
  return [...new Set(lista)];
}

// a dor de mais valor (o Jev escolhe quando há mais de uma; sem Jev, a da vez)
export function dorPrincipal(ctx: Contexto): DorId | null {
  const l = dores(ctx);
  if (l.length > 1) {
    const p = dado(ctx, "principal", "principal");
    if (ehDor(p) && l.includes(p)) return p;
  }
  return l[0] ?? null;
}

// a consequência que o Jev leu no texto livre (pula o passo 3)
export function consequenciaLida(ctx: Contexto): ConsequenciaId | null {
  for (const id of ["implicacao", "comentario", "releitura"]) {
    const c = dado(ctx, id, "consequencia");
    if (ehConsequencia(c)) return c;
  }
  return null;
}

export function consequencias(ctx: Contexto): ConsequenciaId[] {
  const marcadas = partesMultipla(ctx.respostas.consequencias).filter(ehConsequencia);
  if (marcadas.length) return marcadas;
  const lida = consequenciaLida(ctx);
  return lida ? [lida] : [];
}
export function consequenciaTexto(ctx: Contexto): string {
  return partesMultipla(ctx.respostas.consequencias)
    .filter((p) => !ehConsequencia(p))
    .join(" ");
}

export function payoffs(ctx: Contexto): ConsequenciaId[] {
  return partesMultipla(ctx.respostas.payoff).filter(ehConsequencia);
}
export function payoffTexto(ctx: Contexto): string {
  return partesMultipla(ctx.respostas.payoff)
    .filter((p) => !ehConsequencia(p))
    .join(" ");
}

// tem ferramenta? (chip 2 = sim; texto livre = Jev; o resto não se sabe)
export function temFerramenta(ctx: Contexto): "sim" | "nao" | "" {
  if (dorP1(ctx) === "complexidade" && CHIP_DOR[(ctx.respostas.situacao_texto ?? "").trim()]) return "sim";
  const s = dado(ctx, "implicacao", "situacao");
  if (s === "tem_ferramenta" || s === "cliente") return "sim";
  if (s === "sem_fila") return "nao";
  return "";
}
export const FERRAMENTAS_CHIP: Opcao[] = [
  { valor: "glpi", rotulo: "GLPI" },
  { valor: "movidesk", rotulo: "Movidesk" },
  { valor: "jira", rotulo: "Jira" },
  { valor: "topdesk", rotulo: "TOPdesk" },
  { valor: "outra", rotulo: "Outra" },
];
export function ferramentaNome(ctx: Contexto): string {
  const r = ctx.respostas;
  if (r.ferramenta === "outra") return (r.ferramenta_outra ?? "").trim();
  const chip = FERRAMENTAS_CHIP.find((f) => f.valor === r.ferramenta);
  if (chip) return chip.rotulo;
  return dado(ctx, "implicacao", "ferramenta_nome") ?? "";
}
// o passo da ferramenta só aparece quando ele disse que tem e não disse qual
export function perguntaFerramenta(ctx: Contexto): boolean {
  return temFerramenta(ctx) === "sim" && !dado(ctx, "implicacao", "ferramenta_nome");
}

// --------------------------------------------------------------------------
// 5. A conta (seção 2, passo 7): horas por semana que o lead informa × 52 ÷ 8 h;
//    no relatório, horas por mês × 12 ÷ 8 h. Volume: pessoas × 1,3 (HDI/MetricNet).
//    Nunca minuto por chamado.
// --------------------------------------------------------------------------
export const TEMPO_SEMANA: Opcao[] = [
  { valor: "ate4", rotulo: "Até 4 horas" },
  { valor: "4a8", rotulo: "De 4 a 8 horas" },
  { valor: "8a16", rotulo: "1 a 2 dias" },
  { valor: "mais16", rotulo: "Mais que isso" },
  { valor: "nm", rotulo: "Não dá pra medir" },
];
export const TEMPO_MES: Opcao[] = [
  { valor: "m4", rotulo: "Até meio dia" },
  { valor: "m8", rotulo: "Um dia" },
  { valor: "m16", rotulo: "Dois dias ou mais" },
  { valor: "nm", rotulo: "Nem conseguimos montar" },
];
// horas que a resposta diz (min, max; max null = sem teto; "até" = só o teto, sem inventar piso)
const HORAS: Record<string, { min: number | null; max: number | null; por: "semana" | "mes" }> = {
  ate4: { min: null, max: 4, por: "semana" },
  "4a8": { min: 4, max: 8, por: "semana" },
  "8a16": { min: 8, max: 16, por: "semana" },
  mais16: { min: 16, max: null, por: "semana" },
  m4: { min: null, max: 4, por: "mes" },
  m8: { min: 8, max: 8, por: "mes" },
  m16: { min: 16, max: null, por: "mes" },
};
export const CHAMADOS_POR_PESSOA = 1.3; // HDI SupportWorld, Jeff Rumburg (MetricNet), 30/12/2020
const PESSOAS: Record<string, { min: number | null; max: number | null }> = {
  "50": { min: null, max: 50 },
  "200": { min: 51, max: 200 },
  "1000": { min: 201, max: 1000 },
  mais: { min: 1000, max: null },
};
const TECNICOS: Record<string, { min: number; max: number | null }> = { "1-2": { min: 1, max: 2 }, "3-10": { min: 3, max: 10 }, "+10": { min: 10, max: null } };

const n0 = (n: number) => formatarNumero(Math.round(n));
function faixa(min: number | null, max: number | null, sufixo = ""): string {
  if (min === null && max !== null) return `até ${n0(max)}${sufixo}`;
  if (max === null && min !== null) return `mais de ${n0(min)}${sufixo}`;
  if (min !== null && max !== null) return min === max ? `${n0(min)}${sufixo}` : `${n0(min)} a ${n0(max)}${sufixo}`;
  return "";
}
const vezes = (v: number | null, k: number) => (v === null ? null : v * k);

export type Conta = {
  medido: boolean;
  por: "semana" | "mes";
  horasConta: string; // "4 a 8 h por semana", pra conta aberta
  diasTexto: string; // "26 a 52", "até 26", "mais de 104"
  diasValor: number;
  hMesTexto: string; // "17 a 35"
  horasTexto: string; // o que ele disse: "de 4 a 8 horas por semana"
  semanaTime?: string; // "5% a 20%"
  volume?: string; // "66 a 260"
};

export function conta(ctx: Contexto): Conta | null {
  const r = ctx.respostas;
  if (!r.tempo) return null;
  const vol = PESSOAS[r.usuarios ?? ""];
  const volume = vol ? faixa(vezes(vol.min === null ? null : vol.min, CHAMADOS_POR_PESSOA), vezes(vol.max, CHAMADOS_POR_PESSOA)) : undefined;
  if (r.tempo === "nm") return { medido: false, por: "semana", horasConta: "", diasTexto: "?", diasValor: 0, hMesTexto: "", horasTexto: "", volume };
  const h = HORAS[r.tempo];
  if (!h) return null;
  const k = h.por === "semana" ? 52 / 8 : 12 / 8;
  const kMes = h.por === "semana" ? 4.33 : 1;
  const dMin = vezes(h.min, k);
  const dMax = vezes(h.max, k);
  const opcao = (h.por === "semana" ? TEMPO_SEMANA : TEMPO_MES).find((o) => o.valor === r.tempo)?.rotulo.toLowerCase() ?? "";
  // % da semana do time: horas por semana ÷ (técnicos × 40 h); só aparece se o teto passa de 10%
  let semanaTime: string | undefined;
  const t = TECNICOS[r.tecnicos ?? ""];
  const hsMin = h.por === "semana" ? h.min : vezes(h.min, 1 / 4.33);
  const hsMax = h.por === "semana" ? h.max : vezes(h.max, 1 / 4.33);
  if (t) {
    const b = hsMax !== null ? hsMax / (t.min * 40) : null;
    const a = hsMin !== null && t.max !== null ? hsMin / (t.max * 40) : null;
    const pct = (x: number) => `${Math.max(1, Math.round(x * 100))}%`;
    if (b !== null && b > 0.1) semanaTime = a !== null ? `${pct(a)} a ${pct(b)}` : `até ${pct(b)}`;
    else if (b === null && a !== null && a > 0.1) semanaTime = `mais de ${pct(a)}`;
  }
  // "Dois dias ou mais" (por mês) é "24 ou mais", não "mais de 24"
  const ouMais = h.por === "mes" && h.max === null;
  return {
    medido: true,
    por: h.por,
    horasConta: `${faixa(h.min, h.max)} h por ${h.por === "semana" ? "semana" : "mês"}`,
    diasTexto: ouMais && dMin !== null ? `${n0(dMin)} ou mais` : faixa(dMin, dMax),
    diasValor: dMax ?? dMin ?? 0,
    hMesTexto: faixa(vezes(h.min, kMes), vezes(h.max, kMes)),
    horasTexto: h.por === "semana" ? `${opcao} por semana` : `${opcao} por mês`,
    semanaTime,
    volume,
  };
}

// "entre 66 e 260", "até 65", "mais de 1.300"
export function fraseVolume(volume: string | undefined): string {
  if (!volume) return "";
  const m = /^(\S+) a (\S+)$/.exec(volume);
  return m ? `algo entre ${m[1]} e ${m[2]}` : volume;
}

// --------------------------------------------------------------------------
// 6. Frases montadas por código (need-payoff, revelação, resumo)
// --------------------------------------------------------------------------
const primeiro = (n?: string) => (n ?? "").trim().split(/\s+/)[0] ?? "";

// "Ana, se os pedidos caíssem numa fila só, com dono, e o aviso viesse antes de o prazo estourar, o que isso mudaria pra você?"
export function perguntaPayoff(ctx: Contexto): string {
  const principal = dorPrincipal(ctx);
  const ordem = [principal, ...dores(ctx).filter((d) => d !== principal)].filter((d): d is DorId => !!d).slice(0, 3);
  const frags = ordem.map((d) => DORES[d].fragmento);
  const nome = primeiro(ctx.respostas.nome);
  // fragmento com vírgula dentro ("numa fila só, com dono") pede vírgula antes do "e"
  const juntos = frags.length > 1 && frags.some((f) => f.includes(",")) ? `${frags.slice(0, -1).join(", ")}, e ${frags[frags.length - 1]}` : listaNatural(frags);
  const se = frags.length ? `se ${juntos}` : "se o atendimento funcionasse do jeito que você precisa";
  const abre = nome ? `${nome}, ${se}` : se.charAt(0).toUpperCase() + se.slice(1);
  return `${abre}, o que isso mudaria pra você? Pode marcar mais de um.`;
}

// chips do need-payoff na ordem das consequências que ele marcou primeiro
export function opcoesPayoff(ctx: Contexto): Opcao[] {
  const marcadas = consequencias(ctx);
  const ordem = [...marcadas, ...CONSEQUENCIAS_IDS.filter((c) => !marcadas.includes(c))];
  return ordem.map((c) => ({ valor: c, rotulo: CONSEQUENCIAS[c].feliz }));
}

// o que ele quer, nas palavras dele (até 2 itens; texto livre entre aspas se tiver até 80 caracteres)
export function querTexto(ctx: Contexto): { formas: string[]; citacao: string } {
  const formas = payoffs(ctx).map((c) => CONSEQUENCIAS[c].forma);
  const t = payoffTexto(ctx);
  const citacao = t && t.length <= 80 ? t : "";
  return { formas: formas.slice(0, citacao ? 1 : 2), citacao };
}

export function revelacao(ctx: Contexto, empresa: string): string {
  const { formas, citacao } = querTexto(ctx);
  const partes: string[] = [];
  if (formas.length) partes.push(`Você disse que quer ${listaNatural(formas)}.`);
  if (citacao) partes.push(`Você disse: “${citacao}”.`);
  const quem = empresa ? `da ${empresa}` : "de vocês";
  partes.push(`A SysAid atende o que vocês precisam. O que for bem específico do cenário ${quem}, o nosso especialista avalia com você na reunião e, se precisar, pede uma customização.`);
  return partes.join(" ");
}

export function resumoDuasLinhas(ctx: Contexto, empresa: string): string {
  const d = dorPrincipal(ctx);
  const c = conta(ctx);
  const cs = consequencias(ctx);
  const quem = empresa ? `a ${empresa}` : "vocês";
  let l1 = `Hoje ${quem} tem ${d ? DORES[d].nome : "um atendimento sem controle"}`;
  if (c?.medido) l1 += c.por === "semana" ? `, e isso come ${c.horasTexto.replace(/ por semana$/, "")} do time por semana` : `, e montar os números leva ${c.horasTexto.replace(/ por mês$/, "")} todo mês`;
  if (cs.length) l1 += `, ${CONSEQUENCIAS[cs[0]].resumo}`;
  l1 += ".";
  const { formas, citacao } = querTexto(ctx);
  const quer = [...formas, ...(citacao ? [`“${citacao}”`] : [])];
  const l2 = quer.length ? ` O que vocês querem é ${listaNatural(quer)}.` : "";
  return (l1 + l2).replace(/^Hoje vocês tem/, "Hoje vocês têm");
}

// --------------------------------------------------------------------------
// 7. Capacidades do caso (PDF): dor principal → outras dores → need-payoffs,
//    na ordem da tabela 1.2, no máximo 5, sem repetir
// --------------------------------------------------------------------------
export function capacidadesDoCaso(ctx: Contexto, maximo = 5): { cap: Capacidade; motivos: string[] }[] {
  const principal = dorPrincipal(ctx);
  const ds = [principal, ...dores(ctx).filter((d) => d !== principal)].filter((d): d is DorId => !!d);
  const mapa = new Map<CapacidadeId, string[]>();
  const somar = (ids: CapacidadeId[], motivo: string) => {
    for (const id of ids) {
      const m = mapa.get(id);
      if (m) {
        if (!m.includes(motivo)) m.push(motivo);
      } else mapa.set(id, [motivo]);
    }
  };
  for (const d of ds) somar(DORES[d].capacidades, DORES[d].nome);
  for (const p of payoffs(ctx)) somar(CONSEQUENCIAS[p].capacidades, CONSEQUENCIAS[p].forma);
  if (!mapa.size) somar(["C1", "C2", "C3"], "o atendimento de hoje");
  return [...mapa.entries()].slice(0, maximo).map(([id, motivos]) => ({ cap: CAPACIDADES[id], motivos }));
}

// --------------------------------------------------------------------------
// 8. Horários (passo 12): dias úteis, das 9h às 18h, a partir do próximo dia
//    útil, sem feriado nacional. As mesmas regras validam no servidor.
// --------------------------------------------------------------------------
export const FERIADOS_BR = [
  // 2026
  "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25",
  // 2027
  "2027-01-01", "2027-02-08", "2027-02-09", "2027-03-26", "2027-04-21", "2027-05-01", "2027-05-27", "2027-09-07", "2027-10-12", "2027-11-02", "2027-11-15", "2027-11-20", "2027-12-25",
];
export const REGRAS_HORARIO: RegrasHorario = {
  quantidade: 2,
  dias: 10,
  diasUteis: true,
  janela: { inicio: "09:00", fim: "18:00" },
  intervaloMin: 30,
  aPartirDe: "proximoDiaUtil",
  feriados: FERIADOS_BR,
  fuso: "America/Sao_Paulo",
};

export type Pedido = "reuniao" | "orcamento" | "whatsapp" | null;
export function pedido(r: Contexto["respostas"]): Pedido {
  if (r.reuniao === "whatsapp" || r.reuniao_orcamento === "whatsapp") return "whatsapp";
  if (r.reuniao === "orcamento") return r.reuniao_orcamento ? "orcamento" : null;
  if (r.reuniao) return "reuniao";
  return null;
}
export function horariosPedidos(r: Contexto["respostas"]): string {
  const v = r.reuniao === "orcamento" ? r.reuniao_orcamento : r.reuniao;
  const l = lerHorarios(v).filter((h) => h.data && h.hora);
  return l.length ? l.map((h) => formatarHorario(h)).join(" ou ") : "";
}

// --------------------------------------------------------------------------
// 9. Tudo o que foi lido, pra ficha do comercial e pro /admin
// --------------------------------------------------------------------------
export function derivados(ctx: Contexto): Record<string, unknown> {
  const c = conta(ctx);
  const p = dorPrincipal(ctx);
  return {
    dor_p1: dorP1(ctx),
    dor_principal: p,
    dor_principal_nome: p ? DORES[p].nome : null,
    dores: dores(ctx).map((d) => ({ id: d, nome: DORES[d].nome })),
    consequencias: consequencias(ctx).map((x) => CONSEQUENCIAS[x].triste),
    consequencia_texto: consequenciaTexto(ctx) || null,
    consequencia_lida_pelo_jev: consequenciaLida(ctx),
    payoffs: payoffs(ctx).map((x) => CONSEQUENCIAS[x].feliz),
    payoff_texto: payoffTexto(ctx) || null,
    tem_ferramenta: temFerramenta(ctx) || null,
    ferramenta: ferramentaNome(ctx) || null,
    conta: c,
    capacidades: capacidadesDoCaso(ctx).map((x) => `${x.cap.id} ${x.cap.necessidade}`),
    pedido: pedido(ctx.respostas),
    horarios: horariosPedidos(ctx.respostas) || null,
    papel: ctx.respostas.papel ?? null,
    cargo: ctx.respostas.cargo && ctx.respostas.cargo !== "pulou" ? ctx.respostas.cargo : null,
  };
}

// o que vai em `notes` no lead parcial (nasce no e-mail; nunca vai pro RD Station)
export function notasGenerica(ctx: Contexto): string {
  const r = ctx.respostas;
  const linhas: string[] = ["Qualifica v2 · busca genérica"];
  if (r.situacao_texto) linhas.push(`Problema: ${r.situacao_texto}`);
  const p = dorPrincipal(ctx);
  if (p) linhas.push(`Dor principal: ${DORES[p].nome}`);
  const outras = dores(ctx).filter((d) => d !== p);
  if (outras.length) linhas.push(`Outras dores: ${outras.map((d) => DORES[d].nome).join(", ")}`);
  if (r.implicacao && !["sim", "mais", "nao"].includes(r.implicacao)) linhas.push(`Sobre a implicação: ${r.implicacao}`);
  const cs = consequencias(ctx).map((c) => CONSEQUENCIAS[c].triste);
  if (cs.length) linhas.push(`Consequências: ${cs.join("; ")}`);
  const ct = consequenciaTexto(ctx);
  if (ct) linhas.push(`Consequência (texto): ${ct}`);
  return linhas.join("\n").slice(0, 1900);
}
