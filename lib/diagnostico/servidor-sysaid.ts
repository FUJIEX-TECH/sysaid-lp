// ==========================================================================
// Diagnóstico ITSM — lado do SERVIDOR da configuração da SysAid (parte 2).
// Só importar de rotas de API. Aqui moram: limites de custo, prompts da LLM
// (palpite da dor, pergunta de aprofundamento) e perguntas do Jev (rótulo,
// coerência, dor no texto livre). Dono do conteúdo: sysaid-growth (1ª versão do
// Severino, 30/10/2026; copy revisada pelo sysaid-growth no mesmo dia).
//
// Três camadas: genérico = lib/conversa-core/servidor (clientes, cache, tetos);
// configurável = este arquivo (modelo, tetos, prompts, rótulos);
// sob medida = as rotas app/api/diagnostico/{gerar,rotular}.
// ==========================================================================

import { z } from "zod";
import type { JevServidorConfig, LLMConfig, PerguntaJev } from "@/lib/conversa-core";
import type { EmpresaServidorConfig } from "@/lib/conversa-core/servidor";

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
  custo: "preço, licença, cobrança por técnico, agente ou usuário, módulos cobrados à parte, dólar, contrato; a conta da ferramenta pesa ou só sobe",
  esm: "quer atender outros departamentos além da TI: RH, facilities, jurídico, financeiro",
  vaga: "o texto não descreve um problema claro de atendimento de TI ou não dá pra saber",
};

export const ROTULOS_JEV: Record<string, string> = {
  cotando: "a pessoa só quer preço ou orçamento pra comparar; não descreve problema de atendimento nem intenção de mudar",
  fora: "não é empresa compradora em potencial: estudante, trabalho acadêmico, curiosidade, concorrente, fornecedor oferecendo serviço, TI de 1 pessoa sem equipe, ou texto fora do assunto",
  cliente: "já usa SysAid hoje (diz que é cliente, pede suporte ou quer evoluir o que já tem)",
  nenhum: "nada acima: lead comum, com problema e intenção de avaliar",
};

