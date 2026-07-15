/** Completa profundidad, relatedCalcs y fuentes externas del blog. */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BLOG = path.join(ROOT, 'src/content/blog');
const CONTENT = path.join(ROOT, 'src/content');
const WRITE = process.argv.includes('--write');
const stop = new Set('como que para por del de la el los las con una uno sus sobre guia preguntas frecuentes ejemplos ejemplo casos caso practicos practica explicado facil errores comunes hacer mejorar calcular calculo calculadora necesario necesaria hace cuentas 2026'.split(' '));
const aliases = new Map([
  ['hogar', new Set(['hogar', 'construccion', 'vida'])],
  ['impuestos', new Set(['impuestos', 'finanzas'])],
  ['fiscal', new Set(['impuestos', 'finanzas'])],
  ['educacion', new Set(['educacion', 'matematica'])],
  ['matematica', new Set(['matematica', 'educacion'])],
  ['marketing', new Set(['marketing', 'negocios'])],
  ['laboral', new Set(['laboral', 'finanzas', 'negocios'])],
]);
const normalize = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ');
const tokens = (value) => [...new Set(normalize(value).split(/\s+/).filter((token) => token.length > 2 && !stop.has(token)))];
const plain = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const words = (html) => plain(html).split(/\s+/).filter(Boolean).length;

const calcs = [];
for (const dir of fs.readdirSync(CONTENT, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name.startsWith('calcs'))) {
  for (const file of fs.readdirSync(path.join(CONTENT, dir.name)).filter((name) => name.endsWith('.json'))) {
    let calc;
    try { calc = JSON.parse(fs.readFileSync(path.join(CONTENT, dir.name, file), 'utf8')); } catch { continue; }
    if (!calc.slug || calc.status === 'draft' || calc.noindex === true || calc.distribution === 'restricted' || calc.adsenseEligible === false) continue;
    const text = `${calc.slug} ${calc.title} ${calc.h1} ${calc.description} ${calc.seoKeywords || ''}`;
    calcs.push({ ...calc, _tokens: tokens(text), _dir: dir.name });
  }
}
const bySlug = new Map(calcs.map((calc) => [calc.slug, calc]));
const relatedOverrides = [
  [/combinator|combinaciones|permutaciones/, ['calculadora-combinaciones-permutaciones-factorial', 'calculadora-permutaciones-n-tomados-k-pnk', 'calculadora-factorial-numero-n']],
  [/(^|-)roi($|-)|retorno-de-inversion/, ['calculadora-roi-inversion', 'calculadora-roi-ad-spend-facebook-meta', 'calculadora-roi-publicidad-redes']],
  [/punto-de-equilibrio/, ['calculadora-punto-equilibrio-break-even', 'calculadora-costos-fijos-y-variables']],
  [/proyeccion-de-ventas/, ['calculadora-proyeccion-ventas-crecimiento', 'calculadora-flujo-caja-libre-fcf']],
  [/pintura-necesaria/, ['calculadora-pintura-por-m2-litros-latas', 'calculadora-area-perimetro-figuras']],
  [/ceramicos-necesarios/, ['calculadora-pisos-ceramicos-porcellanato-cajas', 'calculadora-ceramicos-m2-cajas']],
  [/credito-prendario/, ['calculadora-financiacion-auto-cuota-prendario', 'calculadora-cuota-prestamo-auto-frances-argentino']],
  [/ingresos-brutos/, ['calculadora-ingresos-brutos-provincial', 'calculadora-iva-agregar-discriminar']],
  [/poder-de-compra/, ['calculadora-inflacion-poder-compra', 'calculadora-sueldo-en-dolares-poder-compra']],
  [/media-estadistica|mediana-estadistica|moda-estadistica/, ['calculadora-media-mediana-moda-rango-estadistica', 'calculadora-promedio-mediana-moda-estadistica']],
  [/nota-necesaria-para-aprobar/, ['calculadora-nota-necesaria-aprobar', 'calculadora-nota-minima-aprobar-final-parcial-promedio']],
  [/monotributo/, ['calculadora-monotributo-2026', 'calculadora-facturacion-maxima-monotributo-vs-ri']],
];

function overriddenRelated(post) {
  const normalized = normalize(`${post.slug} ${post.title}`).replace(/ /g, '-');
  const match = relatedOverrides.find(([pattern]) => pattern.test(normalized));
  return match ? match[1].filter((slug) => bySlug.has(slug)) : [];
}

