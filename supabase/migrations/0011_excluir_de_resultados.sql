-- ============================================================
-- Diagnósticos fuera de los resultados, sin borrarlos.
-- Aplicada en el proyecto fundacion-managers el 22/10/2026.
--
-- El equipo llenó el diagnóstico para probarlo (Jorge Hugo Pérez y
-- William Mojica) y esas respuestas se mezclaban con las de los
-- emprendedores: inflaban el conteo y movían los promedios del grupo.
--
-- Se marcan en vez de borrarse. Un borrado no tiene vuelta atrás, y una
-- marca se quita con un update si alguien se equivocó de fila. El panel
-- de resultados deja fuera las filas marcadas en todas sus vistas y en
-- las descargas.
--
-- Si lo que llega es una solicitud de supresión de la persona (Ley 1581,
-- Art. 8), esto NO basta: ahí la fila se borra.
-- ============================================================

alter table public.emprendedores
  add column if not exists excluido_de_resultados boolean not null default false;

comment on column public.emprendedores.excluido_de_resultados is
  'true = respuesta de prueba del equipo: el panel la deja fuera de conteos, promedios y descargas.';

-- Las dos respuestas de prueba del equipo.
update public.emprendedores
   set excluido_de_resultados = true
 where lower(correo) in ('williammojica@fundacionmanagers.com',
                         'jorgehugoperezgaona@gmail.com');
