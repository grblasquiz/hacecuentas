#!/usr/bin/env node
/**
 * Regenera las tablas de referencia data-driven del ICL en
 * src/content/calcs/alquiler-icl.json a partir de src/lib/formulas/_bcra-icl.ts.
 *
 * Genera 2 tablas de information-gain (crawlables, server-rendered) que capturan
 * queries de alta intención que hoy no tienen superficie nuestra:
 *   1. "Aumento del alquiler por ICL — coeficiente de ajuste anual por mes"
 *      → "cuánto aumenta el alquiler en {mes} {año}", "coeficiente ICL {mes}"
 *   2. "Valor del ICL del BCRA (últimos meses)"
 *      → "ICL hoy", "valor ICL BCRA", "ICL {mes} {año}"
 * Preserva cualquier tabla hand-authored (p.ej. la comparación de índices).
 *
 * Anti-fabricación: TODO sale computado de la serie oficial del BCRA, nada se
 * inventa. Idempotente: sólo escribe si el contenido cambió (no mueve el mtime
 * al pedo → no infla el sitemap). Se corre solo al final de `bcra:update-icl`.
 *
 * Uso: node scripts/gen-icl-tables.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ICL_FILE = path.join(process.cwd(), 'src/lib/formulas/_bcra-icl.ts');
const JSON_FILE = path.join(process.cwd(), 'src/content/calcs/alquiler-icl.json');

// Prefijos de título que identifican las tablas generadas (para regenerarlas sin
// duplicar y sin pisar las hand-authored).
const GEN_TITLE_PREFIXES = ['Aumento del alquiler por ICL', 'Valor del ICL del BCRA'];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nf = (n, dec) => n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const ddmmyyyy = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };

/** Parsea ICL_LAST_UPDATED + los arrays paralelos del archivo generado. */
function parseIcl(src) {
  const last = src.match(/ICL_LAST_UPDATED\s*=\s*'(\d{4}-\d{2}-\d{2})'/)?.[1];
  const fechasBlock = src.match(/ICL_FECHAS[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1] ?? '';
  const valoresBlock = src.match(/ICL_VALORES[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1] ?? '';
  const fechas = [...fechasBlock.matchAll(/'(\d{4}-\d{2}-\d{2})'/g)].map((m) => m[1]);
  const valores = [...valoresBlock.matchAll(/(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
  if (!last || fechas.length === 0 || fechas.length !== valores.length) {
    throw new Error(`Parse ICL inválido (last=${last}, fechas=${fechas.length}, valores=${valores.length})`);
  }
  return { last, fechas, valores };
}

/** Valor del ICL para una fecha: día hábil <= fecha (búsqueda binaria). null si previo al inicio. */
function makeLookup(fechas, valores) {
  return (d) => {
    if (d < fechas[0]) return null;
    let lo = 0, hi = fechas.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (fechas[mid] <= d) lo = mid; else hi = mid - 1; }
    return valores[lo];
  };
}

function buildTables(icl) {
  const look = makeLookup(icl.fechas, icl.valores);
  const year = Number(icl.last.slice(0, 4));
  const lastMonth = Number(icl.last.slice(5, 7));
  const lastVal = icl.valores[icl.valores.length - 1];

  // ── Tabla 1: coeficiente de ajuste ANUAL por mes de aniversario (year-1 → year).
  // Sólo meses con dato del año en curso; el resto se completa al publicarse.
  const rows1 = [];
  for (let m = 1; m <= lastMonth; m++) {
    const mm = String(m).padStart(2, '0');
    const ini = look(`${year - 1}-${mm}-01`);
    const fin = look(`${year}-${mm}-01`);
    if (!ini || !fin) continue;
    const coef = fin / ini;
    rows1.push([
      `${cap(MESES[m - 1])} ${year}`,
      nf(coef, 4),
      `+${nf((coef - 1) * 100, 1)}%`,
      `$${nf(500000 * coef, 0)}`,
    ]);
  }
  const table1 = {
    title: `Aumento del alquiler por ICL — coeficiente de ajuste anual por mes (${year})`,
    caption: `Cuánto sube un alquiler con ajuste ANUAL por ICL según el mes de aniversario del contrato. Coeficiente = ICL del mes en ${year} ÷ ICL del mismo mes en ${year - 1}.`,
    headers: ['Mes de aniversario', 'Coeficiente ICL', 'Aumento anual', 'Ejemplo: $500.000 →'],
    rows: rows1,
    highlightCol: 2,
    note: `Datos oficiales del BCRA (base 30/6/2020 = 1). Último dato: ${ddmmyyyy(icl.last)} (ICL ${nf(lastVal, 4)}). Los meses posteriores se completan automáticamente cuando el BCRA publica el índice.`,
  };

  // ── Tabla 2: valor del ICL al 1º de cada mes (últimos 14) + variación mensual.
  const months = [];
  let y = year, m = lastMonth;
  for (let i = 0; i < 14; i++) { months.unshift([y, m]); m--; if (m === 0) { m = 12; y--; } }
  const rows2 = [];
  let prev = null;
  for (const [yy, mm] of months) {
    const v = look(`${yy}-${String(mm).padStart(2, '0')}-01`);
    if (v == null) { prev = null; continue; }
    rows2.push([`${cap(MESES[mm - 1])} ${yy}`, nf(v, 4), prev ? `+${nf((v / prev - 1) * 100, 1)}%` : '—']);
    prev = v;
  }
  const table2 = {
    title: 'Valor del ICL del BCRA (últimos meses)',
    caption: 'Índice para Contratos de Locación (ICL) al 1º de cada mes y su variación mensual.',
    headers: ['Mes', 'Valor ICL', 'Var. mensual'],
    rows: rows2,
    note: `Fuente: BCRA, serie diaria base 30/6/2020 = 1. Último dato disponible: ${ddmmyyyy(icl.last)} = ${nf(lastVal, 4)}.`,
  };

  return [table1, table2];
}

const iclSrc = await fs.readFile(ICL_FILE, 'utf8');
const icl = parseIcl(iclSrc);
const genTables = buildTables(icl);

const raw = await fs.readFile(JSON_FILE, 'utf8');
const data = JSON.parse(raw);
const existing = Array.isArray(data.referenceTables) ? data.referenceTables : [];
const preserved = existing.filter((t) => !GEN_TITLE_PREFIXES.some((p) => (t.title || '').startsWith(p)));
data.referenceTables = [...genTables, ...preserved];
if (data.dataUpdate) data.dataUpdate.lastUpdated = icl.last; // freshness real → sitemap lastmod

const next = JSON.stringify(data, null, 2) + '\n';
if (next !== raw) {
  await fs.writeFile(JSON_FILE, next);
  console.log(`[icl-tables] OK — ${genTables.length} tablas (${rows1Len(genTables)} meses de coef), último dato ${icl.last}.`);
} else {
  console.log('[icl-tables] sin cambios (ya al día).');
}

function rows1Len(tables) { return tables[0]?.rows?.length ?? 0; }
