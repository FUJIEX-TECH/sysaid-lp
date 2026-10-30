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
| `ui/ConversaChat.tsx`, `ui/conversa.css` | interface do chat; tema por variáveis `--cv-*`; dispara gerações no debounce do campo-gatilho e espera no máximo `esperaMs` no Enter |

**Gerações (parte 2, 30/10/2026):** `config.geracoes[]` diz qual campo dispara (`gatilho`), pra qual endpoint do cliente e quanto esperar no Enter. O servidor devolve um `Gerado` (`textos`, `listas`, `dados` do Jev, `para` = entrada usada, `paraPrefixo` = campos em que basta o texto final começar pelo trecho). Uma etapa usa o gerado com `gerado: { id, texto, opcoes, seIgual }`; a condição `{ gerado, disponivel }` liga/desliga etapas (ex.: o palpite só aparece se chegou a tempo); `aoResponder: [{ valor, definir: { campo, deGerado } }]` copia um dado do Jev pra outra resposta. Contrato: a LLM escreve, o Jev decide, o código roteia; o que chega depois do Enter é descartado.

Uso por um cliente: um arquivo de configuração (`ConfigConversa`) + um adaptador de gravação (`Persistencia`) + opcionalmente uma cena (`config.Cena`). Exemplo: `lib/diagnostico/config-sysaid.ts` e `lib/diagnostico/persistencia.ts`.
