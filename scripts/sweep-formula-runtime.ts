// QA: corre CADA fórmula con inputs derivados de sus fields y flaggea las que
// tiran error, devuelven NaN/undefined, o un output primario vacío. Encuentra
// calcs que "no funcionan" sin abrir 2793 páginas a mano.
import { formulas } from '../src/lib/formulas/index.ts';
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/content/calcs';
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'));

function inputFor(field: any): any {
  const id = field.id || field.name;
  if (!id) return null;
  const t = field.type || 'number';
  if (t === 'select' || field.options) {
    const opts = field.options || [];
    const first = opts[0];
    return { id, val: typeof first === 'object' ? (first.value ?? first.val ?? first.id) : first };
  }
  if (t === 'number' || field.inputmode) {
    // placeholder "Ej: 120" → 120; si no, punto medio min/max; si no, 10
    const ph = String(field.placeholder || '').match(/-?\d+([.,]\d+)?/);
    let v = ph ? Number(ph[0].replace(',', '.')) : NaN;
    if (!Number.isFinite(v)) {
      const mn = Number(field.min), mx = Number(field.max);
      v = Number.isFinite(mn) && Number.isFinite(mx) ? (mn + mx) / 2 : 10;
    }
    return { id, val: v };
  }
  if (t === 'date') return { id, val: '2026-01-01' };
  return { id, val: field.placeholder || '10' };
}

const fails: any[] = [];
let checked = 0, noFormula = 0, noFields = 0;

for (const f of files) {
  let d: any;
  try { d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  const fid = d.formulaId;
  if (!fid) { noFormula++; continue; }
  const fn = (formulas as any)[fid];
  if (typeof fn !== 'function') { fails.push({ slug: d.slug, why: `formulaId '${fid}' no está en el registro` }); continue; }
  const fields = d.fields || d.inputs || [];
  if (!fields.length) { noFields++; continue; }
  const inputs: any = {};
  for (const fld of fields) { const x = inputFor(fld); if (x) inputs[x.id] = x.val; }
  checked++;
  try {
    const out = fn(inputs);
    if (out == null || typeof out !== 'object') { fails.push({ slug: d.slug, why: 'output no es objeto', out: String(out) }); continue; }
    // primer output declarado o cualquier valor del retorno
    const primId = (d.outputs?.find((o: any) => o.primary) || d.outputs?.[0])?.id;
    const vals = Object.entries(out).filter(([k]) => k !== '_insight');
    const primVal = primId && primId in out ? out[primId] : (vals[0]?.[1]);
    const sv = String(primVal ?? '');
    if (primVal === undefined || primVal === null || sv === '' || /NaN|Infinity|undefined/.test(sv)) {
      fails.push({ slug: d.slug, why: 'output primario vacío/NaN', primId, val: sv, inputs });
    }
  } catch (e: any) {
    fails.push({ slug: d.slug, why: 'THROW: ' + String(e?.message || e).slice(0, 80), inputs });
  }
}

console.log(`Archivos: ${files.length} | con fórmula+fields corridos: ${checked} | sin formulaId: ${noFormula} | sin fields: ${noFields}`);
console.log(`\n🔴 FALLAS: ${fails.length}`);
for (const x of fails.slice(0, 40)) console.log('  -', x.slug, '→', x.why, x.val !== undefined ? `(val='${x.val}')` : '');
