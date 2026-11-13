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
  // segura a pergunta seguinte ao e-mail (mostrando "digitando") até a empresa
  // chegar, no máximo isto; assim dá pra confirmar nome e empresa de uma vez
  esperaMs?: number;
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
  // depois, só pede de novo quando o texto cresceu `passoCaracteres` (padrão 20).
  // `ignorarAtalhos` (13/11/2026): resposta por chip não pede nada (o texto é fixo).
  // 13/11/2026: ou dispara quando uma destas etapas é respondida (`aoResponder`),
  // sem a conversa esperar; o que chegar vale enquanto o `para` bater.
  gatilho:
    | { campo: string; minCaracteres: number; debounceMs: number; passoCaracteres?: number; ignorarAtalhos?: boolean }
    | { aoResponder: string[]; quando?: Condicao };
  // quanto o motor espera no Enter por uma geração ainda em andamento (depois: fallback)
  esperaMs: number;
  timeoutMs: number;
  // 13/11/2026: campos que NÃO vão pro servidor nesta geração (ex.: e-mail, nome, telefone)
  omitir?: string[];
  // 13/11/2026: dados calculados no navegador que vão junto (`extras` no corpo), função PURA da config
  incluir?: (ctx: Contexto) => Record<string, string>;
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
  // 13/11/2026: resposta de múltipla escolha (valores separados por "|") inclui este valor
  | { campo: string; inclui: string }
  // 13/11/2026: decisão do Jev (ou de outra camada do servidor) que veio numa geração e ainda
  // vale: `dados[dado]` igual a / em / definido. É o "pular passo por decisão do Jev"
  // (ex.: a etapa da consequência some se o Jev leu a consequência no texto livre)
  | { decisao: string; dado: string; igual?: string; em?: string[]; definido?: boolean }
  | { todas: Condicao[] }
  | { alguma: Condicao[] }
  | { nao: Condicao };

// --------------------------------------------------------------------------
// Textos com template ({{variavel}}) e variantes por condição
// --------------------------------------------------------------------------
export type Texto = string | { padrao: string; casos: { quando: Condicao; texto: string }[] };

export type Opcao = { valor: string; rotulo: string };

// 13/11/2026: ou calculada por uma função PURA da config (ex.: chips na ordem do que a pessoa marcou antes)
export type ListaOpcoes = Opcao[] | { catalogo: string } | { calcular: (ctx: Contexto) => Opcao[] };

export type Opcoes = ListaOpcoes | { padrao: ListaOpcoes; casos: { quando: Condicao; opcoes: ListaOpcoes }[] };

// --------------------------------------------------------------------------
// Validação de texto
// --------------------------------------------------------------------------
export type Validacao =
  | { regra: "email"; mensagem: string }
  | { regra: "minCaracteres"; valor: number; mensagem: string }
  | { regra: "minDigitos"; valor: number; mensagem: string }
  // 12/11/2026: telefone do Brasil (DDD que existe, fixo 2-5 + 7 dígitos ou celular 9 + 8;
  // aceita +55 e 0 na frente; recusa número de dígito repetido). `celular`: só celular
  | { regra: "telefoneBR"; mensagem: string; celular?: boolean }
  | { regra: "custom"; nome: string }; // função em config.validadores

// --------------------------------------------------------------------------
// 13/11/2026: múltipla escolha. A resposta guarda os valores marcados separados
// por "|" (o texto livre, se houver, entra como mais um item, sem "|"). Ler com
// `valoresMultipla`/`textoMultipla` (selecao.ts); condição `{ campo, inclui }`.
// --------------------------------------------------------------------------
export type MultiplaConfig = {
  confirmar: string; // botão que envia o que está marcado (ex.: "Continuar")
  min?: number; // quantos marcar no mínimo (padrão 1; o texto livre conta como 1)
  max?: number;
  minMensagem?: string; // aviso quando falta marcar (padrão: nada acontece)
  // campo "ou escreve do seu jeito" junto dos chips
  texto?: { placeholder?: Texto; rotulo?: string };
};

