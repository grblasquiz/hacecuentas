/**
 * lint-source-urls.ts
 *
 * E-E-A-T: el `dataUpdate.sourceUrl` de una calc debería apuntar al DATO PUNTUAL
 * (la página/endpoint concreto del organismo), no al home genérico. Un link a
 * `https://www.arca.gob.ar/` no le sirve al usuario ni a Google para verificar;
 * uno a la resolución/cuadro específico, sí.
 *
 * Este lint NO edita nada: reporta las calcs cuyo sourceUrl es genérico
 * (dominio raíz o home de organismo sin path profundo) para corregirlas a mano
 * o con un fixer dedicado.
 *
 * Uso:
 *   node --experimental-strip-types scripts/lint-source-urls.ts
 *   node --experimental-strip-types scripts/lint-source-urls.ts --json
 *   node --experimental-strip-types scripts/lint-source-urls.ts --strict   # exit 1 si hay genéricas
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

// Dominios de organismos donde un link "a la raíz" es claramente insuficiente.
const ORG_DOMAINS = [
  'arca.gob.ar', 'afip.gob.ar', 'bcra.gob.ar', 'indec.gob.ar', 'anses.gob.ar',
  'argentina.gob.ar', 'boletinoficial.gob.ar', 'enargas.gob.ar', 'sii.cl',
  'bcentral.cl', 'dian.gov.co', 'banrep.gov.co', 'sat.gob.mx', 'datos.gov.co',
];

interface Finding { slug: string; category: string; sourceUrl: string; reason: string; }

function pathDepth(u: URL): number {
  return u.pathname.split('/').filter(Boolean).length;
}

function classify(sourceUrl: string): string | null {
  let u: URL;
  try { u = new URL(sourceUrl); } catch { return 'sourceUrl no es URL válida'; }
  const host = u.hostname.replace(/^www\./, '');
  const depth = pathDepth(u);
  const hasQuery = u.search.length > 1;
  // Raíz pura (sin path ni query) → genérico siempre
  if (depth === 0 && !hasQuery) return 'apunta a la raíz del dominio (sin path)';
  // Organismo con path superficial (1 segmento tipo /inicio, /home) sin query
  if (ORG_DOMAINS.includes(host) && depth <= 1 && !hasQuery) {
    return `organismo (${host}) con path superficial — apuntar al dato puntual`;
  }
  return null; // OK
}

function main() {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const strict = args.includes('--strict');

  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const findings: Finding[] = [];
  let withSource = 0;

  for (const f of files) {
    let raw: any;
    try { raw = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')); } catch { continue; }
    const du = raw?.dataUpdate;
    if (!du || du.frequency === 'never' || !du.sourceUrl) continue;
    withSource++;
    const reason = classify(du.sourceUrl);
    if (reason) findings.push({ slug: raw.slug, category: raw.category ?? 'sin-cat', sourceUrl: du.sourceUrl, reason });
  }

  if (json) {
    console.log(JSON.stringify({ scanned: files.length, withSource, generic: findings.length, findings }, null, 2));
  } else {
    console.log(`# sourceUrl genéricas — ${findings.length} de ${withSource} calcs con fuente`);
    console.log('');
    if (findings.length === 0) {
      console.log('Todas las sourceUrl apuntan a un path/endpoint específico.');
    } else {
      const byCat = new Map<string, Finding[]>();
      for (const x of findings) { const a = byCat.get(x.category) ?? []; a.push(x); byCat.set(x.category, a); }
      for (const cat of [...byCat.keys()].sort()) {
        console.log(`## ${cat} (${byCat.get(cat)!.length})`);
        for (const x of byCat.get(cat)!) console.log(`- \`${x.slug}\` → ${x.sourceUrl}  _(${x.reason})_`);
        console.log('');
      }
    }
  }
  console.log(`SOURCEURL_SUMMARY::${JSON.stringify({ scanned: files.length, withSource, generic: findings.length })}`);
  if (findings.length > 0 && strict) process.exit(1);
}

main();
