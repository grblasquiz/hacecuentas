/**
 * Gate de CI anti-hardcode fiscal.
 *
 * Problema que mata: fórmulas que hardcodean constantes fiscales VIEJAS
 * (salário mínimo 2025, teto INSS 2025, límites IRS 2025, monotributo viejo)
 * cuando la fuente única correcta YA existe en src/lib/data/ (brasil-2026.ts,
 * monotributo-2026.ts, usa-2026.ts, peru-2026.ts, ecuador-2026.ts) o en los
 * módulos compartidos (formulas/sueldo-ar.ts, formulas/_ganancias-escala.ts).
 *
 * Diseño: precisión > recall. CERO falsos positivos.
 *  - ERROR (exit 1): una fórmula contiene un literal numérico de la lista
 *    STALE_LITERALS — valores fiscales viejos CONOCIDOS e inequívocos
 *    (decimales específicos tipo 8157.41, nunca números genéricos 100/1000).
 *    Solo se escanean literales numéricos de CÓDIGO: strings y comentarios
 *    se enmascaran antes del scan (un "antes era R$ 1.518" en un comentario
 *    no dispara el gate).
 *  - WARNING (no falla): fórmula cuyo nombre matchea un término fiscal
 *    (inss, irrf, monotributo, ganancias, ...) y NO importa nada de
 *    src/lib/data/ ni de un módulo compartido. Lista de sospechosas para
 *    revisión manual, nada más.
 *
 * Mantenimiento: cuando rote un valor fiscal (enero BR, noviembre IRS,
 * recategorización monotributo, base SIPA mensual en sueldo-ar.ts), agregá el
 * valor SALIENTE a STALE_LITERALS. Así el valor viejo no puede volver a
 * entrar por copy-paste.
 *
 * Uso: npx tsx scripts/check-fiscal-hardcode.ts
 *      (el prebuild lo corre en fase 1 vía node --experimental-strip-types)
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FORMULAS_DIR = 'src/lib/formulas';

type StaleLiteral = {
  /** Valor numérico exacto del literal viejo. */
  value: number;
  /** Qué era (año incluido, para el mensaje de error). */
  was: string;
  /** Qué importar en su lugar. */
  fix: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Lista explícita de valores fiscales VIEJOS conocidos. SOLO valores
// inequívocamente fiscales-viejos (decimales específicos o enteros no-redondos
// documentados). NO agregar números genéricos (100, 1000, 70000, años, etc.):
// un falso positivo acá apaga el gate para siempre.
// ─────────────────────────────────────────────────────────────────────────────
const STALE_LITERALS: StaleLiteral[] = [
  // ── Brasil (fuente única: src/lib/data/brasil-2026.ts) ──
  { value: 1518, was: 'salário mínimo BR 2025', fix: 'SALARIO_MINIMO de data/brasil-2026' },
  { value: 1412, was: 'salário mínimo BR 2024', fix: 'SALARIO_MINIMO de data/brasil-2026' },
  { value: 8157.41, was: 'teto INSS 2025', fix: 'INSS_TETO de data/brasil-2026' },
  { value: 7786.02, was: 'teto INSS 2024', fix: 'INSS_TETO de data/brasil-2026' },
  { value: 951.62, was: 'contribuição máx INSS 2025', fix: 'INSS_CONTRIB_MAX de data/brasil-2026' },
  { value: 2793.88, was: 'faixa 2 INSS 2025', fix: 'INSS_FAIXAS / calcINSS de data/brasil-2026' },
  { value: 4190.83, was: 'faixa 3 INSS 2025', fix: 'INSS_FAIXAS / calcINSS de data/brasil-2026' },
  { value: 2259.2, was: 'teto da faixa isenta IRRF 2024 (2026: 2428.80)', fix: 'IRRF_FAIXAS / calcIRRF2026 de data/brasil-2026' },
  { value: 169.44, was: 'parcela a deduzir IRRF 2024 faixa 7,5%', fix: 'IRRF_FAIXAS / calcIRRF2026 de data/brasil-2026' },
  { value: 381.44, was: 'parcela a deduzir IRRF 2024 faixa 15%', fix: 'IRRF_FAIXAS / calcIRRF2026 de data/brasil-2026' },
  { value: 662.77, was: 'parcela a deduzir IRRF 2024 faixa 22,5%', fix: 'IRRF_FAIXAS / calcIRRF2026 de data/brasil-2026' },
  { value: 2824, was: 'isenção efetiva IRRF 2024 (2× SM 2024)', fix: 'IRRF_ISENCAO_REDUTOR de data/brasil-2026' },
  { value: 2138.76, was: 'seguro-desemprego 2025 faixa 1', fix: 'SEGURO_DESEMPREGO de data/brasil-2026' },
  { value: 3564.96, was: 'seguro-desemprego 2025 faixa 2', fix: 'SEGURO_DESEMPREGO de data/brasil-2026' },
  { value: 1711.01, was: 'seguro-desemprego 2025 parcela fixa', fix: 'SEGURO_DESEMPREGO de data/brasil-2026' },
  { value: 2313.74, was: 'seguro-desemprego 2025 teto', fix: 'SEGURO_DESEMPREGO de data/brasil-2026' },

  // ── USA (fuente única: src/lib/data/usa-2026.ts) ──
  { value: 23500, was: 'límite 401(k) elective deferral 2025 (2026: 24500)', fix: 'IRS_401K.deferralUnder50 de data/usa-2026' },

  // ── Argentina — monotributo (fuente única: src/lib/data/monotributo-2026.ts) ──
  { value: 7813063.45, was: 'tope cat. A monotributo feb-2025', fix: 'TOPES de data/monotributo-2026' },
  { value: 7813063, was: 'tope cat. A monotributo feb-2025 (redondeado)', fix: 'TOPES de data/monotributo-2026' },

  // ── Argentina — SIPA (fuente única: src/lib/formulas/sueldo-ar.ts) ──
  // BASE_IMPONIBLE_MAXIMA_APORTES rota mensual: al actualizarla, agregar acá
  // el valor saliente para que no re-entre por copy-paste.
];