// --------------------------------------------------------------------------
// 13/11/2026: horários. N campos de dia + hora, só com os dias e horas que as
// regras deixam (dias úteis, feriados, janela, a partir do próximo dia útil),
// validados de novo no envio (horarios.ts, no navegador e no servidor). A
// resposta guarda "AAAA-MM-DDTHH:MM|AAAA-MM-DDTHH:MM", no fuso da config.
// --------------------------------------------------------------------------
export type RegrasHorario = {
  quantidade: number; // quantos horários escolher (ex.: 2)
  dias: number; // quantos dias oferecer, contando do primeiro permitido
  diasUteis?: boolean; // só segunda a sexta (padrão true)
  janela: { inicio: string; fim: string }; // "09:00" e "18:00": o último horário começa antes do fim
  intervaloMin?: number; // de quanto em quanto (padrão 30)
  aPartirDe?: "proximoDiaUtil" | "amanha" | "hoje"; // padrão "proximoDiaUtil"
  feriados?: string[]; // "AAAA-MM-DD", não entram
  fuso?: string; // padrão "America/Sao_Paulo"
};
export type HorariosConfig = RegrasHorario & {
  rotulos: { opcao: string; dia: string; hora: string; confirmar: string }; // opcao aceita {{n}}
  mensagens: { incompleto: string; invalido: string; repetido: string };
};

export type Fala = { rotulo?: Texto; texto: Texto; quando?: Condicao };

