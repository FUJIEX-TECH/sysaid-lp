// ==========================================================================
// Qualifica v2 — qual configuração a conversa usa.
// 13/11/2026: a busca genérica ganhou o fluxo consultivo (config-sysaid-generica.ts) e
// comparativa, marca e preço ficaram no fluxo de sempre (config-sysaid.ts).
// 24/11/2026 (pedido do Fernando): TODA origem usa o fluxo consultivo; o que muda com
// a campanha é a abertura, a 1ª pergunta e os chips (origens-sysaid.ts). A origem é
// a mesma regra das duas configs (UTMs, gclid, página, ?de=, UTM guardada pela LP).
// Pra testar: ?fluxo=anterior força o fluxo de sempre (comparação).
// ==========================================================================

import type { ConfigConversa, Sinais } from "@/lib/conversa-core";
import { configSysaid } from "@/lib/diagnostico/config-sysaid";
import { configSysaidGenerica } from "@/lib/diagnostico/config-sysaid-generica";

export const FLUXOS: Record<string, ConfigConversa> = { [configSysaid.id]: configSysaid, [configSysaidGenerica.id]: configSysaidGenerica };

export function escolherConfig(sinais: Sinais): ConfigConversa {
  return sinais.parametros.fluxo === "anterior" ? configSysaid : configSysaidGenerica;
}
