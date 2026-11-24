"use client";

// Bloco "Quanto custa o SysAid" das comparativas pagas (/movidesk, /topdesk,
// /freshdesk). Sem número: a SysAid Brasil não publica preço; os nomes e o
// conteúdo dos planos seguem sysaid.com.br/valores/ (conferido em 10/11/2026).
// O CTA leva ao formulário da página e manda o evento "cta_cotacao" pro GA4,
// pra separar quem pediu cotação de quem pediu demo.

const PLANOS = [
  {
    nome: "Básico",
    d: "Service desk de TI com o essencial: gestão de incidentes, gestão de ativos, controle remoto, roteamento e regras de escalonamento.",
  },
  {
    nome: "Completo",
    d: "Tudo do Básico, mais gestão de mudanças e problemas no modelo ITIL, SLA e SLM, integração por API e customização avançada.",
  },
  {
    nome: "Enterprise",
    d: "Todos os módulos, pacote de serviços profissionais, implementação completa e suporte VIP.",
  },
];

type Props = { concorrente: string; nota: string };

export default function QuantoCusta({ concorrente, nota }: Props) {
  const pedirCotacao = () => {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", "cta_cotacao", { pagina: window.location.pathname });
    }
  };

  return (
    <section className="section" id="quanto-custa">
      <div className="container container--narrow">
        <div className="section-head">
          <p className="eyebrow">Preço</p>
          <h2>Quanto custa o SysAid</h2>
          <p className="section-head__sub">
            O SysAid é cotado pelo número de administradores (quem atende os
            chamados), em assinatura anual ou licença perpétua, na nuvem ou no
            seu servidor. Usuários finais não entram na conta.
          </p>
        </div>
        <dl className="planos">
          {PLANOS.map((p) => (
            <div className="planos__row" key={p.nome}>
              <dt>{p.nome}</dt>
              <dd>{p.d}</dd>
            </div>
          ))}
        </dl>
        <p className="planos__nota">{nota}</p>
        <div className="planos__cta">
          <a className="btn btn--primary" href="#form" onClick={pedirCotacao}>
            Receber uma cotação
          </a>
          <span>
            Saindo do {concorrente}? A proposta já considera a migração.
          </span>
        </div>
      </div>
    </section>
  );
}
