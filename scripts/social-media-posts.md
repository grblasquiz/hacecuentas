# Social Media Posts — hacecuentas.com

Contenido listo para copiar y pegar. Generado 2026-04-16.

---

## 1. Reddit Posts

---

### r/argentina — Post 1: Sueldo en mano

**Title:** Hice una calculadora de sueldo en mano para Argentina con todas las deducciones actualizadas

**Body:**

Buenas gente. Laburo en sistemas y estaba podrido de googlear cada vez que quería saber cuánto me iba a quedar en mano de un aumento, o cuando comparaba ofertas laborales y no entendía la diferencia entre bruto y neto.

Me puse a armar una calculadora que tenga todas las deducciones de Argentina al día (jubilación, obra social, PAMI, ganancias si aplica) y que te muestre el desglose completo en tiempo real.

La fui mejorando y terminó siendo un sitio con más de 535 calculadoras gratuitas, pero la que más usan es justamente esta: https://hacecuentas.com/sueldo-en-mano-argentina

No pide registro, no tiene paywall, no te llena de pop-ups. Metés el bruto, te dice cuánto cobrás. Así de simple.

Si les sirve genial, si tienen feedback bienvenido sea. También hay calculadoras de aguinaldo, monotributo 2026, indemnización por despido, impuesto a las ganancias y un montón más.

---

### r/argentina — Post 2: Monotributo 2026

**Title:** Calculadora de Monotributo 2026 con las categorías actualizadas

**Body:**

Para los que son monotributistas o están evaluando pasarse: hice una calculadora que te dice en qué categoría caés según tu facturación, actividad y si tenés empleados o local.

Te muestra la cuota mensual desglosada (impuesto integrado + SIPA + obra social), los topes de facturación de cada categoría, y te avisa si te estás acercando al límite para recategorizarte.

Está actualizada a 2026: https://hacecuentas.com/calculadora-monotributo-2026

La hice porque cada vez que AFIP actualiza las escalas hay que buscar la resolución, abrir un PDF, sacar la cuenta... Acá está todo automático.

El sitio tiene 535+ calculadoras gratuitas de finanzas, salud, conversiones y más. Todo sin registro ni spam. Si les copa, compartan. Si encuentran un error, avísenme que lo corrijo al toque.

---

### r/merval — Post: Comparador de Plazo Fijo

**Title:** Armé un comparador de plazo fijo que te muestra la ganancia real después de inflación

**Body:**

Vengo lurkeando acá hace rato y siempre veo la misma pregunta: "me conviene el plazo fijo o meto en FCI/dólar/cripto?"

No voy a responder eso porque depende de cada uno, pero sí les comparto algo que armé y creo que les puede servir: un comparador de plazo fijo que te muestra no solo el interés nominal sino también cuánto te queda en términos reales considerando inflación.

https://hacecuentas.com/comparador-plazo-fijo

Podés comparar montos, plazos y tasas. También hay una calculadora de plazo fijo clásica que te calcula con TNA y TNM: https://hacecuentas.com/calculadora-plazo-fijo

Es parte de hacecuentas.com, un sitio con 535+ calculadoras gratuitas que cubre finanzas, impuestos, salud y más. Todo gratuito, sin registro.

No es consejo financiero, solo matemática.

---

### r/devsarg — Post: Technical

**Title:** Hice un sitio con 535 calculadoras usando Astro + TypeScript y generación programática de páginas

**Body:**

Quería compartir un side project que vengo puliendo: hacecuentas.com, un sitio de calculadoras gratuitas para Argentina y LATAM.

Lo interesante técnicamente es la arquitectura. Cada calculadora se define con un JSON que tiene la config de campos (inputs, tipos, validaciones, presets) y la fórmula vive en un archivo TypeScript tipado aparte. Astro genera todas las páginas en build time con `getStaticPaths()` leyendo los 535 JSONs de `/content/calcs/`.

Stack:
- **Astro** con output estático
- **TypeScript** para las fórmulas (cada una es un módulo con interfaces de input/output)
- **JSON-driven UI**: los campos del formulario se renderizan dinámicamente desde el JSON
- **SEO automático**: meta descriptions, FAQ schema, breadcrumbs, hreflang (hay versión en inglés)
- **Deploy en Cloudflare Pages** (build de ~535 páginas en menos de 30 segundos)

El pattern que más me gustó fue separar la "definición" de la calculadora (JSON) de la "lógica" (TypeScript). Agregar una calculadora nueva es crear un JSON + un .ts y ya. No tocás layout, routing, ni nada.

Ejemplo de fórmula:

```typescript
export function aguinaldo(inputs: AguinaldoInputs): AguinaldoOutputs {
  const aguinaldoBruto = (mejorSueldo / 2) * (mesesTrabajados / 6);
  const descuentos = aguinaldoBruto * 0.17;
  return { aguinaldoBruto, aguinaldoNeto: aguinaldoBruto - descuentos };
}
```

Ejemplo de config JSON (resumido):

