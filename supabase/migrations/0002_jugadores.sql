-- ============================================================
-- Torneo Managers — Paso 3: planteles (jugadores) + fotos + reanudación
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Token de reanudación en inscripciones (enlace único del capitán).
alter table public.inscripciones add column if not exists token text;

-- 2) Tabla de jugadores (datos "completos").
create table if not exists public.jugadores (
  id                uuid primary key default gen_random_uuid(),
  inscripcion_id    uuid not null references public.inscripciones(id) on delete cascade,
  nombre            text not null default '',
  documento         text not null default '',
  celular           text default '',
  numero            int,
  posicion          text,           -- POR / DEF / MED / DEL
  fecha_nacimiento  date,
  eps               text default '',
  talla             text default '', -- XS..XXL
  foto_url          text,            -- ruta del archivo en Storage
  orden             int not null default 0,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);
create index if not exists idx_jugadores_inscripcion on public.jugadores(inscripcion_id);

alter table public.jugadores enable row level security;

-- Solo el admin autenticado tiene acceso directo (panel + descargas).
drop policy if exists "admin_jugadores_all" on public.jugadores;
create policy "admin_jugadores_all" on public.jugadores
  for all to authenticated using (true) with check (true);
-- anon NO tiene acceso directo: usa las funciones RPC con token de abajo.

drop trigger if exists trg_touch_jugadores on public.jugadores;
create trigger trg_touch_jugadores before update on public.jugadores
  for each row execute function public.touch_actualizado_en();

-- 3) Funciones seguras (SECURITY DEFINER) para el capitán anónimo con token.
create or replace function public.fm_token_ok(p_id uuid, p_token text)
returns boolean language sql security definer set search_path = public as $func$
  select exists(
    select 1 from public.inscripciones
    where id = p_id and token = p_token and p_token is not null and p_token <> ''
  );
$func$;

create or replace function public.fm_get_equipo(p_id uuid, p_token text)
returns json language plpgsql security definer set search_path = public as $func$
declare result json;
begin
  if not public.fm_token_ok(p_id, p_token) then
    raise exception 'token invalido';
  end if;
  select json_build_object(
    'inscripcion', (
      select row_to_json(i) from (
        select id, equipo, capitan, contacto, paso_actual from public.inscripciones where id = p_id
      ) i
    ),
    'jugadores', coalesce((
      select json_agg(j order by j.orden, j.creado_en)
      from public.jugadores j where j.inscripcion_id = p_id
    ), '[]'::json)
  ) into result;
  return result;
end;
$func$;

create or replace function public.fm_upsert_jugador(p_id uuid, p_token text, p_jugador json)
returns uuid language plpgsql security definer set search_path = public as $func$
declare jid uuid;
begin
  if not public.fm_token_ok(p_id, p_token) then raise exception 'token invalido'; end if;
  jid := nullif(p_jugador->>'id', '')::uuid;
  if jid is null then
    insert into public.jugadores(
      inscripcion_id, nombre, documento, celular, numero, posicion,
      fecha_nacimiento, eps, talla, foto_url, orden
    ) values (
      p_id,
      coalesce(p_jugador->>'nombre',''),
      coalesce(p_jugador->>'documento',''),
      coalesce(p_jugador->>'celular',''),
      nullif(p_jugador->>'numero','')::int,
      nullif(p_jugador->>'posicion',''),
      nullif(p_jugador->>'fecha_nacimiento','')::date,
      coalesce(p_jugador->>'eps',''),
      coalesce(p_jugador->>'talla',''),
      nullif(p_jugador->>'foto_url',''),
      coalesce(nullif(p_jugador->>'orden','')::int, 0)
    ) returning id into jid;
  else
    update public.jugadores set
      nombre           = coalesce(p_jugador->>'nombre', nombre),
      documento        = coalesce(p_jugador->>'documento', documento),
      celular          = coalesce(p_jugador->>'celular', celular),
      numero           = nullif(p_jugador->>'numero','')::int,
      posicion         = nullif(p_jugador->>'posicion',''),
      fecha_nacimiento = nullif(p_jugador->>'fecha_nacimiento','')::date,
      eps              = coalesce(p_jugador->>'eps', eps),
      talla            = coalesce(p_jugador->>'talla', talla),
      foto_url         = coalesce(nullif(p_jugador->>'foto_url',''), foto_url)
    where id = jid and inscripcion_id = p_id;
  end if;
  return jid;
end;
$func$;

create or replace function public.fm_delete_jugador(p_id uuid, p_token text, p_jugador_id uuid)
returns void language plpgsql security definer set search_path = public as $func$
begin
  if not public.fm_token_ok(p_id, p_token) then raise exception 'token invalido'; end if;
  delete from public.jugadores where id = p_jugador_id and inscripcion_id = p_id;
end;
$func$;

grant execute on function public.fm_get_equipo(uuid, text) to anon, authenticated;
grant execute on function public.fm_upsert_jugador(uuid, text, json) to anon, authenticated;
grant execute on function public.fm_delete_jugador(uuid, text, uuid) to anon, authenticated;

-- 4) Storage privado para las fotos de jugadores.
insert into storage.buckets (id, name, public)
values ('jugadores', 'jugadores', false)
on conflict (id) do nothing;

drop policy if exists "anon_sube_fotos" on storage.objects;
create policy "anon_sube_fotos" on storage.objects
  for insert to anon with check (bucket_id = 'jugadores');

drop policy if exists "admin_ve_fotos" on storage.objects;
create policy "admin_ve_fotos" on storage.objects
  for select to authenticated using (bucket_id = 'jugadores');

drop policy if exists "admin_borra_fotos" on storage.objects;
create policy "admin_borra_fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'jugadores');
