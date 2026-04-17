-- Trigger function reutilizada por todas as tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.characters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identidade
  name             TEXT NOT NULL,
  race             TEXT NOT NULL DEFAULT '',
  concept          TEXT NOT NULL DEFAULT '',
  quote            TEXT NOT NULL DEFAULT '',
  image_url        TEXT,
  level            INTEGER NOT NULL DEFAULT 0,

  -- Atributos e perícias como JSONB (sempre lidos como conjunto completo)
  attributes       JSONB NOT NULL DEFAULT '{"fisico":1,"destreza":1,"intelecto":1,"influencia":1}',
  skills           JSONB NOT NULL DEFAULT '{"fortitude":0,"vontade":0,"atletismo":0,"combate":0,"furtividade":0,"precisao":0,"acrobacia":0,"reflexo":0,"percepcao":0,"intuicao":0,"investigacao":0,"conhecimento":0,"empatia":0,"dominacao":0,"persuasao":0,"performance":0}',
  talents          TEXT[] NOT NULL DEFAULT '{}',

  -- Derivados
  hp               INTEGER NOT NULL DEFAULT 15,
  sanidade         INTEGER NOT NULL DEFAULT 15,

  -- Valores atuais (mudam durante o jogo)
  current_hp       INTEGER,
  current_sanidade INTEGER,

  -- Arcano
  afinidade        TEXT NOT NULL DEFAULT '',
  antitese         TEXT NOT NULL DEFAULT '',
  entropia         INTEGER NOT NULL DEFAULT 0,
  runas            TEXT[] NOT NULL DEFAULT '{}',

  -- Lore
  traumas          TEXT[] NOT NULL DEFAULT '{}',
  antecedentes     TEXT[] NOT NULL DEFAULT '{}',
  historia         TEXT,

  -- Controle de acesso
  is_public        BOOLEAN NOT NULL DEFAULT false,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_user_id   ON public.characters(user_id);
CREATE INDEX idx_characters_is_public ON public.characters(is_public) WHERE is_public = true;

CREATE TRIGGER characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
