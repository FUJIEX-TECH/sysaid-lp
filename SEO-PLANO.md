# SEO-PLANO — itsm.sysaid.com.br

Plano vivo de ranqueamento (Google + IAs). Atualizado a cada sessão de /seo-ranking.
Estratégia (o porquê): ver playbook.md da skill seo-ranking-ratos.
Config do site: `~/.config/seo-ranking-ratos/config.json` (modo manual de medição de IA, sem DataForSEO).

## Norte

Aparecer nas buscas e nas respostas de IA para o vocabulário de COMPRA de ITSM no Brasil:
`software itsm`, `ferramenta itsm`, `sistema de chamados`, `service desk com ia`, alternativas a
GLPI/Freshdesk/Zendesk/Jira/Movidesk/TOPdesk, e o cluster informacional `gestão/gerenciamento de
serviços de TI` (o profissional em formação que daqui a 2 anos especifica a ferramenta).
Métrica que importa: leads do formulário/chat vindos de orgânico + presença nas respostas de
ChatGPT/Perplexity/AI Overviews (share of voice vs ManageEngine, Movidesk, Freshworks, Zendesk, GLPI).
Referências de pesquisa: `../semrush-itsm-analise.md` e `../semrush-gerenciamento-servicos-ti.md`.

## Estado da fundação técnica (auditado em 2026-08-13)

**Pilar 1 — Técnico:**
- ✅ `robots.txt` ok: `User-Agent: *` + `Allow: /` libera todos os bots de IA (GPTBot, ClaudeBot,
  PerplexityBot, OAI-SearchBot, Google-Extended); bloqueia só /admin, /api e /obrigado. Sitemap declarado.
- ✅ `sitemap.xml` com as 10 rotas públicas.
- ✅ `llms.txt` presente e atualizado (nota: neutro pro Google, rende nas IAs de fora).
- ✅ HTML estático/SSR legível (Next.js prerender, conteúdo em texto, sem JS-gate).
- ✅ FAQPage schema nas páginas com FAQ; `/gestao-de-servicos-de-ti` tem também Article + Breadcrumb.
- ❌ **Sem schema `Organization` em nenhuma página** (nem logo/sameAs) — a entidade "SysAid Brasil"
  não está declarada.
- ❓ Bing/IndexNow: não verificado (ChatGPT busca no índice do Bing — verificar se o subdomínio está lá).
- ❓ GSC: meta de verificação presente no layout; conferir propriedade, cobertura e sitemap submetido.
- ❓ PageSpeed mobile: quota do PSI estourada em 13/08; medir depois (build é estático, expectativa boa).

**Pilar 2 — Conteúdo:**
- 10 rotas no ar: home comercial, 2 guias informacionais (`/o-que-e-itsm`, `/gestao-de-servicos-de-ti`),
  1 página de categoria (`/sistema-de-chamados`), 6 comparativas de conquista (glpi, freshdesk, zendesk,
  jira, movidesk, topdesk) com dados G2.
- Estrutura de resposta já é padrão (H2-pergunta, FAQ, front-loading). Gap: pouca citação de fonte
  externa verificável fora das comparativas; zero autoria pessoal (EEAT), tudo assinado "SysAid Brasil".

**Pilar 3 — Autoridade (o buraco):**
- ❌ Semrush: **zero keywords orgânicas e zero backlinks** pro subdomínio (novo, jul/2026).
- ❌ **`sysaid.com.br` (raiz, WordPress) não tem nenhum link pro subdomínio** — as LPs estão órfãs.
  A raiz tem pouca força (rank BR 812k, 66 kw, ~75 visitas orgânicas/mês), mas é o que existe de
  entidade indexada + temos gestão via WPVibe.
- ❓ Menções/diretórios BR (Wikidata, Crunchbase, B2B Stack, GetApp/Capterra BR): não inventariado.
  O sysaid.com global tem autoridade (G2, Gartner) que não respinga no .com.br.

