"use client";

// conversa-core — v2: o porte em bonequinhos, gerado por código (SVG leve).
// Cada glifo é uma pessoa (ou N pessoas, quando passa de 120); a equipe que
// atende aparece em destaque. Nada aqui é do cliente: números e rótulos chegam prontos.

type Props = {
  pessoas: number;
  equipe: number;
  rotuloPessoas: string;
  rotuloEquipe: string;
  titulo?: string;
  legenda?: string;
};

const MAX = 120;
const COLS = 24;
const W = 10;
const H = 15;

function Pessoa({ x, y, i, classe }: { x: number; y: number; i: number; classe: string }) {
  return (
    <g className={classe} transform={`translate(${x} ${y})`} style={{ animationDelay: `${i * 9}ms` }}>
      <circle cx={5} cy={3} r={2.3} />
      <path d="M1.6 14.5 V9.2 C1.6 7.1 3.1 5.8 5 5.8 C6.9 5.8 8.4 7.1 8.4 9.2 V14.5 Z" />
    </g>
  );
}

export default function Porte({ pessoas, equipe, rotuloPessoas, rotuloEquipe, titulo, legenda }: Props) {
  const porGlifo = Math.max(1, Math.ceil(pessoas / MAX));
  const n = Math.max(1, Math.min(MAX, Math.ceil(pessoas / porGlifo)));
  const cols = Math.min(n, COLS);
  const rows = Math.ceil(n / cols);
  const eq = Math.max(0, Math.min(16, equipe));

  return (
    <figure className="cvg cvg--porte" aria-label={`${rotuloPessoas}${eq ? `; ${rotuloEquipe}` : ""}`}>
      {titulo && <figcaption className="cvg__titulo">{titulo}</figcaption>}
      {eq > 0 && (
        <div className="cvg__equipe">
          <svg viewBox={`0 0 ${eq * (W + 3)} ${H + 1}`} width={eq * 14} height={18} aria-hidden="true">
            {Array.from({ length: eq }).map((_, i) => (
              <Pessoa key={`e${eq}-${i}`} x={i * (W + 3)} y={0} i={i} classe="cvg__p cvg__p--equipe" />
            ))}
          </svg>
          <span className="cvg__rotulo">{rotuloEquipe}</span>
        </div>
      )}
      <svg className="cvg__pessoas" viewBox={`0 0 ${cols * (W + 2)} ${rows * (H + 3)}`} style={{ maxWidth: cols * 14 }} aria-hidden="true">
        {Array.from({ length: n }).map((_, i) => (
          <Pessoa key={`p${n}-${i}`} x={(i % cols) * (W + 2)} y={Math.floor(i / cols) * (H + 3)} i={i} classe="cvg__p" />
        ))}
      </svg>
      <p className="cvg__num">
        <strong>{rotuloPessoas}</strong>
        {legenda && <span>{legenda}</span>}
      </p>
    </figure>
  );
}
