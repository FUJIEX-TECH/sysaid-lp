// Filtro de status do painel (?status=). Padrao: so completos.
export type StatusFilter = "completo" | "parcial" | "todos";

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "completo", label: "Completos" },
  { value: "parcial", label: "Parciais" },
  { value: "todos", label: "Todos" },
];

export function parseStatus(v: string | null | undefined): StatusFilter {
  return v === "parcial" || v === "todos" ? v : "completo";
}

export function matchesStatus(completion: string, status: StatusFilter): boolean {
  if (status === "todos") return true;
  const isComplete = completion === "complete";
  return status === "completo" ? isComplete : !isComplete;
}
