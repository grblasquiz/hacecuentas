# 04 — Política de contenido sensible (§23)

## Fuente de verdad única: `src/lib/content-policy.ts`

La política YMYL ya estaba **centralizada** (no dispersa). Funciones existentes:
`hasValidProfessionalReviewer`, `isRestrictedCalc`, `isNoindexCalc`,
`isIndexableCalc`, `canDistributeCalc`, `canEmbedCalc`, `canAdvertiseCalc`,
`canShareResultsCalc`, `isSensitiveCalc`. Consumidas por `generate-sitemap.ts`
(filtro sitemap), `CalcLayoutV2.astro` (render/RestrictedNotice), search-index,
related, page-feed, feeds LLM.

Regla base: **restringida** = `ymylRisk==='high'` sin revisor profesional válido,
o `distribution==='restricted'`. Restringida ⇒ fuera de index, sitemap, buscador,
related, widget, pdf, imagen, email, share, embed.

## Cambio aplicado: helper compuesto `isSensitiveCalculator(calc)`

Se agregó (§23) una API compuesta que envuelve las funciones existentes y
devuelve, en una sola llamada:

```ts
{ isSensitive, riskLevel, allowIndex, allowSitemap, allowSearch, allowRelated,
  allowWidget, allowPdf, allowImage, allowEmail, allowShareLink, allowEmbed }
```

**Invariante:** para riesgo alto sin revisor, TODOS los permisos son `false`.
Un revisor profesional válido los rehabilita. `distribution:'restricted'` los
apaga aunque el riesgo sea bajo. Los helpers individuales siguen válidos (no se
rompió nada).

Tests: `tests/sensitive-permissions.test.ts` (6 casos, cubren cada permiso +
riesgo alto con/sin revisor + restricted + noindex + null). **6/6 PASS.**

## Herramientas de alto riesgo (§1.7) — verificación

El build reporta 18-28 calcs con `noindex:true` intencional (magnesio, melatonina,
cafeína/dosis, alimentación complementaria, pubalgia, isquiotibiales, fórmula
bebé, antiparasitario, etc.). Están fuera de sitemap/buscador/related por
`canDistributeCalc`. **No se revirtió ninguna restricción** para ganar tráfico
(§1.7). El inventario marca `is_sensitive=true` en 28 calcs.