**Pilar 4 — Medição:**
- ✅ GA4 (`G-6QD52M51RG`) + Hotjar globais; conversão Ads no form/chat.
- ✅ Prompts de comprador prontos: `ai-visibility-prompts.txt` (10 prompts, modo manual/dry-run).
- ❌ Baseline de visibilidade em IA ainda não medido (nem manual).
- ❓ GSC sem leitura ainda (skill `gsc-fujiex` disponível pra isso).

## Citability Score (média do site: ~62/100 — heurística inicial, calibrar quando medir)

| Página | Score | Maior gap |
|--------|-------|-----------|
| `/gestao-de-servicos-de-ti` | 70 | densidade de dado (poucos números/datas) e citação de fonte externa |
| `/o-que-e-itsm` | 65 | sem Article/Breadcrumb schema, sem fonte externa, sem autoria |
| comparativas (glpi, freshdesk, zendesk, jira, movidesk, topdesk) | 65 | dados G2 ajudam; falta data da coleta e autoria |
| `/sistema-de-chamados` | 60 | idem o-que-e-itsm |
| `/` (home) | 55 | página de conversão, não de citação; sem Organization schema |

## Baseline (1ª medição — 2026-08-13)

- Tráfego orgânico/mês (Semrush): **0** (subdomínio sem dado; raiz .com.br: 66 kw, ~75 visitas).
- Backlinks (Semrush): **0** referring domains pro subdomínio.
- Keywords/impressões (GSC): não lido ainda.
- Aparece nas IAs pras queries-alvo? **não medido** — rodar os 10 prompts do modo manual.

## Backlog (P0 = faz primeiro)

### P0
- [ ] Schema `Organization` global no layout (name, url, logo, sameAs → sysaid.com, LinkedIn, G2)
      · _falha se:_ o teste de rich results do Google não reconhecer a entidade em todas as rotas.
- [ ] Links internos da raiz `sysaid.com.br` → subdomínio via WPVibe (menu, rodapé e/ou posts de blog
      relacionados apontando pras LPs certas) · _falha se:_ Semrush seguir com 0 backlinks em 30 dias.
- [ ] GSC: confirmar propriedade do subdomínio, sitemap submetido e pedir indexação das 10 rotas
      (skill `gsc-fujiex`) · _falha se:_ cobertura não mostrar as 10 rotas indexadas em 2 semanas.
- [ ] Bing Webmaster Tools: cadastrar subdomínio + sitemap (ChatGPT usa o índice do Bing); avaliar
      IndexNow · _falha se:_ `site:itsm.sysaid.com.br` no Bing seguir zerado em 2 semanas.

### P1
- [ ] Baseline manual de AI visibility: perguntar os 10 prompts de `ai-visibility-prompts.txt` no
      ChatGPT e Perplexity, registrar aqui (X/10 com menção à SysAid, quem domina)
      · _falha se:_ não der pra comparar na re-medição em 30-60 dias.
- [ ] Subir densidade de dado do guia `/gestao-de-servicos-de-ti`: números com fonte (mercado ITSM,
      dados G2 da SysAid, data de atualização visível) · _falha se:_ Citability não passar de 80.
- [ ] Article + Breadcrumb schema e data de atualização em `/o-que-e-itsm` e `/sistema-de-chamados`
      · _falha se:_ rich results não validar.
- [ ] PageSpeed mobile das 3 páginas-chave quando a quota do PSI voltar · _falha se:_ perf < 80 mobile.

### P2
- [ ] Inventário de menções BR: B2B Stack, Capterra/GetApp BR, Wikidata (entidade SysAid),
      perfil LinkedIn BR · _falha se:_ nenhuma menção nova indexada em 90 dias.
- [ ] Avaliar bloco "atualizado em + autor" (EEAT) nas páginas-guia com um nome real do time
      · _falha se:_ Kaique não aprovar autoria pessoal.
- [ ] Cauda longa informacional nova só depois do cluster atual indexar (evitar diluir).

## Feito
- [x] (2026-08-13) Setup da skill + auditoria de seed dos 4 pilares + baseline Semrush + prompts de IA.
- [x] (2026-08-13, pré-plano) `/gestao-de-servicos-de-ti` no ar com FAQPage+Article+Breadcrumb,
      sitemap e llms.txt atualizados (commit `f5f14d6`).

