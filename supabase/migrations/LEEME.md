# Migraciones — cómo leer esta carpeta

Esta carpeta **no contiene todas** las migraciones del proyecto Supabase
`fundacion-managers`. Una misma base de datos recibe cambios desde dos
lugares distintos, y conviene saberlo antes de reconstruirla.

## Las dos series

| Serie | Carpeta | Qué toca |
|---|---|---|
| **Torneo** | esta carpeta (`supabase/migrations/`) | `equipos`, `partidos`, `goleadores`, `disciplina`, `inscripciones`, `jugadores`, `admins` |
| **Caracterización** | `7.Caracterizacion/supabase/`, fuera de este repositorio | `miembros`, `emprendedores`, `emprendedores_avance` |

Las dos numeran desde `0001` por su cuenta, así que **los números se
repiten entre carpetas**: hay dos `0004`, dos `0005`, dos `0006` y dos
`0007` apuntando a la misma base. El número no es un orden global; solo
ordena dentro de su propia serie. El orden real de aplicación es el de
la tabla `supabase_migrations.schema_migrations`, que va por fecha.

## Orden real de aplicación

Lo que la base registra, de la primera a la última:

| Fecha | Migración | Serie | Archivo |
|---|---|---|---|
| 13/08/2026 | `caracterizacion_miembros` | Caracterización | *sin archivo* |
| 13/08/2026 | `fijar_search_path_touch_actualizado_en` | Caracterización | *sin archivo* |
| 13/08/2026 | `miembros_v2_cinco_dimensiones` | Caracterización | `0004_miembros_v2.sql` |
| 19/08/2026 | `0005_emprendedores` | Caracterización | `0005_emprendedores.sql` |
| 22/08/2026 | `0003_torneo_liga` | Torneo | `0003_torneo_liga.sql` |
| 22/08/2026 | `0004_admins_torneo` | Torneo | `0004_admins_torneo.sql` |
| 22/08/2026 | `0005_lista_blanca_inscripciones` | Torneo | `0005_lista_blanca_inscripciones.sql` |
| 22/08/2026 | `0006_marca_de_cambios` | Torneo | `0006_marca_de_cambios.sql` |
| 23/08/2026 | `0007_fase_eliminatoria` | Torneo | `0007_fase_eliminatoria.sql` |
| 05/09/2026 | `auditoria_seguridad_rls_captura_parcial` | Caracterización | `0006_auditoria_seguridad.sql` |
| 05/09/2026 | `ajustes_willian_precio_como_multiple` | Caracterización | `0007_ajustes_willian.sql` |

Fechas en hora de Colombia. La tabla guarda UTC.

## Los desajustes conocidos

Se dejan anotados en vez de disimulados, porque quien reconstruya la
base los va a encontrar de todos modos.

**Tres archivos de esta carpeta no figuran en el historial de la base:**
`0001_inscripciones.sql`, `0002_jugadores.sql` y
`0003_torneo_liga_seed.sql`. Se aplicaron desde el editor SQL, antes de
empezar a usar el sistema de migraciones. Corrieron de verdad — las
tablas `inscripciones` y `jugadores` existen y tienen datos —, pero no
quedó registro. Para reconstruir la base desde cero hay que ejecutarlos
igual, en su orden.

**Dos migraciones de la serie de Caracterización no tienen archivo:**
`caracterizacion_miembros` y `fijar_search_path_touch_actualizado_en`,
ambas del 13/08/2026. Crearon la versión original de `miembros`, que la
migración siguiente reemplazó. Su contenido solo vive en la columna
`statements` de `supabase_migrations.schema_migrations`.

**Dos prefijos `0003` en esta carpeta.** `0003_torneo_liga.sql` crea el
esquema y `0003_torneo_liga_seed.sql` lo puebla. Van en ese orden.

## Para reconstruir la base desde cero

1. Los archivos de esta carpeta, en orden de nombre, con el `_seed`
   después del esquema.
2. Los de `7.Caracterizacion/supabase/`, en orden de nombre.
3. Las dos migraciones sin archivo del 13/08, recuperándolas de
   `supabase_migrations.schema_migrations` si se necesita la versión
   original de `miembros`; si no, `0004_miembros_v2.sql` la deja en su
   forma vigente.
