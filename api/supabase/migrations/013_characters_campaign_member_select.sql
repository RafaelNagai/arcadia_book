-- Permite que membros de uma campanha (GM e demais jogadores) leiam via RLS o
-- registro `characters` de qualquer personagem da mesma campanha, mesmo que a
-- ficha seja privada (is_public=false, o padrão — schema.prisma:37). Antes
-- desta migration, `characters` só tinha characters_select_own e
-- characters_select_public (004_rls_policies.sql): nenhuma policy cobria
-- "membro de campanha", nem para GM nem para jogador.
--
-- Isso quebrava o overlay de HP ao vivo da chamada de vídeo de sessão
-- (web/src/components/call/CallParticipantTile.tsx via useCharacterRealtime):
-- a assinatura Realtime usa `postgres_changes`, que é enforced por RLS direto
-- no Postgres com o JWT do usuário conectado (a API usa a ANON key no
-- frontend — web/src/lib/apiClient.ts) — o bypass manual de GM que já existe
-- em api/src/services/characters.service.ts:54-68 é só para o endpoint REST
-- (GET /characters/:id) e não influencia em nada o que o Realtime entrega.
--
-- Mesma classe de bug que 008_character_state_gm_select.sql resolveu para
-- `character_state`, mas essa migration cobriu só o GM — e nunca foi
-- estendida para `characters`, que é onde `hp`/`current_hp` de fato vivem
-- (schema.prisma:24-27). Aqui cobrimos GM e jogador-membro.
--
-- Usa uma função SECURITY DEFINER (mesmo padrão introduzido em
-- 009_fix_campaign_rls_recursion.sql) em vez de EXISTS diretos contra
-- `campaigns`/`campaign_characters`: essas tabelas têm policies próprias que
-- por sua vez consultam `characters` (campaign_characters_owner_select,
-- 005_rls_campaigns_maps.sql:45-53) — um EXISTS direto aqui reintroduziria o
-- mesmo ciclo de recursão de RLS que a 009 já teve que quebrar. A função
-- roda com privilégio do dono (role postgres, rolbypassrls=true) e bypassa
-- RLS internamente, então suas subqueries em campaign_characters/campaigns
-- nunca re-disparam nenhuma policy (nem a nova, nem as existentes).
--
-- Aditiva: não remove nem altera nenhuma policy existente em `characters`.

CREATE OR REPLACE FUNCTION public.shares_campaign_with_character(p_character_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    -- auth.uid() é o GM de alguma campanha que contém p_character_id
    SELECT 1
    FROM public.campaign_characters cc_target
    JOIN public.campaigns camp ON camp.id = cc_target.campaign_id
    WHERE cc_target.character_id = p_character_id
      AND camp.gm_user_id = auth.uid()
  ) OR EXISTS (
    -- auth.uid() é dono de outro personagem na mesma campanha de p_character_id
    SELECT 1
    FROM public.campaign_characters cc_target
    JOIN public.campaign_characters cc_self ON cc_self.campaign_id = cc_target.campaign_id
    JOIN public.characters c_self ON c_self.id = cc_self.character_id
    WHERE cc_target.character_id = p_character_id
      AND c_self.user_id = auth.uid()
  );
$$;

CREATE POLICY "characters_select_campaign_member"
  ON public.characters FOR SELECT
  USING (public.shares_campaign_with_character(characters.id));
