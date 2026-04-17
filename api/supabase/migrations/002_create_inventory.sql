-- inventory_bags deve ser criada ANTES de inventory_items (FK bag_id)

CREATE TABLE public.inventory_bags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slots        INTEGER NOT NULL DEFAULT 4,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_bags_character_id ON public.inventory_bags(character_id);

CREATE TRIGGER inventory_bags_updated_at
  BEFORE UPDATE ON public.inventory_bags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────

CREATE TABLE public.inventory_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id        UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  bag_id              UUID REFERENCES public.inventory_bags(id) ON DELETE SET NULL,
  -- bag_id NULL = item está solto no inventário raiz

  name                TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  weight              TEXT NOT NULL DEFAULT 'nulo',
  -- enum: nulo | super_leve | leve | medio | pesado | super_pesado | massivo | hyper_massivo

  is_equipment        BOOLEAN NOT NULL DEFAULT false,
  max_durability      INTEGER,
  current_durability  INTEGER,

  image_url           TEXT,        -- URL customizada pelo usuário
  catalog_image       TEXT,        -- asset path original do catálogo

  from_catalog        BOOLEAN NOT NULL DEFAULT false,
  catalog_subcategory TEXT,
  catalog_tier        TEXT,        -- SS | S | A | B | C | D | E

  damage              TEXT,
  effects             TEXT[] NOT NULL DEFAULT '{}',

  sort_order          INTEGER NOT NULL DEFAULT 0,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_items_character_id ON public.inventory_items(character_id);
CREATE INDEX idx_inventory_items_bag_id       ON public.inventory_items(bag_id);

CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
