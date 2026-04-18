---
title: "Fetching real-time data at build time for a static site (and why it still works)"
published: false
description: How I expose live BCRA, INDEC, and market data on a static Astro site without going serverless.
tags: astro, staticsite, webdev, seo
cover_image: https://hacecuentas.com/og-default.png
canonical_url: https://hacecuentas.com/blog/build-time-data-fetching
---

"Static site" usually means "content doesn't change." But what if I want my static site to show today's exchange rate, this month's inflation, and current interest rates — without a backend?

On [Hacé Cuentas](https://hacecuentas.com) there's a [page with live financial values](https://hacecuentas.com/valores-bcra) (Argentine dollar quotes, inflation, UVA index, bank rates). It feels dynamic. It's not.

Here's the architecture.

## Build-time fetching

Astro supports top-level `await` in page frontmatter. At build time, Node fetches external APIs and bakes the result into the HTML:

```astro
---
// src/pages/valores-bcra.astro
async function safeFetch(url, fallback) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'hacecuentas.com/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return fallback;
    return await r.json();
  } catch {
    return fallback;
  }
}

const dolares = await safeFetch('https://dolarapi.com/v1/dolares', []);
const inflacion = await safeFetch(
  'https://api.argentinadatos.com/v1/finanzas/indices/inflacion', []
);
const uva = await safeFetch(
  'https://api.argentinadatos.com/v1/finanzas/indices/uva', []
);
---

<div>
  {dolares.map(d => (
    <div class="card">
      <span>{d.nombre}</span>
      <strong>${d.venta}</strong>
    </div>
  ))}
</div>
```

That's the entire pattern. The HTML is generated at `npm run build`, containing the fetched values inline. Ship to Cloudflare Pages. Done.

## How it stays fresh

The magic: **trigger a rebuild on a schedule.** Cloudflare Pages has no built-in cron, but there are 3 easy options:

### Option A: GitHub Actions scheduled rebuild

```yaml
# .github/workflows/rebuild.yml
on:
  schedule:
    - cron: '0 6,12,18 * * *'  # 6am, 12pm, 6pm UTC
  workflow_dispatch:

jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist --project-name hacecuentas
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

### Option B: Cloudflare Workers Cron Trigger

A tiny worker that hits the Pages deploy webhook every N hours.

### Option C: Vercel / Netlify on-demand revalidation

If you're on those, they have native support. Cloudflare doesn't, but webhooks work.

## Why not client-side fetch?

You _could_ fetch `dolarapi.com` from the browser on page load. Reasons I don't:

1. **CORS**. Many public APIs don't set permissive CORS headers. Even when they do, you're dependent on their uptime.
2. **SEO**. Google crawls and indexes my page. If the values are baked into HTML, Google sees them. If I fetch client-side, Google might see empty placeholders.
3. **Latency**. Static HTML loads in 150ms from Cloudflare edge. Client-side fetch adds 500-2000ms on top.
4. **Reliability**. If the external API is down, my static page still shows the last known values (from the last build). A client-side fetch would show "error".

## The tradeoff: staleness

My data is fresh at build time. If I build 3x a day, my worst case is 8-hour-old dollar quotes. For most calculators (inflation, UVA, bank rates), this is fine — those move slowly.

For things that _do_ move fast (intraday dollar blue), I show the timestamp prominently: "Actualizado al 16/04/2026". Users know it's not realtime, and that's honest.

## Safe fetch pattern

Always wrap external fetches in try/catch with timeout:

```ts
async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'hacecuentas.com/1.0' },
      signal: AbortSignal.timeout(8000),  // 8s max
    });
    if (!r.ok) return fallback;
    return await r.json() as T;
  } catch {
    return fallback;
  }
}
```

**Never let an external API failure break your build.** If `dolarapi.com` is down at build time, your fallback is an empty array — the page still renders, just with "—" placeholders. Build succeeds. Deploy succeeds. Users see the last successful deploy.

## Generalizing

This pattern works for any "semi-dynamic" data:

- Exchange rates
- Weather forecasts
- Stock prices (end-of-day)
- Sport scores (after-game)
- Inflation / economic indices
- Content from CMS (Contentful, Sanity, etc.)
- Anything where "stale by hours" is acceptable

It does **not** work for:

- True realtime (chat, stock tickers mid-day, live auction)
- User-specific data (logged in state, personalized)
- High-frequency updates (< 1 hour)

## What I ship

My `/valores-bcra` page:

- Fetches 4 external APIs at build time
- Renders 7 dollar cards, 3 inflation metrics, 7 bank TNA values
- All static HTML — no JS required to see the data
- Builds in ~4 seconds including all fetches
- Rebuilds 2-3x daily via GitHub Actions
- Shows timestamp so users know when data was updated

Full source (MIT): [grblasquiz/hacecuentas](https://github.com/grblasquiz/hacecuentas) — see `src/pages/valores-bcra.astro`.

Live: [hacecuentas.com/valores-bcra](https://hacecuentas.com/valores-bcra)

---

**TL;DR**: you don't need a backend for dynamic-feeling data. Fetch at build time, rebuild on a schedule, wrap everything in `safeFetch` with a sensible fallback. Your static site gets the SEO, speed, and reliability benefits without sacrificing freshness.
