/**
 * lint-calc-quality.mjs — Detector de calcs incompletas / contradictorias.
 *
 * Implementa el plan AdSense (ítems 2 y 5): marca como candidata a `draft`
 * cualquier calc con señales de incompletitud, plantilla o fuentes genéricas.
 * Reporta por-check (para dimensionar) y el set único de calcs que fallan.
 *
 * Uso:  node scripts/lint-calc-quality.mjs [--json] [--dir calcs]
 * Exit: 0 siempre (reporte); el gate de build se decide aparte.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const onlyDir = (args.find(a => a.startsWith('--dir=')) || '').split('=')[1];
const base = 'src/content';
const dirs = fs.readdirSync(base).filter(d => (d === 'calcs' || d.startsWith('calcs-')) && (!onlyDir || d === onlyDir));

const CHECKS = {
  placeholderPhrase: (j, raw) => /Input\s*1\b|Input\s*2\b|Ingres[áa]\s+consultar|fórmula estándar del tema|ingresando consultar/i.test(raw),
  // Placeholder REAL: "Input 1/2", "Campo 3", label vacío, o el antipatrón "Consultar".
  // "Valor"/"Dato" a secas NO se marcan: son labels válidos de conversor.
  placeholderField: (j) => (j.fields || []).some(f => {
    const l = (f.label || '').trim();
    return /^(input|campo|field)\s*\d+$/i.test(l) || l === '' || /^consultar$/i.test(l);
  }),
  // Example stub SOLO si TODO el ejemplo es placeholder (steps ausentes/genéricos
  // Y result genérico). Un ejemplo con steps ricos y result vacío NO es stub.
  stubExample: (j) => {
    const ex = j.example; if (!ex) return false;
    const steps = (ex.steps || []).map(s => String(s).trim().toLowerCase());
    const res = String(ex.result || '').trim().toLowerCase();
    const stubby = new Set(['ejemplo', 'resultado', 'input 1', 'input 2', '', 'x', '$x']);
    const stepsStub = steps.length === 0 || steps.every(s => stubby.has(s) || s.length < 3);
    const resStub = stubby.has(res) || res === '' || /^\$?x$/i.test(res);
    return stepsStub && resStub;
  },
  // Output genérico SOLO cuando además es un "info-selector" (1 solo campo select):
  // el antipatrón monotributo-social (Consultar→Info). Un conversor con salida
  // "Resultado" es legítimo (la salida ES el valor convertido).
  genericOutput: (j) => {
    const outs = (j.outputs || []);
    const flds = (j.fields || []);
    const infoSelector = flds.length === 1 && flds[0] && flds[0].type === 'select';
    return infoSelector && outs.length > 0 && outs.every(o => /^(info|resultado|resultado \d|interpretaci[óo]n|valor|dato)$/i.test((o.label || '').trim()));
  },
  genericSourceDump: (j) => {
    const s = JSON.stringify(j.sources || []);
    const bad = /Wolfram MathWorld|Khan Academy|NIST — National|WHO, OMS|\bIATA\b|\bAAA\b|Referencias internacionales|fuentes internacionales/i;
    if (!bad.test(s)) return false;
    // en calcs de ciencia/mate el bloque math es defendible
    return !['matematica', 'geometria', 'fisica', 'ciencia', 'conversiones', 'tecnologia'].includes(j.category);
  },
  homepageOnlySources: (j) => {
    const srcs = j.sources || [];
    if (srcs.length === 0) return false;
    const isHome = (u) => typeof u === 'string' && /^https?:\/\/[^/]+\/?$/.test(u.trim());
    return srcs.every(s => isHome(s.url));  // TODAS las fuentes son portada raíz
  },
  editorialNoReviewer: (j, raw) => /equipo editorial/i.test(raw) && !j.professionalReviewer,
  numericFieldNoHelp: (j) => (j.fields || []).some(f => f.type === 'number' && !f.help && !/[€$%]|kg|km|hs|años|meses|m2|m³|mm|cm|kwh|\/|\(/.test(f.label || '')),
};

const results = {};
for (const k of Object.keys(CHECKS)) results[k] = [];
const failByCalc = new Map(); // id -> [checks]

for (const d of dirs) {
  const dir = path.join(base, d);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    let j, raw;
    try { raw = fs.readFileSync(path.join(dir, f), 'utf8'); j = JSON.parse(raw); } catch { continue; }
    // ya gateadas (draft/restricted/ymyl-high/noindex) no cuentan como "visible rota"
    const alreadyGated = j.status === 'draft' || j.distribution === 'restricted' || j.ymylRisk === 'high' || j.noindex === true;
    const id = d + '/' + f.replace('.json', '');
    for (const [k, fn] of Object.entries(CHECKS)) {
      let bad = false; try { bad = fn(j, raw); } catch {}
      if (bad) {
        results[k].push(id + (alreadyGated ? ' [gated]' : ''));
        if (!alreadyGated) { if (!failByCalc.has(id)) failByCalc.set(id, []); failByCalc.get(id).push(k); }
      }
    }
  }
}

// FAQ reutilizadas cross-calc (ítem 2): misma pregunta+respuesta idéntica en ≥3 calcs
const faqSeen = new Map();
for (const d of dirs) {
  const dir = path.join(base, d);
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    for (const q of (j.faq || [])) {
      const key = ((q.q || '') + '||' + (q.a || '')).trim().toLowerCase();
      if (key.length < 20) continue;
      if (!faqSeen.has(key)) faqSeen.set(key, []);
      faqSeen.get(key).push(d + '/' + f.replace('.json', ''));
    }
  }
}
const reusedFaq = [...faqSeen.entries()].filter(([, arr]) => arr.length >= 3);

console.log('=== LINT CALC QUALITY — por check (excluye ya-gateadas del set único) ===');
for (const [k, arr] of Object.entries(results)) {
  const gated = arr.filter(x => x.includes('[gated]')).length;
  console.log(`  ${k}: ${arr.length}  (visibles: ${arr.length - gated}, ya-gateadas: ${gated})`);
}
console.log(`  reusedFaqBlocks (misma FAQ en ≥3 calcs): ${reusedFaq.length} bloques`);
console.log(`\n>>> CALCS VISIBLES que fallan ≥1 check: ${failByCalc.size}`);

// desglose por # de checks fallados
const byCount = {};
for (const [, checks] of failByCalc) { const n = checks.length; byCount[n] = (byCount[n] || 0) + 1; }
console.log('   por # de checks fallados:', JSON.stringify(byCount));

const outArg = (args.find(a => a.startsWith('--out=')) || '').split('=')[1];
if (outArg) {
  try {
    fs.writeFileSync(outArg, JSON.stringify({ failByCalc: [...failByCalc], results, reusedFaq: reusedFaq.map(([k, a]) => ({ n: a.length, sample: a.slice(0, 4) })) }, null, 1));
    console.log(`\nDetalle -> ${outArg}`);
  } catch (e) { console.error('no pude escribir --out:', e.message); }
}

// --- Gate de build (--gate): falla si una calc VISIBLE tiene una rotura DURA
// (placeholder de frase/campo, output genérico de info-selector, o ejemplo stub).
// Los ítems de calidad de fuente (homepage/dump) y el ruido de help NO frenan
// el build: se reportan pero se arreglan aparte. Marcá la calc con
// `"status": "draft"` para sacarla de la vista (y del gate).
const HARD = ['placeholderPhrase', 'placeholderField', 'genericOutput', 'stubExample'];
const hardFails = [...failByCalc].filter(([, checks]) => checks.some(c => HARD.includes(c)));
if (args.includes('--gate')) {
  if (hardFails.length > 0) {
    console.error(`\n🔴 GATE: ${hardFails.length} calc(s) VISIBLE(s) con rotura dura (incompleta/placeholder).`);
    hardFails.forEach(([id, checks]) => console.error(`   ${id} -> ${checks.filter(c => HARD.includes(c)).join(',')}`));
    console.error('   Completala o marcala "status":"draft" para sacarla de la vista.');
    process.exit(1);
  }
  console.log('\n✅ GATE OK: 0 calcs visibles con rotura dura.');
}
