// conversa-core/servidor — tetos de custo e cache das chamadas de IA.
// Só roda no servidor. Contadores em memória do processo: na Vercel cada
// instância conta sozinha, então o teto por hora é "por instância" (margem de
// segurança, não contabilidade exata; a conta de verdade é o limite mensal do
// workspace no Console da Anthropic). Quando o 2º cliente chegar, trocar por KV.

type Janela = { inicio: number; chamadas: number; usd: number };

const porSessao = new Map<string, { chamadas: number; visto: number }>();
const porHora = new Map<string, Janela>();
const HORA = 60 * 60 * 1000;
const SESSAO_TTL = 2 * HORA;

function limparSessoes() {
  if (porSessao.size < 2000) return;
  const corte = Date.now() - SESSAO_TTL;
  for (const [k, v] of porSessao) if (v.visto < corte) porSessao.delete(k);
}

function janela(nome: string): Janela {
  const agora = Date.now();
  const j = porHora.get(nome);
  if (!j || agora - j.inicio > HORA) {
    const nova = { inicio: agora, chamadas: 0, usd: 0 };
    porHora.set(nome, nova);
    return nova;
  }
  return j;
}

// Pode gastar uma chamada? Conta na hora (antes da chamada) pra evitar corrida.
export function reservar(
  nome: string,
  sessao: string,
  tetos: { chamadasPorSessao: number; chamadasPorHora: number; usdPorHora?: number }
): { ok: true } | { ok: false; motivo: "sessao" | "hora" | "usd" } {
  limparSessoes();
  const chave = `${nome}:${sessao}`;
  const s = porSessao.get(chave) ?? { chamadas: 0, visto: 0 };
  if (s.chamadas >= tetos.chamadasPorSessao) return { ok: false, motivo: "sessao" };
  const j = janela(nome);
  if (j.chamadas >= tetos.chamadasPorHora) return { ok: false, motivo: "hora" };
  if (tetos.usdPorHora !== undefined && j.usd >= tetos.usdPorHora) return { ok: false, motivo: "usd" };
  s.chamadas += 1;
  s.visto = Date.now();
  porSessao.set(chave, s);
  j.chamadas += 1;
  return { ok: true };
}

export function registrarCusto(nome: string, usd: number) {
  janela(nome).usd += usd;
}

export function estado(nome: string): Janela {
  return { ...janela(nome) };
}

// Cache por chave de entrada com TTL e tamanho máximo (descarta o mais antigo).
export function criarCache<T>(ttlMs: number, maximo: number) {
  const mapa = new Map<string, { valor: T; expira: number }>();
  return {
    get(chave: string): T | undefined {
      const e = mapa.get(chave);
      if (!e) return undefined;
      if (e.expira < Date.now()) {
        mapa.delete(chave);
        return undefined;
      }
      return e.valor;
    },
    set(chave: string, valor: T) {
      if (mapa.size >= maximo) {
        const primeiro = mapa.keys().next().value;
        if (primeiro !== undefined) mapa.delete(primeiro);
      }
      mapa.set(chave, { valor, expira: Date.now() + ttlMs });
    },
    get tamanho() {
      return mapa.size;
    },
  };
}

// chave de cache: normaliza o texto (minúsculas, espaços, acentos ficam)
export function chaveDe(...partes: (string | undefined | null)[]): string {
  return partes.map((p) => (p ?? "").toLowerCase().replace(/\s+/g, " ").trim()).join("|");
}
