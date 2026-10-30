// ==========================================================================
// conversa-core — tipos do fluxo declarativo.
// Núcleo genérico (produto da Fujiex). NÃO importa nada de fora desta pasta
// e não conhece nenhum cliente: perguntas, opções, condicionais, pesos,
// textos e tema chegam por um `ConfigConversa` (a configuração de cada cliente mora fora desta pasta).
// ==========================================================================

import type { ComponentType } from "react";

export type Respostas = Record<string, string | undefined>;

export type Contexto = {
  // de onde a pessoa veio (ex.: "generica" | "comparativa"); vem de `origens`
  origem: string;
  // variáveis fixas da sessão vindas da URL (ex.: concorrente: "Movidesk")
  variaveis: Record<string, string | null>;
  respostas: Respostas;
  // tempos medidos pelo motor (só na classificação)
  tempos?: { segundosTotal: number };
};

// --------------------------------------------------------------------------
// Condicionais declarativas (avaliadas por condicoes.ts)
// --------------------------------------------------------------------------
export type Condicao =
  | true
  | { campo: string; igual: string }
  | { campo: string; diferente: string }
  | { campo: string; em: string[] }
  | { campo: string; definido: boolean } // respondido (mesmo que "")
  | { campo: string; vazio: boolean } // respondido com "" (ex.: pulou o texto)
  | { campo: string; minCaracteres: number }
  | { origem: string }
  | { variavel: string; definida: boolean } // variável da URL ou derivada, não vazia
  | { tempoTotalEntre: [number, number] } // segundos, só na classificação
  | { todas: Condicao[] }
  | { alguma: Condicao[] }
  | { nao: Condicao };

// --------------------------------------------------------------------------
// Textos com template ({{variavel}}) e variantes por condição
// --------------------------------------------------------------------------
export type Texto = string | { padrao: string; casos: { quando: Condicao; texto: string }[] };

export type Opcao = { valor: string; rotulo: string };

export type ListaOpcoes = Opcao[] | { catalogo: string };

export type Opcoes = ListaOpcoes | { padrao: ListaOpcoes; casos: { quando: Condicao; opcoes: ListaOpcoes }[] };

// --------------------------------------------------------------------------
// Validação de texto
// --------------------------------------------------------------------------
export type Validacao =
  | { regra: "email"; mensagem: string }
  | { regra: "minCaracteres"; valor: number; mensagem: string }
  | { regra: "minDigitos"; valor: number; mensagem: string }
  | { regra: "custom"; nome: string }; // função em config.validadores

// --------------------------------------------------------------------------
// Etapa
// --------------------------------------------------------------------------
export type EtapaConfig = {
  id: string;
  // número mostrado no contador ("3/7"); etapas auxiliares repetem o da mãe
  passo: number;
  tipo: "texto" | "escolha" | "info";
  quando?: Condicao; // ausente = sempre
  texto: Texto;
  // escolha/info
  opcoes?: Opcoes;
  // mostra só as N primeiras e um botão pra abrir o resto
  mostrarPrimeiro?: { quantidade: number; rotulo: string };
  // texto da pergunta e opções mudam conforme o valor de outro campo
  variantes?: { porCampo: string; casos: Record<string, { texto?: Texto; opcoes?: ListaOpcoes }> };
  // texto
  input?: "email" | "text" | "tel" | "textarea";
  autoComplete?: string;
  placeholder?: Texto;
  validar?: Validacao[];
  normalizar?: "minusculas";
  mascara?: "telefone_br";
  pular?: { rotulo: string; valor: string };
  // valor inicial do campo quando a pergunta aparece (nome de variável)
  prefill?: string;
  // rótulo do botão de enviar quando o valor digitado é igual ao prefill
  confirmarRotulo?: string;
  // ao tocar na bolha pra corrigir, o campo volta com a resposta anterior
  recuperarAoCorrigir?: boolean;
  // como a resposta aparece na bolha da pessoa (padrão: rótulo da opção ou o texto)
  resumo?: { template?: string; porValor?: Record<string, string> };
  // efeitos colaterais de uma resposta (ex.: "corrigir" na coerência refaz o porte)
  aoResponder?: { valor: string; refazerDesde: string }[];
};

export type Encerramento = {
  id: string;
  quando: Condicao;
  texto: string;
  link?: { href: string; rotulo: string };
  complemento?: string;
};

