import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyCookie, ADMIN_COOKIE } from "@/lib/auth";
import { lerConversa } from "@/lib/qualifica-db";
import type { Turno } from "@/lib/conversa-core";
import LoginForm from "../../LoginForm";
import { dataBR, horariosTexto, PAPEL_ROTULO, PEDIDO_ROTULO, FLUXO_ROTULO } from "../formato";
import "../../admin.css";

export const dynamic = "force-dynamic";

// 13/11/2026: um lead do Qualifica, com a conversa inteira como aconteceu (falas,
// respostas, chips oferecidos, texto livre, cartões vistos, horários pedidos),
// os dados da empresa e o link pra reconstruir o documento (PDF).

type Empresa = { origem?: string; nome?: string; site?: string; cnpj?: string; razaoSocial?: string; cidade?: string; uf?: string; porte?: string; atividade?: string; desde?: string };

export default async function AdminQualificaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  if (!verifyCookie(store.get(ADMIN_COOKIE)?.value)) return <LoginForm />;
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const c = await lerConversa(n);
  if (!c) notFound();
  const turnos = (c.conversa ?? []) as Turno[];
  const dados = c.dados ?? {};
  const derivados = (dados.derivados ?? {}) as Record<string, unknown>;
  // só a empresa lida de verdade (site ou CNPJ); o chute pelo domínio não conta
  const lida = (dados.empresa ?? null) as Empresa | null;
  const empresa = lida && lida.origem !== "fallback" ? lida : null;
  const classificacao = (dados.classificacao ?? null) as { classe?: string; pontos?: number; rotulo?: string | null } | null;
  const respostas = (dados.respostas ?? {}) as Record<string, string>;
  const linha = (rotulo: string, valor: unknown) =>
    valor === undefined || valor === null || valor === "" ? null : (
      <>
        <dt>{rotulo}</dt>
        <dd>{typeof valor === "string" ? valor : Array.isArray(valor) ? valor.map((v) => (typeof v === "object" && v && "nome" in v ? (v as { nome: string }).nome : String(v))).join(" · ") : JSON.stringify(valor)}</dd>
      </>
    );
  const conta = derivados.conta as { medido?: boolean; diasTexto?: string; hMesTexto?: string; horasTexto?: string; volume?: string } | null;

  return (
    <div className="admin">
      <a className="admin__voltar" href="/admin/qualifica">← Leads do Qualifica</a>
      <header className="admin__top">
        <div>
          <h1>{c.name || c.email || "Conversa sem nome"}</h1>
          <p className="admin__sub">
            {c.company ? `${c.company} · ` : ""}
            {dataBR(c.created_at)} (Brasília) · {c.completo ? "conversa completa" : "parou no meio"} · {FLUXO_ROTULO[c.fluxo ?? ""] ?? c.fluxo}
          </p>
        </div>
        <a className="qd__acao" href={`/admin/qualifica/${c.id}/documento`} target="_blank" rel="noopener">
          Abrir o documento (PDF)
        </a>
      </header>

      <div className="qd">
        <section className="qd__bloco" aria-label="A conversa">
          <h2>A conversa, como aconteceu</h2>
          <div className="qd__chat">
            {turnos.map((t, i) => {
              if (t.quem === "pessoa")
                return (
                  <p key={i} className="qd__turno qd__turno--pessoa">
                    {t.texto}
                    <span className="qd__meta">
                      {t.via === "chip" ? "tocou no chip" : t.via === "texto" ? "escreveu" : t.via === "multipla" ? "múltipla escolha" : t.via === "horarios" ? "horários" : t.via === "pular" ? "pulou" : "escolheu"}
                      {t.em ? ` · ${dataBR(t.em)}` : ""}
                    </span>
                  </p>
                );
              if (t.tipo === "cartao")
                return (
                  <p key={i} className="qd__turno qd__turno--cartao">
                    <span className="qd__rotulo">Cartão visto · {t.cartao?.tipo}</span>
                    {t.cartao?.titulo ?? t.texto}
                    {t.cartao?.detalhe && <span className="qd__meta">{t.cartao.detalhe}</span>}
                  </p>
                );
              const rot = /^\[([^\]]+)\]\s*/.exec(t.texto);
              return (
                <div key={i} style={{ display: "contents" }}>
                  <p className={`qd__turno qd__turno--${t.tipo === "painel" ? "painel" : t.tipo === "entrega" ? "entrega" : "bot"}`}>
                    {rot && <span className="qd__rotulo">{rot[1]}</span>}
                    {rot ? t.texto.slice(rot[0].length) : t.texto}
                  </p>
                  {t.oferecidas && t.oferecidas.length > 0 && (
                    <div className="qd__ofertas" aria-label="Opções oferecidas">
                      {t.oferecidas.map((o) => (
                        <span key={o}>{o}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="qd__lateral">
          <section className="qd__bloco" aria-label="Contato e próximo passo">
            <h2>Contato e próximo passo</h2>
            <dl className="qd__dados">
              {linha("Nome", c.name)}
              {linha("E-mail", c.email)}
              {linha("WhatsApp", c.phone)}
              {linha("Cargo", derivados.cargo)}
              {linha("Papel", c.papel ? PAPEL_ROTULO[c.papel] ?? c.papel : null)}
              {linha("Próximo passo", c.pedido ? PEDIDO_ROTULO[c.pedido] : null)}
              {linha("Horários", horariosTexto(c.horarios))}
              {c.horarios_validos === false && linha("Atenção", `horários fora das regras: ${respostas.reuniao_orcamento ?? respostas.reuniao}`)}
              {linha("Lead", c.lead_id ? `#${c.lead_id} (${c.completion ?? "?"})` : null)}
              {linha("Termo / campanha", [c.utm_term, c.utm_campaign].filter(Boolean).join(" · "))}
            </dl>
          </section>
          <section className="qd__bloco" aria-label="O caso">
            <h2>O caso</h2>
            <dl className="qd__dados">
              {linha("Dor principal", derivados.dor_principal_nome)}
              {linha("Dores", derivados.dores)}
              {linha("Consequências", derivados.consequencias)}
              {linha("Consequência (texto)", derivados.consequencia_texto)}
              {linha("Quer", derivados.payoffs)}
              {linha("Quer (texto)", derivados.payoff_texto)}
              {linha("A conta", conta ? (conta.medido ? `${conta.diasTexto} dias/ano · ≈ ${conta.hMesTexto} h/mês (${conta.horasTexto})` : "ninguém mede hoje") : null)}
              {linha("Volume esperado", conta?.volume ? `${conta.volume} chamados/mês (pessoas × 1,3)` : null)}
              {linha("Ferramenta", derivados.ferramenta)}
              {linha("Capacidades", derivados.capacidades)}
              {linha("Classe", classificacao ? `${classificacao.classe} · ${classificacao.pontos} pontos${classificacao.rotulo ? ` · ${classificacao.rotulo}` : ""}` : null)}
            </dl>
            <p className="qd__ressalva">O plano no Brasil muda o que entra (ex.: gestão de SLA a partir do Completo): ver a coluna "Plano no Brasil" das capacidades no arquivo do sysaid-growth.</p>
          </section>
          {empresa && (
            <section className="qd__bloco" aria-label="Empresa">
              <h2>Empresa lida pelo e-mail</h2>
              <dl className="qd__dados">
                {linha("Nome", empresa.nome)}
                {linha("Site", empresa.site)}
                {linha("Razão social", empresa.razaoSocial)}
                {linha("CNPJ", empresa.cnpj)}
                {linha("Cidade", [empresa.cidade, empresa.uf].filter(Boolean).join(" / "))}
                {linha("Porte", empresa.porte)}
                {linha("Atividade", empresa.atividade)}
                {linha("Desde", empresa.desde)}
              </dl>
            </section>
          )}
          <section className="qd__bloco" aria-label="Respostas cruas">
            <h2>Respostas cruas</h2>
            <pre className="qd__json">{JSON.stringify(respostas, null, 1)}</pre>
          </section>
        </aside>
      </div>
    </div>
  );
}