// --------------------------------------------------------------------------
// Etapa
// --------------------------------------------------------------------------
export type EtapaConfig = {
  id: string;
  // número mostrado no contador ("3/7"); etapas auxiliares repetem o da mãe
  passo: number;
  // 13/11/2026: "multipla" (chips que marcam e desmarcam + "continuar", com campo de
  // texto opcional) e "horarios" (N campos de dia e hora com regras: dias úteis, janela)
  tipo: "texto" | "escolha" | "info" | "multipla" | "horarios";
  quando?: Condicao; // ausente = sempre
  // 13/11/2026: balões do bot antes da pergunta (ex.: um resumo, uma revelação), cada um
  // com um rótulo pequeno opcional em cima ("O nome disso", "Resumindo")
  falas?: (Texto | Fala)[];
  // 13/11/2026: rótulo pequeno em mono em cima da pergunta (ex.: "Pelo que você contou")
  rotulo?: Texto;
  texto: Texto;
  // 13/11/2026: linha pequena embaixo do campo (ex.: consentimento do WhatsApp)
  nota?: Texto;
  // tipo "multipla"
  multipla?: MultiplaConfig;
  // tipo "horarios"
  horarios?: HorariosConfig;
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
  // respostas rápidas (chips) numa etapa de texto: tocar responde com o `valor`
  // do chip, sem validação; a pessoa também pode escrever do jeito dela
  atalhos?: Opcoes;
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
  // efeitos colaterais de uma resposta (todos os que casam com o valor valem;
  // 13/11/2026: `valor: "*"` casa com qualquer resposta, ex.: copiar um dado do Jev
  // quando a pessoa escreveu texto livre; `deGerado` só copia se a geração ainda vale):
  // "corrigir" na coerência refaz o porte; "é isso" no palpite grava noutro
  // campo um dado decidido pelo Jev; um chip grava um valor fixo noutro campo
  // (ex.: a situação por trás da frase); "sim" na confirmação copia uma
  // variável (nome sugerido, empresa lida) pra resposta
  aoResponder?: (
    | { valor: string; refazerDesde: string }
    | { valor: string; definir: { campo: string; deGerado: { id: string; dado: string } } }
    | { valor: string; definir: { campo: string; valor: string } }
    | { valor: string; definir: { campo: string; deVariavel: string } }
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
  | { tipo: "envio"; ok: boolean }
  // 12/11/2026: um cartão visual entrou na conversa; o mapa completo foi liberado; baixou o PDF
  | { tipo: "cartao"; id: string; etapa: string }
  | { tipo: "entrega"; etapa: string | null }
  | { tipo: "pdf" }
  // 13/11/2026: o documento começou a ser montado (depois da etapa da montagem)
  | { tipo: "montagem"; etapa: string };

// medição acumulada da sessão (custo das gerações, pra ficha e pro log)
export type Medicao = { custoUsd: number; chamadasLlm: number; chamadasJev: number; cacheHits: number; fallbacks: number };

// --------------------------------------------------------------------------
// Persistência: o núcleo não sabe gravar; o cliente entrega um adaptador
// --------------------------------------------------------------------------
// 13/11/2026: a conversa como aconteceu (falas, respostas, chips oferecidos, cartões),
// montada pelo motor (motor.transcricao) pro registro do cliente (ex.: /admin)
export type Turno = {
  quem: "bot" | "pessoa";
  tipo: "abertura" | "fala" | "pergunta" | "resposta" | "cartao" | "painel" | "entrega";
  etapa?: string;
  texto: string;
  valor?: string; // a resposta crua (valor do chip, texto, horários)
  via?: "opcao" | "chip" | "texto" | "multipla" | "horarios" | "pular";
  oferecidas?: string[]; // rótulos das opções/chips que a pessoa viu
  cartao?: { id: string; tipo: string; titulo?: string; rotulo?: string; detalhe?: string };
  em?: string; // ISO, quando a pessoa respondeu
};

export type Persistencia = {
  // chamada a cada resposta (gravação parcial, se o cliente quiser). `extras` (13/11/2026):
  // a sessão (id aleatório da conversa) e a transcrição até aqui
  aoResponder?: (etapaId: string, respostas: Respostas, ctx: Contexto, extras?: { sessao: string; transcricao: Turno[] }) => void;
  // envio final; devolve pra onde redirecionar (ou nada)
  enviar: (args: {
    respostas: Respostas;
    ctx: Contexto;
    classificacao: Classificacao;
    honeypot: string;
    medicao: Medicao;
    // 13/11/2026
    sessao?: string;
    transcricao?: Turno[];
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
// 13/11/2026: o mapa como uma linha de N lugares (no lugar dos 5 fixos). Cada lugar tem o
// estilo de um dos tipos de nó, o rótulo de quando está vazio e a ligação que chega nele
export type LugarMapa = { id: string; tipo: NoMapa["tipo"]; vazio: string; texto: Texto; nota?: Texto; quando?: Condicao; aresta?: string };
export type MapaConfig = {
  lugares?: LugarMapa[]; // com isto, os campos abaixo (atual, problema...) não valem
  atual?: NoMapaConfig; // onde a pessoa está (sempre)
  problema?: NoMapaConfig;
  causa?: NoMapaConfig;
  // nós do catálogo escolhidos pela recomendação (recomendacao.ts)
  destino?: { quando?: Condicao; nota?: Texto; maximo?: number };
  passo?: NoMapaConfig;
  // rótulo das ligações
  arestas?: { problema?: string; causa?: string; destino?: string; passo?: string };
  // v2 (11/11/2026): o mapa "em montagem". Com `vazios`, o nó que ainda não tem
  // resposta aparece tracejado com este rótulo, desde o começo; `progresso` dá o
  // texto do cartão enquanto monta e quando completa (a barra é do núcleo)
  vazios?: { atual?: string; problema?: string; causa?: string; destino?: string; passo?: string };
  progresso?: { montando: Texto; pronto: Texto };
};
export type NoMapa = { id: string; tipo: "atual" | "problema" | "causa" | "destino" | "passo"; texto: string; nota?: string; vazio?: boolean };
export type Mapa = {
  nos: NoMapa[];
  arestas: { de: string; para: string; rotulo?: string }[];
  // quantos lugares do mapa já têm resposta (atual, problema, causa, o que resolve, passo)
  progresso: { cheios: number; total: number };
  completo: boolean;
  linear?: boolean; // 13/11/2026: montado por `lugares` (uma linha de nós, na ordem)
};

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

// --------------------------------------------------------------------------
// 12/11/2026: cartões visuais dentro da conversa. Uma fala do bot que traz um
// gráfico gerado por código a partir das respostas. A config diz o tipo, depois
// de qual etapa entra, a condição, os textos e uma função PURA `calcular` que lê
// o contexto e devolve os dados (ou null = não mostra). O núcleo valida, formata
// e desenha (cartoes.ts + ui/graficos/Cartao.tsx). Textos com template podem usar
// os valores calculados ({{valor}}, {{min}}, {{max}}, {{nivel}}...) e o que o
// servidor escreveu ({{gerado.<id>.<chave>}}, ou a chave `gerado` do cartão).
// --------------------------------------------------------------------------
export type FormatoNumero = {
  estilo?: "decimal" | "moeda"; // moeda = Intl currency (config.idioma)
  moeda?: string; // padrão "BRL"
  casas?: number; // casas decimais (padrão 0)
  prefixo?: string; // ex.: "≈ "
  sufixo?: string; // ex.: " h"
};

export type DadosNumero = {
  valor: number;
  faixa?: [number, number]; // de quanto a quanto (a estimativa honesta)
  formato?: FormatoNumero;
  unidade?: string; // ao lado do número grande (ex.: "h/mês")
  conta?: string; // a conta por trás, numa linha (ex.: "≈ 320 chamados/mês × 12 min")
  // 13/11/2026: o que aparece no lugar do número (ex.: "26 a 52", "?"); sem contagem
  texto?: string;
  regua?: boolean; // padrão true; false tira a régua (ex.: quando não há número)
};
export type DadosBarras = {
  itens: { rotulo: string; valor: number; destaque?: boolean; nota?: string }[];
  formato?: FormatoNumero;
  maximo?: number; // escala (padrão: o maior valor)
  diferenca?: boolean; // mostra a variação do 1º pro último item
};
export type PassoFluxo = { texto: string; marca?: boolean }; // marca: trava (antes) ou ganho (depois)
export type DadosAntesDepois = {
  antes: { titulo: string; passos: PassoFluxo[] };
  depois: { titulo: string; passos: PassoFluxo[] };
};
export type DadosLinhaTempo = {
  etapas: { quando: string; titulo: string; texto?: string }[];
  atual?: number; // 1 = a primeira etapa em destaque
};
export type DadosMedidor = {
  niveis: { rotulo: string; texto?: string }[]; // do mais baixo pro mais alto
  atual: number; // 1..n
  alvo?: number; // atual..n (onde dá pra chegar)
  rotuloAtual?: string; // ex.: "hoje"
  rotuloAlvo?: string; // ex.: "dá pra chegar"
};

// 13/11/2026: cena desenhada. O desenho (SVG pronto, da config, nunca gerado na hora)
// + 2 ou 3 rótulos por cima, nas palavras da pessoa, posicionados em % do desenho,
// + logo e nome opcionais (ex.: "o atendimento da Empresa hoje"). O núcleo confere o
// SVG (sem script, sem evento, sem link externo) e limita os rótulos.
export type RotuloCena = {
  texto: string;
  x: number; // 0 a 100 (% da largura do desenho)
  y: number; // 0 a 100 (% da altura)
  lado?: "esquerda" | "direita" | "centro"; // de que lado do ponto o rótulo cresce (padrão "direita")
  alerta?: boolean; // o ponto de quebra (cor de alerta)
  // "anotacao" (padrão): as palavras da pessoa, em etiqueta; "bloco": o nome de um elemento
  // do desenho (ex.: "time de TI"), sem moldura. Texto da pessoa nunca entra no SVG: vem aqui
  tipo?: "anotacao" | "bloco";
};
// o mesmo desenho recomposto pra outra proporção (ex.: 4:3 no celular), com os rótulos no lugar
// `legenda` (13/11/2026): as anotações viram marcadores numerados no desenho e a lista com as
// palavras logo abaixo (pra composição estreita, onde 3 rótulos de 28 caracteres cruzariam linha)
export type LayoutCena = { svg: string; proporcao: number; rotulos?: RotuloCena[]; placa?: { x: number; y: number }; legenda?: boolean };
export type DadosCena = {
  svg: string; // marcação <svg ...>...</svg>, com viewBox
  proporcao?: number; // largura / altura (padrão 16/9)
  descricao: string; // texto alternativo do desenho (leitor de tela)
  rotulos?: RotuloCena[];
  logo?: { src: string; alt: string } | null;
  nome?: string; // nome ao lado do logo (ou sozinho, sem logo)
  placa?: { x: number; y: number }; // onde fica a placa de logo + nome (padrão canto de cima, à esquerda)
  // 13/11/2026: faixa no topo com logo (ou nome) e uma linha em mono (ex.: "atendimento da X hoje")
  faixa?: { texto: string };
  // a composição pro cartão estreito (abaixo de ~480 px de largura do cartão)
  estreito?: LayoutCena;
};

export type DadosPorTipoCartao = {
  numero: DadosNumero;
  barras: DadosBarras;
  antesDepois: DadosAntesDepois;
  linhaTempo: DadosLinhaTempo;
  medidor: DadosMedidor;
  cena: DadosCena;
};
export type TipoCartao = keyof DadosPorTipoCartao;

type CartaoBase = {
  id: string;
  // a etapa depois da qual o cartão entra na conversa (como uma fala do bot)
  apos: string;
  quando?: Condicao;
  fala?: Texto; // balão do bot logo antes do cartão
  rotulo?: Texto; // linha pequena em mono no topo (ex.: "Estimativa")
  titulo?: Texto;
  legenda?: Texto; // nota de rodapé (premissas, fonte)
  // textos escritos no servidor (chaves de `Gerado.textos`); valem quando a geração
  // chegou e ainda vale, senão fica o texto da config
  gerado?: { id: string; fala?: string; rotulo?: string; titulo?: string; legenda?: string };
  // entra no mapa liberado e no PDF (padrão true)
  naEntrega?: boolean;
  // 13/11/2026: só no documento/PDF, nunca na conversa (ex.: maturidade e etapas)
  soNaEntrega?: boolean;
};
export type CartaoConfig = { [K in TipoCartao]: CartaoBase & { tipo: K; calcular: (ctx: Contexto) => DadosPorTipoCartao[K] | null } }[TipoCartao];

// --------------------------------------------------------------------------
// 12/11/2026: o mapa completo liberado depois de uma etapa (padrão: a última
// etapa de telefone), grande na tela, com resumo, os cartões da conversa e
// "Baixar em PDF" (impressão do navegador com folha clara; ver entrega.ts e
// ui/Entrega.tsx). Antes de liberar, a lateral continua montando ao vivo
// (teaser), e os lugares em `teaser.ocultar` aparecem prontos mas fechados.
// --------------------------------------------------------------------------
// 13/11/2026: o documento (no lugar do mapa liberado padrão). Seções em ordem,
// cada uma com `quando` (é assim que o PDF muda pelo papel da pessoa: a página
// "pra levar pra diretoria" é uma seção com quando) e `novaPagina` (folha nova no PDF).
export type ItemDocumento = { titulo: string; texto?: string; nota?: string };
export type SecaoDocumento = {
  id: string;
  tipo: "mapa" | "cartoes" | "itens" | "texto" | "resumo";
  quando?: Condicao;
  novaPagina?: boolean | Condicao; // folha nova no PDF (sempre, ou só quando a condição vale)
  rotulo?: Texto; // linha em mono acima do título
  titulo?: Texto;
  texto?: Texto;
  paragrafos?: Texto[];
  cartoes?: string[]; // tipo "cartoes": ids dos cartões, nesta ordem (inclui os soNaEntrega)
  itens?: (ctx: Contexto) => ItemDocumento[]; // tipo "itens": função PURA da config
  colunas?: [string, string]; // tipo "itens": cabeçalho das duas colunas (ex.: "O que vocês precisam", "Como resolve")
  destaque?: boolean; // caixa com fundo (ex.: contato)
};
export type DocumentoConfig = {
  preparadoPara?: Texto; // "Preparado para a {{empresa}}"
  cliente?: Texto; // nome da empresa da pessoa, ao lado do logo dela (ex.: "{{empresa}}")
  logoCliente?: boolean; // logo da empresa lida pelo e-mail ao lado do logo da marca (sem logo: só o nome)
  secoes: SecaoDocumento[];
};

export type EntregaConfig = {
  apos?: string; // etapa que destrava (padrão: a última com input "tel"; sem ela, o fim da conversa)
  // 13/11/2026: libera só no fim da conversa (ignora `apos` e o telefone)
  noFim?: boolean;
  // 13/11/2026: o documento "começa a ser montado" depois desta etapa: um cartão na conversa
  // com a barra e o que está sendo montado, que fecha quando a entrega libera
  montagem?: { apos: string; rotulo: Texto; pronto: Texto; itens?: Texto[]; duracaoMs?: number };
  // 13/11/2026: documento por seções (com isto, a entrega vira o documento)
  documento?: DocumentoConfig;
  quando?: Condicao; // condição a mais
  fala?: Texto; // balão do bot logo antes do mapa
  rotulo?: Texto; // linha em mono acima do título (ex.: "Mapa liberado")
  titulo: Texto;
  subtitulo?: Texto; // aceita {{hoje}}
  tituloMapa?: Texto;
  fecho?: Texto; // o que acontece agora
  link?: { href: string; rotulo: string }; // ação secundária (ex.: conhecer o site)
  botaoPdf: string;
  dicaPdf?: string; // ex.: "Abre a impressão: escolha Salvar como PDF"
  verCompleto?: string; // botão na lateral depois de liberar (desktop)
  resumo?: boolean; // inclui o resumo do caso (padrão true)
  cartoes?: boolean; // inclui os cartões da conversa (padrão true)
  // 13/11: tipo do nó ou id do lugar; `ateMontagem`: abre quando o documento começa a ser montado
  teaser?: { ocultar?: (NoMapa["tipo"] | string)[]; rotulo?: string; ateMontagem?: boolean };
  pdf?: {
    arquivo?: Texto; // nome sugerido do arquivo (vira o título da página durante a impressão)
    logo?: { src: string; alt: string; altura?: number }; // logo pra papel claro
    cabecalho?: Texto; // linha no topo da folha (aceita {{hoje}})
    rodape?: Texto; // linha no pé da folha
    tema?: Record<string, string>; // tokens --cv-* da folha (padrão: neutro claro do núcleo)
  };
};

export type ConfigConversa = {
  id: string;
  marca: {
    titulo: string;
    rotuloRegiao: string;
    subtitulo?: string;
    // logo do cliente no cabeçalho (tela e widget); `href` vira link (`hrefRotulo` é o
    // aria-label do link), `alt` é obrigatório; `altura` (px) vale na tela cheia, o
    // widget usa o token --cv-logo-altura (18 px)
    logo?: { src: string; alt: string; href?: string; hrefRotulo?: string; altura?: number };
  };
  // cabeçalho (tela e widget): o que mostrar além do logo. Sem nada aqui, fica
  // como sempre foi (título, subtítulo, contagem "n de total" e barra curta).
  // Um chat de verdade desliga título e contagem e liga a presença e a frase.
  cabecalho?: {
    titulo?: boolean; // mostrar marca.titulo (padrão true)
    subtitulo?: boolean; // mostrar marca.subtitulo (padrão true)
    // presença: ponto + texto ("online", "digitando"...), muda com o estado da conversa
    estado?: { online: string; digitando: string; enviando?: string; encerrado?: string };
    // frase de abertura na linha do cabeçalho, por origem (só na tela cheia)
    frase?: Texto;
    // contagem + barra curta (padrão), só a barra fina na borda de baixo, ou nada
    progresso?: "contagem-e-barra" | "contagem" | "barra" | "nenhum";
  };
  // claro (padrão) ou escuro: cada modo tem o próprio padrão neutro no CSS do
  // núcleo (ui/tela.css, ui/conversa.css); `tema` sobrescreve por cima
  modo?: "claro" | "escuro";
  // "editorial" (padrão): fala do bot com filete, abertura com título grande,
  // botão de enviar ao lado do campo. "chat": balões, abertura em balões curtos
  // que entram em sequência com "digitando" entre eles, botão de enviar dentro
  // do campo, opções como chips, erro de validação como fala do bot. As formas
  // (raio do balão, do campo, do chip, do cartão; fundo do balão) são tokens
  // --cv-radius-* e --cv-bot-* no tema
  estilo?: "editorial" | "chat";
  // intervalo entre os balões da abertura no estilo chat (padrão 650 ms)
  aberturaMs?: number;
  // variáveis CSS --cv-* (ver ui/tela.css: cores, fontes, textura, bolha da pessoa, opções)
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
  // 12/11/2026: cartões visuais na conversa e o mapa liberado (com PDF)
  cartoes?: CartaoConfig[];
  // quanto a próxima pergunta espera depois de um cartão (padrão 900 ms), pra ele se desenhar
  pausaCartaoMs?: number;
  entrega?: EntregaConfig;
  // idioma de números e datas (padrão "pt-BR")
  idioma?: string;
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
