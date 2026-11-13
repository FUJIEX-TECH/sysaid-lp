// ==========================================================================
// Qualifica v2 — qual configuração a conversa usa (13/11/2026). A busca genérica
// ("sistema de chamados", "help desk", acesso direto, orgânico) vai pro fluxo
// novo (config-sysaid-generica.ts); comparativa (Movidesk, TopDesk...), marca e
// preço continuam no fluxo de sempre (config-sysaid.ts). A origem é a mesma
// regra das duas configs (UTMs, gclid, página, parâmetro ?de=).
// Pra testar: ?fluxo=generica força o novo e ?fluxo=anterior força o de sempre.
// ==========================================================================

import { resolverOrigem, type ConfigConversa, type Sinais } from "@/lib/conversa-core";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { configSysaidGenerica } from "@/lib/diagnostico/config-sysaid-generica";

export const FLUXOS: Record<string, ConfigConversa> = { [configSysaid.id]: configSysaid, [configSysaidGenerica.id]: configSysaidGenerica };

export function escolherConfig(sinais: Sinais): ConfigConversa {
  const forca = sinais.parametros.fluxo;
  if (forca === "generica") return configSysaidGenerica;
  if (forca === "anterior") return configSysaid;
  const o = resolverOrigem(configSysaid.origens, sinais);
  return o.origem === "generica" && o.variaveis.intencao !== "preco" ? configSysaidGenerica : configSysaid;
}
