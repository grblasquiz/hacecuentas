---
title: "How I built 1,200+ calculator pages in Astro without writing 1,200 templates"
published: false
description: Using Astro's content collections and dynamic routes to scale a static calculator site from 10 to 1,200 pages without bloating the codebase.
tags: astro, webdev, staticsite, seo
cover_image: https://hacecuentas.com/og-default.png
canonical_url: https://hacecuentas.com/blog/astro-content-collections-scale
---

I run [Hacé Cuentas](https://hacecuentas.com), a free collection of 535+ Spanish-language calculators. What started as 10 hand-built pages turned into **1,236 routes** — and the codebase is actually smaller than when I had 50.

Here's how Astro's content collections + dynamic routes made it possible.

## The problem

Every calculator needs:
- Inputs (each with labels, validation, hints)
- A formula
- Explanation text (markdown, often 2,000+ words for SEO)
- FAQ (minimum 7 questions for depth)
- Related calcs
- schema.org JSON-LD (HowTo + FAQPage + SoftwareApplication + Article + BreadcrumbList)
- Sources and citations

If I wrote one template per calc, every change (layout tweak, new CTA, CSS fix) would mean touching 535 files.

## The approach

**One JSON per calc. One template for all.**

### Step 1: Content collection

```
src/content/calcs/plazo-fijo.json
src/content/calcs/imc.json
src/content/calcs/aguinaldo-sac.json
...
```

Each JSON looks like:

```json
{
  "slug": "calculadora-plazo-fijo",
  "title": "Calculadora Plazo Fijo 2026 Argentina",
  "h1": "Calculadora de plazo fijo",
  "description": "...",
  "category": "finanzas",
  "formulaId": "plazo-fijo",
  "fields": [
    { "id": "capital", "label": "Capital", "type": "number", "format": "thousands" },
    { "id": "tna", "label": "TNA", "type": "number", "suffix": "%" },
    { "id": "dias", "label": "Días", "type": "number", "default": 30 }
  ],
  "outputs": [
    { "id": "montoFinal", "label": "Monto final", "format": "currency", "primary": true },
    { "id": "interesGanado", "label": "Intereses", "format": "currency" }
  ],
  "faq": [ /* ... */ ],
  "explanation": "## Cómo rinde un plazo fijo\\n\\n..."
}
```

### Step 2: Dynamic route

```astro
---
// src/pages/[...slug].astro
export async function getStaticPaths() {
  const calcs = import.meta.glob('../content/calcs/*.json', { eager: true });
  return Object.values(calcs).map((mod) => {
    const c = mod.default;
    return {
      params: { slug: c.slug },
      props: { calc: c },
    };
  });
}

const { calc } = Astro.props;
---

<Layout title={calc.title}>
  <Calculator config={calc} />
  <Explanation markdown={calc.explanation} />
  <FAQ items={calc.faq} />
</Layout>
```

That's it. Adding a new calculator = adding one JSON file. Build time: +8ms per calc.

### Step 3: Formulas as separate TypeScript modules

I keep the actual math separate because JSON can't hold functions:

```ts
// src/lib/formulas/plazo-fijo.ts
export interface Inputs { capital: number; tna: number; dias: number }
export interface Outputs { montoFinal: number; interesGanado: number; /* ... */ }

export function plazoFijo(i: Inputs): Outputs {
  const interesGanado = i.capital * (i.tna / 100) * (i.dias / 365);
  return {
    montoFinal: Math.round(i.capital + interesGanado),
    interesGanado: Math.round(interesGanado),
    // ... TEA, daily interest, etc
  };
}
```

The `Calculator.astro` component imports all formulas via `import.meta.glob`, maps them by `formulaId`, and runs the right one on form submit.

## What I learned

### 1. JSON for content, TS for logic
Don't force everything into one format. JSON is great for structured content (fields, labels, FAQ), terrible for functions. Keeping them separate means non-coders can add calcs by editing JSON, and the formulas stay type-safe.

### 2. Schema.org multiplies "for free"
One JSON feeds 5 different structured data blocks: HowTo, FAQPage, SoftwareApplication, Article, BreadcrumbList. Google loves this — [my SERP impressions 5x'd after I added them](https://hacecuentas.com).

### 3. Markdown in JSON is fine
Yes, escaping `\n` in JSON is ugly. But having everything in one file (field definitions, explanation, FAQ, schema) is worth it. A simple markdown-to-HTML function at build time handles rendering:

```ts
function md(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    // ... tables, links, code, etc
    .replace(/\\n\\n/g, '</p><p>');
}
```

No MDX, no Remark/Rehype pipeline. Just a 30-line function. Fast and debuggable.

### 4. Client-side rendering for the calc only
The entire page is static HTML at build time. Only the calculator widget hydrates with a tiny JS bundle. Lighthouse performance: 100. First Contentful Paint: 0.3s on 3G.

### 5. One page template = consistent UX
Every calc has the same layout: inputs on top, results card, explanation, FAQ, related. Users never have to relearn where things are. This also makes it trivial to A/B test layout changes — one file change propagates to 535 pages.

## Numbers

- **Pages generated**: 1,236 (calcs + blog + tables + comparators + per-province)
- **Build time**: 4.1 seconds (Cloudflare Pages)
- **Source LOC**: ~6,000 lines of Astro/TS + ~8 MB of JSON content
- **Adding a new calc**: ~30 minutes (30 min writing the JSON + formula, 0 min templating)

## When this approach breaks down

- **Highly variable layouts**: if each calc needs a dramatically different UI (3D visualizations, custom interactions), one template doesn't cut it.
- **Heavy client-side state**: works for stateless calculators. Not for something like a multi-step tax filer with progress persistence.
- **Extreme i18n**: I have Spanish + English; adding 20 languages would require a different architecture (content per locale per calc).

For typical calculators, though — input → formula → output → explanation — this pattern scales to thousands of pages without codebase bloat.

## Source

Repo: [grblasquiz/hacecuentas](https://github.com/grblasquiz/hacecuentas)
Live: [hacecuentas.com](https://hacecuentas.com)

Happy to answer questions about the architecture or share specific JSON/formula examples.
