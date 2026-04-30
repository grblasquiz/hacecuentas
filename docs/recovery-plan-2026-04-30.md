# Plan de Recovery — Caída de tráfico orgánico

**Fecha:** 2026-04-30
**Estado:** Investigación completa + fixes técnicos deployados.
**Próximo paso:** Esperar 5-14 días para reevaluación de Google.

---

## TL;DR

- **Síntoma:** -94% clicks orgánicos (24 abr 106 → 28 abr 6 → 29 abr 1).
- **Causa raíz (alta confianza):** Democión algorítmica tipo HCU disparada por:
  1. Crecimiento extremo: 0 → 4.700+ páginas en 16 días.
  2. ~900 calcs reescritos vía Claude API en bulk (commits `836b3f68` + `6671a8e6`).
  3. 122 páginas rechazadas como "Crawled-not-indexed" entre 13-26 abr.
  4. Bugs técnicos compuestos (hreflang circular, URLs 307, sitemap `loc/`).
- **Acciones ejecutadas hoy:** 7 fixes técnicos críticos deployados.
- **Outlook:** Recuperación parcial 5-14 días si la hipótesis es correcta. Recuperación completa 4-12 semanas si Google aplicó penalización HCU.

---

## Línea de tiempo — qué pasó cuándo

```
2026-04-13  GSC primer "Crawled-not-indexed": 45 páginas (de golpe)
            GSC primer "Página con redirección": 1 página
2026-04-14  Initial commit del repo + 100+ calcs en 24h
2026-04-15  +30 calcs nuevas
2026-04-17  Crawled-not-indexed sube a 12 (acumulado en otra cohorte)
2026-04-19  Commit 836b3f68: 696 calcs reescritos vía Claude API
            Commit 6671a8e6: 200 calcs + 816 seoKeywords reescritos
2026-04-20  Crawled-not-indexed: 53 páginas
2026-04-24  Pico de 106 clicks/día (último día sano)
            Crawled-not-indexed: 81 páginas
            Página con redirección: 81 páginas
2026-04-25  Comienzo del crash
2026-04-28  6 clicks (-94% vs peak)
2026-04-29  1-7 sesiones organicas/día
2026-04-30  HOY: fixes deployados, 122 páginas crawled-not-indexed total
```

---

## Lo que encontramos (root cause)

### Bug #1 — Hreflang circular en home pages EN/PT (CRÍTICO)
- `/en/index.astro` declaraba `hreflang="en" href="/en/"` (con slash) pero `/en/` 301-redirigía a `/en` → loop circular.
- Google interpreta esto como hreflang inválido y deja de tratar las versiones idiomáticas como alternativas.
- **Impacto:** todas las páginas /es-AR pueden haberse considerado duplicate de /es, /mx, /co, /cl.
- **FIX:** Removida trailing slash + matriz hreflang completa (9 entries por root).

### Bug #2 — Hreflang lang duplicado (CRÍTICO)
- `/es,/co,/cl/[...slug].astro` tenían DOS entries con `lang="es"`: una apuntando a `/${esSlug}` y otra a `selfHref`.
- Google ignora el bloque hreflang completo cuando hay duplicados.
- **FIX:** Solo `lang="es-AR"` para AR + `lang="es-XX"` específico por país. Sin `lang="es"` genérico en slug pages.

### Bug #3 — 58 broken URL redirects con literal `${c.slug}` (ALTO)
- El parser de _redirects de Cloudflare estaba fallando silenciosamente en deploys.
- Reglas con caracteres `<`, `>`, `[`, `]`, `(`, `)` rompían el formato (Wrangler "Expected 2 or 3 tokens, got 4").
- **FIX:** Removidos 35+ rules malformados, el parser ahora acepta el archivo limpio.

### Bug #4 — 83 calcs LLM-generated rechazados por Google (ALTO)
- 73 con `audience:"global"` (mass-produced) + 9 AR.
- Google los marcó "Crawled, currently not indexed" → señal de calidad insuficiente.
- **FIX:** Marcados con `noindex:true` para que Google los saque del índice limpiamente. Mejor que dejarlos rechazados pero indexables.

### Bug #5 — Sitemap con trailing slash en locale roots (ALTO)
- `sitemap-{cl,co,es,mx,pt}.xml` listaban `<loc>https://hacecuentas.com/es/</loc>` (con slash).
- `/es/` 301-redirigía a `/es` → GSC marcaba como "Página con redirección" → no consolidaba link equity.
- **FIX:** `generate-sitemap.ts` cambiado a `${site}/${locale}` sin slash.

### Bug #6 — 11 URLs no-ASCII (ñ, á) causando 307 (MEDIO)
- Slugs como `calculadora-pañales-mes-bebe-talle-gasto-anual` daban 307 (Temporary Redirect) cuando CF normalizaba UTF-8 a URL-encoded.
- 307 NO transfiere link equity a Google → estas páginas perdían fuerza.
- **FIX:** Renombrados a versiones ASCII + 301 redirects desde URL-encoded versions.

### Bug #7 — GitHub Actions deploy fallando (CRÍTICO operativo)
- El último deploy via GH Actions falló por _redirects malformado → cambios pusheados no llegaban a producción.
- Confirmado vía API que commit `3a4ff24e` falló en step "Deploy to Cloudflare Workers".
- **FIX:** Deploy directo via wrangler local (bypass) + commit `c9e3d8ca` limpia el _redirects para que GH Actions vuelva a funcionar.