```json
{
  "slug": "calculadora-aguinaldo-sac",
  "formulaId": "aguinaldo",
  "fields": [
    { "id": "mejorSueldo", "type": "number", "prefix": "$" },
    { "id": "mesesTrabajados", "type": "select", "options": [...] }
  ]
}
```

Si les interesa verlo: https://hacecuentas.com

Acepto feedback técnico. El repo es privado pero pregúntenme lo que quieran sobre la arquitectura.

---

### r/personalfinance — Post

**Title:** I built a free calculator site with 535+ tools for salary, taxes, loans, and more (focused on Latin America but many are universal)

**Body:**

I'm a developer from Argentina and I built hacecuentas.com — a free calculator platform with 535+ calculators covering personal finance, health, education, and daily life.

While many calculators are specific to Argentina and Latin American tax systems, there are plenty of universal ones:

- **Compound interest calculator** — see how your savings grow over time
- **Loan amortization** — French vs German method comparison
- **BMI / TDEE / Calorie calculators** — health and fitness
- **Currency converters** — including inflation-adjusted comparisons
- **Savings goal calculator** — how much to save monthly to hit a target

The site is 100% free, no registration, no paywalls. It's built with Astro and TypeScript and runs entirely on static pages — fast, no tracking, no BS.

We also have specific salary calculators for Mexico and Chile if you have LATAM connections: https://hacecuentas.com/sueldo-neto-mexico and https://hacecuentas.com/sueldo-neto-chile

Check it out: https://hacecuentas.com (there's an English section too at /en/)

---

### r/webdev — Post

**Title:** I built 535 calculator pages with Astro using a JSON-driven architecture — each calculator is just a config file + a TypeScript formula

**Body:**

I want to share an architectural pattern I've been using for hacecuentas.com — a calculator platform with 535+ pages, all generated programmatically from JSON config files.

**The problem**: I wanted to build hundreds of calculators without duplicating layout code, SEO boilerplate, or form handling logic.

**The solution**: Each calculator is defined by two files:

1. **A JSON config** (`/content/calcs/aguinaldo.json`) — defines slug, title, SEO metadata, input fields (type, validation, presets), output display configuration, FAQ content, and structured data hints.

2. **A TypeScript formula** (`/lib/formulas/aguinaldo.ts`) — a pure function with typed inputs and outputs. No DOM, no side effects. Just math.

Astro's `getStaticPaths()` reads all 535 JSON files at build time and generates a static page for each one. The `Calculator.astro` component renders the form dynamically based on the field definitions in the JSON.

```typescript
// Each formula is a typed pure function
export interface AguinaldoInputs {
  mejorSueldo: number;
  mesesTrabajados: number;
}

export function aguinaldo(inputs: AguinaldoInputs): AguinaldoOutputs {
  const bruto = (inputs.mejorSueldo / 2) * (inputs.mesesTrabajados / 6);
  return { aguinaldoBruto: bruto, aguinaldoNeto: bruto * 0.83 };
}
```

**What I like about this pattern:**
- Adding a new calculator = 1 JSON + 1 TS file. Zero boilerplate.
- SEO, structured data, breadcrumbs, related calculators — all automated from the JSON config.
- Formulas are unit-testable in isolation.
- Full build (535 pages) completes in ~30 seconds on Cloudflare Pages.
- The JSON acts as a contract between content and code — non-developers could theoretically create calculators by writing JSON.

**What I'd improve:**
- A visual editor for the JSON configs would be nice for non-technical contributors.
- Some formulas share logic (tax brackets, compound interest) that could be better abstracted.

Live site: https://hacecuentas.com — Spanish focused, English version at /en/

Happy to answer questions about the architecture.

---

### r/SideProject — Post

**Title:** I built hacecuentas.com — 535+ free calculators for finance, health, and daily life

**Body:**

Hey everyone! I want to share my side project: **hacecuentas.com** — a free calculator platform primarily in Spanish, targeting Argentina and Latin America.

**What it does:** 535+ calculators covering salary calculations, tax tools (monotributo, income tax), loan amortization, health calculators (BMI, calories, TDEE), unit converters, and a ton of niche tools (like "how much water does my dog need" or "savings from switching to LED bulbs").

