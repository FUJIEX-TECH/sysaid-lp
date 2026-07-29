# SysAid LP ITSM (V2)

Landing page de captação de leads da **SysAid Brasil** para tráfego pago (Google Ads),
substituindo a página WordPress `sysaid.com.br/itsm-service-desk/`. No ar em
**https://itsm.sysaid.com.br**.

Motivação: a página WordPress travava o índice de qualidade do Google Ads (LP abaixo da
média, ~2,6s de carregamento, histórico de bot-check do Cloudflare). Uma LP estática/SSR
resolve velocidade e sai das regras de challenge do Cloudflare.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Neon Postgres** (via integração Vercel) — banco de leads
- **Vercel** — hospedagem (projeto `landing-page`, org `fujiex`)
- **Resend** — e-mail de notificação de lead
- **RD Station** — CRM (mesma integração do site WordPress)
- Cloudflare — DNS do subdomínio (`itsm` CNAME → Vercel, cinza/DNS-only)

## Estrutura

```
app/
  page.tsx          → landing page (hero + seções + FAQ)
  glpi/             → LP de conquista para o ad group GLPI (campanha [FJX] Conquista)
  obrigado/         → página de agradecimento (dispara conversão Google Ads)
  admin/            → painel de leads (senha única)
  api/lead/         → recebe o formulário
  api/admin/        → login/logout do painel
components/
  LeadForm.tsx      → formulário progressivo (e-mail gatilho revela os campos)
  Analytics.tsx     → Hotjar + gtag (Google Ads + GA4)
  ConversionPing.tsx→ dispara a conversão Google Ads na /obrigado
lib/
  db.ts             → driver Neon + funções de lead
  rdstation.ts      → envio da conversão ao RD Station
  email.ts          → notificação via Resend
  validation.ts     → schema Zod do formulário
  auth.ts           → sessão do painel admin
  schema.sql        → schema da tabela `leads`
scripts/init-db.mjs → aplica o schema no Neon
```

## Fluxo do lead

1. Visitante clica no anúncio (gclid na URL) → LP.
2. Preenche o formulário progressivo (captura UTM + gclid da URL).
3. `POST /api/lead`: valida → grava no Neon → envia RD Station → notifica por e-mail.
4. Redireciona pra `/obrigado`, que dispara a conversão do Google Ads com o gclid.

O fluxo é o mesmo em todas as rotas de captação (`/` e `/glpi`): as LPs compartilham
`LeadForm`, `Analytics` e a `/obrigado`.

## Rotas de captação

| Rota | Público | Origem de tráfego |
|---|---|---|
| `/` | genérico ITSM / service desk | campanha `[FJX] ITSM - Service Desk` (grupos Service Desk - ITSM e ITSM + IA) |
| `/glpi` | quem já opera GLPI | campanha `[FJX] Conquista`, ad group `GLPI` |

**Ao criar uma nova LP de conquista** (Movidesk, Milvus, TiFlux, OTRS e afins):

- Usar `app/glpi/page.tsx` como molde **estrutural**, mas **reescrever o texto**. Clonar a
  página trocando só o nome do concorrente gera conteúdo duplicado e o Google pontua mal.
- A mensagem muda por família: quem usa ferramenta open source ouve "pare de manter servidor
  e plugin"; quem já paga SaaS precisa de outro argumento.
- Tom: creditar o que o concorrente entrega, mover a conversa para custo total de operação,
  e manter a nota de marca no rodapé do comparativo.
- **Publicar a LP antes de criar o anúncio.** RSA apontando para 404 dispara
  `DESTINATION_NOT_WORKING` no Google Ads (foi o que derrubou os anúncios em julho/2026).
- Classes reaproveitáveis do comparativo: `.ctable` (colapsa em uma coluna abaixo de 760px)
  e `.step`, ambas em `app/globals.css`.

## Rodar local

```bash
npm install
vercel env pull .env.local     # traz as variáveis (precisa estar logado na Vercel/org fujiex)
npm run dev                    # http://localhost:3210 (ou 3000)
```

Aplicar o schema no banco (uma vez): `node --env-file=.env.local scripts/init-db.mjs`

## Deploy

```bash
vercel deploy --prod --yes
```

O projeto Vercel precisa ter **Framework Preset = Next.js** (foi criado como estático;
se voltar a `null`, os domínios dão 404 — corrigir em Settings > General > Framework).

## Variáveis de ambiente

Todas na Vercel (produção + development) e no `.env.local` local. **Nunca no git.**

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Neon (preenchida pela integração Vercel) |
| `RDSTATION_TOKEN` | Token do RD Station (mesmo do site WordPress) |
| `RDSTATION_CONVERSION_IDENTIFIER` | `form-site-wpforms` |
| `RESEND_API_KEY` | Envio de e-mail |
| `LEAD_NOTIFY_TO` / `LEAD_NOTIFY_FROM` | Destino/remetente da notificação |
| `ADMIN_PASSWORD` | Senha do painel `/admin` |
| `NEXT_PUBLIC_GADS_CONVERSION_ID` | `AW-18316207323` (conta SysAid 2026) |
| `NEXT_PUBLIC_GADS_CONVERSION_LABEL` | `buisCNTjts8cENvJ7J1E` (ação "Lead - Formulário LP") |
| `NEXT_PUBLIC_HOTJAR_ID` | `6753056` |
| `NEXT_PUBLIC_GA4_ID` | `G-6QD52M51RG` |

## Painel de leads

`https://itsm.sysaid.com.br/admin` — senha em `ADMIN_PASSWORD`. Lista leads com campanha,
gclid (modal com cópia), status de sincronização RD, filtro por campanha, busca e export CSV.

## Design

Design system do site oficial: verde `#175d4a` (primária), menta `#6bd9b9`, lima `#deff00`,
tinta `#161922`. Tipografia **Figtree** (sans, títulos) + **Besley** (serifada itálica, acentos),
espelhando o padrão do sysaid.com. Logos oficiais em `public/logos`, prova social em
`public/clientes`.
