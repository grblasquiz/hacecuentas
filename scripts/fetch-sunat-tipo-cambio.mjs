/** Actualiza el valor referencial del conversor SUNAT desde la serie oficial SBS/BCRP. */
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/content/calcs-pe/calculadora-tipo-de-cambio-sunat-dolar-soles-peru.json', import.meta.url);
const SERIES = 'PD04639PD-PD04640PD'; // compra / venta, sistema bancario SBS
const end = new Date();
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - 35);
const iso = (d) => d.toISOString().slice(0, 10);
const url = `https://estadisticas.bcrp.gob.pe/estadisticas/series/api/${SERIES}/json/${iso(start)}/${iso(end)}/ing`;

const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'hacecuentas-data-refresh/1.0' } });
if (!res.ok) throw new Error(`BCRP tipo de cambio: HTTP ${res.status}`);
const payload = await res.json();
const period = [...(payload.periods ?? [])].reverse().find((p) =>
  Array.isArray(p.values) && p.values.length >= 2 && p.values.every((v) => Number.isFinite(Number(v)))
);
if (!period) throw new Error('BCRP no devolvió un período reciente con compra y venta numéricas');

const [purchase, sale] = period.values.map(Number);
if (!(purchase > 2 && purchase < 6 && sale >= purchase && sale < 6)) {
  throw new Error(`Tipo de cambio fuera de rango: compra=${purchase}, venta=${sale}`);
}
const parsedDate = new Date(period.name.replace(/\./g, ' '));
if (Number.isNaN(parsedDate.getTime())) throw new Error(`Fecha BCRP inválida: ${period.name}`);
const valueDate = iso(parsedDate);

const calc = JSON.parse(await readFile(FILE, 'utf8'));
const field = calc.fields?.find((f) => f.id === 'tipoCambio');
if (!field) throw new Error('No existe fields.tipoCambio en el calc SUNAT');
field.default = sale;
calc.dataUpdate = {
  frequency: 'daily',
  lastUpdated: valueDate,
  updateType: 'auto',
  notes: `Valor referencial automático: venta S/ ${sale.toFixed(3)} y compra S/ ${purchase.toFixed(3)}, último día publicado ${valueDate}. Para declarar, usar el valor de la fecha exacta de la operación.`,
  source: 'BCRP — tipo de cambio del sistema bancario SBS',
  sourceUrl: url,
  currentPurchase: purchase,
  currentSale: sale,
  valueDate,
};
await writeFile(FILE, `${JSON.stringify(calc, null, 2)}\n`);
console.log(`SUNAT/SBS: ${valueDate} · compra S/ ${purchase.toFixed(3)} · venta S/ ${sale.toFixed(3)}`);
