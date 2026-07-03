# 00 — Línea base (antes de los cambios)

Rama: `seo/bing-growth-10k-2026-07-03` (creada desde `main` @ 24b6dbecf).
Node: v22.19.0 · Gestor: npm (package-lock.json).
Working tree al inicio: **limpio** (el deploy previo de las 52 páginas 21 BIS ya había commiteado todo).

## Comandos y resultados

| Comando | Estado | Notas |
|---|---|---|
| `npm run build` | **PASS** (exit 0) | Última corrida limpia hoy en el deploy 21 BIS: FULL 304s, 5939 HTMLs, wrapper.mjs OK, "sin páginas rotas". No se re-corrió `npm ci` (deps ya instaladas y build verde 4× en la sesión). |
| `npm test` (vitest) | **PASS con baseline** | 177/178 tests OK. Los fallos son **pre-existentes** (no introducidos acá): `tests/formulas.test.ts` importa `../src/lib/formulas/bmr` (renombrado), `tests/formulas-top50.test.ts` importa `frecuencia-respiratoria` (renombrado), `tests/calc-formula-integrity.test.ts` → 265 calcs-en sin `.ts`. |
| `npm run lint` | **SKIPPED** | No declarado en package.json. |
| `npm run typecheck` | **SKIPPED** | No declarado en package.json. |

## Regla aplicada
El build inicial NO falla → se continúa con los cambios SEO (§4). Los 3 fallos de test son baseline conocido y documentado; no se atribuyen a esta ejecución ni se "arreglan" tocando fórmulas médicas/renombradas (fuera de alcance).
