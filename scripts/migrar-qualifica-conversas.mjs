// Qualifica v2 — aplica lib/migrations/2026-11-13-qualifica-conversas.sql no Neon
// (Severino, 13/11/2026). Só aditiva: cria a tabela qualifica_conversas e 2 índices.
// Antes de qualquer coisa faz BACKUP (fora do git, em ~/saida/qualifica-v2/):
// todas as linhas de `leads`, a lista de tabelas e as colunas do schema public.
// Sem --aplicar: só faz o backup e mostra o SQL. Com --aplicar: backup, aplica,
// confere que a tabela existe e que `leads` continua com o mesmo número de linhas.
//   cd fujiex/clientes/sysaid/landing-page-qualifica-v2
//   node scripts/migrar-qualifica-conversas.mjs            (backup + mostra)
//   node scripts/migrar-qualifica-conversas.mjs --aplicar
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const env = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL\s*=\s*["']?([^"'\n]+)/m);
if (!env) {
  console.error("sem DATABASE_URL no .env.local (rode de dentro do worktree)");
  process.exit(2);
}
const sql = neon(env[1]);
const aplicar = process.argv.includes("--aplicar");

const quando = new Date().toISOString().replace(/[:.]/g, "-");
const dir = path.join(os.homedir(), "saida", "qualifica-v2", `backup-neon-${quando}`);
fs.mkdirSync(dir, { recursive: true });
const leads = await sql`SELECT * FROM leads ORDER BY id`;
const tabelas = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1`;
const colunas = await sql`SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`;
fs.writeFileSync(path.join(dir, "leads.json"), JSON.stringify(leads, null, 1));
fs.writeFileSync(path.join(dir, "schema.json"), JSON.stringify({ tabelas, colunas }, null, 1));
const conferido = JSON.parse(fs.readFileSync(path.join(dir, "leads.json"), "utf8"));
if (conferido.length !== leads.length) {
  console.error("backup não confere: nada aplicado");
  process.exit(1);
}
console.log(`backup: ${leads.length} linhas de leads + schema em ${dir}`);
console.log(`tabelas hoje: ${tabelas.map((t) => t.table_name).join(", ")}`);

const texto = fs.readFileSync("lib/migrations/2026-11-13-qualifica-conversas.sql", "utf8");
// um comando por chamada (o driver HTTP do Neon não roda vários de uma vez)
const comandos = texto
  .replace(/--.*$/gm, "")
  .split(";")
  .map((c) => c.trim())
  .filter(Boolean);
console.log(`\n${comandos.length} comandos:\n${comandos.map((c) => `  ${c.split("\n")[0]}...`).join("\n")}`);
if (!aplicar) {
  console.log("\n(sem --aplicar: nada mudou no banco)");
  process.exit(0);
}
for (const c of comandos) await sql.query(c);
const existe = await sql`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qualifica_conversas'`;
const depois = await sql`SELECT count(*)::int AS n FROM leads`;
console.log(`\ntabela qualifica_conversas: ${existe[0].n === 1 ? "criada" : "NÃO ENCONTRADA"}`);
console.log(`leads antes ${leads.length}, depois ${depois[0].n} ${depois[0].n === leads.length ? "(igual)" : "(MUDOU: conferir)"}`);
