// ==========================================================================
// conversa-core — 13/11/2026: horários (só funções puras, sem DOM). Regras da
// config (`RegrasHorario`): quantos horários, quantos dias oferecer, só dias
// úteis, feriados, janela de horário, intervalo, a partir de quando, fuso. As
// mesmas funções montam as opções na tela e validam de novo no envio, no
// navegador e no servidor (rota do cliente). As datas são "AAAA-MM-DD" no fuso
// da config; a conta de dia é feita em UTC ao meio-dia (sem horário de verão).
// ==========================================================================

import type { RegrasHorario } from "./tipos";

export type Horario = { data: string; hora: string }; // "2026-11-16", "10:00"

const FUSO_PADRAO = "America/Sao_Paulo";
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;
const HORA_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

// data e hora "de agora" no fuso da config
export function agoraNoFuso(agora: Date, fuso = FUSO_PADRAO): { data: string; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? "00";
  return { data: `${p("year")}-${p("month")}-${p("day")}`, minutos: Number(p("hour")) * 60 + Number(p("minute")) };
}

function utcMeioDia(data: string): Date {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

export function somarDias(data: string, n: number): string {
  const d = utcMeioDia(data);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 0 = domingo ... 6 = sábado
export function diaDaSemana(data: string): number {
  return utcMeioDia(data).getUTCDay();
}

export function diaPermitido(data: string, regras: RegrasHorario): boolean {
  if (!DATA_RE.test(data)) return false;
  const dia = diaDaSemana(data);
  if ((regras.diasUteis ?? true) && (dia === 0 || dia === 6)) return false;
  return !(regras.feriados ?? []).includes(data);
}

// o primeiro dia que pode ser escolhido
export function primeiroDia(regras: RegrasHorario, agora: Date): string {
  const hoje = agoraNoFuso(agora, regras.fuso).data;
  const modo = regras.aPartirDe ?? "proximoDiaUtil";
  let d = modo === "hoje" ? hoje : somarDias(hoje, 1);
  for (let i = 0; i < 60 && !diaPermitido(d, regras); i++) d = somarDias(d, 1);
  return d;
}

// os `regras.dias` dias permitidos, a partir do primeiro
export function diasDisponiveis(regras: RegrasHorario, agora: Date): string[] {
  const lista: string[] = [];
  let d = primeiroDia(regras, agora);
  const total = Math.max(1, Math.min(60, Math.round(regras.dias)));
  for (let i = 0; lista.length < total && i < 200; i++) {
    if (diaPermitido(d, regras)) lista.push(d);
    d = somarDias(d, 1);
  }
  return lista;
}

function minutosDe(hora: string): number | null {
  const m = HORA_RE.exec(hora);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}
function horaDe(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

// os horários que começam dentro da janela: de `inicio` até antes de `fim`, de `intervaloMin` em `intervaloMin`
export function horasDisponiveis(regras: RegrasHorario): string[] {
  const ini = minutosDe(regras.janela.inicio);
  const fim = minutosDe(regras.janela.fim);
  const passo = Math.max(5, Math.round(regras.intervaloMin ?? 30));
  if (ini === null || fim === null || fim <= ini) return [];
  const lista: string[] = [];
  for (let m = ini; m < fim; m += passo) lista.push(horaDe(m));
  return lista;
}

export function lerHorarios(valor: string | undefined): Horario[] {
  return (valor ?? "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [data = "", hora = ""] = x.split("T");
      return { data, hora };
    });
}

export function juntarHorarios(lista: Horario[]): string {
  return lista.map((h) => `${h.data}T${h.hora}`).join("|");
}

export type ValidacaoHorarios = { ok: true; horarios: Horario[] } | { ok: false; motivo: "incompleto" | "invalido" | "repetido" };

// confere um valor "AAAA-MM-DDTHH:MM|..." contra as regras, no momento `agora`
export function validarHorarios(valor: string | Horario[], regras: RegrasHorario, agora: Date): ValidacaoHorarios {
  const lista = typeof valor === "string" ? lerHorarios(valor) : valor;
  if (lista.length !== regras.quantidade || lista.some((h) => !h.data || !h.hora)) return { ok: false, motivo: "incompleto" };
  const dias = new Set(diasDisponiveis(regras, agora));
  const horas = new Set(horasDisponiveis(regras));
  if (lista.some((h) => !dias.has(h.data) || !horas.has(h.hora))) return { ok: false, motivo: "invalido" };
  const chaves = new Set(lista.map((h) => `${h.data}T${h.hora}`));
  if (chaves.size !== lista.length) return { ok: false, motivo: "repetido" };
  return { ok: true, horarios: lista.map((h) => ({ ...h })) };
}

// "seg, 16/11" no idioma da config
export function formatarDia(data: string, idioma = "pt-BR"): string {
  if (!DATA_RE.test(data)) return data;
  const d = utcMeioDia(data);
  const semana = new Intl.DateTimeFormat(idioma, { weekday: "short", timeZone: "UTC" }).format(d).replace(/\.$/, "");
  const dia = new Intl.DateTimeFormat(idioma, { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(d);
  return `${semana}, ${dia}`;
}

// "10h", "14h30" (forma brasileira); outro idioma usa "10:00"
export function formatarHora(hora: string, idioma = "pt-BR"): string {
  const m = HORA_RE.exec(hora);
  if (!m) return hora;
  if (!idioma.toLowerCase().startsWith("pt")) return hora;
  return m[2] === "00" ? `${Number(m[1])}h` : `${Number(m[1])}h${m[2]}`;
}

// "seg, 16/11 às 10h"
export function formatarHorario(h: Horario, idioma = "pt-BR", conector = "às"): string {
  return `${formatarDia(h.data, idioma)} ${conector} ${formatarHora(h.hora, idioma)}`;
}
