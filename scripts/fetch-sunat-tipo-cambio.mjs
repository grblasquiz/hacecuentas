/**
 * Actualiza el valor referencial del conversor SUNAT.
 * Fuente primaria: SUNAT oficial (tipoCambio.txt, mismo día) — la misma que
 * scripts/update-data/fetchers/tc-sunat-pe.ts, para que el cron de GH y el
 * refresh local nunca se pisen con valores de fuentes distintas.
 * Fallback: serie SBS/BCRP (puede atrasar 1-3 días hábiles).
 */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/content/calcs-pe/calculadora-tipo-de-cambio-sunat-dolar-soles-peru.json', import.meta.url);
const SUNAT_TXT = 'https://www.sunat.gob.pe/a/txt/tipoCambio.txt';
const SERIES = 'PD04639PD-PD04640PD'; // compra / venta, sistema bancario SBS
const iso = (d) => d.toISOString().slice(0, 10);

async function fromSunat() {
  const res = await fetch(SUNAT_TXT, { headers: { 'user-agent': 'hacecuentas-data-refresh/1.0' } });
  if (!res.ok) throw new Error(`SUNAT tipoCambio.txt: HTTP ${res.status}`);
  const text = (await res.text()).trim();
  // Formato: dd/mm/yyyy|compra|venta|
  const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})\|([\d.]+)\|([\d.]+)\|/);
  if (!m) throw new Error(`formato inesperado de tipoCambio.txt: "${text.slice(0, 80)}"`);
  const [, dd, mm, yyyy, compra, venta] = m;
  return {
    purchase: Number(compra),
    sale: Number(venta),
    valueDate: `${yyyy}-${mm}-${dd}`,
    source: 'SUNAT — Tipo de cambio',
    sourceUrl: 'https://www.sunat.gob.pe/cl-at-ittipcam/tcS01Alias',
  };
}

async function fromBcrp() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 35);
  const url = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/${SERIES}/json/${iso(start)}/${iso(end)}/ing`;
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'hacecuentas-data-refresh/1.0' } });
  if (!res.ok) throw new Error(`BCRP tipo de cambio: HTTP ${res.status}`);
  const payload = await res.json();
  const period = [...(payload.periods ?? [])].reverse().find((p) =>
    Array.isArray(p.values) && p.values.length >= 2 && p.values.every((v) => Number.isFinite(Number(v)))
  );
  if (!period) throw new Error('BCRP no devolvió un período reciente con compra y venta numéricas');
  const [purchase, sale] = period.values.map(Number);
  const parsedDate = new Date(period.name.replace(/\./g, ' '));
  if (Number.isNaN(parsedDate.getTime())) throw new Error(`Fecha BCRP inválida: ${period.name}`);
  return {
    purchase,
    sale,
    valueDate: iso(parsedDate),
    source: 'BCRP — tipo de cambio del sistema bancario SBS',
    sourceUrl: url,
  };
}

let tc;
try {
  tc = await fromSunat();
} catch (err) {
  console.warn(`SUNAT falló (${err.message}); fallback BCRP/SBS`);
  tc = await fromBcrp();
}

const { purchase, sale, valueDate, source, sourceUrl } = tc;
if (!(purchase > 2 && purchase < 6 && sale >= purchase && sale < 6)) {
  throw new Error(`Tipo de cambio fuera de rango: compra=${purchase}, venta=${sale}`);
}

const calc = JSON.parse(await readFile(FILE, 'utf8'));
const field = calc.fields?.find((f) => f.id === 'tipoCambio');
if (!field) throw new Error('No existe fields.tipoCambio en el calc SUNAT');
field.default = sale;
calc.dataUpdate = {
  frequency: 'daily',
  lastUpdated: valueDate,
  updateType: 'auto-api',
  notes: `Valor referencial automático: venta S/ ${sale.toFixed(3)} y compra S/ ${purchase.toFixed(3)}, último día publicado ${valueDate}. Para declarar, usar el valor de la fecha exacta de la operación.`,
  source,
  sourceUrl,
  currentPurchase: purchase,
  currentSale: sale,
  valueDate,
};
await writeFile(FILE, `${JSON.stringify(calc, null, 2)}\n`);
console.log(`TC ${source === tc.source ? '' : ''}${valueDate} · compra S/ ${purchase.toFixed(3)} · venta S/ ${sale.toFixed(3)} · fuente: ${source}`);
