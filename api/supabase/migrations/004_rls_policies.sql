-- ── characters ────────────────────────────────────────────────────────────────

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Owner vê suas próprias fichas
CREATE POLICY "characters_select_own"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id);

-- Fichas públicas são visíveis por todos (incluindo anônimos)
CREATE POLICY "characters_select_public"
  ON public.characters FOR SELECT
  USING (is_public = true);

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_update_own"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_delete_own"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- ── inventory_bags ─────────────────────────────────────────────────────────────

ALTER TABLE public.inventory_bags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_bags_owner_all"
  ON public.inventory_bags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_bags.character_id
        AND characters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_bags.character_id
        AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "inventory_bags_public_read"
  ON public.inventory_bags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_bags.character_id
        AND characters.is_public = true
    )
  );

-- ── inventory_items ────────────────────────────────────────────────────────────

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_items_owner_all"
  ON public.inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_items.character_id
        AND characters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_items.character_id
        AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "inventory_items_public_read"
  ON public.inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = inventory_items.character_id
        AND characters.is_public = true
    )
  );

-- ── character_state ────────────────────────────────────────────────────────────

ALTER TABLE public.character_state ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio usuário acessa seu estado
CREATE POLICY "character_state_owner"
  ON public.character_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
