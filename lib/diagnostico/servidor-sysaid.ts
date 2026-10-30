// ==========================================================================
// Diagnóstico ITSM — lado do SERVIDOR da configuração da SysAid (parte 2).
// Só importar de rotas de API. Aqui moram: limites de custo, prompts da LLM
// (palpite da dor, pergunta de aprofundamento) e perguntas do Jev (rótulo,
// coerência, dor no texto livre). Dono do conteúdo: sysaid-growth (os prompts
// abaixo são a 1ª versão do Severino, 30/10/2026; revisar a copy).
//
// Três camadas: genérico = lib/conversa-core/servidor (clientes, cache, tetos);
// configurável = este arquivo (modelo, tetos, prompts, rótulos);
// sob medida = as rotas app/api/diagnostico/{gerar,rotular}.
// ==========================================================================

import { z } from "zod";
import type { JevServidorConfig, LLMConfig, PerguntaJev } from "@/lib/conversa-core";

// Haiku 5.5: US$ 0,10 / 0,50 por milhão (entrada / saída) até 100 K tokens de prompt
export const LLM_SYSAID: LLMConfig = {
  habilitado: process.env.DIAG_LLM !== "0",
  modelo: "claude-haiku-5-5",
  timeoutMs: 6000, // gera enquanto a pessoa digita (Haiku levou 1,8 a 3 s em 30/10); o chat espera no máximo `esperaMs` no Enter
  maxTokens: 400,
  precoPorMilhao: { entrada: 0.1, saida: 0.5 },
  cache: { ttlMs: 30 * 60 * 1000, maximo: 500 },
  // plano: < R$ 40/mês a 500 preenchimentos. 1 chamada por preenchimento, com folga pra correções
  tetos: { chamadasPorSessao: 4, chamadasPorHora: 300, usdPorHora: 0.5 },
};

// no envio final. O plano pedia 800 ms, mas em 30/10/2026 o Jev respondia em
// ~830 ms (e dava 529 "overloaded" em metade das chamadas, com retry no cliente):
// a 800 o rótulo quase nunca chegava. Ficou 1200 ms porque a pessoa já está
// vendo "enviando"; o chat (config-sysaid.ts, jev.timeoutMs) espera até 1500.
export const JEV_SYSAID: JevServidorConfig = {
  habilitado: process.env.DIAG_JEV !== "0",
  url: "https://api.typesafe.ai/v1/systemone",
  modelo: "jev-latest",
  timeoutMs: 1200,
  tetos: { chamadasPorSessao: 8, chamadasPorHora: 600 },
};

// enquanto digita (palpite): roda em paralelo com a digitação, então pode esperar
// mais (o Jev respondeu em ~830 ms em 30/10/2026; o chat espera só `esperaMs` no Enter)
export const JEV_SYSAID_GERAR: JevServidorConfig = { ...JEV_SYSAID, timeoutMs: 1800 };

// --------------------------------------------------------------------------
// Dores do catálogo (os mesmos valores de config-sysaid.ts) com o que cada uma
// significa, pro Jev escolher a partir do texto livre
// --------------------------------------------------------------------------
export const DORES_JEV: Record<string, string> = {
  sla: "SLA ou prazo de atendimento estoura e ninguém é avisado antes; falta alerta ou escalonamento",
  perda: "chamados ou pedidos se perdem (WhatsApp, e-mail, corredor), sem fila clara ou rastreio",
  relatorio: "falta relatório, indicador ou visão pra gestão; não consegue mostrar números",
  automacao: "trabalho manual e repetitivo; falta automação de aprovação, onboarding, reset de senha",
  ativos: "não sabe quem está com qual equipamento, licenças, inventário, histórico de máquinas",
  ia: "quer usar IA no atendimento: responder dúvidas, classificar, resolver o simples sozinha",
  custo: "preço, licença, módulos cobrados à parte, dólar; a ferramenta atual está cara",
  esm: "quer atender outros departamentos além da TI: RH, facilities, jurídico, financeiro",
  vaga: "o texto não descreve um problema claro de atendimento de TI ou não dá pra saber",
};

