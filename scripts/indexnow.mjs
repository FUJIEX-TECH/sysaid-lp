#!/usr/bin/env node
// Avisa Bing/Yandex/Seznam (via api.indexnow.org) que as URLs do site mudaram.
// O ChatGPT busca no índice do Bing, então isso acelera a descoberta pelas IAs também.
//
// Uso (DEPOIS do deploy, com a chave já servida em produção):
//   node scripts/indexnow.mjs                 → todas as URLs do sitemap.xml de produção
//   node scripts/indexnow.mjs /movidesk /esm  → só as rotas passadas
//   node scripts/indexnow.mjs --dry-run       → mostra o que mandaria, sem enviar
//
// A chave é o nome do arquivo .txt de 32 hex em public/. Trocar a chave = trocar o arquivo.

import fs from "node:fs";
import path from "node:path";

const HOST = "itsm.sysaid.com.br";
const BASE = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const publicDir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "public");
const keyFile = fs.readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("Chave IndexNow não encontrada em public/ (arquivo <32 hex>.txt).");
  process.exit(1);
}
const key = keyFile.replace(".txt", "");
const keyLocation = `${BASE}/${keyFile}`;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const rotas = args.filter((a) => a.startsWith("/"));

// 1) A chave precisa estar no ar, senão o IndexNow rejeita (403).
const kRes = await fetch(keyLocation);
const kBody = kRes.ok ? (await kRes.text()).trim() : "";
if (kBody !== key) {
  console.error(`Chave não servida em ${keyLocation} (HTTP ${kRes.status}). Fazer deploy antes.`);
  if (!dryRun) process.exit(1);
}

// 2) URLs: as rotas passadas, ou todas do sitemap de produção.
let urls;
if (rotas.length) {
  urls = rotas.map((r) => `${BASE}${r}`);
} else {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}
urls = [...new Set(urls)].filter((u) => u.startsWith(BASE));
if (!urls.length) {
  console.error("Nenhuma URL pra enviar.");
  process.exit(1);
}

const payload = { host: HOST, key, keyLocation, urlList: urls };
console.log(`${urls.length} URL(s):\n  ${urls.join("\n  ")}`);
if (dryRun) {
  console.log("\n--dry-run: nada enviado.");
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});
// 200 = recebido; 202 = recebido, validação da chave pendente. 403 = chave inválida; 422 = URL fora do host.
console.log(`\nIndexNow: HTTP ${res.status} ${res.statusText}`);
if (res.status >= 300) {
  console.log(await res.text());
  process.exit(1);
}
