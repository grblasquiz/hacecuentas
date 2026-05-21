# Audits diarios

Reportes auto-generados por [`.github/workflows/daily-audit.yml`](../.github/workflows/daily-audit.yml).

Cada día ~8:07 AR el workflow:

1. Audita 50 URLs rotativas de hacecuentas.com.ar (8 fijas + ~42 random rotativas por día).
2. Chequea HTTP status, TTFB, tamaño, redirects.
3. Parsea HTML de 15 URLs: title, meta description, H1, canonical, OG, schema JSON-LD, hreflang.
4. Detecta bugs específicos: `.html` en canonical/og:url, `MathSolver` schema (prohibido), "navidad" en minúscula.
5. Verifica hasta 120 links internos extraídos de home + /calcs/ + /categorias/.
6. Commitea `YYYY-MM-DD.md` acá.
7. Abre GitHub issue con resumen + link al .md.

## Cómo correr a mano

```bash
gh workflow run daily-audit.yml
```

O local:

```bash
node scripts/daily-audit.mjs
# → audits/YYYY-MM-DD.md
# → audits/.cache/summary.json
```

## Severities

- 🔴 **Bloqueante**: HTTP error, SEO high (title/desc/h1 vacíos, canonical roto, schema inválido), link interno roto.
- 🟡 **Warning**: TTFB > 1.5s, página > 500KB, SEO medium (canonical missing, H1 múltiple, "navidad" minúscula), título duplicado.
- 🟢 **OK**: el resto.

## Qué NO hace (intencional)

- No commitea fixes — solo audita.
- No toca GA4/Google Ads.
- No marca noindex / cambia URLs / dispara deploys.
- No corre Lighthouse (lo cubre [`lighthouse.yml`](../.github/workflows/lighthouse.yml) semanalmente).
