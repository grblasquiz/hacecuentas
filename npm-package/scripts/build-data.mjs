// ─────────────────────────────────────────────────────────────────────────────
// Generador del paquete npm `hacecuentas-datos-latam`.
//
// Importa las fuentes únicas de verdad de src/lib/data/*-2026.ts y serializa
// SOLO los datos (no las funciones) a JSON + un index.js/index.d.ts inlined.
//
// Correr:  npx tsx npm-package/scripts/build-data.mjs
//
// Re-correr cada vez que cambian los datos fiscales para mantener el paquete
// en sync con el sitio (cero retipeo manual, cero drift).
// ─────────────────────────────────────────────────────────────────────────────
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');          // npm-package/
const SRC = resolve(__dirname, '../../src/lib/data');
const OUT_DATA = resolve(ROOT, 'data');
mkdirSync(OUT_DATA, { recursive: true });

// Cada dataset: archivo fuente + metadatos de cita (fuente oficial real).
const DATASETS = [
  {
    slug: 'argentina-monotributo', src: 'monotributo-2026.ts',
    country: 'Argentina', cc: 'AR', currency: 'ARS',
    title: 'Monotributo Argentina 2026 — categorías, topes de facturación y cuotas',
    source: 'ARCA (ex AFIP)',
    sourceUrl: 'https://www.afip.gob.ar/monotributo/categorias.asp',
  },
  {
    slug: 'argentina-feriados', src: 'feriados-ar-2026.ts',
    country: 'Argentina', cc: 'AR', currency: null,
    title: 'Feriados Argentina 2026 — nacionales, trasladables y puentes',
    source: 'Boletín Oficial — Ley 27.399 + Decreto 1584/2010 + Resolución 164/2025',
    sourceUrl: 'https://www.argentina.gob.ar/interior/feriados-nacionales-2026',
  },
  {
    slug: 'brasil', src: 'brasil-2026.ts',
    country: 'Brasil', cc: 'BR', currency: 'BRL',
    title: 'Brasil 2026 — salário mínimo, INSS, IRRF, FGTS, seguro-desemprego e MEI',
    source: 'Receita Federal / INSS (Portaria Interministerial MPS/MF) / Decreto 12.797/2025',
    sourceUrl: 'https://www.gov.br/trabalho-e-emprego/pt-br',
  },
  {
    slug: 'chile', src: 'chile-2026.ts',
    country: 'Chile', cc: 'CL', currency: 'CLP',
    title: 'Chile 2026 — ingreso mínimo, topes imponibles e impuesto de 2ª categoría',
    source: 'Ley 21.751 (IMM) / Superintendencia de Pensiones (topes) / SII (Art. 43 LIR)',
    sourceUrl: null,
  },
  {
    slug: 'colombia', src: 'colombia-2026.ts',
    country: 'Colombia', cc: 'CO', currency: 'COP',
    title: 'Colombia 2026 — UVT, retención en la fuente, renta y parámetros laborales',
    source: 'DIAN (Resolución 000238 del 15-dic-2025, UVT) / Ministerio del Trabajo',
    sourceUrl: null,
  },
  {
    slug: 'ecuador', src: 'ecuador-2026.ts',
    country: 'Ecuador', cc: 'EC', currency: 'USD',
    title: 'Ecuador 2026 — SBU, aportes IESS y tabla de impuesto a la renta',
    source: 'SRI (Resolución NAC-DGERCGC25-00000043) / IESS / Ministerio del Trabajo',
    sourceUrl: null,
  },
  {
    slug: 'mexico', src: 'mexico-2026.ts',
    country: 'México', cc: 'MX', currency: 'MXN',
    title: 'México 2026 — tarifas ISR, subsidio al empleo y cuotas IMSS',
    source: 'SAT (Anexo 8 RMF 2026, DOF 28-dic-2025) / IMSS (LSS)',
    sourceUrl: null,
  },
  {
    slug: 'peru', src: 'peru-2026.ts',
    country: 'Perú', cc: 'PE', currency: 'PEN',
    title: 'Perú 2026 — RMV, UIT, IGV, aportes y renta de 5ta categoría',
    source: 'SUNAT / MTPE / EsSalud (RMV DS 006-2024-TR, UIT DS 301-2025-EF)',
    sourceUrl: null,
  },
  {
    slug: 'usa', src: 'usa-2026.ts',
    country: 'Estados Unidos', cc: 'US', currency: 'USD',
    title: 'USA 2026 — IRS 401(k) & IRA contribution limits (tax year 2026)',
    source: 'IRS Notice 2025-67 (Nov 2025 cost-of-living adjustments)',
    sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-25-67.pdf',
  },
];

