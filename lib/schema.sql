-- ==========================================================================
-- SysAid LP ITSM (V2) — schema de leads
-- Rodar uma vez no banco Neon (via `psql $DATABASE_URL -f lib/schema.sql`
-- ou pelo SQL editor do Neon). Idempotente.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- dados do formulario (replicam o sys_LP: email gatilho + campos progressivos)
  email         TEXT NOT NULL,
  name          TEXT,
  company       TEXT,
  phone         TEXT,
  num_admins    TEXT,               -- "1-2" | "3-10" | "+10"

  -- atribuicao de campanha (capturada da URL)
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  gclid         TEXT,

  -- contexto da requisicao
  page_url      TEXT,
  referrer      TEXT,
  user_agent    TEXT,
  ip            TEXT,

  -- estado das integracoes
  rdstation_status    TEXT NOT NULL DEFAULT 'pending', -- pending | sent | failed
  rdstation_response  TEXT,
  gads_conversion_fired BOOLEAN NOT NULL DEFAULT false,

  -- ciclo de vida comercial (uso no painel)
  status        TEXT NOT NULL DEFAULT 'new',           -- new | contacted | qualified | lost
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_utm_campaign ON leads (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
