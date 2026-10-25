# Los dos sitios: producción y ensayos

Hay **dos copias de la web**, servidas por el mismo código desde dos
repositorios. Sirven para probar cambios sin arriesgar el sitio real.

| | Producción | Ensayos |
|---|---|---|
| Web | https://fundacionmanagers.com | https://jorgeicone.github.io/fundacion-managers-ensayos/ |
| Panel | `/resultados/` de esa web | `/resultados/` de esa web |
| Repositorio | `FundacionManagers/fundacion-managers-fuente` | `jorgeicone/fundacion-managers-ensayos` |
| Edición en la base | 5 (la real; sale de `EDICION_ACTUAL`) | 99 (copia sandbox) |
| Aviso en pantalla | ninguno | franja naranja fija en todas las páginas |

---

## Qué está aislado y qué no

**Aislados: los datos.** Todas las tablas del torneo llevan columna `edicion`.
El sitio de ensayos lee y escribe en la 99; producción, en la 4. Cargar un
marcador de prueba no puede tocar un dato real aunque alguien se equivoque de
pestaña. Tampoco se disparan despliegues entre sí: la vista
`torneo_marca_edicion` da a cada sitio solo la marca de su edición.

**Aislado: el despliegue.** Cada repositorio publica su propio GitHub Pages.
El botón «Publicar ahora» del panel manda el entorno en el cuerpo de la
llamada, y la función `publicar` tiene una lista blanca que decide a qué
repositorio disparar.

**NO aislado: el esquema.** La base de datos es la misma. Una migración
afecta a las dos ediciones. Para probar un cambio de tablas destructivo
haría falta un proyecto Supabase aparte.

**NO aislado: inscripciones y planteles.** Esas tablas no llevan `edicion`, así
que un formulario enviado desde ensayos escribe en la tabla real. Está avisado
en la franja naranja; si llega a hacer falta probarlas, primero hay que
añadirles la columna.

---

## Cómo se prueba un cambio

```bash
# 1. Trabajas en local como siempre.
npm run dev

# 2. Lo mandas al sitio de ensayos y lo miras en la URL de arriba.
git push ensayos HEAD:main

# 3. Cuando convence, va a producción.
git push origin main
```

El remoto `ensayos` se añade una sola vez:

```bash
git remote add ensayos https://github.com/jorgeicone/fundacion-managers-ensayos.git
```

`HEAD:main` empuja la rama en la que estés a `main` del repositorio de
ensayos. Así puedes probar una rama sin haberla mezclado todavía.

---

## Cómo sabe cada sitio quién es

Con tres **variables de repositorio** (Settings → Secrets and variables →
Actions → Variables). El archivo `.github/workflows/deploy.yml` es idéntico en
los dos repositorios —por eso se sincronizan con un `git push` sin
conflictos— y lee de ahí:

| Variable | Producción | Ensayos |
|---|---|---|
| `ENTORNO` | *(sin definir)* | `ensayos` |
| `EDICION` | *(sin definir: usa `EDICION_ACTUAL` de `src/lib/liga.ts`)* | `99` |
| `PAGES_BASE_PATH` | *(sin definir)* | `/fundacion-managers-ensayos` |

Sin definir, los valores por defecto son los de producción: el caso seguro.
Un repositorio nuevo clonado de este publica como producción, nunca al revés.

El build de ensayos además **borra `out/CNAME`**, que reclama
fundacionmanagers.com. Sin eso, la réplica le disputaría el dominio a la web
real.

---

## Resetear los datos de ensayos

Cuando la edición 99 quede hecha un desastre de tanto probar, se vuelve a
copiar de la real. Es seguro ejecutarlo tantas veces como haga falta: borra la
99 antes de copiar, y no toca la edición real.

**Al abrir una edición nueva hay que correrlo**, cambiando el `5` por la
nueva: el sitio de ensayos sigue el código, y el código de la 5ª sobre los
datos de la 4ª pinta clubes y fechas que no existen.

```sql
delete from public.premios    where edicion = 99;
delete from public.goleadores where edicion = 99;
delete from public.disciplina where edicion = 99;
delete from public.partidos   where edicion = 99;

insert into public.partidos
  (edicion, fase, copa, jornada, fecha, hora, local, visitante,
   goles_local, goles_visitante, penales_local, penales_visitante, estado)
select 99, fase, copa, jornada, fecha, hora, local, visitante,
       goles_local, goles_visitante, penales_local, penales_visitante, estado
from public.partidos where edicion = 5;

insert into public.disciplina (edicion, equipo, amarillas, rojas)
select 99, equipo, amarillas, rojas
from public.disciplina where edicion = 5;

insert into public.goleadores (edicion, jugador, equipo, numero, goles)
select 99, jugador, equipo, numero, goles
from public.goleadores where edicion = 5;

insert into public.premios (edicion, clave, jugador, equipo, nota)
select 99, clave, jugador, equipo, nota
from public.premios where edicion = 5;
```

Se ejecuta en Supabase → SQL Editor, proyecto `fundacion-managers`.

---

## Probar en local apuntando a ensayos

```bash
GITHUB_PAGES=  NEXT_PUBLIC_ENTORNO=ensayos NEXT_PUBLIC_EDICION=99 npm run dev
```

(En Git Bash para Windows, `PAGES_BASE_PATH` se corrompe al convertirse en
ruta; para compilar con base path usa PowerShell.)
