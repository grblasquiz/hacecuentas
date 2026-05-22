#!/usr/bin/env node
// One-off: audit 150 URLs nuevas (que no estan en audits/*.md previos).
// Reusa la logica del daily-audit pero filtra URLs ya cubiertas.

import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://hacecuentas.com';
const SAMPLE_SIZE = 150;
const TODAY = new Date().toISOString().slice(0, 10);
const SEED = Math.floor(Date.now() / 1000);
const REPORT_PATH = `audits/${TODAY}_extra-${SAMPLE_SIZE}.md`;
const TIMEOUT_MS = 12_000;
const MAX_CONCURRENCY = 8;
const SEO_DEEP_LIMIT = 40;

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
      headers: { 'user-agent': 'hacecuentas-audit-fresh/1.0' },
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
  const { res } = await fetchWithTimeout(`${SITE}/sitemap.xml`);
  const xml = await res.text();
  const sitemapLocs = [...xml.matchAll(/<sitemap[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (sitemapLocs.length > 0) {
    const tasks = sitemapLocs.slice(0, 40).map(c => async () => {
      try {
        const { res: r } = await fetchWithTimeout(c);
        const x = await r.text();
        return [...x.matchAll(/<url[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
      } catch { return []; }
    });
    const results = await pool(tasks, 4);
    for (const list of results) (list || []).forEach(u => urls.add(u));
  } else {
    [...xml.matchAll(/<url[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>/g)].forEach(m => urls.add(m[1]));
  }
  return [...urls];
}

function getAlreadyAudited() {
  const audited = new Set();
  for (const f of readdirSync('audits')) {
    if (!f.endsWith('.md') || f === 'README.md') continue;
    const content = readFileSync(join('audits', f), 'utf8');
    for (const m of content.matchAll(/https:\/\/hacecuentas\.com[^\s)<]*/g)) {
      audited.add(m[0].replace(/[.,)]$/, ''));
    }
  }
  return audited;
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
      size: Number(res.headers.get('content-length')) || buf.byteLength,
      decodedSize: buf.byteLength,
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

async function seoCheck(url) {
  try {
    const { res } = await fetchWithTimeout(url);
    if (res.status !== 200) return { url, status: res.status, skip: true, issues: [] };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return { url, status: res.status, skip: true, issues: [] };
    const html = await res.text();

    const title = extractTag(html, 'title');
    const desc = extractMeta(html, 'description');
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    const canonical = extractCanonical(html);
    const ogImage = extractMeta(html, 'og:image');
    const jsonLdBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);

    const issues = [];
    if (!title) issues.push({ severity: 'high', msg: 'title vacío' });
    else if (title.length > 70) issues.push({ severity: 'low', msg: `title largo (${title.length} chars)` });
    else if (title.length < 25) issues.push({ severity: 'low', msg: `title corto (${title.length} chars)` });

    if (!desc) issues.push({ severity: 'high', msg: 'meta description vacío' });
    else if (desc.length > 180) issues.push({ severity: 'low', msg: `desc largo (${desc.length} chars)` });
    else if (desc.length < 80) issues.push({ severity: 'low', msg: `desc corto (${desc.length} chars)` });

    if (h1s.length === 0) issues.push({ severity: 'high', msg: 'sin H1' });
    else if (h1s.length > 1) issues.push({ severity: 'medium', msg: `múltiples H1 (${h1s.length})` });

    if (!canonical) issues.push({ severity: 'medium', msg: 'sin canonical' });
    else if (canonical.endsWith('.html')) issues.push({ severity: 'high', msg: 'canonical con .html' });
    if (!ogImage) issues.push({ severity: 'low', msg: 'sin og:image' });

    for (const b of jsonLdBlocks) {
      try { JSON.parse(b.trim()); }
      catch (e) { issues.push({ severity: 'high', msg: `JSON-LD inválido: ${e.message.slice(0, 60)}` }); }
    }
    if (jsonLdBlocks.some(b => /MathSolver/.test(b))) {
      issues.push({ severity: 'high', msg: 'schema MathSolver presente (prohibido)' });
    }

    if (title && /\bnavidad\b/.test(title)) issues.push({ severity: 'medium', msg: 'title con "navidad" minúscula' });
    if (desc && /\bnavidad\b/.test(desc)) issues.push({ severity: 'medium', msg: 'desc con "navidad" minúscula' });

    return { url, title, desc, canonical, issues };
  } catch (e) {
    return { url, error: e.message, issues: [{ severity: 'high', msg: `fetch falló: ${e.message}` }] };
  }
}

function selectFreshSample(allUrls, audited, seed) {
  const fresh = allUrls.filter(u => !audited.has(u));
  const rand = seededRandom(seed);
  return shuffle(fresh, rand).slice(0, SAMPLE_SIZE);
}

function generateReport({ sample, techResults, seoResults, totalAvailable, freshCount, runDuration }) {
  const errors = techResults.filter(r => r.error || (r.status >= 400 && r.status < 600));
  const redirects = techResults.filter(r => !r.error && r.status >= 300 && r.status < 400);
  const slow = techResults.filter(r => !r.error && r.ttfb > 1500);
  const heavy = techResults.filter(r => !r.error && r.size > 200_000 && !r.url.includes('sitemap'));
  const seoHigh = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'high').map(i => ({ url: r.url, ...i })));
  const seoMed = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'medium').map(i => ({ url: r.url, ...i })));
  const seoLow = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'low').map(i => ({ url: r.url, ...i })));

  const blockerCount = errors.length + seoHigh.length;
  const warnCount = slow.length + heavy.length + seoMed.length + redirects.length;
  const okCount = techResults.length - errors.length - redirects.length;
  const avgTtfb = Math.round(techResults.filter(r => !r.error).reduce((a, r) => a + r.ttfb, 0) / (techResults.length - errors.length));

  const lines = [];
  lines.push(`# Audit extra hacecuentas — ${TODAY} (150 URLs frescas)`, '');
  lines.push(`**Resumen**: 🔴 ${blockerCount} bloqueantes · 🟡 ${warnCount} warnings · 🟢 ${okCount} OK · ⏱ ${runDuration}s`, '');
  lines.push(`Universo: ${totalAvailable} URLs en sitemap, ${freshCount} no analizadas previamente, ${sample.length} muestreadas hoy. SEO deep-check en las primeras ${Math.min(SEO_DEEP_LIMIT, sample.length)}.`, '');

  // Bloqueantes
  lines.push('## 🔴 Bloqueantes', '');
  if (errors.length) {
    lines.push('### HTTP errors');
    for (const e of errors) lines.push(`- ${e.url} — ${e.status || e.error}`);
    lines.push('');
  }
  if (seoHigh.length) {
    lines.push('### SEO high-severity');
    for (const s of seoHigh) lines.push(`- ${s.url} — ${s.msg}`);
    lines.push('');
  }
  if (!errors.length && !seoHigh.length) lines.push('Sin bloqueantes ✅', '');

  // Warnings
  lines.push('## 🟡 Warnings', '');
  if (redirects.length) {
    lines.push(`### Redirects (${redirects.length})`);
    for (const r of redirects.slice(0, 20)) lines.push(`- ${r.url} → ${r.redirectLocation || '?'} (${r.status})`);
    if (redirects.length > 20) lines.push(`- … +${redirects.length - 20} más`);
    lines.push('');
  }
  if (heavy.length) {
    lines.push(`### Páginas pesadas >200KB (${heavy.length})`);
    for (const h of heavy.sort((a, b) => b.size - a.size)) lines.push(`- ${h.url} — ${(h.size / 1024).toFixed(0)}KB`);
    lines.push('');
  }
  if (slow.length) {
    lines.push(`### Páginas lentas TTFB >1.5s (${slow.length})`);
    for (const s of slow) lines.push(`- ${s.url} — ${s.ttfb}ms`);
    lines.push('');
  }
  if (seoMed.length) {
    lines.push(`### SEO medium (${seoMed.length})`);
    for (const s of seoMed) lines.push(`- ${s.url} — ${s.msg}`);
    lines.push('');
  }
  if (!warnCount) lines.push('Sin warnings ✅', '');

  // Performance
  lines.push('## 📊 Performance', '');
  const okTech = techResults.filter(r => !r.error && r.status === 200);
  const sorted = [...okTech].sort((a, b) => b.ttfb - a.ttfb);
  lines.push('Top 10 más lentas:', '');
  lines.push('| URL | TTFB | Tamaño |', '|---|---|---|');
  for (const r of sorted.slice(0, 10)) lines.push(`| \`${r.url.replace(SITE, '')}\` | ${r.ttfb}ms | ${(r.size / 1024).toFixed(0)}KB |`);
  lines.push('');
  lines.push(`TTFB promedio: ${avgTtfb}ms`, '');

  // SEO low
  if (seoLow.length) {
    lines.push(`## ℹ️ SEO low (${seoLow.length})`, '', `<details><summary>${seoLow.length} items</summary>`, '');
    for (const s of seoLow) lines.push(`- ${s.url} — ${s.msg}`);
    lines.push('', '</details>', '');
  }

  // Muestreadas
  lines.push(`## 📋 URLs muestreadas (${sample.length})`, '', `<details><summary>${sample.length} URLs</summary>`, '');
  for (const u of sample) lines.push(`- ${u}`);
  lines.push('', '</details>', '');

  lines.push('---', '');
  lines.push(`🤖 Generado por \`scripts/audit-fresh.mjs\` (one-off) · seed ${SEED}`);
  return lines.join('\n');
}

