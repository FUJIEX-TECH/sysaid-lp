// conversa-core — v2: o mapa do caso, montado por código a partir da
// configuração declarativa (`config.mapa`) e das respostas. Estrutura fixa
// (onde está → problema → o que acontece hoje → o que resolve → primeiro
// passo); os textos vêm da configuração; os nós de destino, da recomendação.
// Cresce a cada resposta: o nó só entra quando o `quando` dele vale e o texto
// não fica vazio.
import { avaliar, type Resolvedor } from "./condicoes";
import { recomendar } from "./recomendacao";
import { renderTexto } from "./texto";
import type { ConfigConversa, Contexto, Mapa, NoMapa, NoMapaConfig } from "./tipos";

export function montarMapa(config: ConfigConversa, ctx: Contexto, variavel: Resolvedor): Mapa | null {
  const cfg = config.mapa;
  if (!cfg) return null;
  const nos: NoMapa[] = [];
  const arestas: Mapa["arestas"] = [];

  function no(id: NoMapa["tipo"], c: NoMapaConfig | undefined): NoMapa | null {
    if (!c || !avaliar(c.quando, ctx, variavel)) return null;
    const texto = renderTexto(c.texto, ctx, variavel).trim();
    if (!texto) return null;
    const nota = renderTexto(c.nota, ctx, variavel).trim() || undefined;
    const n: NoMapa = { id, tipo: id, texto, nota };
    nos.push(n);
    return n;
  }

  const atual = no("atual", cfg.atual);
  if (!atual) return null;
  const problema = no("problema", cfg.problema);
  if (problema) arestas.push({ de: atual.id, para: problema.id, rotulo: cfg.arestas?.problema });
  const causa = problema ? no("causa", cfg.causa) : null;
  if (causa && problema) arestas.push({ de: problema.id, para: causa.id, rotulo: cfg.arestas?.causa });

  const ultimo = causa ?? problema ?? atual;
  const destinos: NoMapa[] = [];
  if (cfg.destino && config.recomendacao && problema && avaliar(cfg.destino.quando, ctx, variavel)) {
    const nota = renderTexto(cfg.destino.nota, ctx, variavel).trim() || undefined;
    const lista = recomendar(config.recomendacao, ctx, variavel).slice(0, cfg.destino.maximo ?? 3);
    lista.forEach((r, i) => {
      const n: NoMapa = { id: `destino-${r.id}`, tipo: "destino", texto: r.rotulo, nota: i === 0 ? nota : undefined };
      nos.push(n);
      destinos.push(n);
      arestas.push({ de: ultimo.id, para: n.id, rotulo: i === 0 ? cfg.arestas?.destino : undefined });
    });
  }

  const passo = destinos.length ? no("passo", cfg.passo) : null;
  if (passo) arestas.push({ de: destinos[0].id, para: passo.id, rotulo: cfg.arestas?.passo });

  return { nos, arestas };
}
