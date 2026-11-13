// formatação comum das páginas do /admin/qualifica (13/11/2026): hora sempre em Brasília
export function dataBR(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}
export const PEDIDO_ROTULO: Record<string, string> = { reuniao: "Pediu reunião", orcamento: "Pediu orçamento", whatsapp: "Prefere WhatsApp" };
export const PAPEL_ROTULO: Record<string, string> = {
  decide: "Eu decido",
  influencia: "Participa e leva pra quem decide",
  levanta: "Levantando informações pra alguém",
  estuda: "Estudante ou curioso",
};
export const FLUXO_ROTULO: Record<string, string> = { "sysaid-generica-v2": "Busca genérica (fluxo novo)", "sysaid-diagnostico-itsm": "Comparativa, marca ou preço" };
export function horariosTexto(h: { data: string; hora: string }[] | null | undefined): string {
  if (!h?.length) return "";
  return h
    .map(({ data, hora }) => {
      const d = new Date(`${data}T12:00:00Z`);
      const dia = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(d).replace(".", "");
      const [h, m] = hora.split(":");
      return `${dia} às ${Number(h)}h${m && m !== "00" ? m : ""}`;
    })
    .join(" ou ");
}
