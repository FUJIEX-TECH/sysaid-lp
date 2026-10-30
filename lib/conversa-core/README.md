# conversa-core

Núcleo genérico do chat de qualificação (produto da Fujiex, nome provisório "formulário inteligente"). Dono: Severino. Contexto do produto em `fujiex/produtos/formulario-inteligente/_contexto/`.

**Regra da pasta:** nenhum arquivo aqui importa nada de fora de `lib/conversa-core/` nem cita cliente. `grep -rn "@/" lib/conversa-core` tem que voltar vazio.

| Arquivo | O que faz |
|---|---|
| `tipos.ts` | tipos do fluxo declarativo (`ConfigConversa`, `EtapaConfig`, `Condicao`, `PontuacaoConfig`, `Persistencia`, `Evento`) |
| `condicoes.ts` | avaliador de condicionais |
| `texto.ts` | templates `{{variavel}}` e textos por caso |
| `motor.ts` | próxima etapa, histórico, refazer dali, resolver texto/opções/resumo, classificar |
| `recomendacao.ts` | o "mapa": nós do catálogo por regras |
| `pontuacao.ts` | pontos por regras, classe, rótulos de código, rota |
| `jev.ts` | lado do navegador: rótulo do Jev no envio e gerações enquanto digita (`pedirGeracao`), sempre com timeout e fallback |
| `servidor/llm.ts` | **só servidor**: cliente da Anthropic (modelo pequeno) que só escreve; timeout, cache por entrada, teto por sessão/hora, medição de custo |
| `servidor/jev.ts` | **só servidor**: cliente do Jev em TS (decide: rótulo, coerência, dor no texto), timeout com 1 retry em 5xx, teto |
| `servidor/custo.ts` | contadores de teto (memória do processo) e cache com TTL |
| `util.ts` | validações, máscara, chute de empresa pelo domínio |
| `ui/useConversa.ts` | **v2:** estado e ações da conversa (motor, contexto pela origem, gerações, empresa pelo e-mail, envio); usado pelo widget e pela tela |
| `ui/ConversaChat.tsx`, `ui/conversa.css` | o widget (parte 1): caixa com histórico que rola; tema por variáveis `--cv-*` |
| `ui/ConversaTela.tsx`, `ui/tela.css` | **v2:** a tela cheia: cabeçalho com progresso, fluxo que rola com a janela, lateral fixa no desktop (resumo + painéis laterais), painéis no fluxo no celular |
| `ui/graficos/Porte.tsx`, `Mapa.tsx`, `Empresa.tsx`, `ui/Resumo.tsx` | **v2:** gráficos gerados por código (SVG/CSS): bonequinhos, fluxograma do caso, cartão da empresa, resumo que se escreve sozinho |
| `origem.ts` | **v2:** sinais da URL (UTMs, gclid, referrer, página de entrada, lembrados no sessionStorage) → origem + variáveis por regras da configuração |
| `mapa.ts` | **v2:** monta o mapa (nós e ligações) a partir de `config.mapa`, das respostas e da recomendação |
| `enriquecimento.ts` | **v2, navegador:** pede a empresa pelo domínio do e-mail (só o domínio sai), com timeout |
| `servidor/empresa.ts` | **v2, só servidor:** lê o site público e o CNPJ (BrasilAPI) do domínio; https só, DNS conferido, 300 KB, cache por domínio |

**Gerações (parte 2, 30/10/2026):** `config.geracoes[]` diz qual campo dispara (`gatilho`), pra qual endpoint do cliente e quanto esperar no Enter. O servidor devolve um `Gerado` (`textos`, `listas`, `dados` do Jev, `para` = entrada usada, `paraPrefixo` = campos em que basta o texto final começar pelo trecho). Uma etapa usa o gerado com `gerado: { id, texto, opcoes, seIgual }`; a condição `{ gerado, disponivel }` liga/desliga etapas (ex.: o palpite só aparece se chegou a tempo); `aoResponder: [{ valor, definir: { campo, deGerado } }]` copia um dado do Jev pra outra resposta. Contrato: a LLM escreve, o Jev decide, o código roteia; o que chega depois do Enter é descartado.

**v2 (30/10/2026 à noite):** `config.origens.regras` (campanha → origem e variáveis), `config.paineis`/`porte`/`mapa`/`resumo` (gráficos e lateral), `config.empresa` (empresa pelo e-mail), `pontuacao.precedenciaRotulos` (Jev × código), `llm.gerar({ validar })` (trava de saída fora do cache). Condições novas: `{variavel, igual}`, `{empresaEncontrada}`. Variáveis novas nos templates: `{{resumo.<etapa>}}`, `{{sinais.<x>}}`, `{{empresa.<x>}}`.

Uso por um cliente: um arquivo de configuração (`ConfigConversa`) + um adaptador de gravação (`Persistencia`) + opcionalmente uma cena (`config.Cena`). Exemplo: `lib/diagnostico/config-sysaid.ts` e `lib/diagnostico/persistencia.ts`.
