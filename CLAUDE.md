# CLAUDE.md — Instrucciones para Claude Code

> Claude Code lee este archivo al iniciar cada sesión. Es lo primero que ve
> quien llega a trabajar aquí, así que describe **el proyecto que existe**, no
> el que se planeó en mayo.

---

## 1. Contexto

**Nombre:** `fundacion-managers-web` · **Cliente:** Fundación Managers
**En producción:** https://fundacionmanagers.com
**Sitio de ensayos:** https://jorgeicone.github.io/fundacion-managers-ensayos/ — ver `ENTORNOS.md`

Plataforma web institucional de la Fundación Managers, con un módulo deportivo
interactivo —el **Torneo Managers**, F7 para líderes mayores de 28 años— que es
la parte viva del sitio: se carga desde un panel cada semana y se republica sola.

El torneo va por su **quinta edición (2026-2, octubre–noviembre)**: dos grupos
de cuatro a tres fechas; el 1.º y el 2.º de cada grupo juegan la **Copa Oro**
(el título) y el 3.º y el 4.º la **Copa Plata**, cada una con semifinales
cruzadas, tercer puesto y final. Campeón vigente: **Pomada FC** (4.ª edición,
en penales). La 3.ª y la 4.ª están archivadas en `edicion-3.ts` y `edicion-4.ts`.

**Documento de especificaciones:** `Managers_Especificaciones_v2.docx`, en la
raíz. Es el encargo original de mayo de 2026 y **ya no describe la
implementación**: sirve para entender la intención y el alcance comercial, no
para decidir cómo está hecho algo. Cuando los dos se contradigan, manda el
código y este archivo.

---

## 2. Stack real (lo que de verdad corre)

| Capa | Lo que hay | Nota |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript estricto** | |
| Salida | **Exportación estática** (`output: 'export'`) | No hay servidor: no existen Route Handlers ni API routes |
| Estilos | **Tailwind CSS** | shadcn/ui **no** está instalado |
| Datos | **Supabase (PostgreSQL) directo desde el cliente** | Sin ORM. **No hay Prisma** |
| Migraciones | **SQL a mano** en `supabase/migrations/` | Numeradas y con su porqué escrito arriba |
| Seguridad de datos | **Row Level Security** + tabla `public.admins` | Es lo único que protege la escritura |
| Auth | **Supabase Auth**: enlace mágico y contraseña | |
| Funciones de servidor | **Supabase Edge Functions** (`supabase/functions/`) | Solo `publicar` |
| Pagos | **Bold** (`src/lib/pago.ts`, `PagoBold.tsx`) | El contrato decía Wompi + Stripe; se implementó Bold |
| WhatsApp | **Enlaces `wa.me`** | La Cloud API del contrato no está |
| Hosting | **GitHub Pages** + workflow propio | No es Vercel |
| Tests | **`node:test`** (`npm test`, 120 pruebas) | No hay Vitest ni Playwright |

**Lo que el contrato pedía y NO existe** (dilo si alguien lo da por hecho):
tRPC, Prisma, Inngest, Sentry, Cloudinary, `next-intl`, Stripe, Wompi,
WhatsApp Cloud API, blog editorial, tiempo real con Supabase Realtime.

El sitio es estático: **guardar en el panel no publica nada**. Hay que
recompilar. El panel lo pide solo cada vez que guarda (función `publicar`, que
dispara un `repository_dispatch`); el botón «Publicar ahora» repite el disparo.
El cron de `deploy.yml` es solo la red de seguridad: pide cada 15 min, pero
GitHub lo corre cada 2 a 5 horas.

---

## 3. Reglas de oro

### Idioma
- **Comentarios, documentación, textos de interfaz y mensajes de commit:** español.
- **Identificadores de código:** el proyecto usa **español** en `src/lib` y en los
  componentes del torneo (`calcularPosiciones`, `EDICION_ACTUAL`,
  `PartidoEliminatoria`). Es deliberado: el dominio es un torneo colombiano y
  los nombres coinciden con lo que dice la gente. **Sigue esa convención**, no
  la mezcles con inglés.
- No hay i18n. El sitio es solo en español.

### Estilo
- TypeScript estricto. Nada de `any` sin un comentario que lo justifique.
- **La lógica del torneo vive en `src/lib/liga.ts` y es pura**: recibe partidos,
  devuelve tablas. Los componentes no calculan nada.
- Un cálculo se escribe **una sola vez**. Si la Llave y el Calendario deciden por
  separado quién gana un cruce, tarde o temprano se contradicen: por eso existe
  `ladoGanador()`.
- **Nada se escribe a mano si se puede derivar.** La tabla sale de los
  marcadores, la llave sale de la tabla, la posición del goleador sale de sus
  goles. Así el sitio no puede contradecirse a sí mismo.

### Seguridad
- **NUNCA** commitear ni mostrar: `service_role`, tokens de GitHub, secretos.
- La **clave publicable** de Supabase sí viaja en el bundle: está diseñada para
  eso. Quien protege es **RLS**, y hay que comprobarlo, no suponerlo.
- Toda escritura del panel exige que el correo esté en `public.admins`.
- Las tarjetas se guardan una por una (`tarjetas`, solo con dorsal, sin
  nombre). El Fair Play por club y los suspendidos se calculan de ahí.
- Ley 1581 de 2012 (Habeas Data): los datos personales viven en `miembros`,
  `emprendedores`, `inscripciones` y `jugadores`. **Ninguna de esas tablas puede
  quedar legible para `anon`.**