// Infinity/-Infinity/NaN no son representables en JSON → null = "sin tope superior".
const replacer = (_k, v) =>
  (typeof v === 'number' && !Number.isFinite(v)) ? null : v;

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const manifest = [];
const jsExports = [];
const dtsExports = [];

for (const d of DATASETS) {
  const mod = await import(resolve(SRC, d.src));

  // Quedarse solo con los DATOS (descartar funciones).
  const data = {};
  for (const [k, v] of Object.entries(mod)) {
    if (typeof v === 'function') continue;
    data[k] = v;
  }
  const dataAsOf = typeof mod.DATA_AS_OF === 'string' ? mod.DATA_AS_OF : null;

  const meta = {
    slug: d.slug, country: d.country, countryCode: d.cc, currency: d.currency,
    title: d.title, year: 2026, dataAsOf,
    source: d.source, sourceUrl: d.sourceUrl,
    reference: `https://hacecuentas.com`,
    license: 'CC-BY-4.0',
    attribution: 'Datos compilados por hacecuentas.com — https://hacecuentas.com',
  };

  const payload = { $meta: meta, ...data };
  writeFileSync(
    resolve(OUT_DATA, `${d.slug}.json`),
    JSON.stringify(payload, replacer, 2) + '\n',
  );

  const varName = camel(d.slug);
  jsExports.push(
    `/** ${d.title}\n *  Fuente: ${d.source}${dataAsOf ? ` · vigencia ${dataAsOf}` : ''} */\n` +
    `export const ${varName} = ${JSON.stringify(payload, replacer, 2)};`,
  );
  dtsExports.push(
    `/** ${d.title} */\nexport declare const ${varName}: Record<string, unknown>;`,
  );

  manifest.push({ ...meta, file: `data/${d.slug}.json` });
}

// Manifiesto consultable (también queda servido por jsDelivr/unpkg).
writeFileSync(
  resolve(OUT_DATA, 'index.json'),
  JSON.stringify({
    name: 'hacecuentas-datos-latam',
    description: 'Datos fiscales y laborales 2026 de LATAM + EE.UU., compilados por hacecuentas.com',
    homepage: 'https://hacecuentas.com',
    license: 'CC-BY-4.0',
    datasets: manifest,
  }, null, 2) + '\n',
);

// index.js (ESM, datos inlined — sin import assertions ni archivos externos).
const varNames = DATASETS.map((d) => camel(d.slug));
writeFileSync(
  resolve(ROOT, 'index.js'),
  `// AUTO-GENERADO por scripts/build-data.mjs — no editar a mano.\n` +
  `// Datos fiscales y laborales 2026 · LATAM + EE.UU. · CC-BY-4.0 · https://hacecuentas.com\n\n` +
  jsExports.join('\n\n') + '\n\n' +
  `/** Todos los datasets indexados por slug. */\n` +
  `export const datasets = { ${varNames.map((v, i) => `'${DATASETS[i].slug}': ${v}`).join(', ')} };\n\n` +
  `/** Metadatos de cita de cada dataset (país, vigencia, fuente oficial). */\n` +
  `export const meta = ${JSON.stringify(manifest, null, 2)};\n\n` +
  `export default datasets;\n`,
);

// index.d.ts
writeFileSync(
  resolve(ROOT, 'index.d.ts'),
  `// AUTO-GENERADO por scripts/build-data.mjs — no editar a mano.\n\n` +
  dtsExports.join('\n\n') + '\n\n' +
  `export declare const datasets: Record<string, Record<string, unknown>>;\n` +
  `export interface DatasetMeta {\n` +
  `  slug: string; country: string; countryCode: string; currency: string | null;\n` +
  `  title: string; year: number; dataAsOf: string | null;\n` +
  `  source: string; sourceUrl: string | null; reference: string;\n` +
  `  license: string; attribution: string; file: string;\n}\n` +
  `export declare const meta: DatasetMeta[];\n` +
  `declare const _default: Record<string, Record<string, unknown>>;\n` +
  `export default _default;\n`,
);

console.log(`✓ ${DATASETS.length} datasets generados en npm-package/`);
for (const m of manifest) console.log(`  · ${m.slug.padEnd(24)} ${m.dataAsOf ?? '—'}  ${m.source}`);
