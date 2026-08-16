/**
 * Tipo de cambio SUNAT (Perú) — DETERMINÍSTICO, daily. Sin LLM.
 *
 * Fuente: https://www.sunat.gob.pe/a/txt/tipoCambio.txt — archivo plano que
 * publica la propia SUNAT con el formato `dd/mm/yyyy|compra|venta|`. Es el
 * mismo dato que muestra el portal tcS01Alias (la fuente declarada del calc),
 * pero parseable sin scraping frágil.
 *
 * Patchea:
 *  - src/lib/formulas/tipo-de-cambio-sunat-dolar-soles-peru.ts → default del
 *    input `tipoCambio` (`|| 3.404`) + comentario con la fecha.
 *  - src/content/calcs-pe/...sunat...json → fields.tipoCambio.default,
 *    dataUpdate.notes (valores referenciales) y dataUpdate.lastUpdated.
 *
 * El calc convierte con el TC que ingresa el usuario; esto solo mantiene fresco
 * el valor por defecto referencial (y saca al calc de la lista de stale).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { reportMode, reportWarn } from '../utils/run-status.ts';
import { findCalcPath } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('tc-sunat-pe');

const SOURCE_URL = 'https://www.sunat.gob.pe/a/txt/tipoCambio.txt';
const FORMULA_FILE = join(process.cwd(), 'src/lib/formulas/tipo-de-cambio-sunat-dolar-soles-peru.ts');
const SLUG = 'calculadora-tipo-de-cambio-sunat-dolar-soles-peru';

const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

interface TcSunat {
  fecha: string; // YYYY-MM-DD
  fechaLegible: string; // '16-ago-2026'
  compra: number;
  venta: number;
}

/** `S/ 3,368` con coma decimal peruana… (es-PE usa punto, pero el copy del calc usa coma) */
function fmtTc(n: number): string {
  return n.toFixed(3).replace('.', ',');
}

async function fetchTc(): Promise<TcSunat | null> {
  let text: string;
  try {
    const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'hacecuentas-data-refresh/1.0' } });
    if (!res.ok) throw new Error(`SUNAT respondió ${res.status}`);
    text = (await res.text()).trim();
  } catch (err) {
    log.error(`fetch falló: ${(err as Error).message}`);
    return null;
  }

  // Formato: `16/08/2026|3.358|3.368|`
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})\|([\d.]+)\|([\d.]+)\|?/);
  if (!m) {
    log.error(`formato inesperado de tipoCambio.txt: "${text.slice(0, 80)}"`);
    return null;
  }
  const [, dd, mm, yyyy, compraStr, ventaStr] = m;
  const compra = Number(compraStr);
  const venta = Number(ventaStr);
  const fecha = `${yyyy}-${mm}-${dd}`;

  // Sanity: rango plausible USD/PEN, venta > compra, spread chico, fecha reciente.
  if (!(compra > 2.5 && compra < 6 && venta > 2.5 && venta < 6)) {
    log.error(`TC fuera de rango plausible: compra=${compra} venta=${venta}`);
    return null;
  }
  if (venta <= compra || venta - compra > 0.2) {
    log.error(`spread compra/venta raro: compra=${compra} venta=${venta}`);
    return null;
  }
  const ageDays = (Date.now() - new Date(`${fecha}T00:00:00Z`).getTime()) / 86400000;
  if (!(ageDays >= -1 && ageDays <= 10)) {
    log.error(`fecha del TC (${fecha}) fuera de ventana esperada (${ageDays.toFixed(1)} días)`);
    return null;
  }

  const fechaLegible = `${dd}-${MESES_ES[Number(mm) - 1]}-${yyyy}`;
  return { fecha, fechaLegible, compra, venta };
}

function patchFormula(tc: TcSunat, dry: boolean): boolean {
  const src = readFileSync(FORMULA_FILE, 'utf8');
  const re = /(\|\|\s*)(\d+(?:\.\d+)?)(;\s*\/\/ referencial \(venta SUNAT )([^)]*)(\))/;
  const m = src.match(re);
  if (!m) {
    reportWarn('tc-sunat-pe', `no encontré el default \`|| <tc>; // referencial (venta SUNAT …)\` en ${FORMULA_FILE} — patch de fórmula omitido`);
    return false;
  }
  const oldTc = Number(m[2]);
  const delta = Math.abs(tc.venta - oldTc) / oldTc;
  if (delta > 0.3) {
    // Nunca aceptar un salto >30% sin revisión humana.
    reportWarn('tc-sunat-pe', `TC nuevo ${tc.venta} difiere ${(delta * 100).toFixed(0)}% del anterior ${oldTc} — NO se patchea, revisar a mano`);
    return false;
  }
  if (oldTc === tc.venta && m[4] === tc.fechaLegible) return false; // no-op
  if (dry) {
    log.info(`would patch formula default: ${oldTc} → ${tc.venta} (venta SUNAT ${tc.fechaLegible})`);
    return true;
  }
  const next = src.replace(re, `$1${tc.venta}$3${tc.fechaLegible}$5`);
  writeFileSync(FORMULA_FILE, next, 'utf8');
  log.success(`formula default: ${oldTc} → ${tc.venta} (venta SUNAT ${tc.fechaLegible})`);
  return true;
}

function patchCalcJson(tc: TcSunat, dry: boolean): boolean {
  const path = findCalcPath(SLUG);
  if (!path) {
    reportWarn('tc-sunat-pe', `no encontré el calc JSON para slug ${SLUG}`);
    return false;
  }
  const calc = JSON.parse(readFileSync(path, 'utf8'));
  const before = JSON.stringify([calc.fields, calc.dataUpdate]);

  const field = (calc.fields || []).find((f: any) => f.id === 'tipoCambio');
  if (field) field.default = tc.venta;

  const today = new Date().toISOString().slice(0, 10);
  if (calc.dataUpdate) {
    calc.dataUpdate.updateType = 'auto-api'; // dejó de ser manual: lo mantiene este fetcher
    calc.dataUpdate.notes =
      `El tipo de cambio compra/venta lo publica SUNAT cada día hábil. La calculadora convierte con el TC que ingresa el usuario; ` +
      `el valor por defecto (S/ ${fmtTc(tc.venta)}, TC venta SUNAT del ${tc.fechaLegible}; compra S/ ${fmtTc(tc.compra)}) es referencial.`;
    if (JSON.stringify([calc.fields, calc.dataUpdate]) === before) return false; // valores idénticos → no tocar lastUpdated
    calc.dataUpdate.lastUpdated = today;
  } else if (JSON.stringify([calc.fields, calc.dataUpdate]) === before) {
    return false;
  }

  if (dry) {
    log.info(`would patch ${path}: default=${tc.venta}, notes (compra ${tc.compra} / venta ${tc.venta} del ${tc.fechaLegible}), lastUpdated=${today}`);
    return true;
  }
  writeFileSync(path, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  log.success(`calc JSON: default=${tc.venta} · lastUpdated=${today}`);
  return true;
}

export async function fetchTcSunatPe({ dry = false }: { dry?: boolean }): Promise<boolean> {
  const tc = await fetchTc();
  if (!tc) {
    reportMode('tc-sunat-pe', 'pending');
    return false;
  }
  reportMode('tc-sunat-pe', 'deterministic');
  log.info(`TC SUNAT ${tc.fecha}: compra S/ ${tc.compra} · venta S/ ${tc.venta}`);

  const a = patchFormula(tc, dry);
  const b = patchCalcJson(tc, dry);
  if (!a && !b) log.skip('sin cambios (TC ya coincidía)');
  return a || b;
}
