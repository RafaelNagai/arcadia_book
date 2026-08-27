-- Navios e tripulação (ver chapters/03_02_00_navios.md e chapters/03_01_00_moral.md)

-- Reafirma a function de 001_create_characters.sql (idempotente) — evita depender
-- de que as migrations anteriores já tenham sido aplicadas manualmente neste banco.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.ships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name         TEXT NOT NULL,
  motto        TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL DEFAULT 'Material',
  porte        TEXT NOT NULL DEFAULT '',
  image_url    TEXT,
  description  TEXT NOT NULL DEFAULT '',

  slots_total  INTEGER NOT NULL DEFAULT 4,
  hp           INTEGER NOT NULL DEFAULT 4,
  current_hp   INTEGER,

  -- Setores instalados: array de { id, category, key } referenciando o catálogo oficial
  sectors      JSONB NOT NULL DEFAULT '[]',

  crew_code    TEXT NOT NULL UNIQUE,
  is_public    BOOLEAN NOT NULL DEFAULT false,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ships_user_id   ON public.ships(user_id);
CREATE INDEX idx_ships_is_public ON public.ships(is_public) WHERE is_public = true;

CREATE TRIGGER ships_updated_at
  BEFORE UPDATE ON public.ships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE public.ship_crew (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id      UUID NOT NULL REFERENCES public.ships(id) ON DELETE CASCADE,
  character_id UUID NOT NULL UNIQUE REFERENCES public.characters(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ship_crew_ship_id ON public.ship_crew(ship_id);

CREATE TABLE public.ship_state (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id     UUID NOT NULL UNIQUE REFERENCES public.ships(id) ON DELETE CASCADE,

  -- Pote de Moral: array de 1 a 5 números (1-12), histórico cap 200 (controlado pela aplicação)
  moral_pool  JSONB NOT NULL DEFAULT '[]',
  moral_log   JSONB NOT NULL DEFAULT '[]',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER ship_state_updated_at
  BEFORE UPDATE ON public.ship_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS: ships ─────────────────────────────────────────────────────────────────
-- Molde: 004_rls_policies.sql (characters)

ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ships_select_own"
  ON public.ships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ships_select_public"
  ON public.ships FOR SELECT
  USING (is_public = true);

CREATE POLICY "ships_insert_own"
  ON public.ships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ships_update_own"
  ON public.ships FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ships_delete_own"
  ON public.ships FOR DELETE
  USING (auth.uid() = user_id);

-- ── RLS: ship_crew ─────────────────────────────────────────────────────────────
-- Molde: inventory_bags (owner_all + public_read), estendido para membros da tripulação.
-- Escrita real (join/leave) sempre passa pelo service role — o gate de "dono ou
-- tripulante" é aplicado no service layer (ships.service.ts), não confiado ao RLS.

ALTER TABLE public.ship_crew ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ship_crew_owner_all"
  ON public.ship_crew FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_crew.ship_id
        AND ships.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_crew.ship_id
        AND ships.user_id = auth.uid()
    )
  );

CREATE POLICY "ship_crew_member_select"
  ON public.ship_crew FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = ship_crew.character_id
        AND characters.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.ship_crew sc
        JOIN public.characters c ON c.id = sc.character_id
      WHERE sc.ship_id = ship_crew.ship_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "ship_crew_public_read"
  ON public.ship_crew FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_crew.ship_id
        AND ships.is_public = true
    )
  );

-- ── RLS: ship_state ────────────────────────────────────────────────────────────
-- Mesmo molde de ship_crew: dono do navio, qualquer tripulante, ou leitura pública.
-- Mutação do Pote da Moral (dono OU qualquer personagem da tripulação) é checada
-- no service layer — RLS aqui cobre apenas leitura/gravação via service role.

ALTER TABLE public.ship_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ship_state_owner_all"
  ON public.ship_state FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_state.ship_id
        AND ships.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_state.ship_id
        AND ships.user_id = auth.uid()
    )
  );

CREATE POLICY "ship_state_member_select"
  ON public.ship_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ship_crew sc
        JOIN public.characters c ON c.id = sc.character_id
      WHERE sc.ship_id = ship_state.ship_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "ship_state_public_read"
  ON public.ship_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ships
      WHERE ships.id = ship_state.ship_id
        AND ships.is_public = true
    )
  );
