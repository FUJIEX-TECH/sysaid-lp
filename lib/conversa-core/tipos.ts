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
  // textos gerados no servidor (LLM/Jev) e já recebidos; chave = id da geração
  gerados?: Record<string, Gerado>;
  // tempos medidos pelo motor (só na classificação)
  tempos?: { segundosTotal: number };
  // v2: de onde a pessoa veio (URL, UTMs, gclid, referrer, página de entrada); ver origem.ts
  sinais?: Sinais;
  // v2: a empresa lida pelo domínio do e-mail (enriquecimento.ts), quando chegou
  empresa?: Empresa | null;
};

// --------------------------------------------------------------------------
// v2: origem pela campanha. `Sinais` é o que o navegador lê; `OrigemRegra` é
// como cada cliente mapeia sinais → origem + variáveis (o mecanismo é genérico,
// o mapa campanha → contexto é configuração).
// --------------------------------------------------------------------------
export type Sinais = {
  caminho: string; // pathname da página do chat
  entrada: string; // pathname da 1ª página vista na sessão (lembrada no sessionStorage), ou ""
  referrer: string; // document.referrer
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  // todos os parâmetros da URL (ex.: de=movidesk)
  parametros: Record<string, string>;
};

// como um valor casa: igual (string ou lista), contém (sem acento, sem caixa) ou regex
export type Casamento = string | string[] | { contem: string | string[] } | { regex: string };

export type CondicaoOrigem = {
  caminho?: Casamento; // primeiro segmento do pathname (ex.: "movidesk")
  entrada?: Casamento; // primeiro segmento da página de entrada lembrada
  referrer?: Casamento;
  utm_source?: Casamento;
  utm_medium?: Casamento;
  utm_campaign?: Casamento;
  utm_term?: Casamento;
  utm_content?: Casamento;
  gclid?: boolean; // veio de clique pago do Google
  parametro?: Record<string, Casamento>; // qualquer outro parâmetro (ex.: de)
  semCampanha?: boolean; // nenhum utm nem gclid
};

export type OrigemRegra = {
  id: string;
  quando: CondicaoOrigem | { alguma: CondicaoOrigem[] };
  // base: define a origem (a 1ª que casa vence); acrescentar: só soma variáveis
  modo?: "base" | "acrescentar";
  origem?: string;
  variaveis?: Record<string, string>;
};

// --------------------------------------------------------------------------
// v2: empresa lida pelo domínio do e-mail (servidor/empresa.ts lê o site
// público; o navegador só manda o domínio, nunca o e-mail)
// --------------------------------------------------------------------------
export type Empresa = {
  dominio: string;
  nome: string; // melhor nome encontrado (site, CNPJ) ou chute pelo domínio
  site: string;
  logo?: string; // URL de imagem (apple-touch-icon ou favicon grande)
  descricao?: string;
  redes: { instagram?: string; linkedin?: string; facebook?: string; youtube?: string };
  cnpj?: string;
  razaoSocial?: string;
  cidade?: string;
  uf?: string;
  desde?: string; // ano de abertura
  porte?: string;
  atividade?: string;
  origem: "site" | "cnpj" | "fallback";
};

export type EmpresaConfig = {
  habilitado: boolean;
  endpoint: string; // POST {dominio} → Empresa
  campoEmail: string; // etapa cujo valor é o e-mail
  timeoutMs: number;
};

// --------------------------------------------------------------------------
// Geração de texto no servidor (parte 2): a conversa pede ao endpoint do
// cliente enquanto a pessoa ainda digita; o que volta só é usado se `para`
// (as respostas que serviram de entrada) ainda bater com as respostas atuais.
// Contrato: o servidor devolve texto e dados; quem classifica é o Jev lá
// dentro, nunca a LLM; o motor nunca espera além de `esperaMs`.
// --------------------------------------------------------------------------
export type Gerado = {
  id: string;
  // respostas usadas como entrada; se alguma mudar, o gerado é descartado
  para: Record<string, string>;
  // campos de `para` em que basta a resposta final COMEÇAR com o trecho usado
  // (o texto da dor foi lido antes do Enter; a pessoa pode ter continuado)
  paraPrefixo?: string[];
  // textos escritos pela LLM (ex.: palpite, pergunta); chave livre do cliente
  textos: Record<string, string>;
  // listas de opções escritas pela LLM (ex.: alternativas da pergunta)
  listas?: Record<string, string[]>;
  // dados decididos pelo Jev (ex.: dor reconhecida no texto), nunca pela LLM
  dados?: Record<string, string>;
  origem: "servidor" | "cache";
  // medição devolvida pelo servidor (custo em USD, latência)
  medicao?: { custoUsd: number; ms: number; llm: "ok" | "cache" | "fallback" | "desligado"; jev: "ok" | "fallback" | "desligado" };
};

