-- Permite que um tripulante (não-dono) leia a própria linha de `ships` via RLS,
-- corrigindo a sincronização via Realtime (setor/vida alterados pelo dono ou por
-- outro tripulante → demais tripulantes não recebiam o evento postgres_changes).
-- `ships` tinha apenas ships_select_own e ships_select_public (006_create_ships.sql)
-- — faltava a policy de tripulante que já existe em ship_state/ship_crew desde a
-- mesma migration. Mesmo JOIN de ship_state_member_select, trocando ship_state.ship_id
-- por ships.id. Aditiva: não remove nem altera nenhuma policy existente.

CREATE POLICY "ships_select_crew"
  ON public.ships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ship_crew sc
        JOIN public.characters c ON c.id = sc.character_id
      WHERE sc.ship_id = ships.id
        AND c.user_id = auth.uid()
    )
  );
