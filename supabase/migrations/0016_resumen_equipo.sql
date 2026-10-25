-- 0016 · Una consulta del capitán que no trae el plantel
-- Aplicada el 25/10/2026.
--
-- Por qué: las páginas de pago, comprobante y la guardia de las páginas de
-- inscripción llamaban a `fm_get_equipo` solo para saber el nombre del equipo
-- o si el token valía. Esa función devuelve el plantel completo, con
-- documento, celular, EPS, fecha de nacimiento y foto de cada jugador (Ley
-- 1581): el navegador recibía datos personales que la página no usaba ni
-- mostraba. `fm_get_equipo` se queda para el formulario del plantel, que sí
-- los necesita para editarlos.

create or replace function public.fm_resumen_equipo(p_id uuid, p_token text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not public.fm_token_ok(p_id, p_token) then raise exception 'token invalido'; end if;
  return (select json_build_object('equipo', equipo, 'capitan', capitan)
          from public.inscripciones where id = p_id);
end;
$$;

revoke all on function public.fm_resumen_equipo(uuid, text) from public;
grant execute on function public.fm_resumen_equipo(uuid, text) to anon, authenticated;
