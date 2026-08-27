-- Exaustão: contador de sessão que aumenta a dificuldade dos testes em 10 por ponto
-- (chapters/01_04_00_combate.md, seção "Exaustão").

ALTER TABLE public.character_state ADD COLUMN exhaustion INT NOT NULL DEFAULT 0;
