"use client";

import { avaliar } from "../condicoes";
import type { Motor } from "../motor";
import type { Contexto, ResumoConfig } from "../tipos";

// conversa-core — v2: o resumo do caso que se escreve sozinho enquanto a
// pessoa responde (coluna lateral no desktop). Linhas e textos vêm da
// configuração; só entram as que têm valor.

export default function Resumo({ config, ctx, motor }: { config: ResumoConfig; ctx: Contexto; motor: Motor }) {
  const linhas = config.linhas
    .filter((l) => avaliar(l.quando, ctx, motor.resolvedor(ctx)))
    .map((l) => ({ rotulo: l.rotulo, texto: motor.texto(l.texto, ctx).trim() }))
    .filter((l) => l.texto);

  return (
    <section className="cvr" aria-live="polite">
      <h2 className="cvr__titulo">{motor.texto(config.titulo, ctx)}</h2>
      {config.subtitulo && <p className="cvr__sub">{motor.texto(config.subtitulo, ctx)}</p>}
      {linhas.length > 0 && (
        <dl className="cvr__lista">
          {linhas.map((l) => (
            <div className="cvr__linha" key={l.rotulo}>
              <dt>{l.rotulo}</dt>
              <dd>{l.texto}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
