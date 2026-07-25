// Cria/atualiza o schema de leads no Neon.
// Uso: node --env-file=.env.local scripts/init-db.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ausente. Rode `vercel env pull .env.local` antes.");
  process.exit(1);
}

const sql = neon(url);
const file = new URL("../lib/schema.sql", import.meta.url);
const raw = readFileSync(file, "utf8");

// remove linhas de comentario, depois separa em statements por ';'
const cleaned = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const statements = cleaned
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  await sql.query(stmt);
  const label = stmt.split("\n")[0].slice(0, 60);
  console.log("ok:", label);
}

console.log("\nschema aplicado.");
