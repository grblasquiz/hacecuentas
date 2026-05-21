#!/usr/bin/env node
// Daily audit de hacecuentas.com.ar — disparado por .github/workflows/daily-audit.yml
// Output: audits/YYYY-MM-DD.md + audits/.cache/summary.json
// Sin dependencias externas — solo Node 22+ built-ins.

import { writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://hacecuentas.com';
const TODAY = new Date().toISOString().slice(0, 10);
const DAY_SEED = Math.floor(Date.now() / 86_400_000);
const REPORT_PATH = `audits/${TODAY}.md`;
const SUMMARY_PATH = `audits/.cache/summary.json`;
const TIMEOUT_MS = 12_000;
const MAX_CONCURRENCY = 8;

const FIXED_PATHS = [
  '/', '/blog', '/glosario', '/about/',
  '/politica-editorial', '/sitemap.xml',
];

function seededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function pool(tasks, concurrency = MAX_CONCURRENCY) {
  const out = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      try { out[i] = await tasks[i](); }
      catch (e) { out[i] = { error: e.message }; }
    }
  };
  await Promise.all(Array(Math.min(concurrency, tasks.length)).fill(0).map(worker));
  return out;
}

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout || TIMEOUT_MS);
  try {
    const start = Date.now();
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'hacecuentas-daily-audit/1.0 (+github.com/grblasquiz/hacecuentas)' },
      ...opts,
      signal: ctrl.signal,
    });
    return { res, ttfb: Date.now() - start };
  } finally {
    clearTimeout(t);
  }
}

