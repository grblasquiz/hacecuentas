---
title: "How I stopped Google from wasting crawl budget on a 2,500-page static site"
published: false
description: Computing per-URL lastmod from real content mtime instead of build time, so the sitemap only changes when the content actually changes.
tags: seo, webdev, astro, cloudflare
cover_image: https://hacecuentas.com/og-default.png
---

I run [Hacé Cuentas](https://hacecuentas.com), a free set of 2,500+ Spanish-language calculators deployed on Cloudflare Pages. For months I had a subtle but expensive bug: **every deploy told Google that all 2,500 URLs had changed** — even when I'd only touched three of them.

Here's what was happening and how I fixed it.

## The naive sitemap

The first version of my sitemap generator did the obvious thing:

```ts
// DON'T do this
const lastmod = new Date().toISOString().split('T')[0]; // today
```

Every page got `lastmod = today` on every build. I deploy several times a day. So Googlebot kept re-crawling thousands of unchanged pages, burning crawl budget that should have gone to the handful of pages I actually updated — or to discovering new ones.

On a small site nobody notices. On a few thousand URLs with a young domain (mine is months old, still earning trust), crawl budget is a real constraint. You want every crawl to land on something that genuinely changed.

## The fix: lastmod from content, not from the clock

Each calculator is a JSON file in an Astro content collection. The real "last modified" signal isn't the build — it's whichever of these moved most recently:

```ts
import { statSync } from 'node:fs';

function lastmodFor(calc, jsonPath) {
  const candidates = [
    calc.lastReviewed,                 // manual editorial review date
    calc.dataUpdate?.lastUpdated,      // data refresh (rates, tax tables)
    statSync(jsonPath).mtime,          // filesystem mtime of the JSON
  ].filter(Boolean).map((d) => new Date(d).getTime());

  return new Date(Math.max(...candidates)).toISOString().split('T')[0];
}
```

`max(lastReviewed, dataUpdated, file mtime)`. Now `lastmod` only advances when the content actually changes. Edit one calc's JSON → only that URL's `lastmod` moves. Touch global CSS → **no** `lastmod` moves, because no content JSON changed. That's exactly the signal you want Google to see.

## The gotcha that bit me

There's a trap here. If you change the **formula** (a separate `.ts` module) but not the **content JSON**, the JSON mtime doesn't move — so the sitemap stays silent and Google never learns the page changed.

I now treat it as a rule: **if the logic or UX of a page changes, bump the content file too** (even just a `lastReviewed` date). The freshness signal lives in the content file's mtime, so the content file has to be the thing that moves.

## A second guard: same-day churn cap

Even with content-based `lastmod`, a big batch edit (say I improve 400 pages in one session) would still flip 400 `lastmod`s to the same day. That can look like churn. So the generator caps how many URLs are allowed to share a brand-new same-day `lastmod` in a single deploy — beyond the cap, older real dates are kept. It smooths the signal so a content sweep doesn't read as "the whole site changed at once."

## Did it work?

Two things improved:

1. **Crawl distribution.** Instead of re-fetching everything, crawlers spend more of their budget on pages that changed and on newly-added ones.
2. **Sanity.** I can now deploy cosmetic changes (CSS, a component refactor) as often as I want without touching the sitemap at all. The sitemap is a content-truth signal, decoupled from deploy frequency.

The deploy-frequency myth is worth killing too: deploying often does **not** hurt SEO. What hurts is lying to Google about what changed. Fix the `lastmod` source of truth and you can ship 10× a day guilt-free.

## Takeaways

- Don't derive `lastmod` from build time. Derive it from content.
- `max(reviewDate, dataDate, fileMtime)` is a good, cheap heuristic.
- Make sure *every* meaningful change moves the content file, or the signal lies in the other direction.
- Cap same-day churn so big batches don't look like a site-wide rewrite.

If you want to see the output, the [live sitemap](https://hacecuentas.com/sitemap.xml) and any [calculator page](https://hacecuentas.com) are public. Repo: [grblasquiz/hacecuentas](https://github.com/grblasquiz/hacecuentas).

Happy to compare notes if you've fought crawl budget on a large static site.
