# Ship — Plugin WordPress "Hacé Cuentas — Calculadoras"

> Objetivo: cada sitio WP que instale el plugin y embeba una calc = **un backlink dofollow**
> en un dominio real. Más la página `wordpress.org/plugins/hacecuentas-calculadoras` (autoridad
> alta + funnel de instalación). Es el motion de Omni Calculator (~30k dominios de referencia).

## Estado (verificado 2026-06-19, todo LIVE en prod)

Backend — **listo y deployado**, no falta ingeniería:

- `GET /oembed.json?url=<calc>` → `type:"rich"` con **sólo el iframe** (sin link inyectado → cumple wordpress.org). ⚠️ El cambio a iframe-only está en el working tree, **falta deploy** (prod aún sirve la versión vieja con blockquote).
- `GET /api/calcs-slim.json` (4145 calcs, 2740 AR) con `Access-Control-Allow-Origin: *`. ✅ live
- Discovery `<link rel="alternate" type="application/json+oembed">` por-página. ✅ live
- Plugin (`hacecuentas-calculadoras/`): bloque Gutenberg con picker buscable + shortcode
  `[hacecuentas slug="..."]` + auto-resize + registro como oEmbed provider. ✅ código completo

**De dónde salen los backlinks (cumpliendo wordpress.org):**
La directriz #11 PROHÍBE inyectar enlaces externos en el sitio público sin opt-in del usuario.
Por eso el crédito del plugin es opt-in (apagado por defecto). Los backlinks vienen de:
1. **Listing en wordpress.org** → la ficha del plugin enlaza a hacecuentas.com vía `Author URI`
   + `Plugin URI` (estándar, permitido) = **1 backlink fuerte garantizado**, dominio DR alto.
2. **Crédito opt-in** → el usuario activa "Enlazar a la fuente" en el bloque/shortcode (default off).
   El que lo activa = dofollow en su sitio. Menos volumen, pero limpio y compliant.
3. **Widget self-hosted** (`/embeber`, copy-paste desde hacecuentas.com vía `/embed.js`) → NO es un
   plugin de wordpress.org, así que el crédito va por defecto. **Acá vive el volumen estilo Omni** (ya live).

⚠️ El plugin de wordpress.org NO es una máquina de backlink-por-install (eso violaría las reglas):
es **reach + 1 listing backlink + adopters opt-in**. El volumen sale del widget self-hosted (#3).

## Probar en un WP real (antes de subir a .org)

1. Instalar `hacecuentas-calculadoras-1.0.0.zip` en un WP de prueba
   (Plugins → Añadir nuevo → Subir plugin). Activar.
2. **Bloque:** nueva entrada → bloque "Calculadora Hacé Cuentas" → elegir una del picker →
   publicar. Confirmar que en el front se ve el iframe + el `<p>` "Calculadora de … por Hacé Cuentas".
3. **Shortcode:** `[hacecuentas slug="calculadora-imc"]` en el editor clásico.
4. **Auto-embed:** pegar `https://hacecuentas.com/calculadora-imc` en una línea sola (editor de bloques).

### Verificar en WP real (lo único que no pude probar sin instancia)
1. 🔎 Que el bloque y el shortcode rendericen el iframe y se auto-ajuste el alto (sin scroll/hueco).
2. 🔎 **Que el crédito NO aparezca por defecto** y SÓLO salga al activar el toggle "Enlazar a la
   fuente" (clave para pasar la review — la directriz #11).
3. 🔎 Correr el **Plugin Check** oficial → debe pasar sin flags de "external links" / "powered by".

## Subir a wordpress.org (requiere logins de Martín)

1. **Cuenta** en https://wordpress.org/ (la misma sirve para el directorio de plugins).
   ⚠️ El `Contributors: hacecuentas` del `readme.txt` debe ser **tu username real de wordpress.org**.
   Si no es "hacecuentas", cambialo o el plugin no queda atribuido a tu cuenta.
2. Correr el **Plugin Check** oficial (`Plugin Check` plugin, o https://wordpress.org/plugins/plugin-check/)
   sobre el zip → arreglar lo que marque (el código ya usa `esc_*`, `sanitize_title`, `absint`,
   `wp_remote_get`, nonces no aplican por ser read-only → debería pasar limpio).
3. **Submit** del zip en https://wordpress.org/plugins/developers/add/ → revisión manual (días a semanas).
4. Aprobado → te dan repo **SVN** (`/trunk`, `/tags`, `/assets`). Subir el plugin a `/trunk` + tag `1.0.0`.
5. **Assets de la ficha** (van en `/assets` del SVN, NO en el zip):
   - `icon-128x128.png` + `icon-256x256.png`
   - `banner-772x250.png` + `banner-1544x500.png` (retina)
   - `screenshot-1.png` … (matchean el orden de `== Screenshots ==` del readme)
   → **los puedo generar** (nano-banana / Canva) reusando el ícono calculadora + el teal/azul de marca.

## ASO del directorio (para que lo encuentren)

- Keyword principal del título/tags: **"calculadora"** (alto volumen en ES). Ya está en `readme.txt`.
- El `readme.txt` ya tiene Description rica + 7 FAQ + changelog (lo que indexa el directorio).
- Pedir reviews ⭐ a los primeros usuarios (contadores/blogs del playbook de embed) sube el ranking interno.

## Dónde más distribuir el mismo motor (ranked)

El motor oEmbed/iframe ya cubre cualquier consumidor de oEmbed. Próximos builds por ROI de backlink:

1. **wordpress.org** (este) — dofollow en ~43% de la web. ⭐
2. **GitHub repo open-source del plugin** — backlink DR90 + descubrimiento (patrón ya usado con MCP Registry).
3. **Wix App Market** — millones de sitios; más laburo (SDK Wix). Fase 2 si WP convierte.
4. **Ghost / Squarespace / Webflow / Notion** — caen solos con el oEmbed, sin build aparte.
5. **Chrome extension** — distribución/marca, NO dofollow. Baja prioridad.

Detalle del seeding value-first (a quién ofrecerle qué calc): `docs/embed-seeding-playbook.md`.
