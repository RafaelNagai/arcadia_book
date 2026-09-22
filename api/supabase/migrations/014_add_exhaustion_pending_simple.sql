-- Bolinha verde de Ação Simples pendente (Exaustão): estado que aguarda
-- uma segunda Ação Simples antes de virar 1 ponto de Exaustão real.
-- Hoje só existe como estado local no componente e se perde ao recarregar
-- a página (chapters/01_04_00_combate.md, seção "Exaustão").

ALTER TABLE public.character_state ADD COLUMN exhaustion_pending_simple BOOLEAN NOT NULL DEFAULT false;
