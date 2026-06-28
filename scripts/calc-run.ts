// Dev helper: corre la fórmula de UN calc con inputs dados y muestra los outputs
// reales. Sirve para escribir ejemplos worked-out con números correctos.
//   npx tsx scripts/calc-run.ts <slug-o-formulaId> '{"peso":70,"actividad":"moderada"}'
import { formulas } from '../src/lib/formulas/index.ts';
import fs from 'node:fs';
import path from 'node:path';

const arg = process.argv[2];
const inputsRaw = process.argv[3] || '{}';
if (!arg) { console.error('uso: tsx scripts/calc-run.ts <slug|formulaId> \'{json inputs}\''); process.exit(1); }

// Resolver formulaId: aceptar formulaId directo o filename/slug del JSON
let fid = arg;
let calc: any = null;
const BASE = 'src/content/calcs';
const tryFiles = [arg.endsWith('.json') ? arg : `${arg}.json`];
for (const tf of tryFiles) {
  const p = path.join(BASE, tf);
  if (fs.existsSync(p)) { calc = JSON.parse(fs.readFileSync(p, 'utf8')); fid = calc.formulaId; break; }
}
if (!calc) {
  // buscar por slug dentro de los JSON
  for (const f of fs.readdirSync(BASE)) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(BASE, f), 'utf8'));
    if (d.slug === arg || d.formulaId === arg) { calc = d; fid = d.formulaId; break; }
  }
}

const fn = (formulas as any)[fid];
if (typeof fn !== 'function') { console.error(`formulaId '${fid}' no está en el registro`); process.exit(2); }

const inputs = JSON.parse(inputsRaw);
if (!('__lang' in inputs)) inputs.__lang = 'es';
const out = fn(inputs);
console.log('formulaId:', fid);
console.log('inputs:', JSON.stringify(inputs));
console.log('outputs:', JSON.stringify(out, null, 2));
if (calc?.outputs) {
  console.log('\n--- mapping outputs declarados ---');
  for (const o of calc.outputs) {
    const v = out?.[o.id];
    console.log(`  ${o.primary ? '★' : ' '} ${o.id} (${o.label}): ${v}${o.suffix || ''}`);
  }
}
