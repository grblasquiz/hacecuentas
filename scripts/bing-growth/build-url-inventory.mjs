/**
 * Inventario completo de URLs de contenido (calcs de todos los locales, guías,
 * comparaciones, salas de decisión). Lee las FUENTES reales (JSON/TS), no dist.
 *
 * Salida: reports/bing-growth/url-inventory.csv (schema del plan §7).
 *
 * Notas de fidelidad:
 *  - formula_signature = formulaId + firma de inputs + nº de outputs (proxy
 *    estable: dos calcs con misma fórmula base y mismos inputs colisionan).
 *    NO se parsea el AST de cada .ts (2748 fórmulas); la firma captura fórmula
 *    + país/tipo vía formulaId (que suele incluir país/régimen) + inputs.
 *  - input_signature = ids de fields ordenados alfabéticamente.
 *  - indexable/noindex: usa JSON.noindex explícito + heurística YMYL
 *    (ymylRisk 'high' sin professionalReviewer => noindex). La verdad última la
 *    deriva src/lib/content-policy.ts en runtime; acá se aproxima para el inventario.
 *  - internal_links_out = length de relatedSlugs (proxy del enlazado saliente).
 *    internal_links_in se completa en build-internal-links.mjs (segunda pasada).
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const SITE = 'https://hacecuentas.com';
const OUT = 'reports/bing-growth/url-inventory.csv';
const HEADER = 'url,route_type,country,category,cluster,slug,title,h1,indexable,canonical,sitemap,source_file,content_type,formula_signature,input_signature,lastmod,has_quick_answer,has_formula,has_example,has_table,has_faq,has_sources,has_related,internal_links_in,internal_links_out,is_sensitive,is_regulatory,word_count,status';

const esc = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

// locale dir -> country + url prefix
const LOCALES = {
  calcs: { country: 'AR', prefix: '' },
  'calcs-mx': { country: 'MX', prefix: '/mx' }, 'calcs-co': { country: 'CO', prefix: '/co' },
  'calcs-cl': { country: 'CL', prefix: '/cl' }, 'calcs-pe': { country: 'PE', prefix: '/pe' },
  'calcs-ec': { country: 'EC', prefix: '/ec' }, 'calcs-ve': { country: 'VE', prefix: '/ve' },
  'calcs-py': { country: 'PY', prefix: '/py' }, 'calcs-uy': { country: 'UY', prefix: '/uy' },
  'calcs-do': { country: 'DO', prefix: '/do' }, 'calcs-es': { country: 'ES', prefix: '/es' },
  'calcs-en': { country: 'EN', prefix: '/en' }, 'calcs-pt': { country: 'PT', prefix: '/pt' },
  'calcs-pt-pt': { country: 'PT', prefix: '/pt-pt' },
};

// clusters permitidos (§8) — mapeo desde category
const CATEGORY_TO_CLUSTER = {
  finanzas: 'savings', negocios: 'business', negocio: 'business', salud: 'health_low_risk',
  marketing: 'business', deportes: 'sports_non_medical', viajes: 'travel', vida: 'utilities',
  mascotas: 'pets_non_medical', matematica: 'mathematics', construccion: 'construction',
  cocina: 'food', automotor: 'automotive', hogar: 'utilities', impuestos: 'taxes',
  educacion: 'education', ciencia: 'statistics', tecnologia: 'other', familia: 'other',
  idiomas: 'education', jardineria: 'other', electronica: 'other', entretenimiento: 'other',
};
// slug-based cluster overrides (más finos)
function refineCluster(base, slug, title) {
  const s = (slug + ' ' + title).toLowerCase();
  if (/aguinaldo|indemniz|despido|liquidaci[oó]n final|preaviso|vacaciones/.test(s)) return 'employment_termination';
  if (/sueldo|salario|neto|bruto|jornal/.test(s)) return 'salary';
  if (/jubilaci|pension|anses|previsional|moratoria/.test(s)) return 'retirement';
  if (/monotributo|ganancias|iva|bienes personales|impuesto|arba|afip|sellos/.test(s)) return 'taxes';
  if (/pr[eé]stamo|cuota|cr[eé]dito|hipotec|uva/.test(s)) return 'loans';
  if (/plazo fijo|inversi|cedear|acciones|fci|d[oó]lar|cripto|inflaci/.test(s)) return 'investments';
  if (/alquiler|expensas|inmobiliar|metro cuadrado.*construc/.test(s)) return 'housing';
  if (/asado|carne|pizza|empanada|comida|invitado|bebida|hielo|carb[oó]n|torta|ensalada|pan|mate/.test(s)) return 'food';
  if (/fiesta|cumplea|evento|casamiento|boda|invitaci/.test(s)) return 'events';
  if (/pintura|ladrillo|cemento|arena|cer[aá]mico|piso|c[eé]sped|contrapiso|adoqu|machimbre/.test(s)) return 'construction';
  if (/nafta|combustible|peaje|viaje|auto|km|hospedaje/.test(s)) return base === 'travel' ? 'travel' : 'automotive';
  return base;
}

// heurística médica alto riesgo (para is_sensitive; la verdad la da content-policy.ts)
function sensitivity(j) {
  const risk = j.ymylRisk;
  const hasReviewer = !!(j.professionalReviewer && j.professionalReviewer.name);
  const restricted = j.distribution === 'restricted' || !!j.restrictedMode || (risk === 'high' && !hasReviewer);
  return { is_sensitive: restricted || risk === 'high' ? 'true' : 'false', level: risk || 'low' };
}
const REGULATORY_RE = /impuesto|monotributo|ganancias|iva|aguinaldo|indemniz|despido|jubilaci|pension|anses|sueldo|salario|liquidaci|previsional|arba|afip|cesant|finiquito|prestaci|nomina/i;

function wordCount(j) {
  const parts = [j.intro, j.explanation, j.answerSnippet, ...(j.faq || []).flatMap((f) => [f.q, f.a]), ...(j.useCases || [])].filter(Boolean).join(' ');
  return parts.split(/\s+/).filter(Boolean).length;
}
function fileMtimeGit(f) {
  try { return execSync(`git log -1 --format=%cs -- "${f}"`, { encoding: 'utf8' }).trim() || ''; } catch { return ''; }
}

const rows = [];
let counts = { calc: 0, noindex: 0, sensitive: 0 };

// ---- Calcs (todos los locales) ----
for (const [dir, meta] of Object.entries(LOCALES)) {
  const base = `src/content/${dir}`;
  if (!existsSync(base)) continue;
  for (const file of readdirSync(base).filter((f) => f.endsWith('.json'))) {
    let j; try { j = JSON.parse(readFileSync(join(base, file), 'utf8')); } catch { continue; }
    const slug = j.slug || file.replace(/\.json$/, '');
    const url = `${SITE}${meta.prefix}/${slug}`;
    const sens = sensitivity(j);
    const noindex = j.noindex === true || sens.is_sensitive === 'true';
    const inputSig = (j.fields || []).map((x) => x.id).filter(Boolean).sort().join('|');
    const formulaSig = `${j.formulaId || slug}::${inputSig}::${(j.outputs || []).length}`;
    const cluster = refineCluster(CATEGORY_TO_CLUSTER[j.category] || 'other', slug, j.title || '');
    const lastReviewed = j.lastReviewed || (j.dataUpdate && j.dataUpdate.lastUpdated) || '';
    const lastmod = lastReviewed || fileMtimeGit(join(base, file));
    let status = 'ACTIVE';
    if (noindex) status = 'NOINDEX';
    if (!j.fields || !j.formulaId) status = 'INCOMPLETE';
    counts.calc++; if (noindex) counts.noindex++; if (sens.is_sensitive === 'true') counts.sensitive++;
    rows.push([
      url, 'calculator', meta.country, j.category || '', cluster, slug, j.title || '', j.h1 || '',
      noindex ? 'false' : 'true', j.canonicalSlug ? `${SITE}/${j.canonicalSlug}` : url,
      noindex ? 'false' : 'true', join(base, file), 'calc',
      formulaSig, inputSig, lastmod,
      j.answerSnippet ? 'true' : 'false', j.formulaId ? 'true' : 'false', j.example ? 'true' : 'false',
      (j.referenceTables && j.referenceTables.length) ? 'true' : 'false',
      (j.faq && j.faq.length) ? 'true' : 'false', (j.sources && j.sources.length) ? 'true' : 'false',
      (j.relatedSlugs && j.relatedSlugs.length) ? 'true' : 'false',
      '', (j.relatedSlugs || []).length, sens.is_sensitive, REGULATORY_RE.test(slug + ' ' + (j.title || '')) ? 'true' : 'false',
      wordCount(j), status,
    ]);
  }
}

// ---- Guías ----
if (existsSync('src/content/guias')) for (const file of readdirSync('src/content/guias').filter((f) => f.endsWith('.json'))) {
  let j; try { j = JSON.parse(readFileSync(`src/content/guias/${file}`, 'utf8')); } catch { continue; }
  const slug = j.slug || file.replace(/\.json$/, '');
  const wc = (j.sections || []).map((s) => s.content).join(' ').split(/\s+/).filter(Boolean).length;
  rows.push([`${SITE}/guia/${slug}`, 'guide', 'AR', j.category || '', CATEGORY_TO_CLUSTER[j.category] || 'other', slug, j.title || '', j.h1 || '', 'true', `${SITE}/guia/${slug}`, 'true', `src/content/guias/${file}`, 'guide', '', '', j.lastReviewed || '', j.answerSnippet ? 'true' : 'false', 'false', 'false', /\|.*\|/.test(JSON.stringify(j.sections)) ? 'true' : 'false', (j.faq && j.faq.length) ? 'true' : 'false', (j.sources && j.sources.length) ? 'true' : 'false', 'true', '', (j.sections || []).flatMap((s) => s.calcs || []).length, 'false', REGULATORY_RE.test(slug + (j.title || '')) ? 'true' : 'false', wc, 'ACTIVE']);
}

// ---- Comparaciones ----
if (existsSync('src/content/comparaciones')) for (const file of readdirSync('src/content/comparaciones').filter((f) => f.endsWith('.json'))) {
  let j; try { j = JSON.parse(readFileSync(`src/content/comparaciones/${file}`, 'utf8')); } catch { continue; }
  const slug = j.slug || file.replace(/\.json$/, '');
  rows.push([`${SITE}/comparar/${slug}`, 'guide', 'AR', j.category || '', CATEGORY_TO_CLUSTER[j.category] || 'other', slug, j.title || '', '', 'true', `${SITE}/comparar/${slug}`, 'true', `src/content/comparaciones/${file}`, 'comparison', '', '', j.lastReviewed || '', 'false', 'false', 'false', (j.comparisonTable && j.comparisonTable.rows) ? 'true' : 'false', (j.faq && j.faq.length) ? 'true' : 'false', (j.sources && j.sources.length) ? 'true' : 'false', (j.relatedCalcs && j.relatedCalcs.length) ? 'true' : 'false', '', (j.relatedCalcs || []).length, 'false', REGULATORY_RE.test(slug + (j.title || '')) ? 'true' : 'false', 0, 'ACTIVE']);
}

import { writeFileSync } from 'node:fs';
writeFileSync(OUT, HEADER + '\n' + rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
console.log(`[inventory] ${OUT}: ${rows.length} URLs de contenido`);
console.log(`[inventory] calcs=${counts.calc} | noindex=${counts.noindex} | sensibles=${counts.sensitive} | guías+comparaciones=${rows.length - counts.calc}`);
