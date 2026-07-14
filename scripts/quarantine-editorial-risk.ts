/**
 * Pone en cuarentena páginas que todavía no alcanzan el piso editorial.
 * No genera ni rellena texto: sólo cambia su estado de publicación de forma
 * reversible y deja un manifiesto auditable para revisión humana.
 *
 * Uso:
 *   node --experimental-strip-types scripts/quarantine-editorial-risk.ts
 *   node --experimental-strip-types scripts/quarantine-editorial-risk.ts --write
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const REPORTS = join(ROOT, 'reports');
const WRITE = process.argv.includes('--write');
const STRICT = process.argv.includes('--strict');
const MIN_EXPLANATION = 1500;
const GENERIC_SOURCE_HOSTS = new Set([
  'arca.gob.ar', 'afip.gob.ar', 'bcra.gob.ar', 'indec.gob.ar', 'anses.gob.ar',
  'argentina.gob.ar', 'boletinoficial.gob.ar', 'enargas.gob.ar', 'sii.cl',
  'bcentral.cl', 'dian.gov.co', 'banrep.gov.co', 'sat.gob.mx', 'datos.gov.co',
]);
const BCRA_TOPIC_RE = /(banco|bcra|tasa|inter[eé]s|cr[eé]dito|pr[eé]stamo|uva|moneda|d[oó]lar|cambio|inflaci[oó]n|plazo-fijo|cbu|cvu|financ|bono|mercado|ahorro|alquiler|hipoteca|bitcoin)/i;
const HIGH_STAKES_RE = /(fertil|vitrific|ovulo|embarazo-riesgo|sintoma|diagnost|dosis|medicament|insulina|control-esfinter|quitar-panal|indemniz|liquidacion|jubilacion|pension|impuesto|ganancias|losa|viga|columna|cimiento|estructural|potencia-electrica|cable-seccion)/i;

function genericDataSource(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const depth = url.pathname.split('/').filter(Boolean).length;
    if (depth === 0 && !url.search) return true;
    return GENERIC_SOURCE_HOSTS.has(host) && depth <= 1 && !url.search;
  } catch { return true; }
}

function hasProfessionalReviewer(calc: Record<string, any>): boolean {
  const reviewer = calc.professionalReviewer;
  return !!reviewer && ['name', 'profession', 'credential', 'profileUrl', 'reviewedAt']
    .every((key) => typeof reviewer[key] === 'string' && reviewer[key].trim().length > 0);
}

interface Finding {
  file: string;
  slug: string;
  locale: string;
  explanationChars: number;
  previousStatus: string;
  reasons: string[];
  changed: boolean;
}

const dirs = readdirSync(CONTENT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('calcs'))
  .map((entry) => entry.name)
  .sort();
const findings: Finding[] = [];
const descriptionCounts = new Map<string, number>();

// Primera pasada: las descripciones duplicadas se detectan sobre el inventario
// completo, no sólo dentro de una carpeta/país.
for (const dir of dirs) {
  for (const name of readdirSync(join(CONTENT, dir)).filter((file) => file.endsWith('.json'))) {
    try {
      const calc = JSON.parse(readFileSync(join(CONTENT, dir, name), 'utf8'));
      const description = typeof calc.description === 'string' ? calc.description.trim() : '';
      if (description.length > 20) descriptionCounts.set(description, (descriptionCounts.get(description) || 0) + 1);
    } catch { /* el validador estructural informa JSON inválido */ }
  }
}

for (const dir of dirs) {
  for (const name of readdirSync(join(CONTENT, dir)).filter((file) => file.endsWith('.json')).sort()) {
    const file = join(CONTENT, dir, name);
    let calc: Record<string, any>;
    try { calc = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
    const explanationChars = typeof calc.explanation === 'string' ? calc.explanation.length : 0;
    const reasons: string[] = [];
    if (explanationChars < MIN_EXPLANATION) reasons.push(`explanation-under-${MIN_EXPLANATION}`);
    if (!Array.isArray(calc.sources) || calc.sources.length === 0) reasons.push('missing-source');
    if (!calc.example && !calc.solvedExample && !(Array.isArray(calc.solvedExamples) && calc.solvedExamples.length > 0)) reasons.push('missing-solved-example');
    if (genericDataSource(calc.dataUpdate?.sourceUrl)) reasons.push('generic-data-source');
    const description = typeof calc.description === 'string' ? calc.description.trim() : '';
    if (description.length > 20 && (descriptionCounts.get(description) || 0) > 1) reasons.push('duplicate-meta-description');
    const sourceText = JSON.stringify(calc.sources || []);
    if (/bcra\.gob\.ar|Banco Central de la Rep[úu]blica Argentina|\bBCRA\b/i.test(sourceText) && !BCRA_TOPIC_RE.test(String(calc.slug || ''))) {
      reasons.push('source-topic-mismatch-bcra');
    }
    const slug = String(calc.slug || '');
    if (HIGH_STAKES_RE.test(slug) && !hasProfessionalReviewer(calc)) reasons.push('high-stakes-without-professional-review');
    if (/adsense.*rpm|rpm.*adsense/i.test(slug) && !(calc.sourceVerified === true && calc.editorialReview === 'approved')) {
      reasons.push('adsense-benchmark-unverified');
    }
    if (/costo-hora-ilustrador/i.test(slug) && /Harvard Business Review|Stack Overflow Developer Survey/i.test(sourceText)) {
      reasons.push('source-topic-mismatch-benchmark');
    }
    if (!reasons.length) continue;

    const alreadyRestricted = calc.noindex === true || calc.status === 'draft' || calc.distribution === 'restricted';
    findings.push({
      file: relative(ROOT, file),
      slug: String(calc.slug || name.replace(/\.json$/, '')),
      locale: dir.replace(/^calcs-?/, '') || 'es-AR',
      explanationChars,
      previousStatus: alreadyRestricted ? 'restricted' : 'indexable',
      reasons,
      changed: WRITE && !alreadyRestricted,
    });

    if (WRITE && !alreadyRestricted) {
      calc.status = 'draft';
      calc.noindex = true;
      calc.distribution = 'restricted';
      calc.adsenseEligible = false;
      calc.editorialReview = 'pending';
      calc.sourceVerified = false;
      calc.quarantineReasons = [...new Set([...(Array.isArray(calc.quarantineReasons) ? calc.quarantineReasons : []), ...reasons])];
      writeFileSync(file, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
    }
  }
}

mkdirSync(REPORTS, { recursive: true });
const summary = {
  generatedAt: new Date().toISOString(),
  mode: WRITE ? 'write' : 'audit',
  minimumExplanationChars: MIN_EXPLANATION,
  totalFindings: findings.length,
  previouslyIndexable: findings.filter((item) => item.previousStatus === 'indexable').length,
  alreadyRestricted: findings.filter((item) => item.previousStatus === 'restricted').length,
  changed: findings.filter((item) => item.changed).length,
};
writeFileSync(join(REPORTS, 'editorial-quarantine.json'), JSON.stringify({ summary, findings }, null, 2) + '\n');
writeFileSync(join(REPORTS, 'editorial-quarantine.csv'), [
  'file,slug,locale,explanation_chars,previous_status,reasons,changed',
  ...findings.map((item) => [item.file, item.slug, item.locale, item.explanationChars, item.previousStatus, item.reasons.join('|'), item.changed]
    .map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
].join('\n') + '\n');
console.log(JSON.stringify(summary, null, 2));
if (STRICT && summary.previouslyIndexable > 0) process.exitCode = 1;
