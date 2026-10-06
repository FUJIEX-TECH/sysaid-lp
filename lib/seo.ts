// Datas reais de cada rota, usadas no sitemap (lastmod) e nos schemas (dateModified).
// REGRA: ao mudar o conteúdo visível de uma página, atualize o `modificado` dela aqui
// no mesmo commit. Data que muda a cada build (o antigo `new Date()`) faz o Google e
// o Bing pararem de confiar no lastmod.

export const BASE = "https://itsm.sysaid.com.br";
export const ORG_ID = `${BASE}/#organization`;

type Pagina = {
  nome: string;
  publicado: string; // AAAA-MM-DD, primeiro commit da rota
  modificado: string; // AAAA-MM-DD, última mudança de conteúdo
  prioridade: number;
  frequencia: "weekly" | "monthly";
};

export const PAGINAS: Record<string, Pagina> = {
  "/": { nome: "SysAid Brasil", publicado: "2026-07-24", modificado: "2026-10-04", prioridade: 1, frequencia: "weekly" },
  "/sistema-de-chamados": { nome: "Sistema de chamados", publicado: "2026-08-04", modificado: "2026-10-02", prioridade: 0.9, frequencia: "monthly" },
  "/o-que-e-itsm": { nome: "O que é ITSM", publicado: "2026-08-04", modificado: "2026-10-06", prioridade: 0.8, frequencia: "monthly" },
  "/service-desk": { nome: "Service desk", publicado: "2026-09-30", modificado: "2026-10-01", prioridade: 0.8, frequencia: "monthly" },
  "/gestao-de-servicos-de-ti": { nome: "Gestão de serviços de TI", publicado: "2026-08-13", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/esm": { nome: "ESM", publicado: "2026-10-01", modificado: "2026-10-01", prioridade: 0.8, frequencia: "monthly" },
  "/glpi": { nome: "SysAid x GLPI", publicado: "2026-07-28", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/freshdesk": { nome: "SysAid x Freshdesk", publicado: "2026-08-05", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/zendesk": { nome: "SysAid x Zendesk", publicado: "2026-08-05", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/jira": { nome: "SysAid x Jira", publicado: "2026-08-05", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/movidesk": { nome: "SysAid x Movidesk", publicado: "2026-08-05", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/topdesk": { nome: "SysAid x TOPdesk", publicado: "2026-08-07", modificado: "2026-10-04", prioridade: 0.8, frequencia: "monthly" },
  "/servicenow": { nome: "SysAid x ServiceNow", publicado: "2026-10-06", modificado: "2026-10-06", prioridade: 0.8, frequencia: "monthly" },
};

const url = (path: string) => (path === "/" ? `${BASE}/` : `${BASE}${path}`);

// Campos comuns pra espalhar em qualquer schema de página (FAQPage, WebPage, Article).
export function datasDaPagina(path: string) {
  const p = PAGINAS[path];
  return { url: url(path), datePublished: p.publicado, dateModified: p.modificado };
}

// Início > Página
export function breadcrumbSchema(path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
      { "@type": "ListItem", position: 2, name: PAGINAS[path].nome, item: url(path) },
    ],
  };
}