export type GeracaoConfig = {
  id: string;
  endpoint: string; // POST {id, sessao, respostas, origem, variaveis}
  // dispara enquanto a pessoa digita este campo (debounce), a partir de N caracteres;
  // depois, só pede de novo quando o texto cresceu `passoCaracteres` (padrão 20)
  gatilho: { campo: string; minCaracteres: number; debounceMs: number; passoCaracteres?: number };
  // quanto o motor espera no Enter por uma geração ainda em andamento (depois: fallback)
  esperaMs: number;
  timeoutMs: number;
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
  | { variavel: string; igual: string } // v2: variável da origem ou derivada com este valor
  | { tempoTotalEntre: [number, number] } // segundos, só na classificação
  | { gerado: string; disponivel: boolean } // geração do servidor chegou e ainda vale (`para` bate)
  | { empresaEncontrada: boolean } // v2: a empresa pelo domínio chegou (com dado do site ou do CNPJ)
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
  // texto e/ou opções desta etapa vêm de uma geração do servidor, quando ela
  // está disponível (senão vale o `texto`/`opcoes` fixo acima)
  // `seIgual`: só usa o gerado se a resposta do campo for igual ao dado do Jev
  // (ex.: a pergunta gerada pra dor "sla" não serve se a pessoa escolheu "custo")
  gerado?: { id: string; texto?: string; opcoes?: string; seIgual?: { campo: string; dado: string } };
  // efeitos colaterais de uma resposta: "corrigir" na coerência refaz o porte;
  // "é isso" no palpite grava noutro campo um dado decidido pelo Jev
  aoResponder?: (
    | { valor: string; refazerDesde: string }
    | { valor: string; definir: { campo: string; deGerado: { id: string; dado: string } } }
  )[];
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
  // v2: quando o Jev e o código dão rótulos diferentes, vence o que vier antes
  // nesta lista (ex.: ["fora", "cliente", "cotando", "incoerente"]); rótulo fora
  // da lista perde; sem a lista, o do Jev vence (comportamento da parte 2)
  precedenciaRotulos?: string[];
};

export type Classificacao = {
  pontos: number;
  detalhe: Record<string, number>;
  classe: string;
  rotuloCodigo: string | null;
  rotulo: string | null; // Jev vence o código
  rotuloOrigem: "jev" | "fallback";
  jevDados?: Record<string, string>; // o mais que o Jev leu (dor no texto, coerência), pra ficha
  rota: string;
  segundos: number;
};

// --------------------------------------------------------------------------
// Jev (decide/classifica) — cliente genérico com timeout e fallback
// --------------------------------------------------------------------------
export type JevConfig = {
  habilitado: boolean;
  endpoint: string; // POST {sessao, respostas, origem, variaveis} → RotuloJev
  timeoutMs: number;
};

export type RotuloJev = {
  rotulo: string | null;
  motivo: string | null;
  origem: "jev" | "fallback";
  // outros dados decididos pelo Jev (ex.: dor lida no texto livre, coerência), pra ficha
  dados?: Record<string, string>;
};

// --------------------------------------------------------------------------
// Servidor (parte 2): configuração do cliente LLM e do Jev que rodam nas rotas
// de API do cliente. Prompts, limites e endpoints são do cliente; o núcleo só
// sabe chamar, cachear, medir e cair no fallback. Ver servidor/.
// --------------------------------------------------------------------------
export type LLMConfig = {
  habilitado: boolean;
  modelo: string; // ex.: "claude-haiku-5-5"
  timeoutMs: number;
  maxTokens: number;
  // preço por milhão de tokens (entrada, saída) pra medir o custo
  precoPorMilhao: { entrada: number; saida: number };
  cache: { ttlMs: number; maximo: number };
  // tetos: chamadas por sessão e por hora, custo por hora; estourou = fallback
  tetos: { chamadasPorSessao: number; chamadasPorHora: number; usdPorHora: number };
};

export type JevServidorConfig = {
  habilitado: boolean;
  url: string; // ex.: https://api.typesafe.ai/v1/systemone
  modelo: string; // ex.: jev-latest
  timeoutMs: number;
  tetos: { chamadasPorSessao: number; chamadasPorHora: number };
};

// pergunta no formato do Jev (System One): choice | noul | score
export type PerguntaJev =
  | { type: "choice"; criteria: Record<string, string> }
  | { type: "noul"; instructions: string; criteria?: { true: string; false: string } }
  | { type: "score"; criteria: Record<string, string> };

export type RespostaJev = Record<string, unknown>;

// --------------------------------------------------------------------------
// Eventos (pra GA4, log, etc.)
// --------------------------------------------------------------------------
export type Evento =
  | { tipo: "inicio"; origem: string }
  | { tipo: "resposta"; etapa: string; passo: number; segundosNaEtapa: number }
  | { tipo: "correcao"; etapa: string }
  | { tipo: "encerramento"; id: string }
  | { tipo: "classificacao"; classificacao: Classificacao }
  | { tipo: "geracao"; id: string; resultado: "usado" | "fallback" | "descartado"; ms: number }
  | { tipo: "envio"; ok: boolean };