**The origin story:** I was tired of Googling "how to calculate aguinaldo" (that's a mandatory bonus in Argentina) every 6 months. Built one calculator. Then another. Then I realized the pattern was reusable, built a JSON-driven system, and now adding a new calculator takes about 15 minutes — write a JSON config and a TypeScript formula.

**Tech stack:** Astro (static site), TypeScript, Cloudflare Pages. Zero external dependencies for the calculators — it's all vanilla math.

**Numbers so far:**
- 535 calculators live
- 1,236 total pages (including blog, comparison pages, and regional variants)
- Full build in ~30 seconds
- $0 hosting cost (Cloudflare Pages free tier)

**Monetization:** Currently exploring AdSense and affiliate links for financial products. The SEO play is the main strategy — each calculator targets long-tail Spanish keywords with very low competition.

Check it out: https://hacecuentas.com

Feedback welcome! Especially on monetization ideas for calculator sites.

---

### r/InternetIsBeautiful — Post

**Title:** hacecuentas.com — 535+ free calculators for finance, health, and daily life (no ads, no registration, no popups)

**Body:**

I built this calculator platform with 535+ tools that cover everything from salary calculations to how many calories your dog needs.

Some highlights:
- Salary net calculator for Argentina, Mexico, and Chile
- BMI, calorie, and TDEE calculators
- Loan amortization comparison (French vs German method)
- Unit converters for pretty much anything
- Niche stuff like "savings from biking to work instead of driving" or "how much fence wire do I need"

Everything is free, works instantly, no registration, no popups. It's a static site that loads fast on any connection.

https://hacecuentas.com (Spanish, with an English section at /en/)

---

### r/chile — Post

**Title:** Hice una calculadora de sueldo neto para Chile con AFP, salud e impuesto único

**Body:**

Hola! Soy desarrollador argentino y vengo armando hacecuentas.com, un sitio con más de 535 calculadoras gratuitas. Hace poco agregué una calculadora específica para Chile:

https://hacecuentas.com/sueldo-neto-chile

Metés tu sueldo bruto y te calcula:
- Descuento de AFP
- Cotización de salud (Fonasa/Isapre)
- Seguro de cesantía
- Impuesto único de segunda categoría
- Sueldo líquido final

Es gratis, sin registro, sin spam. Si encuentran algún error en los cálculos o las tasas están desactualizadas, porfa avísenme así lo corrijo.

El sitio tiene calculadoras de todo tipo: finanzas, salud, conversiones, educación. Todo en español.

---

### r/mexico — Post

**Title:** Calculadora de sueldo neto México con ISR y todas las deducciones 2026

**Body:**

Qué onda! Soy dev argentino y armé hacecuentas.com, un sitio con 535+ calculadoras gratuitas. Hace poco agregué calculadoras específicas para México:

**Sueldo neto:** https://hacecuentas.com/sueldo-neto-mexico
- Metes tu sueldo bruto mensual
- Te calcula ISR, IMSS, y todas las deducciones
- Te muestra tu sueldo neto real

**Aguinaldo México:** https://hacecuentas.com/aguinaldo-mexico
- Calcula tu aguinaldo según tu salario diario y días de aguinaldo

Todo es gratis, sin registro, sin publicidad invasiva. Si ven algún error en los cálculos o algo desactualizado, díganme y lo corrijo.

El sitio tiene calculadoras de finanzas, salud, conversiones y más. Todo en español.

---

## 2. Twitter/X Posts

---

### Tweet 1 — Launch (Spanish)
```
Lancé hacecuentas.com 🧮

535+ calculadoras gratuitas:
- Sueldo en mano Argentina
- Monotributo 2026
- Aguinaldo
- IMC y calorías
- Plazo fijo
- Préstamos
- Y 500+ más

Sin registro. Sin paywall. Sin spam.

#Argentina #Finanzas #Calculadoras #Gratis
```
[Screenshot: homepage showing category grid with calculator count]

---

### Tweet 2 — Sueldo en mano (Spanish)
```
¿Cuánto cobrás realmente de tu sueldo? 💰

Meté tu bruto y en 2 segundos sabés tu neto con todos los descuentos:
✅ Jubilación
✅ Obra social
✅ PAMI
✅ Ganancias (si aplica)

👉 hacecuentas.com/sueldo-en-mano-argentina

Gratis. Sin registro.

#SueldoEnMano #Argentina #Trabajo
```
[Screenshot: sueldo en mano calculator with example numbers filled in]

---

### Tweet 3 — Monotributo (Spanish)
```
Se actualizaron las categorías de Monotributo 2026 📋

No busques más en PDFs de AFIP. Meté tu facturación y te dice:
→ Tu categoría
→ La cuota mensual desglosada
→ Topes de facturación

hacecuentas.com/calculadora-monotributo-2026

#Monotributo #AFIP #Emprendedores #Argentina
```
[Screenshot: monotributo calculator showing category result]

---

### Tweet 4 — Aguinaldo (Spanish)
```
Se viene el aguinaldo de junio 🎁

¿Sabés cuánto te toca cobrar?

Mejor sueldo del semestre ÷ 2 × (meses trabajados / 6) - 17% aportes = tu aguinaldo neto

O ahorrá la cuenta:
👉 hacecuentas.com/calculadora-aguinaldo-sac

#Aguinaldo #SAC #Sueldo #Argentina
```
[Screenshot: aguinaldo calculator with result showing bruto vs neto]

---

### Tweet 5 — Technical (English)
```
I built 535 calculators with a JSON-driven architecture in Astro + TypeScript 🏗️

Each calculator = 1 JSON config + 1 TS formula
Zero boilerplate for new pages
Full static build in ~30 seconds

The pattern: separate definition from logic. Content as data.

hacecuentas.com

#webdev #astro #typescript #buildinpublic
```

---

### Tweet 6 — Plazo fijo (Spanish)
```
¿Conviene el plazo fijo hoy? 🤔

Armé un comparador que te muestra ganancia nominal vs ganancia real (después de inflación).

Porque ganar 5% mensual suena bien hasta que la inflación es 6%.

👉 hacecuentas.com/comparador-plazo-fijo

#PlazoFijo #Inversiones #Argentina #Merval
```
[Screenshot: comparador showing nominal vs real return]

---

### Tweet 7 — IMC (Spanish)
```
Calculá tu IMC en 5 segundos 📊

Peso + altura = tu índice de masa corporal con categoría y rango saludable.

Nada de apps que te piden crear cuenta para darte un número.

👉 hacecuentas.com/calculadora-imc

#IMC #Salud #Fitness #Calculadora
```

---

### Tweet 8 — Side project story (English)
```
Side project update 📈

Started: "I'll build one salary calculator"
Now: 535+ calculators, 1,236 pages, $0 hosting

Stack: Astro + TypeScript + Cloudflare Pages

Adding a new calculator takes ~15 minutes. Write JSON config, write TS formula, deploy.

hacecuentas.com

#buildinpublic #sideproject #indiehacker
```

---

### Tweet 9 — Indemnización (Spanish)
```
¿Te despidieron sin causa? 💼

Antes de aceptar cualquier número, calculá lo que te corresponde por ley:

→ Indemnización por antigüedad
→ Preaviso
→ SAC proporcional
→ Vacaciones

👉 hacecuentas.com/calculadora-indemnizacion-despido

#Despido #DerechoLaboral #Argentina #Trabajo
```
[Screenshot: indemnización calculator showing all components]

---

### Tweet 10 — LATAM expansion (English/Spanish mix)
```
hacecuentas.com ahora tiene calculadoras para 🇦🇷🇲🇽🇨🇱:

🇦🇷 Sueldo en mano Argentina
🇲🇽 Sueldo neto México (con ISR)
🇨🇱 Sueldo neto Chile (con AFP)

Misma experiencia: metés el bruto, te dice el neto. Gratis.

All free, no registration. 535+ calculators.

#LATAM #Finanzas #SueldoNeto
```

---

## 3. LinkedIn Posts

---

### LinkedIn Post 1 — Spanish

**Title/Hook:** Construí una plataforma con 535+ calculadoras gratuitas en español. Así fue el proceso.

**Body:**

Hace unos meses me hice una pregunta simple: "¿por qué cada vez que quiero calcular mi sueldo neto tengo que buscar en tres sitios distintos y ninguno tiene los datos actualizados?"

Así nació hacecuentas.com.

Lo que empezó como una calculadora de sueldo en mano para Argentina se convirtió en una plataforma con más de 535 calculadoras gratuitas que cubren finanzas personales, salud, educación, conversiones y vida cotidiana.

Algunos números del proyecto:

- 535 calculadoras operativas
- 1,236 páginas totales (incluyendo blog, comparadores y variantes regionales)
- Cobertura para Argentina, México y Chile
- $0 de costo de hosting (gracias Cloudflare Pages)
- Build completo en ~30 segundos

La decisión técnica que más impacto tuvo fue separar la definición de cada calculadora (un archivo JSON con campos, metadata y SEO) de la lógica de cálculo (un módulo TypeScript puro). Esto permite que agregar una calculadora nueva tome unos 15 minutos, sin tocar layout ni routing.

Las calculadoras más utilizadas:
- Sueldo en mano Argentina
- Calculadora de monotributo 2026
- Calculadora de aguinaldo (SAC)
- Comparador de plazo fijo
- Calculadora de IMC

Próximos pasos: expandir la cobertura a más países de LATAM, agregar más calculadoras en inglés, y explorar modelos de monetización que no arruinen la experiencia del usuario.

Si te interesa verlo: https://hacecuentas.com

#FinanzasPersonales #SideProject #Astro #TypeScript #Argentina #LATAM #Calculadoras #BuildInPublic

---

### LinkedIn Post 2 — English

**Title/Hook:** I built a platform with 535+ free calculators using a JSON-driven architecture. Here's what I learned.

**Body:**

A few months ago, I got frustrated trying to calculate my net salary in Argentina. Every website was either outdated, behind a paywall, or loaded with popups.

So I built one calculator. Then another. Then I noticed a pattern and built an architecture that could scale.

The result: hacecuentas.com — a free calculator platform with 535+ tools covering personal finance, health, education, and daily life. Primarily in Spanish, targeting Argentina and Latin America.

The key architectural decision: each calculator is defined by just two files — a JSON configuration (fields, metadata, SEO) and a TypeScript formula (pure function, typed inputs/outputs). Astro generates all 535 pages statically at build time.

What this enables:
- New calculator in ~15 minutes
- Zero layout duplication
- Automated SEO (meta tags, structured data, breadcrumbs)
- Full build in ~30 seconds
- $0 hosting on Cloudflare Pages free tier

The platform now covers salary calculators for Argentina, Mexico, and Chile, along with tax tools, loan calculators, health metrics, and hundreds of converters and niche tools.

Key takeaway: the hardest part of building 535 calculators wasn't the math — it was designing an architecture where adding the 536th one is trivial.

Check it out: https://hacecuentas.com (English version at /en/)

#WebDevelopment #SideProject #Astro #TypeScript #BuildInPublic #FinTech #LatinAmerica

---

## 4. Facebook Groups Posts

---

### Facebook Post 1 — Argentine finance group

**Group target:** Finanzas Personales Argentina, Comunidad Contable Argentina, etc.

Hola grupo! Les comparto una herramienta que vengo armando y que creo les puede servir mucho:

**hacecuentas.com** — 535+ calculadoras gratuitas

Las que más usan:
💰 Sueldo en mano: https://hacecuentas.com/sueldo-en-mano-argentina
📋 Monotributo 2026: https://hacecuentas.com/calculadora-monotributo-2026
🎁 Aguinaldo: https://hacecuentas.com/calculadora-aguinaldo-sac
💼 Indemnización despido: https://hacecuentas.com/calculadora-indemnizacion-despido
📊 Impuesto ganancias: https://hacecuentas.com/calculadora-impuesto-ganancias-sueldo

Todo gratis, sin registro, sin spam. Metés los números y te da el resultado al instante con el desglose completo.

Espero que les sirva! Si encuentran algún error me avisan 🙏

---

### Facebook Post 2 — Expat group

**Group target:** Argentinos en el exterior, Expats Argentina, etc.

Para los que se fueron del país y todavía cobran en pesos, o están evaluando ofertas desde Argentina:

Armé hacecuentas.com, un sitio con 535+ calculadoras. Para los expats las más útiles son:

🇦🇷 Sueldo en mano Argentina: https://hacecuentas.com/sueldo-en-mano-argentina
🇲🇽 Sueldo neto México: https://hacecuentas.com/sueldo-neto-mexico
🇨🇱 Sueldo neto Chile: https://hacecuentas.com/sueldo-neto-chile

Podés comparar cuánto te queda en mano en distintos países. Todo gratis, actualizado y en español.

También hay calculadoras de plazo fijo, monotributo (para los que mantienen monotributo desde afuera), y un montón más.

---

### Facebook Post 3 — Emprendedores group

**Group target:** Emprendedores Argentina, Freelancers Argentina, etc.

Para los freelancers y emprendedores del grupo: hice una herramienta que les puede simplificar la vida con los números.

hacecuentas.com tiene 535+ calculadoras gratuitas. Las que más les van a servir:

📋 Monotributo 2026 — te dice en qué categoría caés y cuánto pagás: https://hacecuentas.com/calculadora-monotributo-2026
💰 Sueldo en mano — para cuando tenés empleados y querés saber el costo real: https://hacecuentas.com/sueldo-en-mano-argentina
📊 Impuesto ganancias — si sos responsable inscripto: https://hacecuentas.com/calculadora-impuesto-ganancias-sueldo
🏦 Plazo fijo — para ver qué hacer con la plata que juntás: https://hacecuentas.com/calculadora-plazo-fijo

Gratis, sin registro, sin letras chicas. Espero que les sirva!

---

## 5. Hacker News — Show HN

---

**Title:** Show HN: Hacecuentas — 535+ free calculators built with Astro and a JSON-driven architecture

**Comment body:**

Hi HN! I'm sharing hacecuentas.com, a free calculator platform with 535+ tools covering personal finance, health, education, and daily life. The site is primarily in Spanish, targeting Argentina and Latin America.

**Why I built it:** Salary calculations in Argentina involve multiple deductions (pension, union, health insurance, income tax) that change frequently. Every existing site was either outdated, behind a registration wall, or riddled with dark patterns. I wanted something that just works.

**Architecture:** Each calculator is defined by a JSON configuration file (input fields, validation rules, presets, SEO metadata) and a TypeScript formula module (pure function with typed inputs/outputs). Astro's `getStaticPaths()` reads all 535 JSON files at build time and generates static pages. A single `Calculator.astro` component renders any calculator based on its JSON config.

Adding a new calculator means writing two files:
- `content/calcs/my-calc.json` — fields, title, description, FAQ
- `lib/formulas/my-calc.ts` — the actual math

No routing changes, no layout work, no SEO boilerplate. The system handles it.

**Stack:** Astro (static output), TypeScript, Cloudflare Pages. No database, no auth, no external API calls at runtime. Build takes ~30 seconds for all 1,236 pages.

**What's working:** Long-tail SEO in Spanish is surprisingly low-competition. Queries like "calculadora aguinaldo 2026" or "sueldo en mano argentina" have decent volume and very few quality results.

**What's next:** Expanding to more LATAM countries (Mexico and Chile are already covered), growing the English section, and exploring monetization (likely ads and financial product affiliates).

Site: https://hacecuentas.com (English: /en/)

Happy to answer questions about the architecture or the LATAM market.

---

## 6. IndieHackers — Launch Post

---

**Title:** I built a platform with 535+ free calculators targeting the Spanish-speaking market

**Body:**

Hey IndieHackers!

I'm Martin, a marketer and part-time developer from Argentina. I just launched **hacecuentas.com** — a free calculator platform with 535+ tools for personal finance, health, education, and daily life.

### The Origin

Every 6 months in Argentina, employees receive a bonus called "aguinaldo." Every time, I Googled how to calculate it. Every time, the top results were garbage — outdated articles, sites requiring registration, PDF downloads from the tax authority.

I thought: "I can build a better calculator in an afternoon." So I did. Then I built another. Then 535 more.

### The Numbers

- **535 calculators** live
- **1,236 total pages** (including blog posts, comparison pages, reference tables, and regional variants for 24 Argentine provinces)
- **$0 hosting** (Cloudflare Pages free tier)
- **~30 second full build**
- **Time per new calculator:** ~15 minutes (JSON config + TypeScript formula)
- **Revenue so far:** $0 (pre-monetization, focusing on traffic first)

### The Architecture

The key insight was making calculators data-driven. Each one is defined by:

1. A **JSON file** with title, SEO metadata, input field definitions (type, validation, presets), output configuration, and FAQ content.
2. A **TypeScript file** with a pure formula function — typed inputs in, typed outputs out.

Astro generates all pages statically at build time. One component renders any calculator. This means zero marginal cost per new calculator — no layout changes, no routing, no SEO boilerplate.

### The Market

Spanish-language calculator searches are massively underserved. Queries like "calculadora monotributo 2026" or "sueldo en mano argentina" have real search volume and the competition is mostly ad-laden newspaper articles or government PDFs.

I recently expanded to Mexico (ISR salary calculator) and Chile (AFP/Fonasa salary calculator).

### What's Next

1. **Monetization**: AdSense + affiliate links for financial products (credit cards, savings accounts)
2. **Traffic**: SEO is the primary channel. Every calculator targets specific long-tail keywords.
3. **Coverage**: Expanding to Colombia, Peru, and more English calculators
4. **Content**: Blog posts ("How to calculate X"), comparison pages, reference tables

### Key Takeaway

The hardest part wasn't building 535 calculators — it was building the system that makes the 536th one trivial.

Check it out: https://hacecuentas.com

Would love to hear your thoughts on monetization strategies for calculator/tool sites!

---

## 7. DEV.to Article

---

**Title:** How I Built 535 Calculators with Astro and TypeScript

**Tags:** astro, typescript, webdev, javascript

**Cover image description:** Screenshot of hacecuentas.com homepage showing the grid of calculator categories with the count "535+ calculadoras gratuitas"

---

Every six months in Argentina, employees receive a mandatory bonus called "aguinaldo." And every six months, millions of people Google "how to calculate aguinaldo" and land on the same outdated newspaper articles with wrong formulas.

I decided to build a proper calculator. Then I built 534 more.

This is the story of **hacecuentas.com** — a free calculator platform with 535+ tools — and the JSON-driven architecture that makes it possible.

## The Problem with Building Lots of Pages

When I had 5 calculators, each one was a separate Astro page with its own form, its own logic, its own SEO setup. Adding a new one meant copying a page, changing the fields, writing the formula, updating the sitemap, adding breadcrumbs...

At 20 calculators this was already painful. At 535 it would be impossible.

I needed a system where the **definition** of a calculator was completely separate from its **presentation** and **logic**.

## The Architecture: JSON Config + TypeScript Formula

Each calculator lives as two files:

### 1. A JSON Configuration

```json
{
  "slug": "calculadora-aguinaldo-sac",
  "title": "Calculadora Aguinaldo SAC 2026",
  "description": "Calculá tu aguinaldo 2026...",
  "category": "finanzas",
  "icon": "🎁",
  "formulaId": "aguinaldo",
  "fields": [
    {
      "id": "mejorSueldo",
      "label": "Mejor sueldo bruto del semestre",
      "type": "number",
      "prefix": "$",
      "placeholder": "1500000",
      "min": 0,
      "required": true,
      "format": "thousands"
    },
    {
      "id": "mesesTrabajados",
      "label": "Meses trabajados en el semestre",
      "type": "select",
      "default": "6",
      "options": [
        { "value": "1", "label": "1 mes" },
        { "value": "6", "label": "6 meses" }
      ]
    }
  ],
  "outputs": [
    { "id": "aguinaldoBruto", "label": "Aguinaldo bruto", "format": "currency" },
    { "id": "aguinaldoNeto", "label": "Aguinaldo neto", "format": "currency" }
  ]
}
```

This JSON defines everything about the calculator's UI and metadata — no layout code, no HTML, no routing.

### 2. A TypeScript Formula

```typescript
export interface AguinaldoInputs {
  mejorSueldo: number;
  mesesTrabajados: number;
}

export interface AguinaldoOutputs {
  aguinaldoBruto: number;
  aguinaldoNeto: number;
  descuentos: number;
  proporcion: string;
}

export function aguinaldo(inputs: AguinaldoInputs): AguinaldoOutputs {
  const mejorSueldo = Number(inputs.mejorSueldo);
  const mesesTrabajados = Math.min(6, Math.max(0, Number(inputs.mesesTrabajados)));

  const aguinaldoBruto = (mejorSueldo / 2) * (mesesTrabajados / 6);
  const descuentos = aguinaldoBruto * 0.17;
  const aguinaldoNeto = aguinaldoBruto - descuentos;

  return {
    aguinaldoBruto: Math.round(aguinaldoBruto),
    aguinaldoNeto: Math.round(aguinaldoNeto),
    descuentos: Math.round(descuentos),
    proporcion: `${mesesTrabajados}/6`,
  };
}
```

Pure function. Typed inputs and outputs. No DOM, no side effects. Easy to test, easy to reason about.

## Programmatic Page Generation

The magic happens in Astro's `getStaticPaths()`:

```typescript
// src/pages/[...slug].astro
export async function getStaticPaths() {
  const calcs = import.meta.glob('../content/calcs/*.json', { eager: true });
  return Object.values(calcs).map((mod) => {
    const c = mod.default || mod;
    return {
      params: { slug: c.slug },
      props: { calc: c },
    };
  });
}
```

That's it. Astro reads all 535 JSON files and generates a static page for each one. One catch-all route handles every calculator.

## The Dynamic Renderer

A single `Calculator.astro` component renders any calculator:

```typescript
export interface Field {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date';
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: string | number;
  options?: { value: string; label: string }[];
  required?: boolean;
  help?: string;
  format?: 'thousands';
}
```

The component iterates over `calc.fields` and renders the appropriate input element for each type. Select fields get dropdowns, number fields get inputs with optional prefix/suffix, and so on.

## What Makes This Scale

**Adding a new calculator** is a 15-minute task:

1. Create `content/calcs/my-calc.json` — define fields, metadata, SEO
2. Create `lib/formulas/my-calc.ts` — write the math
3. Deploy

No routing changes. No layout modifications. No SEO boilerplate. The system handles structured data (FAQ schema, BreadcrumbList), meta tags, Open Graph images, sitemap entries, and related calculator suggestions — all automatically from the JSON config.

**The full build** — 535 calculators, plus blog posts, comparison pages, reference tables, and regional variants (1,236 pages total) — completes in about 30 seconds on Cloudflare Pages.

## Beyond Calculators

The same JSON-driven pattern extended to other content types:

- **Blog posts** with table of contents and FAQ schema
- **Comparison pages** (e.g., "plazo fijo vs FCI") with pros/cons cards
- **Reference tables** (e.g., monotributo category brackets) with color-coded data
- **Regional variants** (24 Argentine provinces x 4 tax calculators = 96 pages)

Each content type has its own template and JSON schema, but the principle is the same: data-driven, programmatically generated, zero per-page boilerplate.

## Lessons Learned

1. **Separate definition from logic.** The JSON/TypeScript split was the best architectural decision. Changes to presentation never touch formulas, and vice versa.

2. **Static generation is underrated.** No server, no database, no cold starts. Cloudflare Pages serves 1,236 pages for free.

3. **Long-tail SEO in non-English markets is wide open.** Spanish calculator queries have real volume and almost no quality competition.

4. **The hardest part of building 535 things is building the system that makes the 536th trivial.** Invest in architecture early.

If you want to see it in action: [hacecuentas.com](https://hacecuentas.com) — there's also an English section at [/en/](https://hacecuentas.com/en/).

The code is in a private repo, but I'm happy to answer any architecture questions in the comments.

---

## 8. Quora Answers

---

### Quora Answer 1

**Question:** "How do I calculate my net salary in Argentina?" / "Como calculo mi sueldo neto en Argentina?"

**Answer:**

Para calcular tu sueldo neto (en mano) en Argentina, tenés que restarle al bruto estos descuentos obligatorios:

- **Jubilación:** 11% del bruto
- **Obra social:** 3% del bruto
- **PAMI:** 3% del bruto
- **Total descuentos fijos:** 17%

Si tu sueldo supera cierto umbral, también te descuentan **impuesto a las ganancias** (4ta categoría), que se calcula con una escala progresiva.

Ejemplo rápido: si tu bruto es $1.500.000, los descuentos de ley son $255.000, y te quedan $1.245.000 antes de ganancias.

Si querés el cálculo exacto con ganancias incluido y actualizado a 2026, podés usar esta calculadora gratuita que hice: https://hacecuentas.com/sueldo-en-mano-argentina — metés el bruto y te muestra todo el desglose.

---

### Quora Answer 2

**Question:** "How is aguinaldo calculated in Argentina?" / "Como se calcula el aguinaldo?"

**Answer:**

El aguinaldo (SAC - Sueldo Anual Complementario) en Argentina se calcula así:

**Fórmula:** Mejor sueldo bruto del semestre / 2 x (meses trabajados / 6)

Luego se le descuenta el 17% de aportes (jubilación + obra social + PAMI), igual que al sueldo.

Se paga en dos cuotas al año:
- Primera cuota: antes del 30 de junio
- Segunda cuota: antes del 18 de diciembre

**Ejemplo:** Si tu mejor sueldo bruto del semestre fue $2.000.000 y trabajaste los 6 meses completos:
- Aguinaldo bruto: $2.000.000 / 2 = $1.000.000
- Descuentos (17%): $170.000
- Aguinaldo neto: $830.000

Si entraste a mitad de semestre (por ejemplo, 3 meses), se aplica proporcional: $1.000.000 x (3/6) = $500.000 bruto.

Para hacer el cálculo exacto sin errores: https://hacecuentas.com/calculadora-aguinaldo-sac — es gratuita y te muestra bruto, neto y descuentos.

---

### Quora Answer 3

**Question:** "What is a good BMI?" / "Como calcular el IMC?"

**Answer:**

El IMC (Índice de Masa Corporal) se calcula dividiendo tu peso en kilos por tu altura en metros al cuadrado:

**IMC = peso (kg) / altura (m)^2**

Las categorías según la OMS son:
- **Menos de 18.5:** Bajo peso
- **18.5 - 24.9:** Peso normal
- **25.0 - 29.9:** Sobrepeso
- **30.0 o más:** Obesidad

**Ejemplo:** Si pesás 75 kg y medís 1.70 m:
- IMC = 75 / (1.70 x 1.70) = 75 / 2.89 = 25.95 → Sobrepeso leve

Es importante aclarar que el IMC no distingue entre masa muscular y grasa, así que no es el indicador definitivo de salud. Pero es un buen punto de partida.

Si querés calcularlo al instante: https://hacecuentas.com/calculadora-imc — es gratis y te da la categoría con recomendaciones.

---

### Quora Answer 4

**Question:** "How does monotributo work in Argentina?" / "Que categoría de monotributo me corresponde?"

**Answer:**

El Monotributo en Argentina es un régimen simplificado que unifica en una sola cuota mensual:

1. **Impuesto integrado** (lo que pagarías de IVA + Ganancias)
2. **Aportes al SIPA** (jubilación)
3. **Obra social**

Tu categoría depende de:
- Tu facturación anual
- Si prestás servicios o vendés cosas
- Si tenés local o empleados
- El monto de alquileres devengados
- La superficie del local
- El consumo de energía eléctrica

Las categorías van de la A (menor facturación) a la K (mayor facturación, solo venta de cosas).

Lo más importante es no pasarte del tope de tu categoría, porque AFIP te puede recategorizar de oficio o excluirte del régimen.

Para saber exactamente en qué categoría caés y cuánto pagás de cuota mensual en 2026: https://hacecuentas.com/calculadora-monotributo-2026 — metés tu facturación y te dice todo.

---

### Quora Answer 5

**Question:** "How do I calculate severance pay in Argentina?" / "Como se calcula la indemnización por despido en Argentina?"

**Answer:**

La indemnización por despido sin justa causa en Argentina se compone de varios conceptos:

**1. Indemnización por antigüedad (art. 245 LCT):**
- 1 sueldo por cada año trabajado (o fracción mayor a 3 meses)
- Se toma la mejor remuneración mensual, normal y habitual
- Tope: 3 veces el promedio de convenio colectivo

**2. Indemnización sustitutiva de preaviso:**
- Menos de 5 años de antigüedad: 1 mes de sueldo
- 5 o más años: 2 meses de sueldo

**3. Integración del mes de despido:**
- Los días que faltan hasta fin de mes (si te despiden a mitad de mes)

**4. SAC proporcional:**
- Aguinaldo proporcional a los días trabajados del semestre

**5. Vacaciones no gozadas:**
- Días de vacaciones que te corresponden y no tomaste

**Ejemplo simplificado:** Si trabajaste 3 años con un sueldo de $2.000.000:
- Antigüedad: $2.000.000 x 3 = $6.000.000
- Preaviso: $2.000.000
- + integración del mes + SAC proporcional + vacaciones

Para hacer el cálculo exacto con todos los componentes: https://hacecuentas.com/calculadora-indemnizacion-despido — es gratuita y te muestra cada concepto por separado.

Importante: siempre consultá con un abogado laboralista para tu caso particular. Esto es orientativo.

---

## Checklist de Screenshots Necesarios

Para los posts que mencionan screenshots, tomar estas capturas:

1. **Homepage** — vista de categorías con el contador "535+ calculadoras"
2. **Sueldo en mano** — formulario completo con ejemplo ($2.000.000 bruto) mostrando desglose
3. **Monotributo** — resultado mostrando categoría y cuota desglosada
4. **Aguinaldo** — resultado con bruto vs neto
5. **Comparador plazo fijo** — comparación nominal vs real
6. **Indemnización** — desglose de todos los componentes
7. **IMC** — resultado con categoría

---

## Orden de Publicación Recomendado

### Semana 1 — Foundation
1. Hacker News (Show HN)
2. DEV.to article
3. r/SideProject
4. IndieHackers

### Semana 2 — Argentina
5. r/argentina (sueldo en mano)
6. r/argentina (monotributo)
7. r/merval (plazo fijo)
8. Facebook groups (3 posts, espaciados)
9. Twitter: Tweets 1, 2, 3, 4

### Semana 3 — LATAM + Technical
10. r/chile
11. r/mexico
12. r/devsarg
13. Twitter: Tweets 6, 7, 9, 10
14. LinkedIn (Spanish)

### Semana 4 — International
15. r/personalfinance
16. r/webdev
17. r/InternetIsBeautiful
18. Twitter: Tweets 5, 8
19. LinkedIn (English)
20. Quora answers (1 per day)