// ─────────────────────────────────────────────────────────────────────────────
// ALLOWLIST: usos legítimos documentados de un valor de STALE_LITERALS
// (ej.: una calc comparativa "SM 2025 vs 2026" que necesita el valor viejo
// a propósito). Formato: { file: 'nombre-archivo.ts', value: 1518,
// reason: 'por qué es legítimo' }. Hoy vacía: el árbol está limpio.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWLIST: { file: string; value: number; reason: string }[] = [];

// Términos fiscales para el modo WARNING (heurístico, no falla el build).
// Substring sobre el nombre del archivo (términos sin riesgo de colisión)...
const FISCAL_SUBSTRINGS = ['inss', 'irrf', 'fgts', 'monotributo', 'ganancias', 'aguinaldo', 'igv', 'iess'];
// ...y match por segmento exacto del slug para términos cortos/ambiguos
// ('ira' es substring de "respira"; 'sipa' de "disipador"; 'mei' de "primeiro").
const FISCAL_SEGMENTS = ['ira', '401k', 'mei', 'sipa'];

// Una fórmula "importa la fuente única" si trae algo de src/lib/data/ o de un
// módulo compartido con data fiscal centralizada.
const DATA_IMPORT_RE = /from\s+['"][^'"]*(\/data\/|sueldo-ar|_ganancias-escala)[^'"]*['"]/;

/**
 * Enmascara comentarios y contenido de strings (incluido el texto de template
 * literals, preservando el código dentro de ${...}), manteniendo los \n para
 * que los números de línea del reporte sean reales.
 */
function maskNonCode(src: string): string {
  const out: string[] = [];
  // Stack de contextos para templates anidados: 'tpl' = dentro de `...`,
  // número = profundidad de llaves dentro de un ${...}.
  const stack: ('tpl' | number)[] = [];
  let i = 0;
  const n = src.length;
  let state: 'code' | 'line' | 'block' | 'single' | 'double' | 'tpl' = 'code';

  const push = (c: string, masked: boolean) => {
    out.push(masked && c !== '\n' ? ' ' : c);
  };

  while (i < n) {
    const c = src[i];
    const next = i + 1 < n ? src[i + 1] : '';
    if (state === 'code') {
      if (c === '/' && next === '/') { state = 'line'; push(c, true); push(next, true); i += 2; continue; }
      if (c === '/' && next === '*') { state = 'block'; push(c, true); push(next, true); i += 2; continue; }
      if (c === "'") { state = 'single'; push(c, true); i++; continue; }
      if (c === '"') { state = 'double'; push(c, true); i++; continue; }
      if (c === '`') { state = 'tpl'; stack.push('tpl'); push(c, true); i++; continue; }
      if (c === '{' && typeof stack[stack.length - 1] === 'number') {
        stack[stack.length - 1] = (stack[stack.length - 1] as number) + 1;
        push(c, false); i++; continue;
      }
      if (c === '}' && typeof stack[stack.length - 1] === 'number') {
        const depth = (stack[stack.length - 1] as number) - 1;
        if (depth === 0) { stack.pop(); state = 'tpl'; push(c, true); i++; continue; }
        stack[stack.length - 1] = depth;
        push(c, false); i++; continue;
      }
      push(c, false); i++; continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; push(c, false); } else push(c, true);
      i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && next === '/') { state = 'code'; push(c, true); push(next, true); i += 2; continue; }
      push(c, true); i++; continue;
    }
    if (state === 'single' || state === 'double') {
      const quote = state === 'single' ? "'" : '"';
      if (c === '\\') { push(c, true); if (next) push(next, true); i += 2; continue; }
      if (c === quote) { state = 'code'; push(c, true); i++; continue; }
      push(c, true); i++; continue;
    }
    // state === 'tpl' (texto del template literal)
    if (c === '\\') { push(c, true); if (next) push(next, true); i += 2; continue; }
    if (c === '`') { stack.pop(); state = 'code'; push(c, true); i++; continue; }
    if (c === '$' && next === '{') { stack.push(1); state = 'code'; push(c, true); push(next, true); i += 2; continue; }
    push(c, true); i++; continue;
  }
  return out.join('');
}

