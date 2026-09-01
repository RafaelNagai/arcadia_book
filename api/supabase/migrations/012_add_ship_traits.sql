-- Traços do navio (flavor livre, mesmo padrão dos Traços do navio Arcádia em ships.json)

ALTER TABLE public.ships ADD COLUMN traits JSONB NOT NULL DEFAULT '[]'::jsonb;
