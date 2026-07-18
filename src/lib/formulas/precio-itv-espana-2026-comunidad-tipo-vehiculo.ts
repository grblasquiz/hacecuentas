/**
 * Precio de la ITV (España) 2026 — por comunidad autónoma y tipo de vehículo.
 * Tarifa de la estación (regulada por CCAA) + tasa de la DGT (4,18 €). En Madrid y Murcia el
 * precio es libre (cada estación fija su tarifa), por eso ahí el resultado es orientativo.
 * Tarifas de referencia y factores por CCAA en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { ITV_2026 } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

const TARIFAS: Record<string, { base: number; etiqueta: string }> = {
  'gasolina-menor1600': { base: ITV_2026.turismoGasolinaMenor1600, etiqueta: 'Gasolina < 1.600 cc' },
  'gasolina-mayor1600': { base: ITV_2026.turismoGasolinaMayor1600, etiqueta: 'Gasolina ≥ 1.600 cc' },
  'diesel-menor1600': { base: ITV_2026.turismoDieselMenor1600, etiqueta: 'Diésel < 1.600 cc' },
  'diesel-mayor1600': { base: ITV_2026.turismoDieselMayor1600, etiqueta: 'Diésel ≥ 1.600 cc' },
  'electrico': { base: ITV_2026.turismoGasolinaMenor1600, etiqueta: 'Eléctrico' },
  'moto': { base: ITV_2026.moto, etiqueta: 'Motocicleta' },
};

const CCAA: Record<string, { factor: number; etiqueta: string; libre?: boolean }> = {
  andalucia: { factor: ITV_2026.ccaaFactor.andalucia, etiqueta: 'Andalucía' },
  extremadura: { factor: ITV_2026.ccaaFactor.extremadura, etiqueta: 'Extremadura' },
  baleares: { factor: ITV_2026.ccaaFactor.baleares, etiqueta: 'Baleares' },
  referencia: { factor: ITV_2026.ccaaFactor.referencia, etiqueta: 'Media nacional' },
  cataluna: { factor: ITV_2026.ccaaFactor.cataluna, etiqueta: 'Cataluña' },
  paisVasco: { factor: ITV_2026.ccaaFactor.paisVasco, etiqueta: 'País Vasco' },
  cantabria: { factor: ITV_2026.ccaaFactor.cantabria, etiqueta: 'Cantabria' },
  madrid: { factor: 1.0, etiqueta: 'Madrid (precio libre)', libre: true },
  murcia: { factor: 1.0, etiqueta: 'Murcia (precio libre)', libre: true },
};

export interface Inputs {
  tipoVehiculo?: string;
  ccaa?: string;
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const tv = TARIFAS[String(i.tipoVehiculo)] ? String(i.tipoVehiculo) : 'gasolina-menor1600';
  const cc = CCAA[String(i.ccaa)] ? String(i.ccaa) : 'referencia';
  const tarifa = TARIFAS[tv];
  const comunidad = CCAA[cc];

  const tarifaEstacion = tarifa.base * comunidad.factor;
  const total = tarifaEstacion + ITV_2026.tasaDGT;

  const _insight = {
    title: 'Lo que cuesta pasar la ITV',
    text: `Para un vehículo **${tarifa.etiqueta.toLowerCase()}** en **${comunidad.etiqueta}**, la ITV cuesta unos **${fmtEur(total)}**: ${fmtEur(tarifaEstacion)} de tarifa de la estación más ${fmtEur(ITV_2026.tasaDGT)} de tasa de la DGT. ${comunidad.libre ? 'En Madrid y Murcia el precio no está regulado, así que cada estación fija el suyo: compara antes de reservar.' : 'La tarifa está regulada, pero puede variar algo entre estaciones.'}`,
    tone: 'neutral',
    icon: '🚗',
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Tarifa estación', value: Math.round(tarifaEstacion * 100) / 100 },
      { label: 'Tasa DGT', value: Math.round(ITV_2026.tasaDGT * 100) / 100 },
    ],
    ariaLabel: `Tarifa de estación ${fmtEur(tarifaEstacion)} más tasa DGT ${fmtEur(ITV_2026.tasaDGT)}.`,
  };

  return {
    precioTotal: fmtEur(total),
    tarifaEstacion: fmtEur(tarifaEstacion),
    tasaDGT: fmtEur(ITV_2026.tasaDGT),
    detalle: `${tarifa.etiqueta} en ${comunidad.etiqueta}: tarifa ${fmtEur(tarifa.base)} × ${comunidad.factor.toString().replace('.', ',')} = ${fmtEur(tarifaEstacion)} + tasa DGT ${fmtEur(ITV_2026.tasaDGT)} = ${fmtEur(total)}.${comunidad.libre ? ' Precio orientativo (Madrid/Murcia: tarifa libre).' : ''}`,
    _insight,
    _chart,
  };
}
