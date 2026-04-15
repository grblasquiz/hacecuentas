/**
 * Wizard interactivo para crear una calc nueva con el schema completo, incluido
 * el bloque `dataUpdate` obligatorio. Evita que cuelguen JSONs incompletos.
 *
 * Uso:
 *   node --experimental-strip-types scripts/new-calc.ts
 *
 * Pregunta por stdin:
 *   1. slug (kebab-case)
 *   2. title, h1, description, category (elegido de lista)
 *   3. formulaId
 *   4. frequency (elegido de lista)
 *   5. source + sourceUrl si frequency != never
 *   6. updateType
 *
 * Output: src/content/calcs/{slug}.json con fields vacíos y outputs vacíos
 * (el autor completa después). El bloque dataUpdate queda listo.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

const CATEGORIES = [
  'finanzas', 'negocios', 'salud', 'marketing', 'deportes',
  'viajes', 'vida', 'mascotas', 'matematica', 'construccion', 'cocina',
];

const FREQUENCIES = ['never', 'daily', 'weekly', 'monthly', 'biannual', 'yearly'];
const UPDATE_TYPES = ['manual', 'auto-api', 'auto-scrape', 'auto-llm'];

async function main() {
  const rl = readline.createInterface({ input, output });
  const ask = async (q: string, defaultVal?: string): Promise<string> => {
    const prompt = defaultVal ? `${q} (default: ${defaultVal}): ` : `${q}: `;
    const a = (await rl.question(prompt)).trim();
    return a || defaultVal || '';
  };
  const askChoice = async (q: string, choices: string[], defaultVal?: string): Promise<string> => {
    while (true) {
      const a = await ask(`${q} [${choices.join(' | ')}]`, defaultVal);
      if (choices.includes(a)) return a;
      console.log(`  ↳ opción inválida, probá de nuevo`);
    }
  };

  console.log('\n🧮 Nueva calculadora — HaceCuentas\n');

  const slug = await ask('Slug (kebab-case, ej: calculadora-algo)');
  if (!slug) { console.error('Slug requerido.'); process.exit(1); }
  if (!/^[a-z0-9-]+$/.test(slug)) { console.error('Slug debe ser kebab-case.'); process.exit(1); }
  const outPath = join(CALCS_DIR, `${slug}.json`);
  if (existsSync(outPath)) { console.error(`Ya existe: ${outPath}`); process.exit(1); }

  const title = await ask('Título (SEO, 50-60 chars)');
  const h1 = await ask('H1 (cómo aparece en la página)', title);
  const description = await ask('Descripción corta (meta description)');
  const category = await askChoice('Categoría', CATEGORIES);
  const icon = await ask('Icono (emoji o nombre Lucide)', '🧮');
  const formulaId = await ask('formulaId (debe existir en src/lib/formulas/index.ts)');

  console.log('\n— Frecuencia de actualización de datos —');
  console.log('  never: fórmulas puras, matemáticas, físicas inmutables');
  console.log('  daily: cotizaciones vivas');
  console.log('  monthly: ICL alquiler, IPC, UVA');
  console.log('  biannual: ley ganancias, monotributo, SMVM');
  console.log('  yearly: vacaciones, impuestos anuales\n');

  const frequency = await askChoice('frequency', FREQUENCIES, 'never');

  let source: string | null = null;
  let sourceUrl: string | null = null;
  let updateType = 'manual';

  if (frequency !== 'never') {
    source = await ask('Fuente oficial (ej: ARCA, BCRA, INDEC)');
    sourceUrl = await ask('URL oficial (ej: https://www.arca.gob.ar/...)');
    updateType = await askChoice('updateType', UPDATE_TYPES, 'auto-llm');
  }

  const notes = await ask('Notas sobre la actualización (opcional)');

  const dataUpdate: any = {
    frequency,
    lastUpdated: new Date().toISOString().slice(0, 10),
    source,
    sourceUrl,
    updateType,
  };
  if (notes) dataUpdate.notes = notes;

  const calc = {
    slug,
    title,
    h1,
    description,
    category,
    icon,
    formulaId,
    seoKeywords: [],
    intro: '',
    keyTakeaway: '',
    useCases: [],
    fields: [],
    dataUpdate,
    outputs: [],
    faq: [],
  };

  writeFileSync(outPath, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  console.log(`\n✓ Creado: ${outPath}`);
  console.log(`  Completá: fields, outputs, seoKeywords, intro, keyTakeaway, useCases, faq`);
  console.log(`  Registrá la fórmula en src/lib/formulas/index.ts como '${formulaId}'`);
  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
