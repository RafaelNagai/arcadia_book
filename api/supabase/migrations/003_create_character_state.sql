-- Estado volátil de sessão separado da ficha principal para evitar
-- writes frequentes na tabela characters durante o jogo.

CREATE TABLE public.character_state (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id      UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- PE checkboxes por atributo: { fisico: [true,false,...], destreza: [...] }
  pe_checks         JSONB NOT NULL DEFAULT '{}',

  -- Modificadores temporários de perícia: { combate: 2, reflexo: -1 }
  skill_modifiers   JSONB NOT NULL DEFAULT '{}',

  -- Bônus de defesa: { daBase: 1, daBonus: 0, dpBonus: 0 }
  defense_modifiers JSONB NOT NULL DEFAULT '{"daBase":1,"daBonus":0,"dpBonus":0}',

  -- Histórico de rolagens (máx 200 entradas, controlado pela aplicação)
  dice_log          JSONB NOT NULL DEFAULT '[]',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(character_id, user_id)
);

CREATE INDEX idx_character_state_character_id ON public.character_state(character_id);

CREATE TRIGGER character_state_updated_at
  BEFORE UPDATE ON public.character_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
