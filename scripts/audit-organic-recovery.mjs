import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'parse5';

const attr = (node, key) => node.attrs?.find(a => a.name === key)?.value;
const flatten = root => {
  const out = [];
  const walk = n => { out.push(n); for (const c of n.childNodes || []) walk(c); };
  walk(root); return out;
};
const cache = new Map();
function page(path) {
  if (cache.has(path)) return cache.get(path);
  const file = `dist/client${path === '/' ? '/index' : path}.html`;
  if (!existsSync(file)) throw new Error(`Missing rendered page: ${path}`);
  const ns = flatten(parse(readFileSync(file, 'utf8')));
  cache.set(path, ns); return ns;
}
const errors = [];
const backlinks = JSON.parse(readFileSync('src/lib/blog-backlinks.json', 'utf8'));
const covered = new Set();
for (const [key, posts] of Object.entries(backlinks)) {
  try {
    const ns = page(`/${key}`);
    const block = ns.find(n => n.tagName === 'nav' && attr(n, 'data-hc-blog-guides') !== undefined);
    const hrefs = new Set(flatten(block || {}).filter(n => n.tagName === 'a').map(n => attr(n, 'href')));
    for (const p of posts) {
      const target = `/blog/${p.slug}`;
      if (!hrefs.has(target)) errors.push(`${key}: related guide absent from HTML: ${target}`);
      const dest = page(target);
      if (dest.some(n => n.tagName === 'meta' && attr(n, 'name') === 'robots' && /noindex/.test(attr(n, 'content') || ''))) errors.push(`Guide is noindex: ${target}`);
      covered.add(target);
    }
  } catch(e) { errors.push(e.message); }
}
if (covered.size < 250) errors.push(`Contextual coverage fell below 250 guides: ${covered.size}`);
for (const target of covered) {
  const ns = page(target), ids = new Set(ns.map(n => attr(n, 'id')).filter(Boolean));
  for (const nav of ns.filter(n => n.tagName === 'nav' && /bp-toc/.test(attr(n, 'class') || ''))) {
    for (const a of flatten(nav).filter(n => n.tagName === 'a')) {
      const href = attr(a,'href');
      if (href?.startsWith('#') && !ids.has(href.slice(1))) errors.push(`${target}: broken table of contents ${href}`);
    }
  }
}
for (const [path, market] of [['/co/trabajo/horas-extras-y-recargos','co'],['/mx/trabajo/sueldo-neto','mx'],['/py/trabajo/sueldo-neto','py']]) {
  const nav = page(path).find(n => n.tagName === 'nav' && attr(n,'aria-labelledby') === 'hub-interlinking-title');
  for (const a of flatten(nav || {}).filter(n=>n.tagName==='a')) {
    const href=attr(a,'href');
    if (href?.startsWith('/') && href !== '/buscar' && href !== `/${market}` && !href.startsWith(`/${market}/`)) errors.push(`${path}: unrelated market in recommendations ${href}`);
  }
}
const account=page('/mi-hacecuentas');
if (!account.some(n => n.tagName==='meta' && attr(n,'name')==='robots' && /noindex/.test(attr(n,'content')||''))) errors.push('Personal account landing must be noindex');
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`[organic-recovery] PASS: ${covered.size} guides linked from ${Object.keys(backlinks).length} tools; table-of-contents anchors and market boundaries verified`);
