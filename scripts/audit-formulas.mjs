/**
 * audit-formulas.mjs — Audit masivo de las 2831 calcs + 3384 fórmulas.
 *
 * Para cada calc en src/content/calcs/:
 *   1. Carga su JSON config
 *   2. Resuelve formulaId → función en src/lib/formulas/index.ts
 *   3. Sintetiza inputs basados en `fields` (defaults + heurística por nombre)
 *   4. Ejecuta la fórmula y captura crashes/errors
 *   5. Valida outputs:
 *      - No NaN, Infinity, undefined, null
 *      - No "NaN"/"undefined"/"null"/"Infinity" como string
 *      - No placeholders ("TODO", "FIXME", "Resultado")
 *      - Si format=number/currency/percentage → debe ser numérico parseable
 *      - Si format=date → debe parsear
 *
 * Output: JSON con problemas priorizados por severidad.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CALCS_DIR = join(ROOT, "src/content/calcs");

// Dynamic import de la formula registry (TypeScript via tsx/strip-types)
let formulas;
try {
  const mod = await import(join(ROOT, "src/lib/formulas/index.ts"));
  formulas = mod.formulas;
} catch (e) {
  console.error("❌ Error importing formulas registry:", e.message);
  process.exit(1);
}

console.log(`✓ Loaded ${Object.keys(formulas).length} formulas\n`);

// ── INPUT SYNTHESIS ─────────────────────────────────────────────
function synthesizeInputs(fields) {
  const inputs = {};
  if (!Array.isArray(fields)) return inputs;
  for (const f of fields) {
    if (!f || !f.id) continue;
    if (f.default !== undefined && f.default !== "") {
      inputs[f.id] = f.default;
      continue;
    }
    const id = String(f.id || "").toLowerCase();
    const label = String(f.label || "").toLowerCase();
    const ph = String(f.placeholder || "").toLowerCase();
    const all = id + " " + label + " " + ph;
    const type = f.type;
    if (type === "number" || (!type && /^-?\d/.test(String(f.default ?? "")))) {
      // PRIORIDAD 1: usar field.min/max si están definidos (input válido garantizado)
      if (typeof f.min === "number" && typeof f.max === "number") {
        // midpoint redondeado al step si está
        const mid = (f.min + f.max) / 2;
        inputs[f.id] = f.step ? Math.round(mid / f.step) * f.step : Math.round(mid);
        continue;
      }
      if (typeof f.min === "number") {
        inputs[f.id] = f.min + (f.step || 1);
        continue;
      }
      if (typeof f.max === "number") {
        inputs[f.id] = Math.max(1, Math.floor(f.max / 2));
        continue;
      }
      // PRIORIDAD 2: heurística por nombre
      if (/sueldo|salario|monto|precio|costo|ingreso|ganancia|deuda|capital|inversion|prestamo|cuota|ahorro|patrimonio|valor/.test(all)) inputs[f.id] = 1500000;
      else if (/edad/.test(all)) inputs[f.id] = 30;
      else if (/años|anios|year/.test(all)) inputs[f.id] = 5;
      else if (/hijos|personas|cargas|cantidad\b|num\b|nro/.test(all)) inputs[f.id] = 2;
      else if (/repeticiones|reps\b/.test(all)) inputs[f.id] = 10;
      else if (/octava/.test(all)) inputs[f.id] = 4;
      else if (/bpm|tempo/.test(all)) inputs[f.id] = 120;
      else if (/semana/.test(all)) inputs[f.id] = 10;
      else if (/tasa|interes|porcentaje|aliquota|inflacion|tna|tea|cft|comision/.test(all)) inputs[f.id] = 5;
      else if (/altura|estatura/.test(all)) inputs[f.id] = 170;
      else if (/peso/.test(all)) inputs[f.id] = 75;
      else if (/watts?|kwh/.test(all)) inputs[f.id] = 10;
      else if (/dias\b/.test(all)) inputs[f.id] = 30;
      else if (/horas\b/.test(all)) inputs[f.id] = 8;
      else if (/minutos\b/.test(all)) inputs[f.id] = 60;
      else if (/meses\b/.test(all)) inputs[f.id] = 12;
      else if (/litros|ml|metros|m2|m3|kg|gramos/.test(all)) inputs[f.id] = 50;
      else if (/tipo|categoria|nivel|cat\b/.test(all)) inputs[f.id] = 1;
      else inputs[f.id] = 100;
    } else if (type === "select") {
      // Preferir el option marcado como default si existe
      const def = f.options?.find((o) => o.value === f.default);
      inputs[f.id] = (def || f.options?.[0])?.value ?? "";
    } else if (type === "date") {
      inputs[f.id] = "1990-01-15";
    } else {
      // text default — detectar fields que esperan CSV o formato especial
      if (/coefs?|coeficientes/.test(id)) inputs[f.id] = "1,2,3";
      else if (/datos|valores|numeros|notas|series/.test(id)) inputs[f.id] = "10,20,30,40,50";
      else if (/fecha/.test(id) || /\d{4}-\d{2}-\d{2}/.test(ph)) inputs[f.id] = "1990-01-15";
      else if (f.placeholder) inputs[f.id] = f.placeholder;
      else inputs[f.id] = "1990-01-15";
    }
  }
  return inputs;
}

// ── OUTPUT VALIDATION ─────────────────────────────────────────────
function validateOutputs(rawOutputs, declared) {
  const issues = [];
  if (rawOutputs === undefined || rawOutputs === null) {
    return [{ severity: "critical", code: "no-output", msg: "formula returned undefined/null" }];
  }
  if (typeof rawOutputs !== "object") {
    return [{ severity: "critical", code: "bad-output-type", msg: `formula returned ${typeof rawOutputs}` }];
  }
  if (!Array.isArray(declared)) return issues;

  // ¿Stub real? Solo si TODOS los outputs declarados son placeholders ('—', 'Resultado', etc.)
  // Si algunos devuelven valores reales y otros "—", es defensa válida (input parcial), no stub.
  const allOutputsArePlaceholder = declared.every((out) => {
    if (!out?.id) return true;
    const v = rawOutputs[out.id];
    if (typeof v !== "string") return false;
    const t = v.trim();
    return t === "—" || t === "" || /^(todo|fixme|placeholder|resultado|xxx|tbd|n\/?a|--+)$/i.test(t);
  });
  if (allOutputsArePlaceholder && declared.length > 0) {
    issues.push({ severity: "high", code: "stub-all", msg: "all outputs are placeholders — formula is a stub" });
  }

  for (const out of declared) {
    if (!out || !out.id) continue;
    const val = rawOutputs[out.id];
    const fmt = out.format;

    if (val === undefined) {
      issues.push({ severity: "high", code: "missing-output", outputId: out.id, msg: `declared output "${out.id}" not in result` });
      continue;
    }
    if (val === null) {
      issues.push({ severity: "high", code: "null-output", outputId: out.id, msg: `output "${out.id}" is null` });
      continue;
    }

    // Numbers / numeric-format outputs
    if (typeof val === "number") {
      if (Number.isNaN(val)) {
        issues.push({ severity: "critical", code: "nan", outputId: out.id, msg: `${out.id} is NaN` });
      } else if (!Number.isFinite(val)) {
        issues.push({ severity: "critical", code: "infinity", outputId: out.id, msg: `${out.id} is Infinity/-Infinity` });
      }
      continue;
    }

    if (typeof val === "string") {
      const v = val.trim();
      const vLower = v.toLowerCase();
      // Bad string sentinels
      if (vLower === "nan" || vLower === "undefined" || vLower === "null" || vLower === "infinity" || vLower === "-infinity") {
        issues.push({ severity: "critical", code: "bad-string", outputId: out.id, value: v, msg: `output is "${v}"` });
        continue;
      }
      // Placeholders
      if (/^(todo|fixme|placeholder|xxx|tbd|n\/?a|--+)$/i.test(v)) {
        issues.push({ severity: "high", code: "placeholder", outputId: out.id, value: v, msg: `output is placeholder "${v}"` });
        continue;
      }
      // Outputs literales "Resultado" (stub fórmulas autogeneradas) — solo flag si NO es defensa parcial
      // (es decir: si la fórmula es 100% stub, ya quedó capturado arriba por allOutputsArePlaceholder).
      // Acá solo marcamos cuando UNO de los outputs queda "—" con format esperado numérico/date.
      if ((v === "Resultado" || v === "—") && (fmt === "currency" || fmt === "number" || fmt === "percentage" || fmt === "integer" || fmt === "date")) {
        issues.push({ severity: "medium", code: "placeholder-typed", outputId: out.id, value: v, fmt, msg: `numeric output is "${v}" — possible missing calc` });
        continue;
      }
      if (v === "Resultado") {
        issues.push({ severity: "high", code: "stub", outputId: out.id, value: v, msg: `output is stub "${v}"` });
        continue;
      }
      // Numeric formats: el valor string debe ser parseable
      if (fmt === "currency" || fmt === "number" || fmt === "percentage" || fmt === "integer" || fmt === "thousands" || fmt === "decimal") {
        // Aceptamos numbers o strings con números parseables (incluso con format AR)
        const cleaned = v.replace(/\./g, "").replace(",", ".").replace(/[^0-9.\-]/g, "");
        const n = Number(cleaned);
        if (!Number.isFinite(n)) {
          issues.push({ severity: "medium", code: "non-numeric", outputId: out.id, value: v, fmt, msg: `output for ${fmt} is not numeric: "${v}"` });
        }
      }
      // Date format
      if (fmt === "date") {
        const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
        if (!ymd) {
          // Maybe localized date — skip
        } else {
          const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
          if (Number.isNaN(d.getTime())) {
            issues.push({ severity: "medium", code: "bad-date", outputId: out.id, value: v, msg: `bad date "${v}"` });
          }
        }
      }
    }
  }
  return issues;
}

// ── MAIN AUDIT LOOP ─────────────────────────────────────────────
const files = (await readdir(CALCS_DIR)).filter((f) => f.endsWith(".json"));
console.log(`✓ Found ${files.length} calc JSONs\n`);

const stats = {
  total: 0,
  ok: 0,
  noFormula: 0,
  crashed: 0,
  withIssues: 0,
  bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
  byCode: {},
};
const problems = [];

for (const file of files) {
  stats.total++;
  let calc;
  try {
    calc = JSON.parse(await readFile(join(CALCS_DIR, file), "utf-8"));
  } catch (e) {
    problems.push({ slug: file.replace(".json", ""), severity: "critical", code: "bad-json", msg: e.message });
    stats.bySeverity.critical++;
    stats.byCode["bad-json"] = (stats.byCode["bad-json"] || 0) + 1;
    continue;
  }

  const formulaId = calc.formulaId;
  const fn = formulas[formulaId];
  if (!fn) {
    problems.push({ slug: calc.slug, severity: "critical", code: "no-formula", formulaId, msg: `formulaId "${formulaId}" not registered` });
    stats.noFormula++;
    stats.bySeverity.critical++;
    stats.byCode["no-formula"] = (stats.byCode["no-formula"] || 0) + 1;
    continue;
  }

  const inputs = synthesizeInputs(calc.fields);

  let result;
  try {
    result = fn(inputs);
  } catch (e) {
    problems.push({
      slug: calc.slug,
      severity: "critical",
      code: "crash",
      formulaId,
      inputs,
      msg: e?.message?.slice(0, 200) || String(e).slice(0, 200),
    });
    stats.crashed++;
    stats.bySeverity.critical++;
    stats.byCode["crash"] = (stats.byCode["crash"] || 0) + 1;
    continue;
  }

  const issues = validateOutputs(result, calc.outputs);
  if (issues.length > 0) {
    problems.push({ slug: calc.slug, formulaId, inputs, outputs: result, issues });
    stats.withIssues++;
    for (const i of issues) {
      stats.bySeverity[i.severity] = (stats.bySeverity[i.severity] || 0) + 1;
      stats.byCode[i.code] = (stats.byCode[i.code] || 0) + 1;
    }
  } else {
    stats.ok++;
  }
}

// ── REPORT ─────────────────────────────────────────────
console.log("═══════════════════════════════════════════════");
console.log("AUDIT RESULTS");
console.log("═══════════════════════════════════════════════");
console.log(`Total calcs:     ${stats.total}`);
console.log(`✅ OK:            ${stats.ok}`);
console.log(`💥 Crashed:       ${stats.crashed}`);
console.log(`🔌 No formula:    ${stats.noFormula}`);
console.log(`⚠️  With issues:   ${stats.withIssues}`);
console.log();
console.log("By severity:");
for (const [sev, count] of Object.entries(stats.bySeverity)) {
  console.log(`  ${sev.padEnd(10)} ${count}`);
}
console.log();
console.log("By code (top 15):");
const sortedCodes = Object.entries(stats.byCode).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [code, count] of sortedCodes) {
  console.log(`  ${code.padEnd(20)} ${count}`);
}

// Save full report
const reportPath = join(ROOT, "audit-report.json");
await writeFile(reportPath, JSON.stringify({ stats, problems }, null, 2));
console.log(`\n📄 Full report: ${reportPath} (${problems.length} problems)`);

// Print first 10 critical problems
console.log("\n═══════════════════════════════════════════════");
console.log("TOP 10 CRITICAL PROBLEMS");
console.log("═══════════════════════════════════════════════");
const critical = problems.filter((p) => p.severity === "critical" || p.issues?.some((i) => i.severity === "critical"));
for (const p of critical.slice(0, 10)) {
  if (p.code) {
    console.log(`\n[${p.code}] ${p.slug}`);
    console.log(`  ${p.msg}`);
    if (p.formulaId) console.log(`  formulaId: ${p.formulaId}`);
  } else {
    console.log(`\n${p.slug} (formulaId: ${p.formulaId})`);
    for (const i of p.issues.filter((x) => x.severity === "critical").slice(0, 3)) {
      console.log(`  [${i.code}] ${i.msg}`);
    }
  }
}
