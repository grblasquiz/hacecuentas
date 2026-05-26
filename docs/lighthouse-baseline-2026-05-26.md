# Lighthouse Baseline — 2026-05-26 (post recovery sprint)

Snapshot manual con `npx lighthouse` desde Mac local hacia prod. Sirve como
referencia para comparar contra el job semanal de `.github/workflows/lighthouse.yml`
(lunes 11:00 UTC) y para medir si las mejoras E-E-A-T / featured snippets
/ answerSnippet mueven Performance/CWV en próximas sesiones.

## Contexto

- Deploys de este sprint: `aad9ab97` (E-E-A-T Person) + `704790d3` (tareas 1-5).
- Cache CF: doble-purgado antes de medir (cf-cache-status: MISS en primera
  request, HIT en siguientes — los números abajo son con cache caliente, las
  primeras visitas de un usuario nuevo serán algo peores).
- Sin throttling de red/CPU específico (default Lighthouse Mobile preset).

## Scores

| URL | Performance | A11y | Best Pr | SEO | LCP (ms) | CLS | FCP | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 0.73 | 0.90 | 0.73 | **1.00** | 7097 | 0 | 2486 | 51 |
| `/calculadora-imc` | 0.60 | 0.92 | 0.73 | **1.00** | 8443 | 0 | — | — |
| `/calculadora-aguinaldo-sac` | 0.67 | — | — | **1.00** | 8129 | 0 | 2839 | — |
| `/calculadora-aniversario-pareja` | 0.67 | — | — | **1.00** | 7870 | 0 | — | — |
| `/autores/martin-rodriguez` | 0.79 | — | — | **1.00** | 4943 | 0 | — | — |

## Lecturas

- **SEO 1.00 en todas** — post recovery (E-E-A-T + sitemap fix + lastReviewed +
  seoKeywords + featured snippets schema) no quedan flags.
- **CLS = 0 en todas** — el sitio no tiene layout shift. Bien.
- **LCP 5-8s** — Core Web Vitals BAD (umbral verde es <2.5s; rojo >4s).
  Es el bottleneck para Performance score. La página autor sin calc compleja
  ya cae a 4.9s, sugerencia: el problema es global de Layout/Header (no
  específico de Calculator.astro).
- **A11y 0.90+** — bien pero podría llegar a 1.00 con un par de fixes
  (contrast, aria-labels en buttons icon-only).
- **Best Practices 0.73 home / 0.73 imc** — probablemente CSP headers,
  console errors, third-party cookies de AdSense/gtag. No bloquea SEO.

## Próxima sesión: LCP rescue

Para que LCP llegue a <2.5s:
1. Preload de la fuente Inter Variable (probablemente el LCP element es texto).
2. `font-display: swap` en todas las @font-face.
3. Critical CSS inline en `<head>` (Astro lo hace pero verificar).
4. Defer/async todos los scripts no críticos (gtag, AdSense pueden ir bottom).
5. Diferir hidratación de Calculator (es donde Astro Islands ayuda — verificar
   que `client:visible` y no `client:load`).
6. Image preload del logo (si es el LCP element).

Lighthouse Treosh Action en CI corre cada lunes 11:00 UTC con `runs: 2` y
sube artifacts. Para comparar histórico ver GitHub Actions → Lighthouse CI.

## Recordatorio para futuras sesiones

Estos numbers son post-cache. Las primeras visitas (cold cache CF) suelen ser
500-1000ms peor en LCP. Para medir lo que ven los usuarios reales, ver Chrome
UX Report (CrUX) data en PageSpeed Insights, no Lighthouse synth.
