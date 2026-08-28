-- Corrige recursão infinita entre as policies de campaigns e campaign_characters.
-- campaigns_member_select (em campaigns) e campaign_characters_gm_all (em
-- campaign_characters) formam um ciclo mútuo de EXISTS: cada uma consulta a outra
-- tabela sob RLS, e o rewriter do Postgres nunca conseguia terminar a expansão —
-- qualquer SELECT em campaigns ou campaign_characters como role authenticated
-- falhava com "infinite recursion detected in policy for relation ...". Extrai as
-- duas condições para funções SECURITY DEFINER (rodam com privilégio do dono —
-- role postgres, rolbypassrls=true — bypassando RLS internamente), padrão
-- recomendado pela documentação do Supabase para quebrar recursão entre policies
-- de tabelas que se referenciam mutuamente. Não remove nem recria as policies —
-- apenas troca a condição via ALTER POLICY, preservando nome/permissões.

CREATE OR REPLACE FUNCTION public.is_campaign_gm(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = p_campaign_id
      AND campaigns.gm_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_member(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_characters cc
      JOIN public.characters c ON c.id = cc.character_id
    WHERE cc.campaign_id = p_campaign_id
      AND c.user_id = auth.uid()
  );
$$;

ALTER POLICY "campaigns_member_select"
  ON public.campaigns
  USING (public.is_campaign_member(campaigns.id));

ALTER POLICY "campaign_characters_gm_all"
  ON public.campaign_characters
  USING (public.is_campaign_gm(campaign_characters.campaign_id))
  WITH CHECK (public.is_campaign_gm(campaign_characters.campaign_id));
