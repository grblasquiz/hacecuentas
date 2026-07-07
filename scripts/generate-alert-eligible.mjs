// generate-alert-eligible.mjs
// Genera src/lib/alerts/eligible-generated.ts = TODAS las calcs data-driven en
// español cuyo resultado cambia por actualización de datos (frequency≠never +
// dataUpdate.source), para habilitar "avisame cuando cambie" en toda la vertical
// fiscal/salarial/FX de todos los países ES (AR, CO, MX, PE, CL, UY, PY, VE, DO, EC, ES).
// El backend (subscribe.ts + worker alerts-recompute) ya soporta cualquier slug.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src/content');
// Locales en español (excluimos calcs-en / calcs-pt / calcs-pt-pt: el bloque de
// alerta tiene copy hardcodeado en español y el frontend gatea a lang==='es').
const ES_DIRS = ['calcs', 'calcs-mx', 'calcs-co', 'calcs-pe', 'calcs-cl', 'calcs-uy',
  'calcs-py', 'calcs-ve', 'calcs-do', 'calcs-ec', 'calcs-es'];

// slug en el índice de compute → runCompute puede recomputarlo (seguridad)
const computeIndex = JSON.parse(readFileSync(join(ROOT, 'src/lib/calc-compute-index.json'), 'utf8'));
// curados (tienen labels a mano; se fusionan con precedencia en eligible.ts)
const curatedSrc = readFileSync(join(ROOT, 'src/lib/alerts/eligible.ts'), 'utf8');
const curatedSlugs = new Set([...curatedSrc.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));

// Solo verticales económicas: es donde el resultado cambia por actualización de
// datos (salarios, impuestos, aportes, FX, tasas…) y "avisame cuando cambie" aporta.
// El resto (vida, automotor, construcción…) tiene source para citar pero resultado
// input-driven → daría alertas que nunca disparan.
const ECON_CATEGORIES = new Set(['finanzas', 'impuestos', 'laboral', 'negocios']);

// Excluir date-driven / countdown / edad → darían falsos avisos
const DATE_DRIVEN = /cuando-|cuenta-regresiva|regresiva|dias-para|dias-hasta|dias-faltan|faltan-para|proxim|countdown|cumpleanos|aniversario|edad-|-edad|semanas-embarazo|calendario|feriado/i;

function firstLower(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

const out = [];
const seen = new Set();
for (const dir of ES_DIRS) {
  let files = [];
  try { files = readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith('.json')); } catch { continue; }
  for (const f of files) {
    let d;
    try { d = JSON.parse(readFileSync(join(CONTENT, dir, f), 'utf8')); } catch { continue; }
    const slug = d.slug;
    if (!slug || seen.has(slug) || curatedSlugs.has(slug)) continue;
    const du = d.dataUpdate || {};
    const freq = du.frequency;
    if (!freq || freq === 'never') continue;          // no data-driven
    if (!du.source) continue;                          // sin fuente real (evita input-puro)
    if (!ECON_CATEGORIES.has(d.category)) continue;    // solo verticales económicas
    if (DATE_DRIVEN.test(slug)) continue;              // countdown/date → falsos avisos
    if (!computeIndex[slug]) continue;                 // runCompute no lo resuelve → skip
    const outputs = Array.isArray(d.outputs) ? d.outputs : [];
    const primary = outputs.find((o) => o && o.primary && o.id) || outputs.find((o) => o && o.id);
    if (!primary) continue;                            // sin output → no hay qué diffear
    seen.add(slug);
    out.push({
      slug,
      headlineField: primary.id,
      headlineLabel: firstLower(String(primary.label || 'el resultado')).slice(0, 60),
      kind: primary.format === 'currency' ? 'currency' : 'text',
    });
  }
}
out.sort((a, b) => a.slug.localeCompare(b.slug));

const DRY = process.argv.includes('--dry');
if (DRY) {
  const byKind = out.reduce((m, e) => ((m[e.kind] = (m[e.kind] || 0) + 1), m), {});
  console.log(`[dry] elegibles generados: ${out.length}  (curados aparte: ${curatedSlugs.size})`);
  console.log('[dry] por kind:', byKind);
  console.log('[dry] muestra:', out.slice(0, 8).map((e) => `${e.slug} → ${e.headlineField} (${e.kind})`));
} else {
  const header = `// AUTOGENERADO por scripts/generate-alert-eligible.mjs — NO editar a mano.\n` +
    `// Calcs data-driven ES elegibles para "avisame cuando cambie". ${out.length} entradas.\n` +
    `import type { AlertEligible } from './eligible';\n\n` +
    `export const ALERT_ELIGIBLE_GENERATED: AlertEligible[] = ${JSON.stringify(out, null, 2)};\n`;
  writeFileSync(join(ROOT, 'src/lib/alerts/eligible-generated.ts'), header, 'utf8');
  console.log(`✓ eligible-generated.ts escrito: ${out.length} entradas (+ ${curatedSlugs.size} curadas).`);
}
