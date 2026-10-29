// ==========================================================================
// Diagnóstico ITSM — pontuação por código (plano, seção 4).
// Forte 11+ · Médio 7 a 10 · Fraco até 6 · máximo 15.
// Rótulos que vencem o ponto ("só cotando", "fora do perfil", "cliente atual")
// são do Jev na versão final; aqui só os que o código já sabe sem ler texto
// (estudante, "só orçamento", cliente SysAid). Ver jev.ts pra confirmação.
// ==========================================================================

import type { Respostas } from "./fluxo";

export type Classe = "forte" | "medio" | "fraco";
export type Rotulo = "cotando" | "fora" | "cliente" | null;

export type Pontuacao = {
  pontos: number;
  detalhe: Record<string, number>;
  classe: Classe;
  rotuloCodigo: Rotulo;
};

export type Tempos = {
  segundosTotal: number; // da abertura ao envio
};

export function pontuar(r: Respostas, t?: Tempos): Pontuacao {
  const d: Record<string, number> = {};

  d.situacao = r.situacao === "troca" ? 3 : r.situacao === "sem" ? 2 : 0;
  d.dor = r.dor && r.dor !== "vaga" ? 2 : 0;
  d.usuarios = ({ "50": 0, "200": 2, "1000": 3, mais: 3 } as Record<string, number>)[r.usuarios ?? ""] ?? 0;
  d.tecnicos = ({ "1-2": 0, "3-10": 1, "+10": 2 } as Record<string, number>)[r.tecnicos ?? ""] ?? 0;
  d.papel = ({ decide: 3, influencia: 2, levanta: 1, estuda: 0 } as Record<string, number>)[r.papel ?? ""] ?? 0;
  d.prazo = ({ tri: 3, "6m": 2, sem: 0, cota: 0 } as Record<string, number>)[r.prazo ?? ""] ?? 0;

  // capricho: texto da dor com 60+ caracteres e tempo total entre 90 s e 12 min
  const texto = (r.dor_texto ?? "").trim().length;
  const seg = t?.segundosTotal ?? 0;
  d.capricho = texto >= 60 && seg >= 90 && seg <= 12 * 60 ? 1 : 0;

  const pontos = Math.min(15, Object.values(d).reduce((a, b) => a + b, 0));
  const classe: Classe = pontos >= 11 ? "forte" : pontos >= 7 ? "medio" : "fraco";

  let rotuloCodigo: Rotulo = null;
  if (r.papel === "estuda") rotuloCodigo = "fora";
  else if (r.situacao === "cliente") rotuloCodigo = "cliente";
  else if (r.prazo === "cota" || (r.dor === "custo" && r.prazo === "sem")) rotuloCodigo = "cotando";

  return { pontos, detalhe: d, classe, rotuloCodigo };
}

// Rota de saída (seção 4, tabela de rotas). Rótulo vence ponto.
export type Rota = Classe | "cotando" | "fora";

export function rotaDe(p: Pontuacao, rotuloJev: Rotulo): Rota {
  const rotulo = rotuloJev ?? p.rotuloCodigo;
  if (rotulo === "fora") return "fora";
  if (rotulo === "cotando") return "cotando";
  if (rotulo === "cliente") return "medio"; // cliente atual pedindo módulos = médio pro gerente de conta
  return p.classe;
}