## Diário
- 2026-08-13 — Primeira sessão. Config criada (5 concorrentes, modo manual de IA). Seed: técnico é
  ponto forte (robots/sitemap/llms/schema/HTML ok; falta Organization), conteúdo estruturado como
  resposta, mas autoridade é ZERO (0 backlinks, raiz não linka o subdomínio) e medição de IA sem
  baseline. Maior alavanca imediata: entidade + links da raiz + indexação Google/Bing.

---

# Atualização 2026-08-26 — Auditoria SEO página-por-página

Auditoria completa das 10 LPs do subdomínio `itsm.sysaid.com.br` com dados Semrush ao vivo (base BR).
Saúde geral do site: **6/10** (técnico 8/10 · conteúdo 6/10 · autoridade 1/10 · GEO/AEO 6/10).

## Mapa URL × keyword × dados Semrush

| URL | Keyword primária | Vol./mês | KD | CPC (R$) | SERP top3 |
|---|---|---|---|---|---|
| `/` | software itsm | 320 | 24 | 12,61 | IBM, ServiceNow, TIVIT |
| `/sistema-de-chamados` | sistema de chamados | 480 | 20 | 8,21 | Sults, TomTicket, Zendesk blog |
| `/o-que-e-itsm` | o que é itsm | 480 | — | — | IBM, ServiceNow, TIVIT |
| `/gestao-de-servicos-de-ti` | gestão de serviços de ti | 140 | 12–16 | 1,89–2,13 | IBM, Wikipédia x2, kufunda PDF |
| `/glpi` | glpi | 33.100 | 39 | 1,05 | dominado por instâncias (glpi hc etc.) |
| `/freshdesk` | freshdesk | 90.500 | 40 | 3,71 | Freshworks |
| `/zendesk` | zendesk | 110k+ | — | 1,48 | Zendesk inc + holerite McDonald's |
| `/jira` | jira service management | 1.300 | 56 | 23,34 | Atlassian |
| `/movidesk` | movidesk | 9.900 | 35 | 0,47 | Movidesk + Zenvia |
| `/topdesk` | topdesk | 3.600 | 27 | 2,02 | TOPdesk + termos da marca |

## Citability por página (heurística 0–100)

| LP | Score | Gap principal |
|---|---|---|
| `/gestao-de-servicos-de-ti` | **70** | densidade de dado + autoria |
| `/o-que-e-itsm` | **65** | sem Article/Breadcrumb schema |
| `/sistema-de-chamados` | **60** | idem |
| 6 comparativas (glpi, freshdesk, zendesk, jira, movidesk, topdesk) | **65** | 0 linking interno entre elas, H1 muito parecidos (canibalização) |
| `/` (home) | **55** | ~~sem Organization schema~~ (resolvido em 30/09), sem links internos pra cluster |

## Backlog novo

### P0 (esta semana)
- [x] **C1** — `Organization` schema no `app/layout.tsx` ✅ **30/09/2026** (commit `51fcf77`, branch `feat/rota-service-desk`, **sem deploy**). Declarado uma vez, com `@id` estável `https://itsm.sysaid.com.br/#organization`, então vale em todas as páginas sem duplicar entidade. `name`, `alternateName`, `url`, `logo` (1682×1682), `description`, `areaServed` BR, `knowsLanguage`. `sameAs` só com URL verificada: `sysaid.com`, `sysaid.com.br`, `linkedin.com/company/sysaid-technologies`. **G2 e Capterra ficaram fora**: respondem 403 a bot e não deu pra confirmar o slug — `sameAs` errado é pior que curto. Os `Article` de `/service-desk` e `/gestao-de-servicos-de-ti` agora referenciam o `@id` no `author`/`publisher`.
- [x] **C2** — `Article` + `BreadcrumbList` schema em `/o-que-e-itsm` e `/sistema-de-chamados` (03/10/2026, branch `seo/schema-article-breadcrumb`; na `/sistema-de-chamados` é `WebPage`, não `Article`, porque é página de produto)
- [x] **C3** — `dateModified` em todos os schemas FAQPage/Article (03/10/2026, mesmo branch; datas em `lib/seo.ts`, atualizar à mão no commit que muda conteúdo)
- [ ] **C4 (pendência aberta do C1)** — confirmar as URLs de G2 e Capterra da SysAid pra entrar no `sameAs`. Ambas respondem **403 a bot**; precisa de navegador ou de o Kaique confirmar o link oficial.
- [ ] **C4** — Adicionar links da raiz WordPress `sysaid.com.br` → subdomínio (rodapé + menu + 1 post âncora)
- [ ] **C5** — Submeter sitemap no GSC + pedir indexação das 10 URLs (skill `gsc-fujiex`)
- [x] **llms.txt** — completo ✅ **30/09/2026** (mesmo commit). Lista as **11 rotas**, separadas em "Guias e conteúdo de referência" e "Comparativos e alternativas", com descrição tirada do conteúdo real de cada página, não do metadata. O `sitemap.ts` já estava completo com as 11.

