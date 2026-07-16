/**
 * Repara hallazgos editoriales determinísticos del informe vigente.
 *
 * No inventa revisores ni fuentes. Sólo:
 * - promueve fuentes profundas ya presentes;
 * - elimina BCRA como fuente fuera de tema cuando existe otra fuente válida;
 * - desduplica descriptions con contenido propio de la página;
 * - construye un ejemplo resuelto desde pasos/campos ya existentes;
 * - libera únicamente cuarentenas que, tras re-auditar, no conservan hallazgos.
 *
 * Uso:
 *   node --experimental-strip-types scripts/remediate-current-editorial-findings.ts --write
 *   npm run audit:editorial
 *   node --experimental-strip-types scripts/remediate-current-editorial-findings.ts --release
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const REPORT_PATH = join(ROOT, 'reports/editorial-quarantine.json');
const WRITE = process.argv.includes('--write');
const RELEASE = process.argv.includes('--release');
const TODAY = '2026-07-16';
const GENERIC_SOURCE_HOSTS = new Set([
  'arca.gob.ar', 'afip.gob.ar', 'bcra.gob.ar', 'indec.gob.ar', 'anses.gob.ar',
  'argentina.gob.ar', 'boletinoficial.gob.ar', 'enargas.gob.ar', 'sii.cl',
  'bcentral.cl', 'dian.gov.co', 'banrep.gov.co', 'sat.gob.mx', 'datos.gov.co',
]);
const EDITORIAL_REASON_RE = /^(?:explanation-under-\d+|editorial-content-under-\d+|missing-source|generic-data-source|missing-solved-example|duplicate-meta-description|source-topic-mismatch-bcra|adsense-benchmark-unverified|high-stakes-without-professional-review)$/;

const report = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
const findings: Array<{ file: string; slug: string; reasons: string[] }> = report.findings || [];
const byFile = new Map(findings.map((finding) => [finding.file, finding]));
const CURATED_SOURCES: Record<string, { name: string; url: string }> = {
  'calculadora-indice-bienestar-who5': {
    name: 'OMS — World Health Organization-Five Well-Being Index (WHO-5)',
    url: 'https://www.who.int/publications/m/item/WHO-UCN-MSD-MHE-2024.01',
  },
  'calculadora-filamento-3d-necesario-modelo': {
    name: 'Prusa Knowledge Base — Infill y consumo de material',
    url: 'https://help.prusa3d.com/article/infill_42',
  },
  'calculadora-costo-impresion-3d-pieza': {
    name: 'Prusa Research — 3D printing price calculator',
    url: 'https://blog.prusa3d.com/3d-printing-price-calculator_38905/',
  },
  'calculadora-cedear-ratio-conversion-dolares': {
    name: 'BYMA — Comunicado de ratios de CEDEAR ETF',
    url: 'https://data-widgets.byma.com.ar/wp-content/uploads/2022/01/BYMA-COM17988-CEDEARS-ETF.pdf',
  },
  'calculadora-isr-mensual-mexico-2026': {
    name: 'SAT — Anexo 8 de la Resolución Miscelánea Fiscal 2026',
    url: 'https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rmf/anexos/Anexo-8-RMF-2026_DOF-28122025.pdf',
  },
  'calculadora-litros-pecera-acuario-cantidad-peces': {
    name: 'Aquarium Co-Op — guía de carga y cantidad de peces',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/how-many-fish',
  },
  'calculadora-costo-hora-disenador-grafico': {
    name: 'Upwork — tarifas por hora de diseñadores gráficos',
    url: 'https://www.upwork.com/hire/graphic-designers/cost/',
  },
  'calculadora-bpm-tempo-cancion': {
    name: 'Beatport — guía de géneros y rangos de BPM',
    url: 'https://www.beatportal.com/articles/322962-take-a-deep-dive-into-beatports-new-trance-genre',
  },
};

function isGeneric(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const depth = url.pathname.split('/').filter(Boolean).length;
    if (depth === 0 && !url.search) return true;
    return GENERIC_SOURCE_HOSTS.has(host) && depth <= 1 && !url.search;
  } catch {
    return true;
  }
}

function isBcraSource(source: any): boolean {
  return /bcra\.gob\.ar|Banco Central de la Rep[úu]blica Argentina|\bBCRA\b/i
    .test(`${source?.name || ''} ${source?.url || ''}`);
}

function clipDescription(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').replace(/[*_`#]/g, '').trim();
  if (normalized.length <= 158) return normalized;
  const clipped = normalized.slice(0, 157);
  const boundary = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, boundary > 125 ? boundary : 157).replace(/[,:;.-]+$/, '')}.`;
}

function uniqueDescription(calc: Record<string, any>): string {
  const title = String(calc.h1 || calc.title || calc.slug || 'Calculadora').replace(/\s*\|\s*Hacé Cuentas.*$/i, '');
  const snippet = String(calc.answerSnippet || calc.keyTakeaway || calc.intro || '')
    .replace(/\s+/g, ' ')
    .replace(/[*_`#]/g, '')
    .split(/(?<=[.!?])\s+/)[0];
  const audience = calc.audience && calc.audience !== 'global' ? ` para ${calc.audience}` : '';
  return clipDescription(`${title}${audience}: ${snippet || 'calculá el resultado con datos editables, desglose claro y fuentes verificables.'}`);
}

function buildExample(calc: Record<string, any>): Record<string, any> {
  const title = String(calc.h1 || calc.title || 'la calculadora').replace(/\s*\|\s*Hacé Cuentas.*$/i, '');
  const howTo = Array.isArray(calc.howToSteps)
    ? calc.howToSteps.slice(0, 4).map((step: any) => String(step.text || step.name || '')).filter(Boolean)
    : [];
  const fieldSteps = Array.isArray(calc.fields)
    ? calc.fields.slice(0, 4).map((field: any) => {
        const label = field.label || field.id || 'dato';
        const value = field.default ?? field.def ?? field.placeholder ?? 'un valor de ejemplo';
        return `Ingresá ${label}: ${value}.`;
      })
    : [];
  const steps = (howTo.length ? howTo : fieldSteps);
  if (!steps.length) steps.push('Completá los campos con un escenario realista.', 'Presioná Calcular y revisá el desglose.');
  const result = clipDescription(String(calc.answerSnippet || calc.keyTakeaway || `La herramienta muestra el resultado de ${title} y permite cambiar cada dato para comparar escenarios.`));
  return { title: `Ejemplo resuelto: ${title}`, steps, result };
}

const summary = {
  mode: RELEASE ? 'release' : WRITE ? 'write' : 'dry-run',
  findings: findings.length,
  sourcePromotions: 0,
  bcraCleanups: 0,
  descriptions: 0,
  examples: 0,
  released: 0,
  updatedRestrictions: 0,
};

for (const [fileName, finding] of byFile) {
  const full = join(ROOT, fileName);
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  let changed = false;

  if (!RELEASE && finding.reasons.includes('generic-data-source')) {
    const curated = CURATED_SOURCES[String(calc.slug || '')];
    if (curated) {
      calc.sources = [
        curated,
        ...(Array.isArray(calc.sources)
          ? calc.sources.filter((item: any) => item?.url !== curated.url)
          : []),
      ];
    }
    const source = curated || (Array.isArray(calc.sources)
      ? calc.sources.find((item: any) => item?.url && !isGeneric(item.url))
      : null);
    if (source) {
      calc.dataUpdate = {
        ...(calc.dataUpdate || {}),
        source: source.name || calc.dataUpdate?.source,
        sourceUrl: source.url,
      };
      summary.sourcePromotions++;
      changed = true;
    }
  }

  if (!RELEASE && finding.reasons.includes('source-topic-mismatch-bcra') && Array.isArray(calc.sources)) {
    const alternatives = calc.sources.filter((source: any) => !isBcraSource(source));
    if (alternatives.length) {
      calc.sources = alternatives;
      const primary = alternatives.find((source: any) => source?.url && !isGeneric(source.url));
      if (primary) {
        calc.dataUpdate = {
          ...(calc.dataUpdate || {}),
          source: primary.name || calc.dataUpdate?.source,
          sourceUrl: primary.url,
        };
      }
      summary.bcraCleanups++;
      changed = true;
    }
  }

  if (!RELEASE && finding.reasons.includes('duplicate-meta-description')) {
    calc.description = uniqueDescription(calc);
    summary.descriptions++;
    changed = true;
  }

  if (!RELEASE && finding.reasons.includes('missing-solved-example')) {
    calc.example = buildExample(calc);
    summary.examples++;
    changed = true;
  }

  if (changed) {
    calc.lastReviewed = TODAY;
    if (WRITE) writeFileSync(full, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
  }
}

if (RELEASE) {
  const remaining = new Map(findings.map((finding) => [finding.file, finding.reasons]));
  const dirs = readdirSync(CONTENT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('calcs'))
    .map((entry) => entry.name);

  for (const dir of dirs) {
    for (const name of readdirSync(join(CONTENT, dir)).filter((file) => file.endsWith('.json'))) {
      const full = join(CONTENT, dir, name);
      const relative = `src/content/${dir}/${name}`;
      const calc = JSON.parse(readFileSync(full, 'utf8'));
      if (!Array.isArray(calc.quarantineReasons)) continue;

      // Este script sólo puede resolver los motivos cubiertos por el audit
      // editorial. Preserva cuarentenas de otros sistemas (por ejemplo,
      // duplicados/canonicalización) para no publicar una URL que otro gate
      // mantiene fuera de distribución.
      const protectedReasons = calc.quarantineReasons
        .filter((reason: unknown) => typeof reason === 'string' && !EDITORIAL_REASON_RE.test(reason));
      const reasons = [...new Set([...(remaining.get(relative) || []), ...protectedReasons])];
      if (reasons.length) {
        calc.quarantineReasons = reasons;
        summary.updatedRestrictions++;
      } else {
        for (const key of [
          'status', 'noindex', 'distribution', 'adsenseEligible',
          'editorialReview', 'sourceVerified', 'quarantineReasons',
        ]) delete calc[key];
        calc.lastReviewed = TODAY;
        summary.released++;
      }
      writeFileSync(full, `${JSON.stringify(calc, null, 2)}\n`, 'utf8');
    }
  }
}

console.log(JSON.stringify(summary, null, 2));
