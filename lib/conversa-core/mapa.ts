// conversa-core — v2: o mapa do caso, montado por código a partir da
// configuração declarativa (`config.mapa`) e das respostas. Estrutura fixa
// (onde está → problema → o que acontece hoje → o que resolve → primeiro
// passo); os textos vêm da configuração; os nós de destino, da recomendação.
// Cresce a cada resposta: o nó só entra cheio quando o `quando` dele vale e o
// texto não fica vazio. Desde 11/11/2026, com `config.mapa.vazios`, o lugar
// que ainda não tem resposta entra como nó VAZIO (tracejado, com o rótulo da
// config) e o mapa devolve o progresso (lugares cheios / total): é o que o
// cartão mostra como "montando" e o que a barra do mapa enche.
import { avaliar, type Resolvedor } from "./condicoes";
import { recomendar } from "./recomendacao";
import { renderTexto } from "./texto";
import type { ConfigConversa, Contexto, LugarMapa, Mapa, NoMapa, NoMapaConfig } from "./tipos";

// 13/11/2026: o mapa como uma linha de N lugares (`config.mapa.lugares`), na ordem.
// Cada lugar enche quando o `quando` dele vale e o texto não sai vazio; senão
// fica vazio (tracejado) com o rótulo do lugar. Sem dependência entre lugares.
function montarLinear(lugares: LugarMapa[], ctx: Contexto, variavel: Resolvedor): Mapa {
  const nos: NoMapa[] = [];
  const arestas: Mapa["arestas"] = [];
  let cheios = 0;
  for (const l of lugares) {
    const pode = avaliar(l.quando, ctx, variavel);
    const texto = pode ? renderTexto(l.texto, ctx, variavel).trim() : "";
    const nota = renderTexto(l.nota, ctx, variavel).trim() || undefined;
    const no: NoMapa = texto ? { id: l.id, tipo: l.tipo, texto, nota } : { id: l.id, tipo: l.tipo, texto: l.vazio, vazio: true };
    if (texto) cheios += 1;
    const anterior = nos[nos.length - 1];
    if (anterior) arestas.push({ de: anterior.id, para: no.id, rotulo: l.aresta });
    nos.push(no);
  }
  return { nos, arestas, progresso: { cheios, total: lugares.length }, completo: lugares.length > 0 && cheios === lugares.length, linear: true };
}

export function montarMapa(config: ConfigConversa, ctx: Contexto, variavel: Resolvedor): Mapa | null {
  const cfg = config.mapa;
  if (!cfg) return null;
  if (cfg.lugares?.length) return montarLinear(cfg.lugares, ctx, variavel);
  const nos: NoMapa[] = [];
  const arestas: Mapa["arestas"] = [];
  const vazios = cfg.vazios ?? {};

  function cheio(id: NoMapa["tipo"], c: NoMapaConfig | undefined): NoMapa | null {
    if (!c || !avaliar(c.quando, ctx, variavel)) return null;
    const texto = renderTexto(c.texto, ctx, variavel).trim();
    if (!texto) return null;
    const nota = renderTexto(c.nota, ctx, variavel).trim() || undefined;
    return { id, tipo: id, texto, nota };
  }
  function vazio(id: NoMapa["tipo"]): NoMapa | null {
    const rotulo = vazios[id];
    return rotulo ? { id, tipo: id, texto: rotulo, vazio: true } : null;
  }
  // o nó cheio se der; senão o vazio (se a config tem rótulo pra ele); senão nada
  function lugar(id: NoMapa["tipo"], c: NoMapaConfig | undefined, podeEncher: boolean): NoMapa | null {
    const n = (podeEncher ? cheio(id, c) : null) ?? (c ? vazio(id) : null);
    if (n) nos.push(n);
    return n;
  }
  const estaCheio = (n: NoMapa | null): n is NoMapa => !!n && !n.vazio;

  const atual = lugar("atual", cfg.atual, true);
  if (!atual) return null;
  const problema = lugar("problema", cfg.problema, true);
  if (problema) arestas.push({ de: atual.id, para: problema.id, rotulo: cfg.arestas?.problema });
  const causa = lugar("causa", cfg.causa, estaCheio(problema));
  if (causa && problema) arestas.push({ de: problema.id, para: causa.id, rotulo: cfg.arestas?.causa });

  const ultimo = causa ?? problema ?? atual;
  const destinos: NoMapa[] = [];
  if (cfg.destino) {
    const podeEncher = !!config.recomendacao && estaCheio(problema) && avaliar(cfg.destino.quando, ctx, variavel);
    const lista = podeEncher ? recomendar(config.recomendacao!, ctx, variavel).slice(0, cfg.destino.maximo ?? 3) : [];
    if (lista.length) {
      const nota = renderTexto(cfg.destino.nota, ctx, variavel).trim() || undefined;
      lista.forEach((r, i) => {
        const n: NoMapa = { id: `destino-${r.id}`, tipo: "destino", texto: r.rotulo, nota: i === 0 ? nota : undefined };
        nos.push(n);
        destinos.push(n);
        arestas.push({ de: ultimo.id, para: n.id, rotulo: i === 0 ? cfg.arestas?.destino : undefined });
      });
    } else {
      const n = vazio("destino");
      if (n) {
        nos.push(n);
        destinos.push(n);
        arestas.push({ de: ultimo.id, para: n.id, rotulo: cfg.arestas?.destino });
      }
    }
  }

  const passo = lugar("passo", cfg.passo, destinos.length > 0 && estaCheio(destinos[0]));
  if (passo && destinos.length) arestas.push({ de: destinos[0].id, para: passo.id, rotulo: cfg.arestas?.passo });

  // progresso: um ponto por lugar configurado (os destinos contam como um)
  const lugares: (NoMapa | null)[] = [atual, problema, causa, destinos[0] ?? null, passo];
  const configurados = [true, !!cfg.problema, !!cfg.causa, !!cfg.destino, !!cfg.passo];
  let total = 0;
  let cheios = 0;
  lugares.forEach((n, i) => {
    if (!configurados[i]) return;
    total += 1;
    if (estaCheio(n)) cheios += 1;
  });

  return { nos, arestas, progresso: { cheios, total }, completo: total > 0 && cheios === total };
}
