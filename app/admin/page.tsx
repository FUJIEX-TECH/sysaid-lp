import { cookies } from "next/headers";
import { verifyCookie, ADMIN_COOKIE } from "@/lib/auth";
import { listLeads, type Lead } from "@/lib/db";
import LoginForm from "./LoginForm";
import LeadsTable from "./LeadsTable";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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

  return <LeadsTable leads={leads} dbError={dbError} />;
}
