-- Garante que ships, ship_state e ship_crew estão na publication supabase_realtime.
-- Nenhuma migration anterior (001-009) contém ALTER PUBLICATION — a inclusão de
-- tabelas na publication sempre foi feita manualmente pelo Supabase Dashboard
-- (Database → Replication), fora do controle de versão. É possível que as 3 tabelas
-- da feature Navio nunca tenham sido adicionadas lá. ALTER PUBLICATION ... ADD TABLE
-- não aceita IF NOT EXISTS, então o idempotente é feito checando pg_publication_tables
-- antes de cada ADD, para poder rodar esta migration em re-run sem erro.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ships'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ships;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ship_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ship_state;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ship_crew'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ship_crew;
  END IF;
END $$;
