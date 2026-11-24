// Nomes legíveis dos logos de clientes e dos selos, usados no alt das imagens.
// Selos conferidos olhando os SVGs em public/badges (21/10/2026).

export const NOME_CLIENTE: Record<string, string> = {
  vale: "Vale", unimed: "Unimed", petrobras: "Petrobras", cocacola: "Coca-Cola",
  siemens: "Siemens", cisco: "Cisco", kpmg: "KPMG", mcdonalds: "McDonald's",
  lufthansa: "Lufthansa", ems: "EMS",
};

export const NOME_SELO: Record<string, string> = {
  badge_2: "SourceForge Leader Winter 2025",
  badge_5: "TrustRadius Top Rated 2025",
  badge_7: "GetApp Category Leaders 2025",
  badge_3: "Gartner Peer Insights Customers' Choice 2025",
  badge_6: "TrustRadius Buyer's Choice 2025",
};

export const altCliente = (c: string) => `${NOME_CLIENTE[c] ?? c}, cliente SysAid`;
export const altSelo = (b: string) => `SysAid: ${NOME_SELO[b] ?? "selo de reconhecimento"}`;
