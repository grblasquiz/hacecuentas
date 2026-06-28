// Dev helper: corre la fórmula de UN calc con inputs dados y muestra los outputs
// reales. Sirve para escribir ejemplos worked-out con números correctos.
//   npx tsx scripts/calc-run.ts <slug-o-formulaId> '{"peso":70}' [lang]
// Busca el JSON en TODOS los locales (calcs, calcs-en, calcs-es, calcs-mx, ...).
// El __lang se deriva del locale donde aparece el calc (en/pt/es) salvo override.
import { formulas } from '../src/lib/formulas/index.ts';
import fs from 'node:fs';
import path from 'node:path';

const arg = process.argv[2];
const inputsRaw = process.argv[3] || '{}';
const langOverride = process.argv[4];
if (!arg) { console.error('uso: tsx scripts/calc-run.ts <slug|formulaId> \'{json inputs}\' [lang]'); process.exit(1); }

const CONTENT = 'src/content';
const DIRS = fs.readdirSync(CONTENT).filter((d) => d === 'calcs' || d.startsWith('calcs-'));
const langForDir = (d: string) => d === 'calcs-en' ? 'en' : (d === 'calcs-pt' || d === 'calcs-pt-pt') ? 'pt' : 'es';

let fid = arg;
let calc: any = null;
let dir = 'calcs';
const fileName = arg.endsWith('.json') ? arg : `${arg}.json`;
// 1) por filename en cada locale
outer: for (const d of DIRS) {
  const p = path.join(CONTENT, d, fileName);
  if (fs.existsSync(p)) { calc = JSON.parse(fs.readFileSync(p, 'utf8')); fid = calc.formulaId; dir = d; break outer; }
}
// 2) por slug/formulaId dentro de los JSON
if (!calc) {
  outer2: for (const d of DIRS) {
    for (const f of fs.readdirSync(path.join(CONTENT, d))) {
      if (!f.endsWith('.json')) continue;
      let j: any; try { j = JSON.parse(fs.readFileSync(path.join(CONTENT, d, f), 'utf8')); } catch { continue; }
      if (j.slug === arg || j.formulaId === arg) { calc = j; fid = j.formulaId; dir = d; break outer2; }
    }
  }
}

const fn = (formulas as any)[fid];
if (typeof fn !== 'function') { console.error(`formulaId '${fid}' no está en el registro`); process.exit(2); }

const inputs = JSON.parse(inputsRaw);
if (!('__lang' in inputs)) inputs.__lang = langOverride || (calc ? langForDir(dir) : 'es');
const out = fn(inputs);
console.log('formulaId:', fid, '| locale:', dir, '| __lang:', inputs.__lang);
console.log('inputs:', JSON.stringify(inputs));
console.log('outputs:', JSON.stringify(out, null, 2));
if (calc?.outputs) {
  console.log('\n--- mapping outputs declarados ---');
  for (const o of calc.outputs) {
    const v = out?.[o.id];
    console.log(`  ${o.primary ? '★' : ' '} ${o.id} (${o.label}): ${v}${o.suffix || ''}`);
  }
}
