"use client";

import { useState } from "react";
import type { Empresa as EmpresaDados } from "../../tipos";

// conversa-core — v2: o cartão da empresa lida pelo domínio do e-mail (logo,
// nome, site, redes, razão social, cidade, abertura). Só mostra o que veio;
// logo que não carrega vira a inicial. Textos fixos chegam por props.

type Props = {
  empresa: EmpresaDados;
  titulo?: string;
  fonte?: string; // ex.: "Dados públicos do site e da Receita Federal."
  rotulos?: { site?: string; razaoSocial?: string; cidade?: string; desde?: string; porte?: string; atividade?: string };
};

const REDES: { chave: keyof EmpresaDados["redes"]; rotulo: string }[] = [
  { chave: "instagram", rotulo: "Instagram" },
  { chave: "linkedin", rotulo: "LinkedIn" },
  { chave: "facebook", rotulo: "Facebook" },
  { chave: "youtube", rotulo: "YouTube" },
];

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function Empresa({ empresa, titulo, fonte, rotulos }: Props) {
  const [semLogo, setSemLogo] = useState(false);
  const r = { site: "Site", razaoSocial: "Razão social", cidade: "Cidade", desde: "Desde", porte: "Porte", atividade: "Atividade", ...rotulos };
  const redes = REDES.filter((x) => empresa.redes[x.chave]);
  const dados: { k: string; v: string }[] = [];
  if (empresa.razaoSocial && empresa.razaoSocial.toLowerCase() !== empresa.nome.toLowerCase()) dados.push({ k: r.razaoSocial, v: empresa.razaoSocial });
  if (empresa.cidade) dados.push({ k: r.cidade, v: empresa.uf ? `${empresa.cidade}/${empresa.uf}` : empresa.cidade });
  if (empresa.desde) dados.push({ k: r.desde, v: empresa.desde });
  if (empresa.porte) dados.push({ k: r.porte, v: empresa.porte });
  if (empresa.atividade) dados.push({ k: r.atividade, v: empresa.atividade });

  return (
    <figure className="cvg cvg--empresa" aria-label={`${titulo ?? "Empresa"}: ${empresa.nome}`}>
      {titulo && <figcaption className="cvg__titulo">{titulo}</figcaption>}
      <div className="cve__cabeca">
        <span className="cve__logo" aria-hidden="true">
          {empresa.logo && !semLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={empresa.logo} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setSemLogo(true)} />
          ) : (
            <span className="cve__inicial">{empresa.nome.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <div className="cve__ident">
          <strong className="cve__nome">{empresa.nome}</strong>
          <a className="cve__site" href={empresa.site} target="_blank" rel="noopener noreferrer">
            {host(empresa.site)}
          </a>
        </div>
      </div>
      {empresa.descricao && <p className="cve__desc">{empresa.descricao}</p>}
      {dados.length > 0 && (
        <dl className="cve__dados">
          {dados.map((d) => (
            <div key={d.k} className="cve__dado">
              <dt>{d.k}</dt>
              <dd>{d.v}</dd>
            </div>
          ))}
        </dl>
      )}
      {redes.length > 0 && (
        <ul className="cve__redes">
          {redes.map((x) => (
            <li key={x.chave}>
              <a href={empresa.redes[x.chave]} target="_blank" rel="noopener noreferrer">
                {x.rotulo}
              </a>
            </li>
          ))}
        </ul>
      )}
      {fonte && <p className="cve__fonte">{fonte}</p>}
    </figure>
  );
}
