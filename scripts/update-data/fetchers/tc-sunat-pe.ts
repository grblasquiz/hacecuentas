/**
 * Tipo de cambio SUNAT (Perú) — DETERMINÍSTICO, daily. Sin LLM.
 *
 * Fuente: https://www.sunat.gob.pe/a/txt/tipoCambio.txt — archivo plano que
 * publica la propia SUNAT con el formato `dd/mm/yyyy|compra|venta|`. Es el
 * mismo dato que muestra el portal tcS01Alias (la fuente declarada del calc),
 * pero parseable sin scraping frágil.
 *
 * Actualiza el JSON de la calculadora, que también provee el valor de reserva
 * de la fórmula.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { applySunatReference } from '../../sunat-reference.mjs';
import { reportMode, reportWarn } from '../utils/run-status.ts';
import { findCalcPath } from '../patchers/data-update-date.ts';
import { createLogger } from '../utils/logger.ts';

const log = createLogger('tc-sunat-pe');

const SOURCE_URL = 'https://www.sunat.gob.pe/a/txt/tipoCambio.txt';
const SLUG = 'calculadora-tipo-de-cambio-sunat-dolar-soles-peru';


interface TcSunat {
  fecha: string; // YYYY-MM-DD
  compra: number;
  venta: number;
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

  return { fecha, compra, venta };
}

function patchCalcJson(tc: TcSunat, dry: boolean): boolean {
  const path = findCalcPath(SLUG);
  if (!path) {
    reportWarn('tc-sunat-pe', `no encontré el calc JSON para slug ${SLUG}`);
    return false;
  }
  const calc = JSON.parse(readFileSync(path, 'utf8'));
  const changed = applySunatReference(calc, {
    purchase: tc.compra,
    sale: tc.venta,
    valueDate: tc.fecha,
    source: 'SUNAT — Tipo de cambio',
    sourceUrl: 'https://www.sunat.gob.pe/cl-at-ittipcam/tcS01Alias',
  });
  if (!changed) return false;
  if (dry) {
    log.info(`would patch ${path}: default=${tc.venta}, compra=${tc.compra}, fecha=${tc.fecha}`);
    return true;
  }
  writeFileSync(path, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  log.success(`calc JSON: default=${tc.venta} · fecha=${tc.fecha}`);
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

  const changed = patchCalcJson(tc, dry);
  if (!changed) log.skip('sin cambios en la referencia publicada');
  return changed;
}
