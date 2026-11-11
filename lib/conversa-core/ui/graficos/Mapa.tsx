"use client";

import type { Mapa as MapaDados, NoMapa } from "../../tipos";

// conversa-core — v2: o mapa do caso como fluxograma vertical, montado por
// código (HTML + CSS, sem imagem). Onde está → problema → o que acontece hoje
// → o que resolve (nós do catálogo, lado a lado) → primeiro passo. Desde
// 11/11/2026 o mapa aparece "em montagem": os lugares sem resposta vêm como
// nós vazios (tracejados), cada nó cheio entra aceso e a linha até ele
// conecta; o cabeçalho do cartão mostra "montando"/"pronto" (textos da
// config) e uma barra que enche com o progresso do próprio mapa.

type Props = { mapa: MapaDados; titulo?: string; progresso?: { montando: string; pronto: string } };

function No({ no }: { no: NoMapa }) {
  return (
    <div className={`cvm__no cvm__no--${no.tipo} ${no.vazio ? "cvm__no--vazio" : "cvm__no--cheio"}`} key={`${no.id}:${no.texto}`}>
      {no.nota && <span className="cvm__nota">{no.nota}</span>}
      <span className="cvm__texto">{no.texto}</span>
    </div>
  );
}

function Liga({ rotulo, ligada }: { rotulo?: string; ligada: boolean }) {
  return (
    <div className={`cvm__liga ${ligada ? "cvm__liga--ligada" : "cvm__liga--vazia"}`} aria-hidden="true">
      {rotulo && <span>{rotulo}</span>}
    </div>
  );
}

export default function Mapa({ mapa, titulo, progresso }: Props) {
  const por = (tipo: NoMapa["tipo"]) => mapa.nos.filter((n) => n.tipo === tipo);
  const atual = por("atual")[0];
  const problema = por("problema")[0];
  const causa = por("causa")[0];
  const destinos = por("destino");
  const passo = por("passo")[0];
  const rotulo = (para: string) => mapa.arestas.find((a) => a.para === para)?.rotulo;
  const cheio = (n?: NoMapa) => !!n && !n.vazio;
  const { cheios, total } = mapa.progresso;
  const pct = total ? Math.round((cheios / total) * 100) : 0;
  const estado = progresso ? (mapa.completo ? progresso.pronto : progresso.montando) : "";

  return (
    <figure className={`cvg cvg--mapa${mapa.completo ? " cvg--mapa-pronto" : ""}`} aria-label={titulo ?? "Mapa do caso"}>
      {titulo && <figcaption className="cvg__titulo">{titulo}</figcaption>}
      {progresso && (
        <div className="cvm__progresso" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={cheios} aria-label={estado}>
          <span className="cvm__estado">{estado}</span>
          <span className="cvm__barra">
            <i style={{ width: `${pct}%` }} />
          </span>
        </div>
      )}
      <div className="cvm">
        {atual && <No no={atual} />}
        {problema && (
          <>
            <Liga rotulo={rotulo(problema.id)} ligada={cheio(atual) && cheio(problema)} />
            <No no={problema} />
          </>
        )}
        {causa && (
          <>
            <Liga rotulo={rotulo(causa.id)} ligada={cheio(problema) && cheio(causa)} />
            <No no={causa} />
          </>
        )}
        {destinos.length > 0 && (
          <>
            <Liga rotulo={rotulo(destinos[0].id)} ligada={cheio(causa ?? problema) && cheio(destinos[0])} />
            <div className={`cvm__grupo cvm__grupo--${destinos.length}`}>
              {destinos[0].nota && <span className="cvm__grupo-nota">{destinos[0].nota}</span>}
              <div className={`cvm__destinos ${cheio(destinos[0]) ? "cvm__destinos--cheios" : "cvm__destinos--vazios"}`}>
                {destinos.map((d) => (
                  <No key={d.id} no={{ ...d, nota: undefined }} />
                ))}
              </div>
            </div>
          </>
        )}
        {passo && (
          <>
            <Liga rotulo={rotulo(passo.id)} ligada={cheio(destinos[0]) && cheio(passo)} />
            <No no={passo} />
          </>
        )}
      </div>
    </figure>
  );
}
