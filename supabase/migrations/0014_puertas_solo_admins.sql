-- 0014 · Las fotos de los jugadores, solo para administradores
-- Aplicada el 25/10/2026.
--
-- Por qué: `admin_ve_fotos` y `admin_borra_fotos` (0002) se llamaban «admin»
-- pero solo pedían sesión: `to authenticated using (bucket_id = 'jugadores')`.
-- El registro de Supabase Auth está abierto y el panel enviaba el enlace
-- mágico a cualquier correo, así que cualquiera podía tener sesión y, con
-- ella, listar, descargar y borrar las fotos de todos los planteles. Son datos
-- personales (Ley 1581): ahora exigen lo mismo que el resto del panel, que el
-- correo esté en `public.admins` y activo.
--
-- `sesion_lee_admins` (0004) ya estaba restringida en la base a la fila del
-- propio correo, pero ese cambio se hizo desde el editor y el repositorio
-- seguía diciendo `using (true)`. Se recrea igual que en la base para que el
-- archivo no mienta. La función `publicar` depende de esto: consulta la fila
-- del llamante con su propio token.
--
-- Lo que sigue abierto a propósito: `anon_sube_fotos`. El capitán sube las
-- fotos de su plantel sin cuenta, con el token de su inscripción.

drop policy if exists admin_ve_fotos on storage.objects;
create policy admin_ve_fotos on storage.objects
  for select to authenticated
  using (
    bucket_id = 'jugadores'
    and exists (
      select 1 from public.admins a
      where a.correo = lower(auth.jwt() ->> 'email') and a.activo
    )
  );

drop policy if exists admin_borra_fotos on storage.objects;
create policy admin_borra_fotos on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'jugadores'
    and exists (
      select 1 from public.admins a
      where a.correo = lower(auth.jwt() ->> 'email') and a.activo
    )
  );

drop policy if exists sesion_lee_admins on public.admins;
create policy sesion_lee_admins on public.admins
  for select to authenticated
  using (lower(correo) = lower(auth.jwt() ->> 'email'));
