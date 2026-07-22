# Pasada mensual de frescura — datos manuales (corre headless vía launchd)

Sos una sesión autónoma mensual de hacecuentas. Tu único trabajo: que NINGÚN calc quede con dato vencido. Reglas del repo en CLAUDE.md (multi-sesión: nunca `git add -A`, commiteá SOLO lo que toques vos).

## Flujo

1. Corré `npx tsx scripts/check-stale-data.ts` y quedate con la lista de stale (el resumen final `STALE_SUMMARY::`).
2. Para cada calc stale de `updateType: manual` (procesalos TODOS, priorizando los de más días vencidos):
   - Leé su JSON (está en `src/content/calcs*/`) y su fórmula si hardcodea el dato (`src/lib/formulas/`, a veces `src/lib/data/<pais>-2026.ts`).
   - Investigá el valor vigente HOY con WebSearch/WebFetch en la fuente oficial que ya cita el calc (`dataUpdate.source/sourceUrl`). NO inventes: si no confirmás el dato en una fuente confiable, NO lo cambies — anotalo en el reporte como "sin fuente verificable".
   - Si el dato cambió: actualizá fórmula/data + el contenido del JSON (tablas, ejemplos, answerSnippet si menciona el número) + `dataUpdate.lastUpdated` y `lastReviewed` a hoy + `notes` con lo verificado.
   - Si el dato NO cambió: solo bumpeá `dataUpdate.lastUpdated` a hoy con nota "verificado sin cambios contra <fuente>".
3. Seeds de IPC sin API (uruguay, paraguay, ecuador, venezuela en `src/data/live/<pais>.json`, bloque `ipc`): buscá el dato del último mes publicado (INE UY / BCP PY / INEC EC / BCV VE vía prensa confiable) y actualizá el bloque `ipc` a mano (índice si hay, var mensual, interanual, período, fuente). Los fetchers preservan este bloque.
4. Gates: `npx tsx scripts/validate-data-updates.ts` (debe dar OK) y re-corré `check-stale-data` — el count de manuales debe bajar a ~0.
5. Commit SOLO tus archivos (lista explícita, nunca -A): `git add <archivos> && git commit -m "data(sweep-mensual): refresh datos manuales YYYY-MM [auto]"`. Si el pre-commit pide `npm run related`, corrélo y sumá los related-auto al commit.
6. `npm run deploy` (el lock serializa si hay otro deploy). Después `bash scripts/cf-purge-cache.sh`, esperá 90s, purge otra vez, y verificá 2-3 URLs tocadas con curl.
7. Dejá un resumen en `/tmp/hc-stale-sweep-report.md`: qué actualizaste (valor viejo → nuevo + fuente), qué quedó sin fuente verificable, count stale antes/después.

## Límites duros
- NO toques calcs `auto-live` ni `auto-api` (los cubre otro sistema). NO toques gtag/GA4/CSP/headers. NO borres páginas ni slugs. NO toques archivos que no estén en tu lista de stale.
- Si el deploy falla, dejá el commit hecho (otra sesión lo publica) y anotalo en el reporte. Nunca fuerces (`--force`, `checkout` de archivos ajenos, etc.).
- YMYL: si un dato de salud/dosis no se puede verificar, no lo toques y marcalo en el reporte.
