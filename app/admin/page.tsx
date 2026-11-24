import { cookies } from "next/headers";
import { verifyCookie, ADMIN_COOKIE } from "@/lib/auth";
import { listLeads, type Lead } from "@/lib/db";
import LoginForm from "./LoginForm";
import LeadsTable from "./LeadsTable";
import { parseStatus } from "./status";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const store = await cookies();
  const authed = verifyCookie(store.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return <LoginForm />;
  }

  let leads: Lead[] = [];
  let dbError: string | null = null;
  try {
    leads = await listLeads(1000);
  } catch (err) {
    leads = [];
    dbError = (err as Error).message;
  }

  const raw = (await searchParams).status;
  const initialStatus = parseStatus(Array.isArray(raw) ? raw[0] : raw);

  return <LeadsTable leads={leads} dbError={dbError} initialStatus={initialStatus} />;
}