function rank(post) {
  const pt = tokens(`${post.slug} ${post.title} ${post.description} ${post.category}`);
  const acceptedCats = aliases.get(normalize(post.category).trim()) || new Set([normalize(post.category).trim()]);
  return calcs.map((calc) => {
    const shared = pt.filter((token) => calc._tokens.includes(token));
    let score = shared.reduce((sum, token) => sum + Math.min(8, token.length), 0);
    if (acceptedCats.has(normalize(calc.category).trim())) score += 8;
    if (normalize(post.slug).includes(normalize(calc.slug).replace(/^calculadora /, ''))) score += 25;
    if (calc._dir === 'calcs') score += 1;
    return { calc, score, shared };
  }).sort((a, b) => b.score - a.score || b.shared.length - a.shared.length);
}

function bestSource(related, ranked) {
  const candidates = [...related.map((slug) => bySlug.get(slug)).filter(Boolean), ...ranked.map((row) => row.calc)];
  for (const calc of candidates) {
    for (const source of Array.isArray(calc.sources) ? calc.sources : []) {
      if (/^https?:\/\//.test(source?.url || '') && !/hacecuentas\.com/.test(source.url)) return { source, calc };
    }
  }
  return null;
}

function depthSection(post, calc) {
  const takeaway = plain(calc.keyTakeaway || calc.answerSnippet || calc.explanation || calc.description);
  const steps = (Array.isArray(calc.howToSteps) ? calc.howToSteps : []).slice(0, 3).map((step) => plain(step.text || step.description || step)).filter(Boolean);
  const tailored = takeaway || `La herramienta ${plain(calc.h1 || calc.title)} permite probar los datos del caso y comparar el resultado sin rehacer las cuentas a mano.`;
  const stepHtml = steps.length
    ? `<ul>${steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ul>`
    : `<ul><li>Usá valores del mismo período y la misma unidad.</li><li>Probá un escenario conservador y otro exigente.</li><li>Guardá los datos usados para poder revisar el resultado.</li></ul>`;
  return `<h2>Cómo verificar este cálculo en un caso real</h2><p>${esc(tailored)}</p><p>Antes de decidir, separá los datos comprobables de los supuestos. Los importes, porcentajes, fechas o rendimientos pueden cambiar; por eso conviene repetir el cálculo cuando cambie cualquiera de esas variables. La <a href="/${esc(calc.slug)}">${esc(plain(calc.h1 || calc.title))}</a> sirve para contrastar escenarios con la misma metodología.</p>${stepHtml}<p>Tomá el resultado como una estimación reproducible: anotá la fuente de cada dato, redondeá solamente al final y comprobá si existe una regla local o contractual que modifique el caso general. Esa revisión evita que una cuenta matemáticamente correcta se aplique a un supuesto equivocado.</p>`;
}

const summary = { total: 0, relatedCompleted: 0, expanded: 0, sourced: 0, lowConfidence: 0 };
const changes = [];
for (const file of fs.readdirSync(BLOG).filter((name) => name.endsWith('.json'))) {
  const full = path.join(BLOG, file);
  const post = JSON.parse(fs.readFileSync(full, 'utf8'));
  const ranked = rank(post);
  let changed = false;
  let related = Array.isArray(post.relatedCalcs) ? [...new Set(post.relatedCalcs.filter((slug) => bySlug.has(slug)))] : [];
  if (!related.length) {
    related = overriddenRelated(post);
    if (!related.length) related = ranked.filter((row) => row.score > 8).slice(0, 3).map((row) => row.calc.slug);
    if (!related.length) related = ranked.slice(0, 1).map((row) => row.calc.slug);
    post.relatedCalcs = related;
    summary.relatedCompleted++;
    if ((ranked[0]?.score || 0) < 14) summary.lowConfidence++;
    changed = true;
  } else if (related.length !== post.relatedCalcs.length) {
    post.relatedCalcs = related;
    changed = true;
  }
  const primary = bySlug.get(related[0]) || ranked[0]?.calc;
  if (words(post.content) < 300 && primary) {
    post.content = `${String(post.content || '').trim()}\n${depthSection(post, primary)}`;
    summary.expanded++;
    changed = true;
  }
  if (!(String(post.content || '').match(/href=["']https?:\/\//g) || []).length) {
    const match = bestSource(related, ranked);
    if (match) {
      post.content = `${String(post.content || '').trim()}\n<h2>Fuente y alcance</h2><p>Para revisar el marco o la metodología consultá <a href="${esc(match.source.url)}" rel="noopener noreferrer">${esc(match.source.name || match.calc.title)}</a>. La fuente respalda el criterio indicado; los datos variables y el caso particular deben verificarse al momento de usarlo.</p>`;
      summary.sourced++;
      changed = true;
    }
  }
  summary.total++;
  if (changed) {
    changes.push({ file: `src/content/blog/${file}`, slug: post.slug, related: post.relatedCalcs, words: words(post.content), topScore: ranked[0]?.score || 0 });
    if (WRITE) fs.writeFileSync(full, `${JSON.stringify(post, null, 2)}\n`);
  }
}
console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', summary, changes }, null, 2));