async function getAllUrls() {
  const urls = new Set();
  try {
    const { res } = await fetchWithTimeout(`${SITE}/sitemap.xml`);
    const xml = await res.text();
    const sitemapLocs = [...xml.matchAll(/<sitemap[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    if (sitemapLocs.length > 0) {
      const children = sitemapLocs.slice(0, 40);
      const childTasks = children.map(c => async () => {
        try {
          const { res: r } = await fetchWithTimeout(c);
          const x = await r.text();
          return [...x.matchAll(/<url[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        } catch { return []; }
      });
      const childResults = await pool(childTasks, 4);
      for (const list of childResults) (list || []).forEach(u => urls.add(u));
    } else {
      [...xml.matchAll(/<url[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].forEach(m => urls.add(m[1]));
    }
  } catch (e) {
    console.error('Sitemap fetch failed:', e.message);
  }
  return [...urls];
}

function selectSample(allUrls, seed) {
  const rand = seededRandom(seed);
  const fixed = FIXED_PATHS.map(p => `${SITE}${p}`);

  const blog = allUrls.filter(u => /\/blog\//.test(u));
  const glosario = allUrls.filter(u => /\/glosario\//.test(u));
  const categorias = allUrls.filter(u => /\/categoria\//.test(u));
  const i18n = allUrls.filter(u => /\/(en|pt|mx)\//.test(u) && !/\/(blog|glosario|categoria)\//.test(u));
  const calcs = allUrls.filter(u =>
    !blog.includes(u) && !glosario.includes(u) && !categorias.includes(u) && !i18n.includes(u)
    && !FIXED_PATHS.some(p => u === `${SITE}${p}` || u === `${SITE}${p}/`)
    && !u.endsWith('.xml')
  );

  const sample = [
    ...fixed,
    ...shuffle(calcs, rand).slice(0, 28),
    ...shuffle(blog, rand).slice(0, 5),
    ...shuffle(glosario, rand).slice(0, 5),
    ...shuffle(categorias, rand).slice(0, 4),
    ...shuffle(i18n, rand).slice(0, 2),
  ];

  return [...new Set(sample)].slice(0, 55);
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    const { res, ttfb } = await fetchWithTimeout(url);
    const buf = await res.arrayBuffer();
    return {
      url,
      status: res.status,
      ttfb,
      total: Date.now() - start,
      size: buf.byteLength,
      contentType: res.headers.get('content-type') || '',
      redirectLocation: res.status >= 300 && res.status < 400 ? res.headers.get('location') : null,
    };
  } catch (e) {
    return { url, error: e.message };
  }
}

function extractTag(html, tag) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
}

function extractMeta(html, name) {
  const re1 = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i');
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return m?.[1] ?? null;
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  return blocks.map(b => {
    try { return { valid: true, data: JSON.parse(b.trim()) }; }
    catch (e) { return { valid: false, error: e.message, snippet: b.slice(0, 120) }; }
  });
}

async function seoCheck(url) {
  try {
    const { res } = await fetchWithTimeout(url);
    if (res.status !== 200) return { url, status: res.status, skip: true, issues: [] };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return { url, status: res.status, contentType: ct, skip: true, issues: [] };
    const html = await res.text();

    const title = extractTag(html, 'title');
    const desc = extractMeta(html, 'description');
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    const canonical = extractCanonical(html);
    const robots = extractMeta(html, 'robots');
    const ogTitle = extractMeta(html, 'og:title');
    const ogImage = extractMeta(html, 'og:image');
    const ogUrl = extractMeta(html, 'og:url');
    const jsonLd = extractJsonLd(html);

    const issues = [];

    if (!title) issues.push({ severity: 'high', msg: 'title vacío' });
    else if (title.length < 25) issues.push({ severity: 'low', msg: `title corto (${title.length} chars)` });
    else if (title.length > 70) issues.push({ severity: 'low', msg: `title largo (${title.length} chars)` });

    if (!desc) issues.push({ severity: 'high', msg: 'meta description vacío' });
    else if (desc.length < 80) issues.push({ severity: 'low', msg: `desc corto (${desc.length} chars)` });
    else if (desc.length > 180) issues.push({ severity: 'low', msg: `desc largo (${desc.length} chars)` });

    if (h1s.length === 0) issues.push({ severity: 'high', msg: 'sin H1' });
    else if (h1s.length > 1) issues.push({ severity: 'medium', msg: `múltiples H1 (${h1s.length})` });

    if (!canonical) issues.push({ severity: 'medium', msg: 'sin canonical' });
    else if (canonical.endsWith('.html')) issues.push({ severity: 'high', msg: 'canonical con .html (bug Astro SSG)' });

    if (robots && /noindex/i.test(robots)) issues.push({ severity: 'info', msg: 'noindex (verificar intencional)' });

    if (!ogTitle) issues.push({ severity: 'low', msg: 'sin og:title' });
    if (!ogImage) issues.push({ severity: 'low', msg: 'sin og:image' });
    if (ogUrl?.endsWith('.html')) issues.push({ severity: 'high', msg: 'og:url con .html' });

    for (const ld of jsonLd) {
      if (!ld.valid) issues.push({ severity: 'high', msg: `JSON-LD inválido: ${ld.error}` });
    }
    if (jsonLd.some(ld => ld.valid && /MathSolver/.test(JSON.stringify(ld.data)))) {
      issues.push({ severity: 'high', msg: 'schema MathSolver presente (prohibido)' });
    }

    if (title && /\bnavidad\b/.test(title)) issues.push({ severity: 'medium', msg: 'title con "navidad" minúscula' });
    if (desc && /\bnavidad\b/.test(desc)) issues.push({ severity: 'medium', msg: 'desc con "navidad" minúscula' });

    return { url, title, desc, h1s, canonical, robots, ogTitle, ogImage, ogUrl, jsonLdCount: jsonLd.length, issues };
  } catch (e) {
    return { url, error: e.message, issues: [{ severity: 'high', msg: `fetch falló: ${e.message}` }] };
  }
}

function extractInternalLinks(html) {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  const internal = hrefs.filter(h => h.startsWith('/') && !h.startsWith('//'));
  return [...new Set(internal.map(h => h.split('#')[0].split('?')[0]))]
    .filter(p => p && !/\.(png|jpg|jpeg|svg|gif|webp|pdf|ico|css|js|xml|json|txt|ics|woff2?)$/i.test(p))
    .map(p => `${SITE}${p}`);
}

async function checkLinks(urls) {
  const tasks = urls.map(u => async () => {
    try {
      const { res } = await fetchWithTimeout(u, { method: 'HEAD' });
      return { url: u, status: res.status };
    } catch (e) {
      return { url: u, error: e.message };
    }
  });
  return pool(tasks, MAX_CONCURRENCY);
}

function checkTitleUniqueness(seoResults) {
  const titles = new Map();
  for (const r of seoResults) {
    if (!r.title) continue;
    const list = titles.get(r.title) ?? [];
    list.push(r.url);
    titles.set(r.title, list);
  }
  return [...titles.entries()].filter(([, urls]) => urls.length > 1).map(([title, urls]) => ({ title, urls }));
}

function generateReport({ sample, techResults, seoResults, linkResults, titleDuplicates, sitemapSize, runDuration }) {
  const lines = [];
  lines.push(`# Audit hacecuentas — ${TODAY}`, '');

  const errors = techResults.filter(r => r.error || (r.status >= 400 && r.status < 600));
  const slow = techResults.filter(r => !r.error && r.ttfb > 1500);
  const heavy = techResults.filter(r => !r.error && r.size > 500_000 && !r.url.includes('sitemap'));
  const seoHigh = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'high').map(i => ({ url: r.url, ...i })));
  const seoMed = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'medium').map(i => ({ url: r.url, ...i })));
  const seoLow = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'low').map(i => ({ url: r.url, ...i })));
  const brokenLinks = linkResults.filter(r => r.status >= 400 && r.status < 600);

  const blockerCount = errors.length + seoHigh.length + brokenLinks.length;
  const warnCount = slow.length + heavy.length + seoMed.length + titleDuplicates.length;
  const okCount = Math.max(0, techResults.length - errors.length - slow.length);

  lines.push(`**Resumen**: 🔴 ${blockerCount} bloqueantes · 🟡 ${warnCount} warnings · 🟢 ${okCount} OK · ⏱ ${runDuration}s wall-clock`, '');

  lines.push('## 🔴 Bloqueantes (revisar HOY)', '');
  if (blockerCount === 0) {
    lines.push('Sin bloqueantes ✅', '');
  } else {
    if (errors.length) {
      lines.push('### HTTP errors / no responde');
      for (const e of errors) lines.push(`- ${e.url} — ${e.error ? `❌ ${e.error}` : `HTTP ${e.status}`}`);
      lines.push('');
    }
    if (seoHigh.length) {
      lines.push('### SEO high severity');
      for (const s of seoHigh) lines.push(`- ${s.url} — ${s.msg}`);
      lines.push('');
    }
    if (brokenLinks.length) {
      lines.push(`### Links internos rotos (${brokenLinks.length})`);
      for (const l of brokenLinks.slice(0, 20)) lines.push(`- ${l.url} — HTTP ${l.status}`);
      if (brokenLinks.length > 20) lines.push(`- ...y ${brokenLinks.length - 20} más`);
      lines.push('');
    }
  }
  lines.push('');

  lines.push('## 🟡 Warnings (esta semana)', '');
  let hasWarns = false;
  if (slow.length) {
    hasWarns = true;
    lines.push('### Performance — TTFB > 1.5s');
    for (const s of slow.slice(0, 10)) lines.push(`- ${s.url} — TTFB ${s.ttfb}ms · ${(s.size / 1024).toFixed(0)}KB`);
    lines.push('');
  }
  if (heavy.length) {
    hasWarns = true;
    lines.push('### Páginas pesadas (>500KB)');
    for (const h of heavy.slice(0, 10)) lines.push(`- ${h.url} — ${(h.size / 1024).toFixed(0)}KB`);
    lines.push('');
  }
  if (seoMed.length) {
    hasWarns = true;
    lines.push(`### SEO medium (${seoMed.length})`);
    for (const s of seoMed.slice(0, 20)) lines.push(`- ${s.url} — ${s.msg}`);
    if (seoMed.length > 20) lines.push(`- ...y ${seoMed.length - 20} más`);
    lines.push('');
  }
  if (titleDuplicates.length) {
    hasWarns = true;
    lines.push('### Títulos duplicados en el sample');
    for (const d of titleDuplicates.slice(0, 8)) {
      lines.push(`- "${d.title.slice(0, 60)}${d.title.length > 60 ? '…' : ''}"`);
      for (const u of d.urls) lines.push(`  - ${u}`);
    }
    lines.push('');
  }
  if (!hasWarns) lines.push('Sin warnings ✅', '');

  lines.push('## 📊 Performance', '', 'Top 5 más lentas:', '', '| URL | HTTP | TTFB | Total | Tamaño |', '|---|---|---|---|---|');
  const slowest = [...techResults].filter(r => !r.error).sort((a, b) => b.ttfb - a.ttfb).slice(0, 5);
  for (const r of slowest) {
    const path = r.url.replace(SITE, '') || '/';
    lines.push(`| \`${path}\` | ${r.status} | ${r.ttfb}ms | ${r.total}ms | ${(r.size / 1024).toFixed(0)}KB |`);
  }
  lines.push('');

  const avgTtfb = Math.round(techResults.filter(r => !r.error).reduce((a, r) => a + r.ttfb, 0) / Math.max(1, techResults.filter(r => !r.error).length));
  lines.push(`TTFB promedio: ${avgTtfb}ms · ${techResults.filter(r => !r.error).length} URLs respondieron OK`, '');

  if (seoLow.length) {
    lines.push('## ℹ️ SEO low / nice to have', '', `<details><summary>${seoLow.length} items</summary>`, '');
    for (const s of seoLow) lines.push(`- ${s.url} — ${s.msg}`);
    lines.push('', '</details>', '');
  }

  lines.push('## 📋 URLs auditadas hoy', '', `<details><summary>${sample.length} URLs</summary>`, '');
  for (const u of sample) lines.push(`- ${u}`);
  lines.push('', '</details>', '');

  lines.push('---', '');
  lines.push(`🤖 Generado por \`.github/workflows/daily-audit.yml\` · sitemap: ${sitemapSize} URLs totales · seed ${DAY_SEED}`);

  return lines.join('\n');
}

async function main() {
  const startTime = Date.now();
  console.log(`Daily audit ${TODAY} starting...`);

  const allUrls = await getAllUrls();
  console.log(`Sitemap: ${allUrls.length} URLs`);
  if (allUrls.length === 0) throw new Error('Sitemap vacío o no accesible');

  const sample = selectSample(allUrls, DAY_SEED);
  console.log(`Sample: ${sample.length} URLs`);

  console.log('Technical checks...');
  const techResults = await pool(sample.map(u => () => checkUrl(u)));

  console.log('SEO checks (15 URLs)...');
  const seoResults = await pool(sample.slice(0, 15).map(u => () => seoCheck(u)));
  const titleDuplicates = checkTitleUniqueness(seoResults);

  console.log('Internal links check...');
  const links = new Set();
  for (const path of ['/', '/calcs/', '/categorias/']) {
    try {
      const { res } = await fetchWithTimeout(`${SITE}${path}`);
      if (res.status === 200) extractInternalLinks(await res.text()).forEach(l => links.add(l));
    } catch (e) {
      console.error(`Link extraction failed for ${path}:`, e.message);
    }
  }
  const linkSample = [...links].slice(0, 120);
  const linkResults = await checkLinks(linkSample);

  const runDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const report = generateReport({ sample, techResults, seoResults, linkResults, titleDuplicates, sitemapSize: allUrls.length, runDuration });

  const errors = techResults.filter(r => r.error || (r.status >= 400 && r.status < 600));
  const seoHigh = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'high'));
  const seoMed = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'medium'));
  const brokenLinks = linkResults.filter(r => r.status >= 400 && r.status < 600);
  const slow = techResults.filter(r => !r.error && r.ttfb > 1500);

  const blockerCount = errors.length + seoHigh.length + brokenLinks.length;
  const warnCount = slow.length + seoMed.length + titleDuplicates.length;
  const okCount = Math.max(0, techResults.length - errors.length);

  const topIssues = [];
  if (errors.length) topIssues.push(`${errors.length} URLs con HTTP error`);
  if (seoHigh.length) topIssues.push(`${seoHigh.length} SEO high-severity`);
  if (brokenLinks.length) topIssues.push(`${brokenLinks.length} links internos rotos`);
  if (slow.length) topIssues.push(`${slow.length} URLs lentas (TTFB > 1.5s)`);
  if (titleDuplicates.length) topIssues.push(`${titleDuplicates.length} títulos duplicados`);

  const summary = {
    date: TODAY,
    blockerCount, warnCount, okCount,
    sampleSize: sample.length,
    sitemapSize: allUrls.length,
    topIssues,
    runDuration: Number(runDuration),
    generatedAt: new Date().toISOString(),
  };

  mkdirSync('audits/.cache', { recursive: true });
  writeFileSync(REPORT_PATH, report);
  writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2));

  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Summary: ${blockerCount} blockers, ${warnCount} warnings, ${okCount} OK · ${runDuration}s`);
}

main().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
