# Traspaso · Fundación Managers · 23 de septiembre de 2026

Para arrancar una sesión nueva. Lo permanente del proyecto está en
`CLAUDE.md` dentro del repositorio —se reescribió hoy y ya describe el stack
real—. Esto es **lo que pasó en las últimas dos semanas y lo que queda abierto**.

---

## Dónde está todo

| | |
|---|---|
| Carpeta del proyecto | `…\1. 2026\18. Fundacion Manager\fundacion-managers-fuente` |
| Repositorio de producción | `FundacionManagers/fundacion-managers-fuente` (remoto `origin`) |
| Web real | https://fundacionmanagers.com |
| Repositorio de ensayos | `jorgeicone/fundacion-managers-ensayos` (remoto `ensayos`) |
| Web de ensayos | https://jorgeicone.github.io/fundacion-managers-ensayos/ |
| Supabase | proyecto `fundacion-managers` · `rlgakgpcfbwhigjdumiv` |
| Documentación de entornos | `ENTORNOS.md` en el repositorio |

Un `git push origin main` **publica la web real**. Para probar antes:
`git push ensayos HEAD:main`.

---

## El torneo, ahora mismo

Cuarta edición, 2026-2. Ocho clubes, siete fechas de liga ya jugadas, fase
final en curso.

- **Cuartos** (13/09) y **semifinales** (20/09): jugados. Dos se definieron por
  penales.
- **Tercer puesto**: sábado 26/09, 19:00 — Los Pibes del Barrio vs Tranquilo Papi.
- **Gran Final**: sábado 26/09, 21:00 — **Pomada FC vs The Originals**.

**Lo próximo que hay que hacer en el panel es cargar esos dos resultados** el
sábado por la noche, y publicar.

Campeón vigente (3.ª edición): The Originals.

---

## Qué se construyó en esta sesión

**1 · El panel ya maneja la fase final.** Antes solo cargaba las siete fechas de
liga: una consulta filtraba por `fase = 'grupos'` y los cruces eliminatorios no
llegaban nunca al formulario. Ahora las cuatro rondas salen en el selector, se
pueden **crear cruces** desde el panel (propone los ganadores de la ronda
anterior, el día del calendario y la hora), y hay papelera para corregir.

**2 · Penales.** Migración `0008`. Al marcar jugado un cruce de fase final con
empate aparece solo el recuadro de la tanda, y confirma quién pasa. La base
rechaza cualquier combinación imposible. Quien gana un cruce se decide en una
sola función, `ladoGanador()`, que usan la Llave y el Calendario.

**3 · Sitio de ensayos.** Réplica completa con su propio repositorio y su propia
URL. El aislamiento es **por `edicion`**, no por base de datos: producción usa
la 4 y la réplica la 99 (copia de la 4). Migración `0009` (`torneo_marca_edicion`)
evita que un marcador de prueba dispare un despliegue de la web real. La
función `publicar` recibe el entorno y elige destino con lista blanca. El
`deploy.yml` es **el mismo archivo en los dos repositorios** y lee variables de
repositorio (`ENTORNO`, `EDICION`, `PAGES_BASE_PATH`); sin ellas publica como
producción, que es el caso seguro.

**4 · Kit de las 5 auditorías sobre la web.** 13 hallazgos, 13 corregidos y
verificados contra el dominio. El informe completo está en
`Auditoria-fundacionmanagers-2026-09-23.md`, en esta misma carpeta. El grave: un
script del `<head>` secuestraba el enlace mágico del panel del torneo y lo
mandaba a `/panel.html`, así que quien no tuviera contraseña no podía entrar.

---

## Lo que queda abierto

