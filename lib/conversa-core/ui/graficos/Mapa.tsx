"use client";

import type { Mapa as MapaDados, NoMapa } from "../../tipos";

// conversa-core — v2: o mapa do caso como fluxograma vertical, montado por
// código (HTML + CSS, sem imagem). Onde está → problema → o que acontece hoje
// → o que resolve (nós do catálogo, lado a lado) → primeiro passo. Cada nó
// novo entra animado; mudou a resposta, o mapa se refaz.

type Props = { mapa: MapaDados; titulo?: string };

function No({ no }: { no: NoMapa }) {
  return (
    <div className={`cvm__no cvm__no--${no.tipo}`} key={`${no.id}:${no.texto}`}>
      {no.nota && <span className="cvm__nota">{no.nota}</span>}
      <span className="cvm__texto">{no.texto}</span>
    </div>
  );
}

function Liga({ rotulo }: { rotulo?: string }) {
  return (
    <div className="cvm__liga" aria-hidden="true">
      {rotulo && <span>{rotulo}</span>}
    </div>
  );
}

export default function Mapa({ mapa, titulo }: Props) {
  const por = (tipo: NoMapa["tipo"]) => mapa.nos.filter((n) => n.tipo === tipo);
  const atual = por("atual")[0];
  const problema = por("problema")[0];
  const causa = por("causa")[0];
  const destinos = por("destino");
  const passo = por("passo")[0];
  const rotulo = (para: string) => mapa.arestas.find((a) => a.para === para)?.rotulo;

  return (
    <figure className="cvg cvg--mapa" aria-label={titulo ?? "Mapa do caso"}>
      {titulo && <figcaption className="cvg__titulo">{titulo}</figcaption>}
      <div className="cvm">
        {atual && <No no={atual} />}
        {problema && (
          <>
            <Liga rotulo={rotulo(problema.id)} />
            <No no={problema} />
          </>
        )}
        {causa && (
          <>
            <Liga rotulo={rotulo(causa.id)} />
            <No no={causa} />
          </>
        )}
        {destinos.length > 0 && (
          <>
            <Liga rotulo={rotulo(destinos[0].id)} />
            <div className={`cvm__grupo cvm__grupo--${destinos.length}`}>
              {destinos[0].nota && <span className="cvm__grupo-nota">{destinos[0].nota}</span>}
              <div className="cvm__destinos">
                {destinos.map((d) => (
                  <No key={d.id} no={{ ...d, nota: undefined }} />
                ))}
              </div>
            </div>
          </>
        )}
        {passo && (
          <>
            <Liga rotulo={rotulo(passo.id)} />
            <No no={passo} />
          </>
        )}
      </div>
    </figure>
  );
}
