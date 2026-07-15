/**
 * Repara cuarentenas editoriales causadas por dataUpdate.sourceUrl superficial.
 *
 * Sólo reutiliza una URL profunda que ya exista en sources[]. No inventa
 * fuentes, revisores ni texto. Una página se libera únicamente cuando fue
 * puesta en cuarentena por el script editorial y, después de quitar esta
 * causa, no conserva ningún otro quarantineReason.
 *
 * Uso:
 *   node --experimental-strip-types scripts/remediate-editorial-quarantine.ts
 *   node --experimental-strip-types scripts/remediate-editorial-quarantine.ts --write
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const WRITE = process.argv.includes('--write');
const GENERIC_SOURCE_HOSTS = new Set([
  'arca.gob.ar', 'afip.gob.ar', 'bcra.gob.ar', 'indec.gob.ar', 'anses.gob.ar',
  'argentina.gob.ar', 'boletinoficial.gob.ar', 'enargas.gob.ar', 'sii.cl',
  'bcentral.cl', 'dian.gov.co', 'banrep.gov.co', 'sat.gob.mx', 'datos.gov.co',
]);

function isGeneric(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const depth = url.pathname.split('/').filter(Boolean).length;
    if (host === 'hacecuentas.com') return true;
    if (depth === 0 && !url.search) return true;
    return GENERIC_SOURCE_HOSTS.has(host) && depth <= 1 && !url.search;
  } catch { return true; }
}

function deepSource(calc: Record<string, any>): { name?: string; url: string } | null {
  if (!Array.isArray(calc.sources)) return null;
  for (const source of calc.sources) {
    if (source && typeof source.url === 'string' && !isGeneric(source.url)) return source;
  }
  return null;
}

const summary = { scanned: 0, remapped: 0, released: 0, stillRestricted: 0, withoutDeepSource: 0 };
const changes: Array<{ file: string; slug: string; from: string; to: string; released: boolean; remaining: string[] }> = [];
const dirs = readdirSync(CONTENT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('calcs'))
  .map((entry) => entry.name);

for (const dir of dirs) {
  for (const name of readdirSync(join(CONTENT, dir)).filter((file) => file.endsWith('.json'))) {
    const file = join(CONTENT, dir, name);
    let calc: Record<string, any>;
    try { calc = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
    const reasons = Array.isArray(calc.quarantineReasons) ? calc.quarantineReasons : [];
    if (!reasons.includes('generic-data-source')) continue;
    summary.scanned++;
    const source = deepSource(calc);
    if (!source) { summary.withoutDeepSource++; continue; }

    const from = String(calc.dataUpdate?.sourceUrl || '');
    calc.dataUpdate = { ...(calc.dataUpdate || {}), sourceUrl: source.url };
    if (source.name) calc.dataUpdate.source = source.name;
    const remaining = reasons.filter((reason: string) => reason !== 'generic-data-source');
    const released = remaining.length === 0;
    summary.remapped++;

    if (released) {
      delete calc.status;
      delete calc.noindex;
      delete calc.distribution;
      delete calc.adsenseEligible;
      delete calc.editorialReview;
      delete calc.sourceVerified;
      delete calc.quarantineReasons;
      summary.released++;
    } else {
      calc.quarantineReasons = remaining;
      summary.stillRestricted++;
    }

    changes.push({ file: relative(ROOT, file), slug: String(calc.slug || ''), from, to: source.url, released, remaining });
    if (WRITE) writeFileSync(file, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  }
}

console.log(JSON.stringify({ mode: WRITE ? 'write' : 'dry-run', summary, changes }, null, 2));
