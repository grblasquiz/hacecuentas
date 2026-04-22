# hacecuentas — notas operativas

Calculadoras en Astro, desplegadas en Cloudflare Pages. ~2500 URLs indexadas. SEO es el canal principal, así que las reglas de abajo no son negociables.

## 1. Nunca borrar un slug sin un 301

Cada URL indexada tiene autoridad acumulada. Borrar el archivo de un calc sin agregar un redirect manda a Google a 404 y perdés el link equity.

**Checklist antes de borrar un calc:**
1. Agregar `301` a `public/_redirects` apuntando al equivalente más cercano (otro calc, categoría, o `/`).
2. Si no hay equivalente, redirect a `/categoria/<cat>`.
3. Borrar `src/content/calcs/<slug>.json` y `src/lib/formulas/<slug>.ts`.
4. Limpiar imports en `src/lib/formulas/index.ts`.
5. Correr `npm run related` para regenerar `src/lib/related-auto.json`.
6. `npm run build` local.
7. Post-deploy: `curl -sI https://hacecuentas.com/<viejo>` debería dar `HTTP/2 301` con el `location` correcto.

## 2. Si tocás una fórmula, tocá el calc

El sitemap calcula `lastmod` como `max(lastReviewed, dataUpdate.lastUpdated, mtime del JSON)`. Si editás sólo el `.ts` de la fórmula pero no el `.json`, Google no se entera.

**Si cambia la lógica o el UX de un calc:** editar también el `.json` (aunque sea bumpear `lastReviewed`) para que el mtime se mueva y Google lo detecte.

## 3. Deploys frecuentes están bien, deploys cosméticos no

Deployar varias veces por día **no daña SEO** — Google no penaliza frecuencia. Lo que daña es:

- Cambiar `sitemap.xml` con `lastmod=hoy` para 2500 URLs cuando sólo tocaste 3. Google quema crawl budget re-visitando todo al pedo.
- Cambios sólo cosméticos (CSS, comentarios, whitespace) que no aportan nada pero inflaman el sitemap.

**Regla:** el sitemap ya usa `max(lastReviewed, lastUpdated, mtime)` del JSON del calc, así que sólo se mueve cuando editás el contenido real. Si tocás sólo CSS global, el sitemap queda igual y Google no se entera — eso es lo que querés.

**Cuándo no deployar:**
- Fin-de-semana para cambios no urgentes (Googlebot crawlea menos los fines de semana, re-indexación tarda más).
- Durante el día si hay tráfico pago corriendo y el cambio toca el funnel de conversión (Clarity/GA4).

## 4. Cache de Cloudflare — ritual obligatorio post-push

CF Pages + CF edge cache → hay DOS capas. Después de cada `git push` a main:

```bash
bash scripts/cf-purge-cache.sh          # purge inmediato
# esperar 60–90s a que CF Pages termine el build
bash scripts/cf-purge-cache.sh          # purge otra vez (CF puede haber re-cacheado la versión vieja entre pasos)
curl -sL https://hacecuentas.com/<url-tocada> | grep '<string-nueva-del-commit>'
```

Sin el segundo purge Martin va a ver la versión vieja y pensar que "no deployó". Ya pasó varias veces.

## 5. GA4 / Google Ads — cero cambios sin aviso

Nunca borrar/renombrar/mover/desactivar tags de GA4 ni Google Ads. Cualquier cambio que toque `gtag`, `dataLayer`, CSP o headers de seguridad → avisar antes de pushear. Datos perdidos = irrecuperables.

**Checklist tags:**
- `<script async src="gtag.js">` siempre en el `<head>` (nunca al final del `<body>` — se pierden sesiones cortas).
- `wait_for_update ≤ 500ms` en CMP.

## 6. Grep gotchas

El codebase mezcla `x + 'y'` y `x+'y'`. Greps con espacio explícito missean casos. Usá `\+\s*` o validación post-fix.

## 7. FAQ mínimo 7 preguntas

Al expandir SEO de un calc, las FAQ tienen que tener al menos 7 preguntas. Menos de eso da thin-content.

## Scripts útiles

```bash
npm run related      # regenerar related-auto.json (tras borrar/agregar calcs)
npm run sitemap      # regenerar sitemap (prebuild lo corre automático)
npm run build        # astro build + optimize CSS
bash scripts/cf-purge-cache.sh
```
