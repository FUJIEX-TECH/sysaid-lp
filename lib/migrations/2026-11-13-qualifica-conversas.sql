-- ==========================================================================
-- Qualifica v2 (13/11/2026, Severino): a conversa inteira de cada lead do
-- Qualifica, pro /admin/qualifica. Migração SÓ ADITIVA: cria uma tabela nova e
-- dois índices dela. NÃO altera nem apaga nada da tabela `leads` (nem coluna,
-- nem linha, nem chave estrangeira: `lead_id` é só um número com índice, pra
-- apagar um lead de teste não depender desta tabela). Idempotente.
-- Aplicar com scripts/migrar-qualifica-conversas.mjs (faz backup antes).
-- ==========================================================================

CREATE TABLE IF NOT EXISTS qualifica_conversas (
  id                BIGSERIAL PRIMARY KEY,
  sessao            TEXT NOT NULL UNIQUE,              -- id aleatório da conversa (gerado no navegador)
  lead_id           BIGINT,                            -- leads.id (sem FK, de propósito)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  seq               INTEGER NOT NULL DEFAULT 0,        -- ordem das gravações (a mais nova vence)
  fluxo             TEXT,                              -- id da configuração (ex.: sysaid-generica-v2)
  origem            TEXT,                              -- generica | comparativa | brand
  completo          BOOLEAN NOT NULL DEFAULT false,    -- chegou ao fim (lead completo)
  pedido            TEXT,                              -- reuniao | orcamento | whatsapp | NULL
  papel             TEXT,                              -- decide | influencia | levanta | ...
  horarios          JSONB,                             -- [{"data":"2026-11-16","hora":"10:00"}, ...], conferidos no servidor
  horarios_validos  BOOLEAN,                           -- false = vieram fora das regras (ficam em dados.respostas)
  conversa          JSONB NOT NULL DEFAULT '[]'::jsonb,-- os turnos, como aconteceram (falas, respostas, chips, cartões)
  dados             JSONB NOT NULL DEFAULT '{}'::jsonb -- respostas, leituras, gerados, empresa lida, sinais, classificação
);

CREATE INDEX IF NOT EXISTS idx_qualifica_conversas_created ON qualifica_conversas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qualifica_conversas_lead ON qualifica_conversas (lead_id);
