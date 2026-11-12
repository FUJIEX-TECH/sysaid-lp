// conversa-core — testes sem dependência: o Node (22.6+, aqui 26) roda .ts direto
// (type stripping), mas não acha import sem extensão ("./tipos"). Este registro
// liga um resolvedor que tenta ".ts" e "/index.ts" quando o import relativo falha.
// Uso: node --import ./lib/conversa-core/testes/registrar.mjs --test <arquivos .test.ts>
import { register } from "node:module";

register("./resolver.mjs", import.meta.url);
