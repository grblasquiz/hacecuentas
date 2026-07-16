/**
 * Estimador de la factura de luz residencial en República Dominicana (EDESUR /
 * EDEESTE / EDENORTE) por bloques de consumo. Tarifa residencial BTS1 (pliego
 * SIE 2026, referencial), cargo fijo mensual y ITBIS 18% si el consumo supera
 * los 700 kWh/mes. ITBIS del módulo país.
 */
import { REPUBLICA_DOMINICANA_2026 as RD, fmtDOP } from '../data/republica-dominicana-2026.ts';

export interface Inputs {
  consumoKwh: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Bloques escalonados residenciales (RD$/kWh) — pliego tarifario SIE 2026 (referencial).
const BLOQUES = [
  { hasta: 100, precio: 5.10 },
  { hasta: 200, precio: 7.85 },
  { hasta: 300, precio: 9.50 },
  { hasta: 700, precio: 11.50 },
  { hasta: Infinity, precio: 13.20 },
];
const CARGO_FIJO = 120;        // RD$/mes (cargo fijo de comercialización)
const UMBRAL_ITBIS = 700;      // el ITBIS 18% aplica sólo si el consumo supera 700 kWh/mes

export function compute(i: Inputs): Outputs {
  const kwh = Math.max(0, Number(i.consumoKwh) || 0);
  if (kwh <= 0) throw new Error('Ingresá tu consumo mensual en kWh');

  let prev = 0;
  let energia = 0;
  const desglose: Array<{ tramo: string; kwh: number; precio: number; subtotal: number }> = [];
  for (const b of BLOQUES) {
    const enBloque = Math.max(0, Math.min(kwh, b.hasta) - prev);
    if (enBloque > 0) {
      const sub = enBloque * b.precio;
      energia += sub;
      const label = b.hasta === Infinity ? `${prev + 1}+ kWh` : `${prev + 1}–${b.hasta} kWh`;
      desglose.push({ tramo: label, kwh: enBloque, precio: b.precio, subtotal: sub });
    }
    prev = b.hasta;
    if (kwh <= b.hasta) break;
  }

  const cargoFijo = CARGO_FIJO;
  const subtotal = energia + cargoFijo;
  const itbis = kwh > UMBRAL_ITBIS ? subtotal * RD.itbis : 0;
  const total = subtotal + itbis;
  const precioMedio = kwh > 0 ? total / kwh : 0;

  const _insight = {
    title: 'Estimación de tu factura de luz',
    text: `Con **${kwh.toLocaleString('de-DE')} kWh** al mes, tu factura ronda **${fmtDOP(total)}** — un precio medio de **${fmtDOP(precioMedio)}/kWh**. ${kwh > UMBRAL_ITBIS ? 'Al superar 700 kWh se agrega el **ITBIS 18%** sobre toda la factura.' : 'Por debajo de 700 kWh no se aplica ITBIS.'} El tramo alto (${BLOQUES[BLOQUES.length - 1].precio.toFixed(2)} RD$/kWh) es el que más encarece.`,
    tone: kwh > UMBRAL_ITBIS ? 'warn' : 'neutral',
    icon: '💡',
  };
  const _chart = {
    type: 'bar',
    labels: desglose.map((d) => d.tramo),
    values: desglose.map((d) => Math.round(d.subtotal)),
    prefix: 'RD$ ',
    ariaLabel: 'Costo de energía por tramo de consumo.',
  };

  return {
    total: fmtDOP(total),
    energia: fmtDOP(energia),
    cargoFijo: fmtDOP(cargoFijo),
    itbis: fmtDOP(itbis),
    precioMedio: fmtDOP(precioMedio),
    detalle: `Energía ${fmtDOP(energia)} + cargo fijo ${fmtDOP(cargoFijo)}${itbis > 0 ? ` + ITBIS ${fmtDOP(itbis)}` : ''} = ${fmtDOP(total)} por ${kwh.toLocaleString('de-DE')} kWh.`,
    _insight,
    _chart,
  };
}
