-- ── campaigns ──────────────────────────────────────────────────────────────────

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_gm_all"
  ON public.campaigns FOR ALL
  USING (auth.uid() = gm_user_id)
  WITH CHECK (auth.uid() = gm_user_id);

-- Membros da campanha podem ver a campanha
CREATE POLICY "campaigns_member_select"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_characters cc
        JOIN public.characters c ON c.id = cc.character_id
      WHERE cc.campaign_id = campaigns.id
        AND c.user_id = auth.uid()
    )
  );

-- ── campaign_characters ────────────────────────────────────────────────────────

ALTER TABLE public.campaign_characters ENABLE ROW LEVEL SECURITY;

-- GM da campanha tem acesso total
CREATE POLICY "campaign_characters_gm_all"
  ON public.campaign_characters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_characters.campaign_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_characters.campaign_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

-- Dono do personagem pode ver e remover a própria entrada
CREATE POLICY "campaign_characters_owner_select"
  ON public.campaign_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = campaign_characters.character_id
        AND characters.user_id = auth.uid()
    )
  );

CREATE POLICY "campaign_characters_owner_delete"
  ON public.campaign_characters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = campaign_characters.character_id
        AND characters.user_id = auth.uid()
    )
  );

-- ── maps ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

-- GM tem acesso total
CREATE POLICY "maps_gm_all"
  ON public.maps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = maps.campaign_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = maps.campaign_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

-- Membros podem ler
CREATE POLICY "maps_member_select"
  ON public.maps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_characters cc
        JOIN public.characters c ON c.id = cc.character_id
      WHERE cc.campaign_id = maps.campaign_id
        AND c.user_id = auth.uid()
    )
  );

-- ── map_layers ─────────────────────────────────────────────────────────────────

ALTER TABLE public.map_layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "map_layers_gm_all"
  ON public.map_layers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_layers.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_layers.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

CREATE POLICY "map_layers_member_select"
  ON public.map_layers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaign_characters cc ON cc.campaign_id = maps.campaign_id
        JOIN public.characters c ON c.id = cc.character_id
      WHERE maps.id = map_layers.map_id
        AND c.user_id = auth.uid()
    )
  );

-- ── map_walls ──────────────────────────────────────────────────────────────────

ALTER TABLE public.map_walls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "map_walls_gm_all"
  ON public.map_walls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_walls.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_walls.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

CREATE POLICY "map_walls_member_select"
  ON public.map_walls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaign_characters cc ON cc.campaign_id = maps.campaign_id
        JOIN public.characters c ON c.id = cc.character_id
      WHERE maps.id = map_walls.map_id
        AND c.user_id = auth.uid()
    )
  );

-- ── map_doors ──────────────────────────────────────────────────────────────────

ALTER TABLE public.map_doors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "map_doors_gm_all"
  ON public.map_doors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_doors.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_doors.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

CREATE POLICY "map_doors_member_select"
  ON public.map_doors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaign_characters cc ON cc.campaign_id = maps.campaign_id
        JOIN public.characters c ON c.id = cc.character_id
      WHERE maps.id = map_doors.map_id
        AND c.user_id = auth.uid()
    )
  );

-- ── map_tokens ─────────────────────────────────────────────────────────────────

ALTER TABLE public.map_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "map_tokens_gm_all"
  ON public.map_tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_tokens.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaigns ON campaigns.id = maps.campaign_id
      WHERE maps.id = map_tokens.map_id
        AND campaigns.gm_user_id = auth.uid()
    )
  );

-- Membros veem tokens visíveis
CREATE POLICY "map_tokens_member_select"
  ON public.map_tokens FOR SELECT
  USING (
    is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.maps
        JOIN public.campaign_characters cc ON cc.campaign_id = maps.campaign_id
        JOIN public.characters c ON c.id = cc.character_id
      WHERE maps.id = map_tokens.map_id
        AND c.user_id = auth.uid()
    )
  );

-- Dono do personagem pode mover seu próprio token
CREATE POLICY "map_tokens_owner_update"
  ON public.map_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = map_tokens.character_id
        AND characters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = map_tokens.character_id
        AND characters.user_id = auth.uid()
    )
  );

-- ── custom_creatures ───────────────────────────────────────────────────────────

ALTER TABLE public.custom_creatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_creatures_owner_all"
  ON public.custom_creatures FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "custom_creatures_public_select"
  ON public.custom_creatures FOR SELECT
  USING (is_public = true);
