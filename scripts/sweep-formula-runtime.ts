// QA: corre CADA fórmula con inputs derivados de sus fields y flaggea las que
// tiran error, devuelven NaN/undefined, o un output primario vacío. Encuentra
// calcs que "no funcionan" sin abrir 2793 páginas a mano.
import { formulas } from '../src/lib/formulas/index.ts';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'src/content';
const DIRS = fs.readdirSync(BASE).filter((d) => d === 'calcs' || d.startsWith('calcs-'));
const files: { dir: string; file: string; lang: string }[] = [];
for (const dir of DIRS) {
  const lang = dir === 'calcs-en' ? 'en' : (dir === 'calcs-pt' || dir === 'calcs-pt-pt') ? 'pt' : 'es';
  for (const f of fs.readdirSync(path.join(BASE, dir))) {
    if (f.endsWith('.json')) files.push({ dir, file: f, lang });
  }
}

function inputFor(field: any): any {
  const id = field.id || field.name;
  if (!id) return null;
  const t = field.type || 'number';
  // 1) Si el campo declara un default, usarlo: es el valor que el autor eligió y
  //    el que ve el usuario. Evita falsos positivos por inputs sintéticos malos.
  if (field.default !== undefined && field.default !== null && field.default !== '') {
    return { id, val: field.default };
  }
  // 2) Selects / radios → primer option válido.
  if (t === 'select' || t === 'radio' || field.options) {
    const opts = field.options || [];
    const first = opts[0];
    return { id, val: typeof first === 'object' ? (first.value ?? first.val ?? first.id) : first };
  }
  // 2b) Horas (HH:MM) ANTES del branch numérico: muchos campos de hora son
  //     type:text con inputmode, y el branch numérico les extraería "20" del
  //     placeholder "Ej: 20:00" → la fórmula espera "HH:MM" y devuelve NaN:NaN.
  if (t === 'time' || /\d{1,2}:\d{2}/.test(String(field.placeholder || ''))) {
    return { id, val: '08:00' };
  }
  // 3) Numéricos (incluye currency/percent/range e inputmode numérico).
  if (t === 'number' || t === 'currency' || t === 'percent' || t === 'range' || field.inputmode) {
    // placeholder "Ej: 120" → 120; si no, punto medio min/max; si no, 10
    const ph = String(field.placeholder || '').match(/-?\d+([.,]\d+)?/);
    let v = ph ? Number(ph[0].replace(',', '.')) : NaN;
    if (!Number.isFinite(v)) {
      const mn = Number(field.min), mx = Number(field.max);
      v = Number.isFinite(mn) && Number.isFinite(mx) ? (mn + mx) / 2 : 10;
    }
    return { id, val: v };
  }
  // 4) Fechas y horas.
  if (t === 'date') return { id, val: '2026-01-01' };
  if (t === 'time') return { id, val: '08:00' };
  // 5) Texto/textarea: si el placeholder sugiere una lista de números, devolverla
  //    (ej. promedio/desvío esperan "10, 20, 30"). Si parece hora (HH:MM), 08:00.
  const phStr = String(field.placeholder || '');
  const listNums = phStr.match(/-?\d+([.,]\d+)?/g);
  if (/\d[\s,;]+\d/.test(phStr) && listNums && listNums.length >= 2) {
    return { id, val: listNums.map((n) => n.replace(',', '.')).join(', ') };
  }
  if (/\d{1,2}:\d{2}/.test(phStr) || /\b(hora|time)\b/i.test(id)) return { id, val: '08:00' };
  // 6) Texto genérico: usar el placeholder si es un valor de ejemplo limpio, si no '10'.
  const clean = phStr.replace(/^ej[:.]?\s*/i, '').trim();
  return { id, val: clean || '10' };
}

const fails: any[] = [];
let checked = 0, noFormula = 0, noFields = 0;

for (const { dir, file: f, lang } of files) {
  let d: any;
  try { d = JSON.parse(fs.readFileSync(path.join(BASE, dir, f), 'utf8')); } catch { continue; }
  const fid = d.formulaId;
  if (!fid) { noFormula++; continue; }
  const fn = (formulas as any)[fid];
  if (typeof fn !== 'function') { fails.push({ slug: `${dir}/${d.slug}`, why: `formulaId '${fid}' no está en el registro` }); continue; }
  const fields = d.fields || d.inputs || [];
  if (!fields.length) { noFields++; continue; }
  const inputs: any = { __lang: lang };
  for (const fld of fields) { const x = inputFor(fld); if (x) inputs[x.id] = x.val; }
  checked++;
  try {
    const out = fn(inputs);
    if (out == null || typeof out !== 'object') { fails.push({ slug: `${dir}/${d.slug}`, why: 'output no es objeto', out: String(out) }); continue; }
    // primer output declarado o cualquier valor del retorno
    const primId = (d.outputs?.find((o: any) => o.primary) || d.outputs?.[0])?.id;
    const vals = Object.entries(out).filter(([k]) => k !== '_insight');
    const primVal = primId && primId in out ? out[primId] : (vals[0]?.[1]);
    const sv = String(primVal ?? '');
    if (primVal === undefined || primVal === null || sv === '' || /NaN|Infinity|undefined/.test(sv)) {
      fails.push({ slug: `${dir}/${d.slug}`, why: 'output primario vacío/NaN', primId, val: sv, inputs });
    }
  } catch (e: any) {
    fails.push({ slug: `${dir}/${d.slug}`, why: 'THROW: ' + String(e?.message || e).slice(0, 80), inputs });
  }
}

console.log(`Archivos: ${files.length} | con fórmula+fields corridos: ${checked} | sin formulaId: ${noFormula} | sin fields: ${noFields}`);
console.log(`\n🔴 FALLAS: ${fails.length}`);
for (const x of fails.slice(0, 40)) console.log('  -', x.slug, '→', x.why, x.val !== undefined ? `(val='${x.val}')` : '');