// medição acumulada da sessão (custo das gerações, pra ficha e pro log)
export type Medicao = { custoUsd: number; chamadasLlm: number; chamadasJev: number; cacheHits: number; fallbacks: number };

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
    medicao: Medicao;
  }) => Promise<{ ok: boolean; redirecionar?: string }>;
};

// --------------------------------------------------------------------------
// A configuração completa de um cliente
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// v2: painéis visuais gerados por código (porte, mapa, empresa, resumo) e o
// mapa declarativo. Tudo que é texto vem da configuração; a forma é do núcleo.
// --------------------------------------------------------------------------
export type NoMapaConfig = { quando?: Condicao; texto: Texto; nota?: Texto };
export type MapaConfig = {
  atual: NoMapaConfig; // onde a pessoa está (sempre)
  problema?: NoMapaConfig;
  causa?: NoMapaConfig;
  // nós do catálogo escolhidos pela recomendação (recomendacao.ts)
  destino?: { quando?: Condicao; nota?: Texto; maximo?: number };
  passo?: NoMapaConfig;
  // rótulo das ligações
  arestas?: { problema?: string; causa?: string; destino?: string; passo?: string };
};
export type NoMapa = { id: string; tipo: "atual" | "problema" | "causa" | "destino" | "passo"; texto: string; nota?: string };
export type Mapa = { nos: NoMapa[]; arestas: { de: string; para: string; rotulo?: string }[] };

export type PorteConfig = {
  pessoas: { campo: string; valores: Record<string, number>; rotulo: Texto };
  equipe: { campo: string; valores: Record<string, number>; rotulo: Texto };
  titulo?: Texto;
  legenda?: Texto; // pode usar {{porGlifo}} e {{razao}}
};

export type PainelConfig = {
  id: string;
  tipo: "porte" | "mapa" | "empresa" | "custom";
  quando?: Condicao;
  // etapa depois da qual o painel aparece no fluxo (ou junto da pergunta, se ela for a atual)
  apos?: string;
  // fluxo: dentro da conversa; lateral: coluna fixa no desktop (no celular cai no fluxo em `apos`)
  lugar?: "fluxo" | "lateral";
  titulo?: Texto;
  Componente?: ComponentType<{ respostas: Respostas; ctx: Contexto }>;
};

export type ResumoConfig = {
  titulo: Texto;
  subtitulo?: Texto;
  linhas: { rotulo: string; texto: Texto; quando?: Condicao }[];
};

export type ConfigConversa = {
  id: string;
  marca: { titulo: string; rotuloRegiao: string; subtitulo?: string };
  // variáveis CSS --cv-* (ver ui/conversa.css)
  tema?: Record<string, string>;
  totalPassos: number;
  digitandoMs?: number;
  // origem: `porSlug` (parte 1: primeiro segmento do caminho) e/ou `regras` (v2:
  // UTMs, gclid, referrer, página de entrada, parâmetro). As regras rodam antes.
  origens: {
    padrao: string;
    porSlug?: Record<string, { origem: string; variaveis: Record<string, string> }>;
    regras?: OrigemRegra[];
    // chave do sessionStorage pra lembrar os sinais da 1ª página (ex.: anúncio caiu
    // na LP, a pessoa clicou e veio pro chat); vazio = não lembra
    lembrar?: string;
  };
  catalogos?: Record<string, Opcao[]>;
  abertura: Texto[];
  etapas: EtapaConfig[];
  encerramentos?: Encerramento[];
  recomendacao?: RecomendacaoConfig;
  pontuacao: PontuacaoConfig;
  jev: JevConfig;
  // gerações do servidor disparadas enquanto a pessoa digita (parte 2)
  geracoes?: GeracaoConfig[];
  // v2: empresa pelo domínio do e-mail
  empresa?: EmpresaConfig;
  // v2: painéis visuais, mapa declarativo, porte e resumo lateral
  paineis?: PainelConfig[];
  mapa?: MapaConfig;
  porte?: PorteConfig;
  resumo?: ResumoConfig;
  textos: {
    enviando: string;
    erro: string;
    tentarDeNovo: string;
    legal: string;
    corrigirDica: string;
    passoAria: string; // "Pergunta {{passo}} de {{total}}"
    enviar?: string; // botão de enviar texto (padrão "Enviar")
    corrigir?: string; // rótulo sob a bolha da pessoa (padrão "corrigir")
    faltam?: string; // v2: "faltam ~{{n}}"
  };
  // variáveis derivadas, disponíveis nos templates como {{nome}}
  variaveis?: Record<string, (ctx: Contexto) => string>;
  // validadores próprios do cliente (regra "custom")
  validadores?: Record<string, (valor: string, ctx: Contexto) => string | null>;
  // cena ilustrada (sob medida); opcional
  Cena?: ComponentType<{ respostas: Respostas; ctx: Contexto }>;
};
