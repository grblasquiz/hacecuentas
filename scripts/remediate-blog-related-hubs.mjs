/**
 * Completa relatedCalcs vacíos usando hubs vigentes.
 *
 * Prioridad:
 * 1. reutiliza links contextuales ya presentes en el artículo;
 * 2. traduce URLs podadas mediante `replaces` del registro de hubs;
 * 3. usa overrides editoriales explícitos para posts sin links resolubles.
 *
 * No inventa slugs de calculadoras ni modifica contenido. El template de blog
 * acepta rutas de hub/silo con `/` inicial, por lo que el resultado se valida
 * contra el mismo universo que renderiza `src/pages/blog/[slug].astro`.
 *
 * Uso:
 *   node scripts/remediate-blog-related-hubs.mjs          # dry-run
 *   node scripts/remediate-blog-related-hubs.mjs --write  # aplica
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BLOG = path.join(ROOT, 'src/content/blog');
const HUBS = path.join(ROOT, 'src/lib/hubs');
const WRITE = process.argv.includes('--write');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
  );
}

const valid = new Set();
const replacements = new Map();
for (const file of walk(HUBS).filter((name) => name.endsWith('.ts') && !/(registry|types)\.ts$/.test(name))) {
  const source = fs.readFileSync(file, 'utf8');
  const hubStart = source.search(/export\s+const\s+hub\s*:[^=]+=/);
  if (hubStart < 0) continue;
  const hubSource = source.slice(hubStart);
  const slug = hubSource.match(/\bslug:\s*['"]([^'"]+)['"]/)?.[1];
  if (!slug) continue;
  const destination = `/${slug.replace(/^\//, '')}`;
  valid.add(destination);
  const silo = hubSource.match(/\bsiloHref:\s*['"]([^'"]+)['"]/)?.[1];
  if (silo) valid.add(silo);
  const replaced = hubSource.match(/\breplaces:\s*\[([\s\S]*?)\]/)?.[1] || '';
  for (const match of replaced.matchAll(/['"](\/[^'"]+)['"]/g)) {
    replacements.set(match[1].replace(/\/$/, ''), destination);
  }
}

const overrides = [
  [/benchmarks-de-tasa-de-conversion|casos-practicos-de-roi/, ['/negocios/metricas-de-marketing']],
  [/piso-flotante/, ['/construccion/pisos']],
  [/combinatoria/, ['/matematica/probabilidad']],
  [/aire-acondicionado/, ['/hogar/factura-de-luz']],
  [/impuesto-a-las-ganancias/, ['/impuestos/deducciones-ganancias']],
  [/poder-de-compra/, ['/finanzas-personales/dolar']],
  [/punto-de-equilibrio/, ['/negocios/precio-de-venta']],
  [/feriado-17-agosto-2026/, ['/fechas/dias-entre-fechas']],
  [/ingresos-brutos/, ['/impuestos/retenciones']],
  [/media-estadistica/, ['/matematica/estadistica-descriptiva']],
  [/nota-necesaria-para-aprobar/, ['/estudio/nota-necesaria-para-aprobar']],
  [/proyeccion-de-ventas/, ['/negocios/cuanto-vale-mi-negocio']],
  [/paquete-economico-2027-mexico/, ['/mx/impuestos/isr-por-mi-cuenta']],
  [/tina-asistente-virtual/, ['/tramites/dni-y-pasaporte']],
];

const changes = [];
const unresolved = [];
for (const file of fs.readdirSync(BLOG).filter((name) => name.endsWith('.json')).sort()) {
  const full = path.join(BLOG, file);
  const post = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (Array.isArray(post.relatedCalcs) && post.relatedCalcs.length) continue;

  const hrefs = [...new Set(
    [...String(post.content || '').matchAll(/href=["'](\/[^"'#?]+)/g)]
      .map((match) => match[1].replace(/\/$/, '')),
  )];
  const related = [];
  for (const href of hrefs) {
    const destination = valid.has(href) ? href : replacements.get(href);
    if (destination && !related.includes(destination)) related.push(destination);
    // Dos destinos alcanzan para recuperar CTA/sidebar sin llenar la tarjeta
    // con una tercera relación débil producto de una redirección histórica.
    if (related.length === 2) break;
  }
  if (!related.length) {
    const override = overrides.find(([pattern]) => pattern.test(post.slug));
    if (override) related.push(...override[1].filter((href) => valid.has(href)));
  }
  if (!related.length) {
    unresolved.push(post.slug);
    continue;
  }
  post.relatedCalcs = related;
  changes.push({ slug: post.slug, relatedCalcs: related });
  if (WRITE) fs.writeFileSync(full, `${JSON.stringify(post, null, 2)}\n`);
}

console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', changed: changes.length, unresolved, changes }, null, 2));
if (unresolved.length) process.exitCode = 1;