// Literal numérico de código: dígitos (con separadores _) + fracción opcional.
// Lookarounds evitan matchear dentro de identificadores, hex (0x1F), notación
// científica (1e6) o números más largos (1518 dentro de 15180).
const NUM_RE = /(?<![\w$.])\d[\d_]*(?:\.\d[\d_]*)?(?![\w.])/g;

const staleByValue = new Map<number, StaleLiteral>();
for (const s of STALE_LITERALS) staleByValue.set(s.value, s);

function isAllowed(file: string, value: number): boolean {
  return ALLOWLIST.some((a) => a.file === file && a.value === value);
}

function main() {
  const files = readdirSync(FORMULAS_DIR).filter((f) => f.endsWith('.ts')).sort();
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    const path = join(FORMULAS_DIR, file);
    const src = readFileSync(path, 'utf8');
    const masked = maskNonCode(src);
    const lines = masked.split('\n');

    // ERROR: literales fiscales viejos en código.
    for (let ln = 0; ln < lines.length; ln++) {
      for (const m of lines[ln].matchAll(NUM_RE)) {
        const value = parseFloat(m[0].replace(/_/g, ''));
        const stale = staleByValue.get(value);
        if (!stale || isAllowed(file, value)) continue;
        errors.push(
          `${path}:${ln + 1} → ${m[0]} (${stale.was}) — usá ${stale.fix}`
        );
      }
    }

    // WARNING: nombre fiscal sin import de fuente única.
    const base = file.replace(/\.ts$/, '').toLowerCase();
    const segments = base.split(/[^a-z0-9]+/);
    const looksFiscal =
      FISCAL_SUBSTRINGS.some((t) => base.includes(t)) ||
      FISCAL_SEGMENTS.some((t) => segments.includes(t));
    if (looksFiscal && !DATA_IMPORT_RE.test(src) && !file.startsWith('_') && file !== 'sueldo-ar.ts') {
      warnings.push(`${path} — nombre fiscal pero no importa de src/lib/data/ ni de un módulo compartido`);
    }
  }

  if (warnings.length) {
    console.log(`[fiscal-gate] ⚠ ${warnings.length} fórmula(s) sospechosa(s) (heurístico, no bloquea):`);
    for (const w of warnings) console.log(`[fiscal-gate]   ${w}`);
  }

  if (errors.length) {
    console.error(`[fiscal-gate] ✗ ${errors.length} literal(es) fiscal(es) VIEJO(s) hardcodeado(s):`);
    for (const e of errors) console.error(`[fiscal-gate]   ${e}`);
    console.error('[fiscal-gate] Fix: importá la constante actual de src/lib/data/ (o documentá la excepción en ALLOWLIST con razón).');
    process.exit(1);
  }

  console.log(
    `[fiscal-gate] ✓ ${files.length} fórmulas sin literales fiscales viejos (${warnings.length} warning(s) heurístico(s))`
  );
}

main();