1. **Enviar el instructivo del panel por correo a los tres administradores**
   (Jorge, Ramón Mojica, William Mojica). El PDF está en esta carpeta como
   `Instructivo-Panel-Resultados.pdf`. **Se retiró del sitio** —daba la
   dirección del panel de administración en una pieza abierta— y hasta que ese
   correo salga, el hallazgo 5.1 de la auditoría no está cerrado: solo se borró
   información. Jorge tiene tres opciones sobre la mesa: enviarlo por correo,
   publicar una versión depurada sin la dirección del panel, o republicarlo tal
   cual como decisión suya.
2. **Decisión pendiente, no defecto:** `panel.html` (el panel de caracterización,
   con datos personales de miembros y emprendedores) entra con **contraseña**,
   mientras el panel del torneo usa enlace mágico precisamente para que una
   contraseña filtrada no sirva de nada. RLS aguanta en los dos —comprobado
   tabla por tabla—, así que no hay brecha, pero son dos criterios distintos
   para el mismo riesgo y el más débil está sobre los datos más sensibles.
3. **El repositorio de ensayos vive bajo la cuenta personal de Jorge**, no bajo
   la organización: GitHub no deja a su cuenta crear repositorios en
   `FundacionManagers` (es colaborador, no miembro con ese permiso). Si se
   quiere mover, alguien con permiso tiene que crearlo allá y hay que cambiar
   el destino en la función `publicar` y en `ENTORNOS.md`.
4. **El contraste nunca se midió bien.** El script propio dio 92 falsos
   positivos porque el diseño usa degradados. Queda pendiente pasarle Lighthouse
   o axe al dominio.
5. **El peso de la portada** son 776 KB, y el grueso no son las fotos: 359 KB de
   JavaScript de framework y 109 KB de polyfills. Si alguna vez importa, ahí
   está el margen.

---

## Trampas de este entorno — cuestan media hora cada una

**El repositorio local era un clon superficial.** Empujar a `origin` funcionaba,
pero a un remoto nuevo fallaba con `remote unpack failed: index-pack failed` y
`did not receive expected object`. Se arregló con `git fetch --unshallow origin`
(pasó de 94 a 158 commits). Ya está hidratado; si vuelve a aparecer ese error
con otro remoto, es lo primero que hay que mirar.

**Git Bash corrompe las variables de entorno que empiezan por `/`.**
`PAGES_BASE_PATH=/fundacion-managers-ensayos` se convierte en
`C:/Program Files/Git/fundacion-managers-ensayos`. Para compilar con base path,
o para pasar valores así por la API de GitHub, **usa PowerShell**.

**`npm run build` no genera `out/` sin `GITHUB_PAGES=true`.** Sin esa variable
`output: 'export'` no se aplica y el `postbuild` falla al no encontrar la
carpeta.

**No escribas expresiones regulares dentro del script `REENVIO_AUTH` de
`layout.tsx`.** Vive en una plantilla de JavaScript y la plantilla se come la
barra invertida de `\/`: el script sale al HTML con un error de sintaxis y el
navegador tira el bloque entero **en silencio**. Pasó hoy, y el falso positivo
era perfecto. Comparaciones de cadena.

**`git checkout -- src` revierte TODO `src/`.** Si estás revirtiendo un
experimento concreto, nombra los archivos. Hoy borró siete correcciones ya
hechas y no se notó hasta la pasada de coherencia.

**Verifica siempre contra el dominio, no contra `out/`.** Y con parámetro
anticaché: GitHub Pages manda `Cache-Control: max-age=600` y el navegador te
enseña la versión de hace diez minutos. Un despliegue en verde no es prueba de
que el cambio llegó.

**`npx prettier --write "src/**/*"` reformatea archivos que no tocaste.** No es
grave —el build, el lint y las pruebas pasan— pero infla el diff.

---

## Comprobaciones antes de dar algo por terminado

```bash
npm run typecheck && npx next lint && npm test && npm run build
```

88 pruebas. Y después, `curl` contra `https://fundacionmanagers.com` con
cache-buster para confirmar que lo que cambiaste llegó de verdad.

---

<sub>ICONE ialabs · Jorge Hugo Pérez Gaona · © 2026</sub>
