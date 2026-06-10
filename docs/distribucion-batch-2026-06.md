# Batch de distribución — junio 2026 (ejecutable)

> Generado 2026-06-10. **El cuello de botella es autoridad externa**: 0 menciones detectables fuera de lo ya ejecutado + la marca "hace cuentas" la acapara hacecuentas.com.ar (sitio ajeno). Por eso, dos reglas en TODOS los textos de abajo:
>
> 1. **La marca se escribe siempre "hacecuentas.com"** (con TLD). Nunca "Hacé Cuentas" solo, nunca "hacecuentas" pelado.
> 2. **Cada texto linkea calcs de DINERO específicas** (deep links verificados HTTP 200 al 2026-06-10), no la home. Si un form de directorio exige la home como "URL del producto", la home va en ese campo y los deep links van en la descripción.
>
> Yo no publico nada: todo requiere login de Martin. Patrón probado 2026-06-09: **Martin hace login/OAuth/CAPTCHA, Claude llena y submitea el resto** (sesión con Chrome MCP).

## Ya LIVE (no repetir)

dev.to post 1 (3 dofollow) · Official MCP Registry (`io.github.grblasquiz/hacecuentas`, cascada a PulseMCP) · mcp.so · Glama · Smithery · repo GitHub grblasquiz/hacecuentas · Wikidata. SaaSHub = submitido, pending approval.

## Deep links de dinero (verificados 200 hoy)

| Calc | URL |
|---|---|
| Sueldo en mano AR | https://hacecuentas.com/sueldo-en-mano-argentina |
| Monotributo 2026 | https://hacecuentas.com/calculadora-monotributo-2026 |
| Recategorización julio | https://hacecuentas.com/calculadora-monotributo-categoria-2026-recategorizacion-julio |
| Aguinaldo (SAC) | https://hacecuentas.com/calculadora-aguinaldo-sac |
| Indemnización despido | https://hacecuentas.com/calculadora-indemnizacion-despido |
| Comparador plazo fijo (TNAs live) | https://hacecuentas.com/comparador-plazo-fijo |
| Recibo de sueldo (hub) | https://hacecuentas.com/simulador-recibo-de-sueldo-argentina |
| EN: salario AR | https://hacecuentas.com/en/salary-calculator-argentina |
| EN: indemnización | https://hacecuentas.com/en/severance-calculator-argentina |
| EN: aguinaldo | https://hacecuentas.com/en/aguinaldo-calculator-argentina |
| Devs (API+MCP) | https://hacecuentas.com/desarrolladores |

⚠️ NO usar: `/en/salary-take-home-argentina` (404), `/pt/salario-liquido-clt-inss-irrf` (404 — el vivo es `/pt/simulador-holerite-clt`), `/cuanto-falta-aguinaldo-junio-diciembre` (el slug real lleva prefijo `calculadora-`).

## Calendario sugerido

- **Hoy**: #1 Hashnode, #3 public-apis, #4 SaaSHub, #8 APIs.guru
- **Esta semana**: #6 Reddit (aguinaldo vence 30/6 — es AHORA), #7 Crunchbase
- **2026-06-16** (se desbloquea cuenta AlternativeTo + 1 semana desde dev.to post 1): #2 dev.to post 2, #5 AlternativeTo
- **2026-06-23+**: #2 dev.to post 3, #9 Indie Hackers
- **Julio** (cuenta PH madura): #10 Product Hunt

---

## 1. Hashnode — publicar el post ya listo (dofollow, DR ~82)

- **Dónde**: crear cuenta en https://hashnode.com (Google/GitHub OAuth) → crear blog personal en el onboarding → https://hashnode.com/create/story
- **Login**: Martin (cuenta nueva, ~5 min de onboarding).
- **Linkea**: sueldo-en-mano-argentina, comparador-plazo-fijo, calculadora-monotributo-2026.
- **Título**: `Lessons from shipping 1,200+ static pages on Cloudflare Pages`
- **Subtítulo**: `Cache, deploy speed, and gotchas you'll hit past 500 pages`
- **Tags**: `Cloudflare`, `Astro`, `Web Development`, `SEO`
- **Cuerpo**: copiar tal cual **`docs/backlinks/hashnode-post-1.md`** (actualizado 2026-06-10: deep links a calcs de dinero ya adentro; ángulo CF Pages, distinto al post de dev.to → no es duplicado). **NO setear canonical URL** (es contenido original, no existe en el blog del sitio).
- **Extra 2 min**: en la bio del blog poner: `Built hacecuentas.com — 2,500+ free calculators in Spanish for LATAM salaries & taxes.`

