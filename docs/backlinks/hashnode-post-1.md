---
title: "Lessons from shipping 1,200+ static pages on Cloudflare Pages"
subtitle: "Cache, deploy speed, and gotchas you'll hit past 500 pages"
tags: webdev, cloudflare, astro, seo
canonical_url: https://hacecuentas.com/blog/cloudflare-pages-1200-lessons
---

[Hacé Cuentas](https://hacecuentas.com) is 1,236 static pages built with Astro, hosted on Cloudflare Pages. Started with 10 pages. Scaled to 1,200+.

Most "scale your static site" tutorials stop at 100 pages. Past 500, real problems start.

Here are 5 lessons I wish I'd known sooner.

## 1. Cloudflare edge cache fights you on 404s

Default behavior: CF edge caches HTML aggressively. When I deployed a new page, the URL would show 404 for up to 24 hours because the edge had cached an earlier "not found" response.

**Fix**: add `public/_headers` with explicit no-cache for HTML:

```
/*
  CDN-Cache-Control: no-store

/*.html
  CDN-Cache-Control: no-store
```

Static assets (CSS, JS, images) still get the default long cache. Only HTML is never cached at edge. Users hit origin (Cloudflare Pages) every request, but Pages is fast enough that latency is still great (~50ms from Buenos Aires).

## 2. Query params don't bypass CF cache

I tried `?v=123` to bust cache. Doesn't work at edge. CF normalizes query params and serves the same cached response.

The only reliable cache busters:

- Different URL path (`/page-v2`)
- Cache purge via API:
  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \\
    -H "Authorization: Bearer $CF_API_TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{"purge_everything":true}'
  ```
- The `_headers` no-store approach (above)

## 3. Serverless API routes don't work on Pages (easily)

If you want `/api/foo.ts` on Cloudflare Pages, you need Pages Functions, which has its own runtime quirks. For my use case (static HTML with scheduled data fetching), I moved everything to **build-time fetches**:

```astro
---
const data = await fetch('https://api.example.com').then(r => r.json());
---
<div>{data.value}</div>
```

Rebuild triggered by GitHub Actions on cron. Data gets as fresh as my rebuild frequency (3x daily in my case).

## 4. Sitemap generation past 500 URLs

Astro's default sitemap plugin handles big sitemaps fine, but:

- Keep it under 50k URLs per file (sitemap protocol limit)
- For 1,000+ pages, **manually split** by type (`sitemap-calcs.xml`, `sitemap-blog.xml`, `sitemap-main.xml`)
- Reference them from a sitemap index
- Submit index to Search Console, Bing, Yandex

Google indexes much faster when you submit a proper index vs one giant sitemap.

## 5. Content collections don't scale linearly

Astro's content collections (`import.meta.glob`) are fast, but past ~1,000 JSON files, you'll notice:

- Cold build time jumps (2s → 8s)
- Dev server HMR gets slower
- Memory usage spikes

Mitigations:

- **Prebuild cache**: script that processes JSON into an optimized format once, reads from cache otherwise
- **Lazy import**: don't load all calcs eagerly on every page; only load what each page needs
- **Lean JSON**: trim fields you don't use in the collection schema

For my use case (1,200 calcs × 5-10KB each = ~8MB of JSON), build time is 4 seconds on Cloudflare. Acceptable. If I hit 5,000 calcs, I'll need to restructure.

## Build time vs deploy time

My current numbers:

- Local build: 4.1s
- Cloudflare Pages full deploy: ~2 minutes (upload + CDN propagation)
- Incremental deploy via wrangler: ~40s

The 2min includes cache invalidation at edge. Under 5 minutes total from commit to live.

## Worth it vs. Next.js / Vercel?

I love Cloudflare for:

- Free tier is actually generous (500 builds/mo, unlimited bandwidth)
- Edge is physically closer to Argentina than Vercel
- CF Workers integration if I need serverless later
- No vendor lock-in (pure static HTML, portable anywhere)

I miss:

- Vercel's On-Demand Revalidation (cleaner than cron-rebuild)
- Next.js's Route Groups (Astro's `[...slug]` works but feels hackier)
- Vercel Analytics built-in

For my use case — SEO-driven static site with semi-dynamic data — Cloudflare Pages wins.

## Full repo

[grblasquiz/hacecuentas](https://github.com/grblasquiz/hacecuentas) — MIT licensed. If you're shipping a big static site on Cloudflare, clone it and steal patterns.

Live: [hacecuentas.com](https://hacecuentas.com) — 1,236 static pages, all on CF Pages.
