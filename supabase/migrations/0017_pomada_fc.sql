-- 0017 · Nombre oficial de Pomada: «Pomada FC»
--
-- Por qué: el documento «Actualización página web» de la organización
-- (30 oct 2026) escribe el club como «Pomada FC». Hasta ahora la base y el
-- código decían «Pomada Alfa». Es el mismo club: se cambia el nombre, no el
-- identificador. El slug sigue siendo 'pomada-alfa' porque partidos,
-- goleadores y tarjetas lo usan como clave.
--
-- Efecto en la base: solo la fila de equipos. El sitio no lee esta tabla (los
-- nombres salen de src/lib/torneo-data.ts), así que esto la deja coherente con
-- el sitio y no cambia ningún marcador.
--
-- Aplicada: 31 oct 2026, desde el MCP de Supabase.
-- Para deshacer: update equipos set nombre = 'Pomada Alfa', corto = 'PAL'
--                where slug = 'pomada-alfa';

update equipos
set nombre = 'Pomada FC',
    corto = 'PFC'
where slug = 'pomada-alfa';
