# Pruning audit vs GSC — 2026-05-20

Periodo: **2026-04-20 → 2026-05-17** (28 dias).
Threshold impressions: **50/periodo**.

- **DESPRUNE recomendado**: 4 URLs (≈ **548 impressions/periodo recuperables**)
- **REVIEW manual**: 0 URLs
- **KEEP** (target funciona): 0 URLs

## DESPRUNE — orden por impressions desc

| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |
|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|
| /calculadora-indemnizacion-despido-objetivo-espana-20-dias | /categoria/vida | 186 | 0 | 0.0% | 28.8 | 42 | 0 | DESPRUNE |
| /calculadora-cripto-tax-espana-irpf | /categoria/finanzas | 169 | 0 | 0.0% | 5.9 | 145 | 0 | DESPRUNE |
| /calculadora-indemnizacion-despido-improcedente-espana-33-dias | /categoria/vida | 136 | 0 | 0.0% | 14.8 | 42 | 0 | DESPRUNE |
| /calculadora-costo-por-view-cpv-video | /categoria/marketing | 57 | 0 | 0.0% | 27.0 | 0 | 0 | DESPRUNE |

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
