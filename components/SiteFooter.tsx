import Image from "next/image";

// Rodapé com links internos do cluster (SEO-PLANO, item "internal linking cruzado").
// Fica depois do formulário final de propósito: as comparativas são LP de Google Ads,
// então o link sai do caminho de conversão e serve a rastreador e a quem já rolou até o fim.
const COMPARATIVAS = [
  { href: "/glpi", label: "SysAid vs GLPI" },
  { href: "/movidesk", label: "SysAid vs Movidesk" },
  { href: "/topdesk", label: "SysAid vs TopDesk" },
  { href: "/freshdesk", label: "SysAid vs Freshdesk" },
  { href: "/zendesk", label: "SysAid vs Zendesk" },
  { href: "/jira", label: "SysAid vs Jira Service Management" },
  { href: "/servicenow", label: "SysAid vs ServiceNow" },
];

const GUIAS = [
  { href: "/o-que-e-itsm", label: "O que é ITSM" },
  { href: "/service-desk", label: "Service desk" },
  { href: "/sistema-de-chamados", label: "Sistema de chamados" },
  { href: "/gestao-de-servicos-de-ti", label: "Gestão de serviços de TI" },
  { href: "/esm", label: "ESM: gestão de serviços corporativos" },
  { href: "/cmdb", label: "CMDB: o que é e como implantar" },
];

function Coluna({
  titulo,
  links,
  atual,
}: {
  titulo: string;
  links: { href: string; label: string }[];
  atual?: string;
}) {
  return (
    <div className="site-footer__col">
      <p className="site-footer__title">{titulo}</p>
      <ul>
        {links
          .filter((l) => l.href !== atual)
          .map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default function SiteFooter({ atual }: { atual?: string }) {
  return (
    <footer className="site-footer">
      <nav className="container site-footer__nav" aria-label="Comparativos e guias">
        <Coluna titulo="Compare o SysAid" links={COMPARATIVAS} atual={atual} />
        <Coluna titulo="Guias de ITSM" links={GUIAS} atual={atual} />
      </nav>
      <div className="container site-footer__inner">
        <a href="/" aria-label="SysAid Brasil, página inicial">
          <Image src="/logos/logo-white.svg" alt="SysAid" width={116} height={30} />
        </a>
        <p>SysAid Brasil · Software ITSM com Inteligência Artificial</p>
      </div>
    </footer>
  );
}
