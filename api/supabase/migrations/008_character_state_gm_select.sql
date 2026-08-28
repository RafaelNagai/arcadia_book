-- Permite que o GM da campanha veja o character_state de personagens de jogadores
-- na mesma campanha, corrigindo a sincronização via Realtime (dono altera → GM não via).
-- Aditiva: não remove nem altera a policy character_state_owner já existente.

CREATE POLICY "character_state_gm_select"
  ON public.character_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_characters cc
        JOIN public.campaigns camp ON camp.id = cc.campaign_id
      WHERE cc.character_id = character_state.character_id
        AND camp.gm_user_id = auth.uid()
    )
  );