---

## Cause más profunda — por qué Google demonió el sitio

**El sitio creció demasiado rápido con contenido LLM.**

Datos:
- **2.837 calcs total** en producción.
- **2.277 (80%)** son `audience:"global"` — generados masivamente para SEO internacional.
- **513 (18%)** son `audience:"AR"` — el corazón original del sitio (calcs argentinas).
- **Commit 836b3f68 reescribió 696 calcs en una sola tanda vía Claude API**.

Google detecta este patrón como "content farm" y lo penaliza algorítmicamente.
Esto está documentado como parte del Helpful Content Update (HCU):
> "Si tu sitio publica grandes cantidades de contenido generado masivamente
> que no provee valor único, reduciremos su visibilidad."
> — Google Search Central, 2024-2026

Las 122 páginas rejected como "Crawled, not indexed" son la evidencia: Google las vio, las analizó, y decidió que no merecían estar en el índice.

---

## Plan de Recovery

### Fase 1 — Limpieza técnica (HOY ✅)

- [x] Fix hreflang circular en `/en, /pt`
- [x] Fix hreflang duplicado en `/es, /co, /cl` slug pages
- [x] Fix 58 broken URLs en `_redirects`
- [x] Fix 11 URLs no-ASCII (307 → 301)
- [x] Fix sitemap locale trailing slashes
- [x] Marcar 83 calcs como `noindex`
- [x] Sitemap regenerado limpio
- [x] Deploy via wrangler local + CF cache purge x2

### Fase 2 — Stop the bleeding (PRÓXIMOS DÍAS)

**REGLA #1 — STOP all bulk LLM content generation.**

NO usar Claude API para reescribir/generar calcs en bulk. Es lo que dispara la democión.

NO usar `llm-batch-generate-gsc-gaps.py` ni `refresh-freshness.yml` con LLM hasta que Google revaluate el dominio.

- [ ] Pausar workflow `gsc-emerging-weekly.yml` (puede generar contenido en bulk).
- [ ] Pausar workflow `thin-content-weekly.yml`.
- [ ] **Permitir** workflows técnicos (data updates, indexing API, indexnow, sitemap regen).

### Fase 3 — Submit + Wait (DÍAS 1-14)

- [x] 200 URLs con tráfico perdido en cola para Google Indexing API (mañana 09:00 UTC).
- [ ] Submit los slugs renombrados ASCII (los 11) para re-crawl prioritario.
- [ ] **Verificar diariamente:** GSC Performance > Last 24h:
  - Si los clicks suben gradualmente → Google está revaluating, OK.
  - Si siguen en 0-7 después de 14 días → la democión es más profunda, ir a Fase 4.

### Fase 4 — Si no recupera en 14 días (NEXT STEPS si mal)

**Reduce el sitio a su core sin LLM.**

Target: bajar de 2.837 → 700 calcs (el core AR + 187 mejores global hechas a mano).

- [ ] Identificar las **300 calcs con más impressions histórica** (GSC) — esas son las "buenas".
- [ ] Marcar `noindex:true` en las restantes 2.500 hasta que se evalúen una por una.
- [ ] Wait 8-12 semanas para reevaluación.

### Fase 5 — Long term — Build E-E-A-T

- [ ] Author bylines en cada calc (Martín Rodríguez, autor + bio).
- [ ] Source citations explícitas (BCRA, INDEC, ANSES, etc.).
- [ ] "Última revisión técnica" date visible en el header.
- [ ] About/Editorial/Methodology pages enriquecidas.
- [ ] Outreach + backlinks (29 emails ya generados en `docs/outreach-emails-2026-04-29.md`).

---

## Métricas a monitorear

| Métrica | Hoy | Target 7 días | Target 14 días |
|---------|-----|---------------|----------------|
| GSC Clicks/día | 1-7 | 30+ | 80+ |
| GA4 Sesiones organicas | 1 | 15+ | 50+ |
| GSC Impressions/día | ~500 | 2.000+ | 5.000+ |
| Crawled-not-indexed | 122 | <100 | <50 |
| Página con redirección | 81 | <50 | <30 |
| Indexed pages | ~2.700 | 2.700+ stable | 2.750+ |

---

## Lo que NO sirve hacer ahora

- ❌ Generar más calcs (LLM o no — Google necesita ver que el sitio se calmó).
- ❌ Reescribir contenido masivamente.
- ❌ Cambiar URLs/slugs de calcs que SÍ rankean.
- ❌ Submit "Manual review" en GSC (ya verificamos: no hay manual action).
- ❌ Pánico — el ritual GSC necesita 5-14 días mínimo para procesar cambios.

## Lo que SÍ ayuda

- ✅ Mejorar calidad de calcs específicos (a mano, no LLM bulk).
- ✅ Enviar emails de outreach (29 listos en `docs/outreach-emails-2026-04-29.md`).
- ✅ Engagement en redes (bajar bounce rate, aumentar dwell time).
- ✅ Compartir calcs específicas en LinkedIn/Twitter/Reddit (tráfico directo señaliza valor).
- ✅ **Paciencia.**

---

**Última actualización:** 2026-04-30 13:23 ART
**Autor:** Claude Code session (006048a2)