export const ROTULOS_JEV: Record<string, string> = {
  cotando: "a pessoa só quer preço ou orçamento pra comparar; não descreve problema nem intenção de mudar",
  fora: "não é empresa cliente em potencial: estudante, curiosidade, concorrente, fornecedor vendendo algo, ou TI de 1 pessoa sem equipe",
  cliente: "já usa SysAid hoje (menciona ser cliente, pedir suporte ou evoluir o que já tem)",
  nenhum: "nada acima: lead comum, com problema e intenção de avaliar",
};

export function perguntasRotulo(): Record<string, PerguntaJev> {
  return {
    rotulo: { type: "choice", criteria: ROTULOS_JEV },
    coerente: {
      type: "noul",
      instructions:
        "As respostas são coerentes entre si (porte da empresa, número de técnicos, papel na decisão, prazo e o texto livre batem) e parecem de uma pessoa real preenchendo com atenção?",
      criteria: { true: "coerente, parece real", false: "contraditório, aleatório ou texto sem sentido" },
    },
    dor_texto: { type: "choice", criteria: DORES_JEV },
  };
}

export function perguntasDor(): Record<string, PerguntaJev> {
  return { dor: { type: "choice", criteria: DORES_JEV } };
}

// --------------------------------------------------------------------------
// LLM: o palpite + a pergunta de aprofundamento, numa chamada só. A LLM recebe
// a dor que o JEV decidiu; ela escreve, não classifica. Sem concorrente, sem
// preço, sem promessa de produto (decisão 4 do plano: comparativa é frase fixa).
// --------------------------------------------------------------------------
export const SAIDA_PALPITE = z.object({
  palpite: z.string().describe("1 frase, até 140 caracteres, que devolve o problema com as palavras da pessoa e termina com 'É isso?'"),
  pergunta: z.string().describe("1 pergunta curta de aprofundamento sobre esse problema, até 90 caracteres"),
  opcoes: z.array(z.string()).describe("exatamente 3 respostas curtas pra pergunta, até 40 caracteres cada, concretas, sem 'outro'"),
});

export const SYSTEM_PALPITE = `Você escreve as falas de um chat de diagnóstico de atendimento de TI (ITSM) de um site brasileiro de software. Fala em português do Brasil, tom direto e simpático, sem jargão, sem exclamação, sem emoji, sem travessão.

Você NÃO decide nada: a categoria do problema já vem pronta (foi decidida por outra camada). Seu trabalho é só escrever:
1. "palpite": uma frase que devolve o problema da pessoa com as palavras dela, reformulando o que ela escreveu (não repita o texto literal), e termina com "É isso?". Exemplo de forma: "Parece que o problema não é o SLA em si, e sim ninguém ser avisado antes de ele estourar. É isso?"
2. "pergunta": uma pergunta curta de aprofundamento, concreta, sobre o dia a dia dela nesse problema (o que acontece hoje, por onde chega, o que o gestor pede).
3. "opcoes": exatamente 3 respostas curtas e concretas pra pergunta, que cubram os casos mais comuns, pra pessoa responder com um toque.

Regras: nunca cite nome de produto, empresa, concorrente ou preço; nunca prometa funcionalidade; nunca invente fato; não dê conselho; não use "você precisa"; não comece com "Entendi". Se o texto da pessoa for curto ou vago, escreva o palpite a partir da categoria.`;

export const PALPITE_PROMPT = (args: { dor: string; descricao: string; texto: string; situacao?: string }) =>
  `Categoria decidida: ${args.dor} (${args.descricao}).${args.situacao ? ` Situação: ${args.situacao}.` : ""}\nTexto da pessoa: """${args.texto.slice(0, 600)}"""`;

export const SITUACOES: Record<string, string> = {
  troca: "tem uma ferramenta e quer trocar",
  sem: "não tem ferramenta: e-mail, planilha ou WhatsApp",
  cliente: "já usa o produto e quer evoluir",
  pesquisa: "está pesquisando o assunto",
};
