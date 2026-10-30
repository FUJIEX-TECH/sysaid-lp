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
| `jev.ts` | cliente do Jev com timeout e fallback |
| `util.ts` | validações, máscara, chute de empresa pelo domínio |
| `ui/ConversaChat.tsx`, `ui/conversa.css` | interface do chat; tema por variáveis `--cv-*` |

Uso por um cliente: um arquivo de configuração (`ConfigConversa`) + um adaptador de gravação (`Persistencia`) + opcionalmente uma cena (`config.Cena`). Exemplo: `lib/diagnostico/config-sysaid.ts` e `lib/diagnostico/persistencia.ts`.
