-- ==========================================================================
-- Diagnóstico ITSM (variante B do formulário da LP): colunas diag_* em leads.
-- Escrita em 28/10/2026 e NÃO APLICADA em produção (regra do Fernando: nada no
-- banco de produção nesta rodada). Aplicar em branch do Neon ou quando a
-- variante B for aprovada: `psql $DATABASE_URL -f lib/migrations/2026-10-28-diagnostico.sql`.
-- Idempotente. Depois de aplicar, ligar DIAGNOSTICO_PERSIST=true no ambiente.
-- diag_dor_texto guarda o texto livre da dor: LGPD (decisão 5 do plano) ainda
-- em aberto; até lá só em ambiente local/teste.
-- ==========================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_variante   TEXT;      -- 'a' | 'b'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_origem     TEXT;      -- 'generica' | 'comparativa'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_situacao   TEXT;      -- troca | sem | cliente | pesquisa
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_ferramenta TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_dor        TEXT;      -- sla | perda | relatorio | automacao | ativos | ia | custo | esm | vaga
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_dor_texto  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_aprof      TEXT;      -- a | b | c | outro
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_usuarios   TEXT;      -- 50 | 200 | 1000 | mais (técnicos já é num_admins)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_papel      TEXT;      -- decide | influencia | levanta | estuda
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_prazo      TEXT;      -- tri | 6m | sem | cota
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_pontos     SMALLINT;  -- 0 a 15
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_classe     TEXT;      -- forte | medio | fraco
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_rotulo     TEXT;      -- cotando | fora | cliente | NULL
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_rota       TEXT;      -- forte | medio | fraco | cotando | fora
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_segundos   INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS diag_json       JSONB;     -- tudo (detalhe dos pontos, histórico de correções no futuro)

CREATE INDEX IF NOT EXISTS idx_leads_diag_classe ON leads (diag_classe) WHERE diag_classe IS NOT NULL;