async function main() {
  const startTime = Date.now();
  console.log(`Audit fresh ${TODAY} (target: ${SAMPLE_SIZE} URLs nuevas)...`);

  const audited = getAlreadyAudited();
  console.log(`URLs ya analizadas en audits previos: ${audited.size}`);

  const allUrls = await getAllUrls();
  console.log(`Sitemap: ${allUrls.length} URLs totales`);
  if (allUrls.length === 0) throw new Error('Sitemap vacío');

  const fresh = allUrls.filter(u => !audited.has(u));
  console.log(`URLs frescas (no analizadas antes): ${fresh.length}`);

  const sample = selectFreshSample(allUrls, audited, SEED);
  console.log(`Sample: ${sample.length} URLs`);

  console.log('Technical checks (150 URLs)...');
  const techResults = await pool(sample.map(u => () => checkUrl(u)));

  console.log(`SEO deep-check (primeras ${SEO_DEEP_LIMIT})...`);
  const seoResults = await pool(sample.slice(0, SEO_DEEP_LIMIT).map(u => () => seoCheck(u)));

  const runDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const report = generateReport({ sample, techResults, seoResults, totalAvailable: allUrls.length, freshCount: fresh.length, runDuration });

  mkdirSync('audits', { recursive: true });
  writeFileSync(REPORT_PATH, report);

  const errors = techResults.filter(r => r.error || (r.status >= 400 && r.status < 600));
  const heavy = techResults.filter(r => !r.error && r.size > 200_000 && !r.url.includes('sitemap'));
  const slow = techResults.filter(r => !r.error && r.ttfb > 1500);
  const seoHigh = seoResults.flatMap(r => (r.issues || []).filter(i => i.severity === 'high'));
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Errors: ${errors.length} · Heavy: ${heavy.length} · Slow: ${slow.length} · SEO-high: ${seoHigh.length}`);
  console.log(`Done in ${runDuration}s`);
}

main().catch(e => {
  console.error('Audit failed:', e);
  process.exit(1);
});