// --------------------------------------------------------------------------
// Recomendação (o "mapa"): nós do catálogo escolhidos por regras
// --------------------------------------------------------------------------
export type RecomendacaoConfig = {
  nos: Record<string, string>;
  padrao: string[];
  // a primeira regra "base" que casar substitui o padrão; as "acrescentar" somam
  regras: { quando: Condicao; nos: string[]; modo?: "base" | "acrescentar" }[];
};

// --------------------------------------------------------------------------
// Pontuação por regras
// --------------------------------------------------------------------------
export type PontuacaoConfig = {
  maximo: number;
  // pontos por valor de um campo; "*" = qualquer valor respondido
  criterios: { id: string; campo: string; pontos: Record<string, number> }[];
  // pontos extras por condição (ex.: capricho)
  extras: { id: string; quando: Condicao; pontos: number }[];
  // da maior pra menor: a primeira cujo mínimo é atingido vence
  classes: { id: string; minimo: number }[];
  // rótulos que o código já sabe sem ler texto; o primeiro que casar vence
  rotulos: { rotulo: string; quando: Condicao }[];
  // rótulo → rota; sem rótulo, a rota é a classe
  rotaPorRotulo: Record<string, string>;
};

export type Classificacao = {
  pontos: number;
  detalhe: Record<string, number>;
  classe: string;
  rotuloCodigo: string | null;
  rotulo: string | null; // Jev vence o código
  rotuloOrigem: "jev" | "fallback";
  rota: string;
  segundos: number;
};

// --------------------------------------------------------------------------
// Jev (decide/classifica) — cliente genérico com timeout e fallback
// --------------------------------------------------------------------------
export type JevConfig = {
  habilitado: boolean;
  endpoint: string;
  timeoutMs: number;
};

export type RotuloJev = { rotulo: string | null; motivo: string | null; origem: "jev" | "fallback" };

// --------------------------------------------------------------------------
// Eventos (pra GA4, log, etc.)
// --------------------------------------------------------------------------
export type Evento =
  | { tipo: "inicio"; origem: string }
  | { tipo: "resposta"; etapa: string; passo: number; segundosNaEtapa: number }
  | { tipo: "correcao"; etapa: string }
  | { tipo: "encerramento"; id: string }
  | { tipo: "classificacao"; classificacao: Classificacao }
  | { tipo: "envio"; ok: boolean };

// --------------------------------------------------------------------------
// Persistência: o núcleo não sabe gravar; o cliente entrega um adaptador
// --------------------------------------------------------------------------
export type Persistencia = {
  // chamada a cada resposta (gravação parcial, se o cliente quiser)
  aoResponder?: (etapaId: string, respostas: Respostas, ctx: Contexto) => void;
  // envio final; devolve pra onde redirecionar (ou nada)
  enviar: (args: {
    respostas: Respostas;
    ctx: Contexto;
    classificacao: Classificacao;
    honeypot: string;
  }) => Promise<{ ok: boolean; redirecionar?: string }>;
};

// --------------------------------------------------------------------------
// A configuração completa de um cliente
// --------------------------------------------------------------------------
export type ConfigConversa = {
  id: string;
  marca: { titulo: string; rotuloRegiao: string };
  // variáveis CSS --cv-* (ver ui/conversa.css)
  tema?: Record<string, string>;
  totalPassos: number;
  digitandoMs?: number;
  // origem pela URL: primeiro segmento do caminho → origem + variáveis
  origens: { padrao: string; porSlug: Record<string, { origem: string; variaveis: Record<string, string> }> };
  catalogos?: Record<string, Opcao[]>;
  abertura: Texto[];
  etapas: EtapaConfig[];
  encerramentos?: Encerramento[];
  recomendacao?: RecomendacaoConfig;
  pontuacao: PontuacaoConfig;
  jev: JevConfig;
  textos: {
    enviando: string;
    erro: string;
    tentarDeNovo: string;
    legal: string;
    corrigirDica: string;
    passoAria: string; // "Pergunta {{passo}} de {{total}}"
  };
  // variáveis derivadas, disponíveis nos templates como {{nome}}
  variaveis?: Record<string, (ctx: Contexto) => string>;
  // validadores próprios do cliente (regra "custom")
  validadores?: Record<string, (valor: string, ctx: Contexto) => string | null>;
  // cena ilustrada (sob medida); opcional
  Cena?: ComponentType<{ respostas: Respostas; ctx: Contexto }>;
};
