import { cookies } from "next/headers";
import { verifyCookie, ADMIN_COOKIE } from "@/lib/auth";
import { listarConversas, type ConversaComLead } from "@/lib/qualifica-db";
import LoginForm from "../LoginForm";
import QualificaLista from "./QualificaLista";
import "../admin.css";

export const dynamic = "force-dynamic";

// 13/11/2026: só os leads do Qualifica, com a conversa inteira. O piloto roda
// aqui (sem RD Station); o comercial (Marcelo) já tem acesso ao /admin.
export default async function AdminQualificaPage() {
  const store = await cookies();
  if (!verifyCookie(store.get(ADMIN_COOKIE)?.value)) return <LoginForm />;
  let conversas: ConversaComLead[] = [];
  let erro: string | null = null;
  try {
    conversas = await listarConversas(500);
  } catch (err) {
    erro = (err as Error).message;
  }
  return <QualificaLista conversas={JSON.parse(JSON.stringify(conversas))} erro={erro} />;
}
