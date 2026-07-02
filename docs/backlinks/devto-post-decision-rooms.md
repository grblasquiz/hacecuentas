---
title: "Beyond single-purpose calculators: orchestrating multiple formulas into one 'decision room'"
published: false
description: How we compose existing calculator formulas into decision tools that output a verdict instead of a number — architecture, TypeScript patterns, and SEO reasoning.
tags: typescript, astro, webdev, architecture
cover_image: https://hacecuentas.com/og-default.png
---

A calculator answers "how much?". But users rarely stop there — the real question is "**should I?**". Should I take this job offer? Should I prepay my loan or invest the money? Rent or buy?

At [Hacé Cuentas](https://hacecuentas.com) we have thousands of single-purpose calculators (net salary, loan installment, fixed-term deposit yield…). Each one is a pure function: inputs → number. This post is about the layer we built on top: **decision rooms** — pages that run several of those formulas against one shared set of inputs and output a *verdict*, not a number. Example: [¿Me conviene aceptar esta oferta laboral?](https://hacecuentas.com/decidir/aceptar-oferta-laboral) runs net-salary, income-tax, commute-cost and hourly-value formulas internally, then tells you how much a job offer *really* improves your income and the minimum you should negotiate.

## Why not just link the calculators together?

We tried. A "related calculators" rail forces the user to be the orchestrator: carry the output of calc A into calc B, remember intermediate numbers, and do the final comparison in their head. Completion rates were poor — people came with a decision anxiety, not a spreadsheet mindset.

The insight: **the decision defines the data model, not the formulas**. If someone is deciding between prepaying a loan vs investing, the natural inputs are "outstanding balance, rate, spare cash, alternative yield" — and *both* formulas should consume that single form.

## The architecture

Each room is a plain TypeScript module — no DOM, no framework imports:

```ts
export const room: DecisionRoom = {
  slug: 'me-conviene-adelantar-cuotas',
  h1: '¿Me conviene adelantar cuotas de mi préstamo?',
  fields: [ /* shared input schema */ ],
  compute(inputs): DecisionResult {
    // runs N formulas internally, compares effective rates
    return {
      status: 'a' | 'b' | 'tie' | 'insufficient',
      verdict: { badge, title, detail },   // the human answer
      decisiveNumber: { label, value },    // THE number that tips it
      scenarios: [ /* side-by-side breakdown */ ],
    };
  },
  componentCalcs: [ /* the single-purpose calcs it reuses */ ],
};
```

Design decisions that paid off:

1. **`compute()` returns a discriminated status, not a float.** The UI renders a verdict block (green/amber/red) from `status` + `verdict`. `'insufficient'` is a first-class outcome — with partial inputs you get "we need X to conclude", never a misleading number.

2. **Rooms are data for the build, functions for the client.** Because modules are DOM-free, the same file feeds the static site generator (sitemap, manifest, structured data at build time) *and* ships to the browser for live recomputation. One source of truth, zero hydration mismatch.

3. **A generated manifest keeps the build cheap.** A prebuild script imports every room, *verifies* `compute(example)` and `compute({})` don't throw, checks contract rules (FAQ ≥ 7, fields non-empty) and emits a flat-data manifest. The sitemap and hub pages import the manifest, never the rooms — so build tooling doesn't drag in formula code.

4. **The reverse map is where internal linking comes from.** Each room declares its `componentCalcs`. Inverting that relation at build time gives every calculator page a contextual "are you making this decision?" link to the rooms that use it. Hundreds of deep links, zero manual curation, and it can't go stale — it's derived from the same declaration that powers the math.

## The SEO angle (why a third content class)

Search intent comes in flavors: transactional ("calculate X"), informational ("what is X"), and **decisional** ("should I X or Y"). Mixing them on one page cannibalizes rankings. So rooms live in their own namespace (`/decidir/*`), never use "calculator" as the primary title, and link down to their component calcs. Decision queries are also exactly what LLM assistants get asked — a page that states a question, a framework, and a numeric verdict with cited sources is highly quotable by ChatGPT/Perplexity, which is becoming a real traffic channel.

## Results shape

A room page ends up with: shared form → verdict block → decisive number → scenario table → "how it works" (numbered methodology, which doubles as HowTo schema) → FAQ (FAQPage schema) → links to component calculators. All static HTML at the edge; the JS only re-runs `compute()` on input.

If you maintain a fleet of small pure functions, consider what "orchestration pages" would look like in your domain — the marginal cost is low (you already own the formulas) and it answers the question users actually have.

Questions about the TypeScript patterns or the build pipeline? Happy to go deeper in the comments.