### P1 (próximas 2 semanas)
- [ ] Cadastrar no Bing Webmaster Tools (precisa do login do Fernando; dá pra importar do Search Console)
- [x] IndexNow pronto em branch (01/10/2026 20h, `feat/seo-indexnow`): chave `public/df788ab4e8e335bc73c8ac2a84941392.txt` + `npm run indexnow` (lê o sitemap de produção e pinga `api.indexnow.org`; `--dry-run` e rotas avulsas). **Rodar logo depois do deploy** e a cada página nova. Recusa enviar se a chave não estiver no ar.
- [x] (03/10/2026, mesmo branch: lastmod vem de `lib/seo.ts`) `sitemap.ts` usa `lastModified: now` em todas as URLs: cada build diz que tudo mudou. Bing/IndexNow desconfiam de lastmod que sempre muda; trocar por data real por página (junto com o C3 `dateModified`).
- [x] Internal linking cruzado entre as 6 comparativas (cluster semântico) ✅ **01/10/2026** (commit `7af39be`, branch `feat/seo-links-cluster` em cima da `feat/rota-service-desk`, **sem deploy**). Componente `components/SiteFooter.tsx` nas 11 páginas de conteúdo (6 comparativas, 4 guias e home): coluna "Compare o SysAid" + coluna "Guias de ITSM", omitindo a própria página. Fica **depois do formulário final** de propósito, pra não vazar conversão das LPs de Ads. Medir 30 dias após o deploy: queda de saída pelo rodapé x formulário (GA4) e páginas comparativas descobertas pelo Google.
- [ ] Reescrever `alt` descritivo das imagens (`/clientes/*.png`, `/badges/*.svg`)
- [ ] Submeter pra B2B Stack, Capterra/GetApp BR, G2 (perfil de produto)
- [ ] Aumentar densidade de dado em `/gestao-de-servicos-de-ti` (Gartner, HDI)

### P2 (30–60 dias)
- [ ] Diferenciar H1/H2 das 6 comparativas (anti-canibalização)
- [ ] Avaliar bloco "atualizado em + autor" (E-E-A-T) com Kaique
- [ ] PageSpeed mobile das 3 páginas-chave
- [ ] Guest post em 1–2 veículos BR

## O que NÃO fazer (armadilhas detectadas)

- ❌ Investir SEO em `/glpi` — estudo 10/08 já provou 3x que não há demanda de troca no BR
- ❌ Inflar H1s com keywords — copy atual está conversacional e bom
- ❌ Criar mais páginas até backlinks existirem — cada LP sem autoridade dilui o cluster

## Métrica de sucesso (re-medir em 30 / 60 / 90 dias)

| | Baseline | 30d | 60d | 90d |
|---|---|---|---|---|
| Keywords orgânicas | 0 | 5–10 | 15–30 | 30–60 |
| Tráfego orgânico/mês | ~0 | 50–100 | 150–300 | 300–600 |
| Backlinks (ref. domains) | 0 | 3 | 5–8 | 10–15 |
| Citability média | 62 | 70 | 75 | 78+ |

Auditoria completa (incluindo análise página-por-página com schema, intent, gaps) entregue em
26/08/2026 via skill `SEO`.