## 2. dev.to — goteo posts 2 y 3 (dofollow ×3 c/u, cuenta YA logueada)

- **Dónde**: https://dev.to/new (cuenta `martin_rodriguez_a289dd17`, OAuth ya hecho).
- **Cuándo**: post 2 **no antes del 2026-06-16** (1 semana desde post 1; 2 posts juntos en cuenta nueva = spam-flag y caen TODOS los links). Post 3: 2026-06-23 o después.
- **Linkea**: post 2 → calculadora-monotributo-2026; post 3 → valores-bcra + comparador-plazo-fijo.
- **Texto**: copiar tal cual **`docs/backlinks/devto-post-2.md`** y luego **`docs/backlinks/devto-post-3.md`** (corregidos 2026-06-10: canonical roto removido — apuntaba a /blog/* que da 404 — y deep links de dinero agregados). Cambiar `published: false` → publicar desde la UI.
- **Gotcha conocido**: si da "Invalid authenticity token" al publicar → recargar `/new` (CSRF stale post-OAuth) y re-pegar.

## 3. PR a public-apis/public-apis (GitHub, DR 95+, dofollow)

- **Dónde**: https://github.com/public-apis/public-apis → abrir `README.md` → botón lápiz (forkea solo) → sección **Finance**, insertar la fila en orden alfabético (entra por "H").
- **Login**: GitHub `grblasquiz` (ya existente, dueño del repo hacecuentas).
- **Linkea**: /desarrolladores (página de docs de la API — el form exige link a docs, no home).
- **Fila exacta** (columnas API | Description | Auth | HTTPS | CORS):

```
| [Hacé Cuentas](https://hacecuentas.com/desarrolladores) | 2,500+ Spanish-language calculators (net salary, taxes, finance) for Latin America | No | Yes | No |
```

- **Título del PR**: `Add Hacé Cuentas API (Finance)`
- **Body del PR** (pegar):

```
- [x] My submission is formatted according to the guidelines in the contributing guide
- [x] My addition is ordered alphabetically
- [x] My submission has a useful description
- [x] The description does not have more than 100 characters
- [x] The description does not end with punctuation
- [x] Each table column is padded with one space on either side
- [x] I have searched the repository for any relevant issues or pull requests
- [x] Any category I am creating has the minimum requirement of 3 items

hacecuentas.com exposes a free REST API (OpenAPI 3 at https://hacecuentas.com/.well-known/openapi.yaml) over 2,500+ calculators: net salary for Argentina (https://hacecuentas.com/en/salary-calculator-argentina), tax regimes, severance, deposits. No auth required. Endpoints: /api/calcs-index.json, /api/calc/{slug}.json, /api/calc/{slug}/compute.
```

- Nota: la descripción de la fila tiene 84 caracteres (límite 100) y no termina en puntuación — pasa el linter.

## 4. SaaSHub — cerrar el pending (DR 71)

- **Dónde**: https://www.saashub.com (login Martin, cuenta ya creada 2026-06-09) → dashboard del producto. Si sigue "pending approval" después del 2026-06-13, escribir a https://www.saashub.com/contact.
- **Linkea**: /en/salary-calculator-argentina, /en/severance-calculator-argentina, /en/aguinaldo-calculator-argentina (SaaSHub filtra "solo inglés" → URLs /en/).
- **Completar el listing con** — Alternative to: `Omni Calculator`, `Calculator.net`. Category: `Utilities → Calculators`. Pricing: `Free`.
- **Descripción (pegar)**:

```
hacecuentas.com is a collection of 2,500+ free online calculators in Spanish, English and Portuguese, focused on Latin American salaries and taxes. Flagship tools: Argentine net salary (hacecuentas.com/en/salary-calculator-argentina), severance pay (hacecuentas.com/en/severance-calculator-argentina) and aguinaldo/13th salary (hacecuentas.com/en/aguinaldo-calculator-argentina). Country-specific math for Argentina, Mexico, Spain, Chile, Colombia, Peru, Ecuador and Brazil, updated yearly against official sources. No sign-up, no paywall, plus a free REST API and MCP server for developers.
```

## 5. AlternativeTo — listar como alternativa a Omni Calculator (DR ~89; desde el 2026-06-16)

- **Dónde**: https://alternativeto.net/submit-item/ — ⚠️ la cuenta de Martin está bloqueada para submits hasta el **2026-06-16** (cuentas <7 días no pueden).
- **Login**: Martin (cuenta creada 2026-06-09).
- **Linkea**: sueldo-en-mano-argentina y calculadora-monotributo-2026 (en la descripción; el campo URL del form exige la home).
- **Campos**: URL: `https://hacecuentas.com` · Category: `Online Service → Business & Commerce` (o Productivity) · Alternative to: `Omni Calculator`, `Calculator.net` · Tags: `calculators, finance, taxes, spanish, free, privacy` · License: `Free`.
- **Descripción (pegar)**:

```
hacecuentas.com is a free alternative to Omni Calculator for Spanish speakers: 2,500+ calculators covering net salary, taxes, loans, deposits, health and conversions, with country-specific math for Argentina, Mexico, Spain, Chile, Colombia, Peru, Ecuador and Brazil. Examples: Argentine net salary (hacecuentas.com/sueldo-en-mano-argentina) and the Monotributo 2026 tax calculator (hacecuentas.com/calculadora-monotributo-2026). No registration, no paywall, inputs never leave the browser. Also ships a free API and MCP server so AI assistants can use the calculators directly.
```

## 6. Reddit ×3 — manual de Martin (nofollow; referral + crawl IA; 2 son TIMELY)

> Reglas de siempre: buscar thread fresco (<72 h) con el link de búsqueda, ordenar por New, **adaptar** el draft (no pegar idéntico), 80% respuesta útil / link al final, máx 1 link por sub por día. Reddit está bloqueado para Claude → esto lo postea Martin a mano.

### 6a. Aguinaldo de junio (vence 30/6 → postear ESTA semana) — r/argentina

- **Buscar**: https://www.reddit.com/r/argentina/search/?q=aguinaldo+junio&restrict_sr=1&sort=new&t=week
- **Linkea**: calculadora-aguinaldo-sac
- **Draft (adaptar)**:

```
El aguinaldo de junio es el 50% de la mejor remuneración mensual devengada del
semestre enero-junio, y si no trabajaste el semestre completo va proporcional:
(mejor sueldo ÷ 2) × (días trabajados ÷ 182). La primera cuota vence el 30 de
junio con tolerancia de hasta 4 días hábiles (Ley 27.073). Ojo con un detalle
que confunde a todos: al aguinaldo también le descuentan aportes (jubilación,
PAMI, obra social), así que en mano cobrás menos que el "mejor sueldo ÷ 2" que
calculaste de cabeza.

Si querés el número exacto con descuentos incluidos:
https://hacecuentas.com/calculadora-aguinaldo-sac
```

### 6b. Recategorización monotributo (ventana 1-20 julio → dejar listo ya) — r/finanzasargentina

- **Buscar**: https://www.reddit.com/r/finanzasargentina/search/?q=monotributo+recategorizacion&restrict_sr=1&sort=new&t=month
- **Linkea**: calculadora-monotributo-categoria-2026-recategorizacion-julio
- **Draft (adaptar)**:

```
En la recategorización de julio se mira la facturación de los últimos 12 meses
(jul-2025 a jun-2026) y te corresponde la categoría cuyo tope anual no superes.
Con los topes 2026: la A llega hasta $10.277.988 anuales y la K hasta
$108.357.084 — y desde la reforma, servicios también puede llegar a la K (antes
cortaba antes). El trámite es con clave fiscal en la web de ARCA, del 1 al 20
de julio. Si te corresponde recategorizar y no lo hacés, ARCA puede hacerlo de
oficio, con la cuota nueva retroactiva.

Para ver en qué categoría caés con tu facturación real:
https://hacecuentas.com/calculadora-monotributo-categoria-2026-recategorizacion-julio
```

### 6c. "¿Cuánto me descuentan del sueldo?" (evergreen) — r/empleos_AR

- **Buscar**: https://www.reddit.com/r/empleos_AR/search/?q=sueldo+neto+descuentos&restrict_sr=1&sort=new&t=month
- **Linkea**: sueldo-en-mano-argentina
- **Draft (adaptar)**:

```
Lo estándar en relación de dependencia es 17% de descuentos: 11% jubilación
(SIPA), 3% PAMI y 3% obra social, más cuota sindical si tu convenio la tiene
(1-3% según gremio). Dos detalles que casi nadie tiene en cuenta: (1) los
aportes se calculan hasta una base imponible máxima (~$4,41 millones brutos a
junio 2026) — si ganás por encima de eso, el excedente no paga aportes; y
(2) Ganancias recién aparece bastante por arriba del sueldo promedio y se
calcula sobre el neto de aportes, no sobre el bruto.

Para ver el desglose completo bruto → neto con tu sueldo:
https://hacecuentas.com/sueldo-en-mano-argentina
```

> Munición adicional ya redactada (vacaciones + plazo fijo): `docs/reddit-queue-2026-06-09-manual.md`.

## 7. Crunchbase — perfil de organización (desambiguación de marca vs hacecuentas.com.ar)

- **Dónde**: https://www.crunchbase.com/add-new (crear cuenta gratis → "Add an Organization").
- **Login**: Martin. Es EL movimiento de Knowledge Graph: cuando alguien (o una IA) busca "hacecuentas", hoy gana el .com.ar.
- **Linkea**: sueldo-en-mano-argentina, calculadora-monotributo-2026 (en la descripción).
- **Campos**: Organization name: `Hacé Cuentas (hacecuentas.com)` · Website: `https://hacecuentas.com` · Industries: `FinTech, Consumer Web, Internet` · HQ: `Buenos Aires, Argentina` · Founder: `Martín Rodríguez` · Founded: dejar vacío si el form lo permite (no inventar fecha).
- **Descripción (pegar)**:

```
hacecuentas.com operates a platform of 2,500+ free online calculators in Spanish, Portuguese and English focused on Latin American payroll and taxes. Flagship tools include the Argentine net salary calculator (hacecuentas.com/sueldo-en-mano-argentina) and the Monotributo 2026 tax calculator (hacecuentas.com/calculadora-monotributo-2026), with country-specific rules for Argentina, Mexico, Spain, Chile, Colombia, Peru, Ecuador and Brazil verified against official sources. The product is free, requires no registration, and offers a public REST API and MCP server for AI assistants. Not affiliated with hacecuentas.com.ar.
```

## 8. APIs.guru — agregar el OpenAPI al directorio (lo leen crawlers y agentes)

- **Dónde**: https://github.com/APIs-guru/openapi-directory/issues/new/choose → template "Add API" (si no aparece, issue en blanco).
- **Login**: GitHub `grblasquiz`.
- **Linkea**: /desarrolladores + /en/salary-calculator-argentina.
- **Título del issue**: `Add API: hacecuentas.com (2,500+ calculators, compute API)`
- **Body (pegar)**:

```
**Spec URL:** https://hacecuentas.com/.well-known/openapi.yaml (OpenAPI 3, verified live)
**Official:** yes — I'm the site owner.
**Description:** Free REST API over the 2,500+ calculators of hacecuentas.com (Spanish/English/Portuguese; net salary, taxes and finance for Latin America — e.g. https://hacecuentas.com/en/salary-calculator-argentina). No auth. Endpoints: /api/calcs-index.json, /api/calc/{slug}.json, /api/calc/{slug}/compute. Docs: https://hacecuentas.com/desarrolladores
```

## 9. Indie Hackers — producto + milestone post (DR ~81, comunidad indie/fintech)

- **Dónde**: https://www.indiehackers.com/products/new (login Google/Twitter) → crear producto → publicar un post.
- **Login**: Martin (cuenta nueva).
- **Linkea**: sueldo-en-mano-argentina, calculadora-monotributo-2026, /desarrolladores.
- **Producto**: Name: `Hacé Cuentas` · Website: `https://hacecuentas.com` · Tagline: `2,500+ free Spanish calculators for salary & taxes (LATAM)` · Revenue: `$0/mo` (la transparencia es la moneda de IH).
- **Título del post**: `2,500+ calculator pages, $0 MRR, and why I'm betting on AI assistants instead of Google`
- **Body (pegar)**:

```
hacecuentas.com is a free calculator site in Spanish (plus EN/PT) focused on LATAM money math: net salary for Argentina (hacecuentas.com/sueldo-en-mano-argentina), the Monotributo small-taxpayer regime (hacecuentas.com/calculadora-monotributo-2026), severance, fixed-term deposits, and ~2,500 more — each with country-specific rules that change every year.

The uncomfortable part: Google organic is basically dead for independent content sites in this niche, so distribution now runs through Bing, paid traffic and AI assistants. That's why the site ships a free REST API and an MCP server (hacecuentas.com/desarrolladores) — so ChatGPT/Claude/Grok can actually compute with it instead of just paraphrasing it.

Happy to share real numbers on what AI-assistant referrals look like for a content site in 2026. Ask me anything.
```

## 10. Product Hunt — lanzar (mayor techo; primero madurar la cuenta)

- **Dónde**: https://www.producthunt.com/posts/new
- **Login**: Martin. ⚠️ Cuenta nueva no puede lanzar bien: crear ya, y durante 2-3 semanas hacer upvotes/comentarios. **Lanzar en julio**, martes-jueves.
- **Linkea**: sueldo-en-mano-argentina, calculadora-monotributo-2026, comparador-plazo-fijo, /desarrolladores (en el maker comment).
- **Campos**: Name: `Hacé Cuentas` · Tagline (55 chars): `2,500+ free calculators in Spanish for salary and taxes` · Topics: `Fintech`, `Productivity`, `Web App` · Website: `https://hacecuentas.com`
- **Description (pegar)**:

```
hacecuentas.com: 2,500+ free calculators with country-specific money math for Latin America — net salary, taxes, severance, deposits, plus health and conversions. Spanish, English and Portuguese. No sign-up, no paywall, free API + MCP server for AI assistants.
```

- **Primer comentario (maker, pegar)**:

```
Hi Product Hunt! I built hacecuentas.com because Spanish-language calculator sites are ad-stuffed, slow, and usually wrong about LATAM tax rules (which change every single year).

What's inside: 2,500+ free calculators with country-specific math — Argentine net salary (hacecuentas.com/sueldo-en-mano-argentina), the Monotributo 2026 tax regime (hacecuentas.com/calculadora-monotributo-2026), severance pay, and a fixed-term deposit comparator with live bank rates (hacecuentas.com/comparador-plazo-fijo) — plus health, math and conversion tools, in Spanish, English and Portuguese.

No sign-up, no paywall, and your inputs never leave the browser. There's also a free REST API + MCP server so AI assistants can compute with it: hacecuentas.com/desarrolladores

AMA about scaling a static site to thousands of pages on Cloudflare Pages.
```

---

## Tracking

Después de cada acción, anotar acá la URL final y la fecha (mismo formato que docs/backlinks/EXECUTION-PLAN.md):

| # | Acción | Fecha | URL final | Status |
|---|--------|-------|-----------|--------|
| 1 | Hashnode | | | pendiente |
| 2a | dev.to post 2 | ≥2026-06-16 | | pendiente |
| 2b | dev.to post 3 | ≥2026-06-23 | | pendiente |
| 3 | public-apis PR | | | pendiente |
| 4 | SaaSHub | 2026-06-09 (submit) | | pending approval |
| 5 | AlternativeTo | ≥2026-06-16 | | bloqueado hasta 6/16 |
| 6 | Reddit ×3 | | | pendiente (manual) |
| 7 | Crunchbase | | | pendiente |
| 8 | APIs.guru | | | pendiente |
| 9 | Indie Hackers | | | pendiente |
| 10 | Product Hunt | julio | | madurar cuenta |
