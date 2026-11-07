// Regera lib/disposable-domains.ts a partir da lista pública (CC0)
// github.com/disposable-email-domains/disposable-email-domains.
// Uso: node scripts/gerar-dominios-descartaveis.mjs
// Criado em 07/11/2026 depois do "lead completo" de 04/11 com e-mail uorak.com
// (descartável) que passou pela trava, virou conversão no Google Ads e treinou o lance.
import { writeFileSync } from "node:fs";

const FONTE =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf";
const res = await fetch(FONTE);
if (!res.ok) throw new Error(`HTTP ${res.status} em ${FONTE}`);
const dominios = [...new Set(
  (await res.text())
    .split("\n")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && !s.startsWith("#") && s.includes(".")),
)].sort();
if (dominios.length < 1000) throw new Error(`lista curta demais (${dominios.length}), não sobrescrevo`);
const hoje = new Date().toISOString().slice(0, 10);
const corpo = `// GERADO por scripts/gerar-dominios-descartaveis.mjs em ${hoje}. Não editar à mão.
// Fonte: ${FONTE} (CC0), ${dominios.length} domínios.
// Só servidor (lib/validation.ts): fica fora do bundle do navegador.
const LISTA = ${JSON.stringify(dominios.join("\n"))};
export const DISPOSABLE_DOMAINS_FULL: ReadonlySet<string> = new Set(LISTA.split("\\n"));
`;
writeFileSync(new URL("../lib/disposable-domains.ts", import.meta.url), corpo);
console.log(`lib/disposable-domains.ts: ${dominios.length} domínios`);
