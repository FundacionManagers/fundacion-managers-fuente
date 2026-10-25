/**
 * Dispara el despliegue del sitio bajo demanda.
 *
 * Por qué existe: el cron de GitHub pide correr cada 15 minutos, pero en la
 * práctica corre cada 2 a 5 horas (medido en octubre de 2026). El panel llama
 * a esta función cada vez que guarda, y así un marcador sale en un par de
 * minutos.
 *
 * Por qué no lo hace el navegador directamente: haría falta un token de
 * GitHub en el bundle, visible para cualquiera. Aquí el token vive como
 * secreto de Supabase y nunca sale del servidor.
 *
 * Autorización: no basta con tener sesión. Se comprueba que el correo del
 * llamante esté en `public.admins`, la misma lista que gobierna la escritura
 * de los datos del torneo.
 */

/**
 * A donde dispara cada entorno.
 *
 * Es una lista blanca, no un parametro libre: el navegador dice "ensayos" o
 * "produccion" y nada mas. Si llegara un repositorio arbitrario en el
 * cuerpo, cualquiera con sesion de admin podria usar este token para
 * disparar workflows en otros repositorios de la organizacion.
 */
const DESTINOS: Record<string, { repo: string }> = {
  produccion: {
    repo: 'FundacionManagers/fundacion-managers-fuente',
  },
  ensayos: {
    // Vive bajo la cuenta personal y no bajo la organizacion porque la
    // cuenta que opera esto es colaboradora del repo, no miembro de la
    // organizacion con permiso para crear repositorios.
    repo: 'jorgeicone/fundacion-managers-ensayos',
  },
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function responder(estado: number, cuerpo: Record<string, unknown>) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const autorizacion = req.headers.get('Authorization');
  if (!autorizacion) return responder(401, { error: 'Falta la sesión.' });

  // ── Qué sitio hay que publicar ─────────────────────────────────────
  // Sin cuerpo, producción: es como llamaban las versiones anteriores del
  // panel y no deben dejar de funcionar por desplegarse en otro orden.
  let entorno = 'produccion';
  try {
    const cuerpo = await req.json();
    if (typeof cuerpo?.entorno === 'string') entorno = cuerpo.entorno;
  } catch {
    // Cuerpo vacío o no-JSON: se queda en producción.
  }

  const destino = DESTINOS[entorno];
  if (!destino) return responder(400, { error: `Entorno desconocido: ${entorno}.` });

  const urlSupabase = Deno.env.get('SUPABASE_URL');
  const claveAnon = Deno.env.get('SUPABASE_ANON_KEY');
  const tokenGitHub = Deno.env.get('GH_TOKEN');

  if (!urlSupabase || !claveAnon) {
    return responder(500, { error: 'Supabase mal configurado.' });
  }
  if (!tokenGitHub) {
    return responder(500, {
      error: 'Falta el secreto GH_TOKEN. Configúralo en Supabase → Edge Functions → Secrets.',
    });
  }

  // ── Quién llama ────────────────────────────────────────────────────
  const usuarioRes = await fetch(`${urlSupabase}/auth/v1/user`, {
    headers: { Authorization: autorizacion, apikey: claveAnon },
  });
  if (!usuarioRes.ok) return responder(401, { error: 'Sesión inválida.' });

  const usuario = await usuarioRes.json();
  const correo = String(usuario?.email ?? '').toLowerCase();
  if (!correo) return responder(401, { error: 'La sesión no tiene correo.' });

  // ── Está autorizado ────────────────────────────────────────────────
  // Se consulta con el token del llamante, así que las políticas RLS
  // aplican igual que en el resto de la aplicación.
  const adminRes = await fetch(
    `${urlSupabase}/rest/v1/admins?select=correo&activo=eq.true&correo=eq.${encodeURIComponent(correo)}`,
    { headers: { Authorization: autorizacion, apikey: claveAnon } },
  );
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!Array.isArray(admins) || admins.length === 0) {
    return responder(403, { error: 'Tu cuenta no está autorizada para publicar.' });
  }

  // ── Disparar el despliegue ─────────────────────────────────────────
  // repository_dispatch, no workflow_dispatch: este último exige derechos de
  // administrador sobre el repositorio con un token personal clásico, y
  // GitHub responde 403. La versión 7 de esta función, desplegada el 23 de
  // septiembre, volvió a workflow_dispatch: desde entonces no hubo ni un
  // despliegue disparado desde el panel en ninguno de los dos sitios. El
  // workflow escucha `types: [publicar]` y corre siempre sobre la rama por
  // defecto, main.
  const githubRes = await fetch(`https://api.github.com/repos/${destino.repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenGitHub}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'fundacion-managers-panel',
    },
    body: JSON.stringify({ event_type: 'publicar' }),
  });

  // GitHub responde 204 sin cuerpo cuando acepta el disparo.
  if (githubRes.status === 204) {
    return responder(200, { ok: true, mensaje: 'Despliegue iniciado.', por: correo, entorno });
  }

  const detalle = await githubRes.text();
  // Queda en los registros de la funcion: sin esto, un fallo aqui solo se ve
  // como un 502 opaco y hay que adivinar si fue token, permiso o ruta.
  console.error(`[publicar] ${entorno} → GitHub ${githubRes.status}: ${detalle.slice(0, 200)}`);
  return responder(502, {
    error: 'GitHub rechazó el disparo.',
    estado: githubRes.status,
    // Útil para diagnosticar: 401 token inválido, 403 sin permiso de
    // Actions, 404 workflow o repositorio mal escritos.
    detalle: detalle.slice(0, 300),
  });
});
