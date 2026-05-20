# Pruning audit vs GSC — 2026-05-20

Periodo: **2026-04-20 → 2026-05-17** (28 dias).
Threshold impressions: **50/periodo**.

- **GONE_410**: 77 URLs (0 impr + 0 clicks, candidatas a 410 Gone para fast desindex)
- **DESPRUNE recomendado**: 17 URLs (≈ **2225 impressions/periodo recuperables**)
- **REVIEW manual**: 0 URLs
- **KEEP** (target funciona): 0 URLs

## GONE_410 — devolver 410 (acelera desindex vs 301)

URLs con verdadero 0-trafico. Al pasar a `src/lib/gone-410.ts` y deployar,
el middleware devuelve **HTTP 410 Gone**, lo que le dice a Google: 
*'esta URL fue eliminada permanentemente, sacala del index ya'*.
Mas rapido que 301 (que mantiene la URL en queue de re-crawl).

Total: 77 URLs. Para aplicar: corre `--emit-gone-410`.

## DESPRUNE — orden por impressions desc

| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |
|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|
| /calculadora-calorias-quemadas-tareas-domesticas | /calculadora-calorias-quemadas-deporte | 207 | 4 | 1.9% | 9.7 | 547 | 1 | DESPRUNE |
| /calculadora-peso-ideal-rottweiler | /calculadora-peso-ideal | 205 | 0 | 0.0% | 11.0 | 39 | 1 | DESPRUNE |
| /calculadora-calorias-quemadas-yoga-pilates | /calculadora-calorias-quemadas-deporte | 200 | 0 | 0.0% | 11.2 | 547 | 1 | DESPRUNE |
| /calculadora-peso-ideal-husky-siberiano | /calculadora-peso-ideal | 193 | 1 | 0.5% | 10.5 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-pitbull | /calculadora-peso-ideal | 191 | 1 | 0.5% | 8.7 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-beagle | /calculadora-peso-ideal | 167 | 0 | 0.0% | 9.2 | 39 | 1 | DESPRUNE |
| /calculadora-licencia-maternidad-paternidad | /calculadora-licencia-por-maternidad-paternidad-dias | 155 | 2 | 1.3% | 6.4 | 0 | 0 | DESPRUNE |
| /calculadora-peso-ideal-golden-retriever | /calculadora-peso-ideal | 155 | 0 | 0.0% | 17.2 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-boxer | /calculadora-peso-ideal | 136 | 0 | 0.0% | 9.2 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-yorkshire-terrier | /calculadora-peso-ideal | 136 | 0 | 0.0% | 9.7 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-bulldog-ingles | /calculadora-peso-ideal | 101 | 0 | 0.0% | 8.9 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-labrador-retriever | /calculadora-peso-ideal | 93 | 1 | 1.1% | 20.4 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-maine-coon | /calculadora-peso-ideal | 59 | 0 | 0.0% | 13.9 | 39 | 1 | DESPRUNE |
| /calculadora-calorias-quemadas-ejercicio | /calculadora-calorias-quemadas-deporte | 58 | 0 | 0.0% | 19.6 | 547 | 1 | DESPRUNE |
| /calculadora-calorias-quemadas-mediocampista-partido | /calculadora-calorias-quemadas-deporte | 58 | 0 | 0.0% | 9.2 | 547 | 1 | DESPRUNE |
| /calculadora-peso-ideal-bulldog-frances | /calculadora-peso-ideal | 57 | 0 | 0.0% | 15.4 | 39 | 1 | DESPRUNE |
| /calculadora-peso-ideal-ragdoll | /calculadora-peso-ideal | 54 | 0 | 0.0% | 16.4 | 39 | 1 | DESPRUNE |

## REVIEW — decision manual

| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |
|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|

## Como aplicar el desprune

1. Editar `src/lib/pruning-redirects.ts` y eliminar las entradas marcadas DESPRUNE.
2. Restaurar el JSON original de la calc si fue eliminado (revisar git history).
3. Si la calc nunca existio, hay que generarla (formula + JSON + assets OG).
4. Build local: `npm run build` para regenerar `dist/client/*.html`.
5. Deploy normal + ritual CF cache: `bash scripts/cf-purge-cache.sh` x2.
6. Verificar con curl que devuelven 200 OK con title del CTR rescue.

## Como aplicar el GONE_410

1. Re-correr el audit con `--emit-gone-410` para actualizar `src/lib/gone-410.ts`.
2. Build local: `npm run build`.
3. Deploy: `wrangler deploy` o git push.
4. CF purge x2 si hay assets HTML cacheados de esas URLs.
5. Verificar con curl que devuelven 410.
