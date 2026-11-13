import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyCookie, ADMIN_COOKIE } from "@/lib/auth";
import { lerConversa } from "@/lib/qualifica-db";
import LoginForm from "../../../LoginForm";
import DocumentoReconstruido from "./DocumentoReconstruido";

export const dynamic = "force-dynamic";

// 13/11/2026: o documento (PDF) de um lead, reconstruído das respostas gravadas com a
// mesma configuração do chat. O PDF nunca é guardado: sai na hora, pela impressão.
export default async function AdminQualificaDocumento({ params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  if (!verifyCookie(store.get(ADMIN_COOKIE)?.value)) return <LoginForm />;
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const c = await lerConversa(n);
  if (!c) notFound();
  return <DocumentoReconstruido fluxo={c.fluxo ?? ""} dados={JSON.parse(JSON.stringify(c.dados ?? {}))} criadoEm={c.created_at} />;
}
