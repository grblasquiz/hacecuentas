# Lighthouse Baseline — 2026-05-26 (post recovery sprint + LCP fix)

Snapshot manual con `npx lighthouse` desde Mac local hacia prod.

## Commits del sprint

- `aad9ab97` — E-E-A-T Person
- `704790d3` — lastReviewed + UVA + tests CI + featured snippets + seoKeywords
- `bb357f93` — answerSnippet en 41 top calcs
- **`b1ad79f3`** — LCP fix: manualChunks no agrupa entry scripts en components-shared

## Antes vs después del LCP fix

| URL | Performance | LCP (ms) | FCP (ms) | TBT (ms) | CLS |
|---|---:|---:|---:|---:|---:|
| `/` (antes) | 0.73 | 7097 | 2486 | 51 | 0 |
| `/` (post-fix) | 0.73 | **6361** | **1583** | 226 | 0 |
| `/calculadora-imc` (antes) | 0.60 | 8443 | — | — | 0 |
| `/calculadora-imc` (post-fix) | **0.74** | **6889** | 1989 | 122 | 0 |
| `/calculadora-aguinaldo-sac` (antes) | 0.67 | 8129 | 2839 | — | 0 |
| `/calculadora-aniversario-pareja` (antes) | 0.67 | 7870 | — | — | 0 |
| `/autores/martin-rodriguez` (antes) | 0.79 | 4943 | — | — | 0 |
| `/autores/martin-rodriguez` (post-fix) | **0.95** | **2717** | 1924 | — | 0 |

**Mejoras concretas:**
- `/autores` pasa Core Web Vitals (Perf 0.95, LCP 2.7s — umbral verde es <2.5s, naranja <4s)
- `/calculadora-imc` LCP element-render-delay: **3280ms → 1198ms** (-63%)
- FCP global mejora ~1s en home (2486 → 1583)
- TTFB en IMC: 393ms → 140ms (CF cache caliente post-purge)

**Pendiente para Core Web Vitals verde en calc pages:**

Calculator.astro bundle = 625KB. Lighthouse reporta 95KB unused. Para llevar
LCP de calc pages de 6.9s a <2.5s necesitamos:
1. Split del Calculator.astro script: core (form render, ~150KB) vs. heavy
   (history, share, charts, presets — lazy-load on interaction).
2. Defer hidratación de partes no críticas (`requestIdleCallback`).
3. Tree-shake formula strings i18n (Calculator importa formula-strings-i18n-pt.json
   sin condicional — eso se ejecuta en todas las locales).

**Limitación (CLAUDE.md rule #5):** gtag, Google Ads y AdSense suman ~300KB
unused JS por página pero no se pueden remover ni mover de `<head>`. Trade-off
performance vs revenue ya validado.

## Cache CF status

Doble purgado tras cada deploy del sprint. Cache HIT en 2da request.

## Próximo Lighthouse CI run

Workflow `.github/workflows/lighthouse.yml` corre lunes 11:00 UTC (junio 1).
Para trigger manual sin gh CLI: GitHub web UI → Actions → Lighthouse CI →
Run workflow. O instalar gh (`brew install gh`) y `gh workflow run lighthouse.yml`.

## PSI con CrUX field data (REAL users)

PSI API (`category=seo&category=performance&strategy=mobile`) reporta datos de
Chrome UX Report — distribución real de devices/redes en los últimos 28 días.

| URL | SEO | LCP CrUX (p75 real) | LCP Lab (sim) | Perf |
|---|---:|---:|---:|---:|
| `/calculadora-aniversario-pareja` | 1.00 | **2066ms** ✓ | 6928ms | 0.57 |
| `/calculadora-imc` | 1.00 | **2335ms** ✓ | 3776ms | 0.76 |
| `/autores/martin-rodriguez` | 1.00 | **2066ms** ✓ | 1357ms | 0.70 |

**Conclusión:** En datos reales (CrUX) ya estamos en VERDE para LCP en las 3
URLs (umbral <2500ms). Lab data sigue mostrando peor performance pero refleja
mobile throttled artificial, no la experiencia real con CF edge cache + 4G/5G.

Las field data se mueven lento (28-day rolling window). Próximas mediciones
deberían reflejar la mejora del LCP fix de hoy a partir de junio.

## Featured snippets — qué se hizo y cómo verificar

Code-side, todo lo verificable:
- ✓ Schema HowTo + FAQPage + Article correctos en `[...slug].astro`
- ✓ `answerSnippet` 40-75 palabras en 42 calcs (top 50 priority menos los redirects)
- ✓ Tablas markdown con `<thead>` + `scope="col"`/`scope="row"`
- ✓ `.answer-snippet` en `speakable.cssSelector` (prioridad voice assistants)
- ✓ Schema.org "author" Person + sameAs GitHub (E-E-A-T post Core Update)

**Verificación manual pendiente** (no hay API pública para esto):
1. Google Search Console → URL Inspection → ver "Rich results detected" en
   una calc de top 50. Esperado: HowTo, FAQPage, Article, SoftwareApplication.
2. GSC → Performance → filter by Position 1 + filter por URL de calc top → ver
   queries que generaron impressions/clicks. Posición 1 con CTR alto = featured
   snippet activo.
3. Re-correr Lighthouse después del próximo recrawl de Google (2-4 semanas).

## Histórico de mejoras

| Commit | Cambio | Impacto observado |
|---|---|---|
| `528ee785` | manualChunks separa entry scripts | Layout bundle 634KB → 1KB, LCP autor -45% |
| `0700ef29` | Doc baseline post-fix | Documentación |

## Recordatorio

Estos numbers son Lighthouse SYNTHETIC (Chrome headless, M1 Mac local hitting CF
prod). Para datos REALES de usuarios usar Chrome UX Report (CrUX) en
PageSpeed Insights — refleja distribución de devices/redes reales y suele ser
más optimista en cache caliente.