export function perguntasRotulo(): Record<string, PerguntaJev> {
  return {
    rotulo: { type: "choice", criteria: ROTULOS_JEV },
    coerente: {
      type: "noul",
      instructions:
        "As respostas batem entre si (porte da empresa, número de técnicos, papel na decisão, prazo e texto livre) e parecem de uma pessoa real preenchendo com atenção? Ser estudante, só querer preço, já ser cliente ou escrever de forma grosseira NÃO é incoerência (isso é outro rótulo).",
      criteria: { true: "coerente, parece real", false: "respostas que se contradizem, cliques aleatórios ou texto sem sentido (teclado batido, frase solta sem relação)" },
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
  palpite: z.string().describe("1 ou 2 frases, até 30 palavras (máx. 170 caracteres): a consequência provável do que a pessoa contou (o que isso custa no dia a dia), com as palavras dela, terminando com 'É isso?'"),
  pergunta: z.string().describe("1 pergunta só, curta (até 12 palavras, máx. 90 caracteres), sobre como esse problema acontece no dia a dia"),
  opcoes: z.array(z.string()).describe("exatamente 3 respostas diretas à pergunta, na voz da pessoa, até 40 caracteres cada, diferentes entre si, sem 'outro'"),
});

// Revisado pelo sysaid-growth em 30/10/2026 (testes com 12 textos em
// formulario-inteligente/qualifica-copy-testes-2026-10-30.md). O que mudou da
// 1ª versão: tamanho em palavras, uma pergunta só, opções que respondem a
// pergunta, nada de "não é X, e sim Y" inventado, regra pra texto grosseiro ou
// só de preço, e o público (gestor de TI) explícito.
// 11/11/2026 (Severino, pedido do Fernando; copy a revisar pelo sysaid-growth):
// o chat virou SPIN. A pessoa conta a SITUAÇÃO (como o atendimento funciona
// hoje) e o "palpite" passou a ser a IMPLICAÇÃO: o que aquilo provavelmente
// custa no dia a dia, terminando com "É isso?" (o chat oferece "É isso" e
// "Tem mais"). A categoria (dor) continua vindo do Jev; a LLM só escreve.
export const SYSTEM_PALPITE = `Você escreve as falas de um chat de atendimento de TI (service desk) num site brasileiro de software B2B. Quem lê é gestor, coordenador ou analista de TI de empresa média ou grande. Português do Brasil, tom de colega experiente: direto, cordial, profissional. Frases curtas. Sem exclamação, sem emoji, sem travessão, sem jargão de IA ou de marketing.

A pessoa contou como o atendimento de TI funciona hoje (a situação). A categoria do problema já vem decidida por outra camada. Você não classifica, não vende e não aconselha: só escreve três coisas.

1. "palpite": a implicação. Em 1 ou 2 frases (até 30 palavras no total), arrisque a consequência mais provável daquela situação no dia a dia: o que ela custa em chamado perdido, prazo (SLA) sem controle, retrabalho, hora de técnico, visibilidade pro gestor ou dinheiro. Use as palavras da pessoa e ligue a consequência ao que ela disse ("se X, então Y"). Comece com "Se", "Então" ou "Imagino que". Termine SEMPRE com "É isso?". Uma consequência só; não liste várias. A implicação é SEMPRE sobre a categoria decidida: se a pessoa contou mais de uma coisa, fale da que pertence à categoria (ex.: categoria custo e ela citou SLA e cobrança por técnico → fale da conta, não do SLA). Não invente número, prazo nem detalhe que ela não deu.
2. "pergunta": UMA pergunta curta (até 12 palavras), com um assunto só, sobre como o problema acontece hoje: quem percebe, por onde chega, com que frequência ou o que é feito à mão. Escolha um desses ângulos, nunca dois (errado: "Quem recebe e por qual canal chega?"). Não comece com "Hoje".
3. "opcoes": exatamente 3 respostas que respondem essa pergunta de forma direta, escritas como a pessoa responderia (ex.: "Só quando o usuário reclama"), até 40 caracteres cada, diferentes entre si e cobrindo os casos mais comuns.

Exemplos de implicação boa:
- Situação "os chamados chegam por e-mail e WhatsApp e alguém copia pra planilha depois" → "Se o chamado passa por WhatsApp e planilha, imagino que parte se perde no caminho e ninguém sabe o prazo de cada um. É isso?"
- Situação "monto os indicadores no Excel todo mês" → "Então o gestor só enxerga o atendimento no fim do mês, e quem monta o Excel perde horas nisso. É isso?"
- Situação "usamos uma ferramenta, mas o time abre chamado por fora" → "Se o time abre por fora, imagino que a fila oficial não mostra o volume real e o SLA fica sem controle. É isso?"
- Categoria custo, situação "ninguém sabe o SLA e a cobrança por técnico pesa no custo" → "Se a cobrança é por técnico, imagino que cada pessoa nova no time aumenta a conta, e vocês acabam segurando a equipe pelo custo. É isso?"

Regras fixas:
- Nunca cite nome de produto, marca, empresa ou concorrente, nem a ferramenta que a pessoa usa.
- Na categoria custo, a implicação fala do peso na conta (cresce a cada técnico, módulo à parte, dólar, contrato), sempre sem número, valor, desconto ou condição comercial; a pergunta é sobre o que pesa no custo (forma de cobrança, módulos, contrato). Nas outras categorias, não fale de dinheiro.
- Nunca prometa recurso, resultado ou prazo, e não diga o que a solução faz.
- Termos técnicos que a pessoa usou (SLA, N1, chamado, ativo) podem ficar; não introduza siglas novas.
- Não use "você precisa", "Entendi", "Ótimo", "Claro".
- Se o texto for grosseiro, irônico ou só pedir preço, não espelhe o tom, não fale de valor e não suponha o que a pessoa está fazendo (comparando, trocando, com pressa): escreva um palpite neutro a partir da categoria.
- Não avalie a pessoa nem a ferramenta dela (nada de "já usam bem", "está aquém").
- Se o texto for curto ou vago, escreva o palpite a partir da categoria, sem inventar detalhe.`;

// trava de saída (sob medida SysAid). Palpite reprovado = descarta tudo (o chat
// segue com a lista de dores). Só a pergunta reprovada = fica o palpite e a
// pergunta e as opções voltam pras fixas da config (nunca pergunta gerada com
// opção fixa). Motivos: marca, concorrente ou valor; tamanho; travessão ou
// exclamação; duas perguntas numa só ("quem recebe e por qual canal").
const PROIBIDOS = [
  "sysaid", "glpi", "movidesk", "topdesk", "freshdesk", "freshservice", "freshworks", "zendesk", "jira", "servicenow",
  "qualitor", "citsmart", "milvus", "octadesk", "ivanti", "manageengine", "atlassian", "r$", "us$", "reais", "desconto",
];
// avaliar a pessoa ou a ferramenta dela ("já usam bem", "está aquém") também reprova
const AVALIA = /\b(usam|usa|usar) bem\b|aqu[ée]m|n[ãa]o rendem?\b/i;
const limpo = (t: string) => !PROIBIDOS.some((p) => t.toLowerCase().includes(p)) && !/[!—–]/.test(t) && !AVALIA.test(t);
const DUAS_PERGUNTAS = /,?\s(e|ou)\s+(como|qual|quais|quem|por qual|por onde|onde|quando|quantos?|quantas?|com que)\b/i;

export function travaGerado(v: { palpite: string; pergunta: string; opcoes: string[] }): { palpite: boolean; pergunta: boolean } {
  const palpite = limpo(v.palpite) && v.palpite.length <= 200 && /é isso\?$/i.test(v.palpite.trim());
  const pergunta =
    limpo([v.pergunta, ...v.opcoes].join(" ")) &&
    v.pergunta.length <= 110 &&
    !DUAS_PERGUNTAS.test(v.pergunta) &&
    v.opcoes.length === 3 &&
    v.opcoes.every((o) => o.trim().length > 0 && o.trim().length <= 50);
  return { palpite, pergunta };
}

// "Hoje, quem percebe...?" → "Quem percebe...?" (o Haiku insiste no "Hoje,")
export function semHoje(t: string): string {
  const m = t.trim().match(/^hoje,\s*(.+)$/i);
  return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : t.trim();
}

// nome de ferramenta no texto vira "a ferramenta atual" antes de ir pra LLM
// (sem isso o Haiku repete a marca no palpite e a trava descarta tudo)
const MARCAS = new RegExp(`(?:\\b[oO]\\s+)?\\b(${PROIBIDOS.filter((p) => /^[a-z]+$/.test(p) && p !== "reais" && p !== "desconto").join("|")})\\b`, "gi");
const semMarca = (t: string) => t.replace(MARCAS, "a ferramenta atual");

export const PALPITE_PROMPT = (args: { dor: string; descricao: string; texto: string; situacao?: string }) =>
  `Categoria decidida: ${args.dor} (${args.descricao}).${args.situacao ? ` Situação: ${args.situacao}.` : ""}\nTexto da pessoa: """${semMarca(args.texto.slice(0, 600))}"""`;

// 11/11/2026 (sysaid-growth): a dor mais quente. Quem veio de busca de preço
// ("movidesk valores") e escreve sobre custo quer falar de custo, mesmo citando
// SLA na mesma frase; o Jev escolhe uma categoria só e às vezes pega a outra.
// Com sinal explícito de dinheiro no texto e origem de preço, a dor é custo.
const SINAL_CUSTO = /\b(cust\w*|car[oa]s?|pre[çc]o|valor(es)?|cobran[çc]a|cobra[mr]?|licen[çc]\w*|mensalidade|d[óo]lar|fatura|contrato|por t[ée]cnico|por agente|por usu[áa]rio)\b/i;
export function dorMaisQuente(dorJev: string | null, texto: string, variaveis: Record<string, string | null | undefined>): string | null {
  if (variaveis.intencao === "preco" && SINAL_CUSTO.test(texto)) return "custo";
  return dorJev;
}

export const SITUACOES: Record<string, string> = {
  troca: "tem uma ferramenta e quer trocar",
  sem: "não tem ferramenta: e-mail, planilha ou WhatsApp",
  cliente: "já é cliente e quer ampliar o uso (não avalie como usa hoje)",
  pesquisa: "está pesquisando o assunto",
};

// --------------------------------------------------------------------------
// v2 (30/10/2026, Severino): empresa pelo domínio do e-mail. Sem chave paga:
// o site público (título, descrição, ícone, redes, CNPJ no rodapé) e a
// BrasilAPI pelo CNPJ (razão social, cidade, abertura, porte). Ícone de
// reserva: favicon grande do Google. Cache de 24 h por domínio.
// --------------------------------------------------------------------------
export const EMPRESA_SYSAID: EmpresaServidorConfig = {
  habilitado: process.env.DIAG_EMPRESA !== "0",
  timeoutMs: 2500,
  cache: { ttlMs: 24 * 60 * 60 * 1000, maximo: 500 },
  iconeFallback: "https://www.google.com/s2/favicons?domain={dominio}&sz=128",
  cnpjUrl: "https://brasilapi.com.br/api/cnpj/v1/{cnpj}",
};