### Base de datos
- Toda modificación de esquema va en una migración numerada en
  `supabase/migrations/`, con la fecha en que se aplicó y **por qué** existe.
- Nunca borrar datos de producción sin confirmación explícita.
- Tablas y campos en `snake_case`; en TypeScript se mapean a `camelCase` a mano.
- **Todo lo del torneo está separado por `edicion`.** Producción usa la de
  `EDICION_ACTUAL` (hoy la 5); el sitio de ensayos, la 99.

### Git
- `main` siempre desplegable: un push a `main` **publica el sitio real**.
- Commits en español, Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`). El cuerpo explica **por qué**, no qué.
- **Prueba en el sitio de ensayos antes de producción:** `git push ensayos HEAD:main`.

---

## 4. Estructura real

```
fundacion-managers-fuente/
├── CLAUDE.md · ENTORNOS.md · DESIGN_SYSTEM.md · README.md
├── Managers_Especificaciones_v2.docx   ← encargo original (histórico)
├── .github/workflows/deploy.yml        ← el mismo archivo en los dos entornos
├── herramientas/                       ← scripts de postbuild (build-info, huella de fotos)
├── public/                             ← estáticos + tres HTML sueltos (panel, caracterización, diagnóstico)
├── supabase/
│   ├── migrations/                     ← SQL numerado
│   └── functions/publicar/             ← dispara el despliegue desde el panel
├── src/
│   ├── app/(public)/                   ← sitio público
│   ├── app/(admin)/resultados/         ← panel del torneo
│   ├── components/torneo/              ← tabla, llave, fixture, panel
│   ├── components/shared/ · layout/
│   └── lib/                            ← liga.ts (lógica pura), supabase, panel-torneo, entorno
└── tests/                              ← node:test sobre la lógica pura
```

`src/server/`, `src/types/`, `src/styles/`, `prisma/` y `src/components/ui/`
existen vacíos o casi: son andamios del plan original. **No los pueble sin
hablarlo.**

---

## 5. Los tres archivos que hay que entender antes de tocar el torneo

1. **`src/lib/liga.ts`** — toda la lógica: tablas por grupo, desempates del
   Artículo 14, cruces de las dos copas, próximo compromiso, penales. Pura y
   con tests. Los grupos y los clubes viven en `torneo-data.ts`.
2. **`src/lib/liga-supabase.ts`** — lee la edición en tiempo de compilación.
   Si Supabase falla, devuelve datos de respaldo y el sitio se publica igual.
3. **`src/lib/panel-torneo.ts`** — lo que el panel escribe, con la sesión del
   administrador. Aquí mandan las políticas RLS.

### Abrir una edición nueva

1. `EDICION_ACTUAL`, el respaldo (`PARTIDOS_LIGA`, `DISCIPLINA`…) y el
   calendario de la fase final en `liga.ts`; grupos y clubes en `torneo-data.ts`.
2. Cerrar la anterior en `torneo.ts` (`EDICIONES`) con su fase final archivada
   en un `edicion-N.ts`, para que el palmarés salga de su Gran Final.
3. Cargar el fixture en Supabase con su seed numerado en `supabase/migrations/`.
4. Resetear la edición 99 de ensayos copiando la nueva (SQL en `ENTORNOS.md`).

`deploy.yml` y `herramientas/build-info.mjs` leen `EDICION_ACTUAL` del código:
no hay que tocarlos.

---

## 6. Modo de operación: autónomo

- **No pidas permiso para ejecutar herramientas.** Ejecuta: Bash, Edit, Write,
  Read, npm, git.
- Decide y avanza. Al terminar un bloque coherente, resume qué quedó.
- **Pregunta antes de:** cambiar el stack o añadir dependencias mayores; una
  migración destructiva; tocar la pasarela de pagos en producción; borrar
  archivos existentes; `git push --force`, `reset --hard` o cualquier acción
  irreversible sobre el remoto.
- **No preguntes para:** crear componentes siguiendo las convenciones, añadir
  tests, refactorizar manteniendo la API pública, arreglar tipos o linting.

Antes de dar por terminado un cambio en el sitio:

```bash
npm run typecheck && npx next lint && npm test && npm run build
```

Y **verifica contra el dominio**, no contra el local: `out/` puede estar bien y
el sitio publicado seguir siendo el de antes.

---

## 7. Comandos

```bash
npm run dev          # desarrollo local
npm run build        # build de producción (+ postbuild: build-info y huella de fotos)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm test             # node:test sobre la lógica pura (120 pruebas)
npm run format       # prettier
```

No existen `db:migrate`, `db:push`, `db:seed`, `db:studio` ni `test:e2e`: eran
del plan con Prisma. Las migraciones se aplican por el panel de Supabase o por
MCP.

---

## 8. Cliente

- Opera en Bogotá, Colombia. Plataforma solo en español. Moneda: COP.
- Ley 1581 de 2012 (Habeas Data): toda recolección de datos personales exige
  consentimiento explícito.
- Público del torneo: hombres mayores de 28 con perfil profesional.
- Tono: cercano pero profesional. Energía deportiva en el torneo, cálido y
  humano en los demás ejes. **El texto retrata el problema, nunca ridiculiza a
  la persona** — ver la auditoría 4 de tono.

---

**Última actualización:** 25 de octubre de 2026 · apertura de la 5.ª edición.
