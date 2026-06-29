/**
 * Patente de vehículo — PARAGUAY 2026.
 * La patente comercial/de rodados es un tributo municipal anual sobre el valor
 * imponible del vehículo, depreciado por antigüedad. La Ley N° 7459 fija la tasa
 * de referencia en 0,3% del valor fiscal depreciado.
 *
 *   antigüedad      = 2026 − año de fabricación
 *   depreciación    = 5% por año de antigüedad, con tope del 50%
 *   valor depreciado= valorImponible × (1 − depreciación)
 *   patente anual   = valor depreciado × 0,3%
 *   pronto pago     = descuento del 12% por pago anticipado (enero)
 *
 * ⚠️ Cada municipio fija su propia tabla y calendario. El descuento por pronto pago
 * (típicamente en enero) lo aplica el municipio (p. ej. Asunción); verificá con tu
 * municipio. Este cálculo es una estimación de referencia.
 *
 * Fuente: Ley N° 7459, municipios (Asunción y otros).
 */
import { fmtPYG } from '../data/paraguay-2026';

export interface PatenteVehiculoParaguayInputs {
  valorImponible?: number | string;
  anioFabricacion?: number | string;
  prontoPago?: string; // 'si' | 'no'
}

export interface PatenteVehiculoParaguayOutputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const ANIO_ACTUAL = 2026;
const TASA_PATENTE = 0.003; // 0,3% (Ley 7459)
const DEP_POR_ANIO = 0.05;  // 5% por año
const DEP_TOPE = 0.50;      // tope 50%
const DESCUENTO_PRONTO = 0.12; // 12% por pronto pago

export function patenteVehiculoParaguay(i: PatenteVehiculoParaguayInputs): PatenteVehiculoParaguayOutputs {
  const valorImponible = Math.max(0, Number(i.valorImponible) || 0);
  const anioFabricacion = Math.max(0, Number(i.anioFabricacion) || 0);
  const prontoPago = (i.prontoPago || 'no').toString() === 'si';

  if (valorImponible <= 0) throw new Error('Ingresá el valor imponible (fiscal) del vehículo en guaraníes');
  if (anioFabricacion <= 0 || anioFabricacion > ANIO_ACTUAL) throw new Error('Ingresá un año de fabricación válido');

  const antiguedad = Math.max(0, ANIO_ACTUAL - anioFabricacion);
  const depPct = Math.min(DEP_TOPE, DEP_POR_ANIO * antiguedad);
  const valorDepreciado = valorImponible * (1 - depPct);
  const patenteAnual = valorDepreciado * TASA_PATENTE;
  const patenteConDescuento = prontoPago ? patenteAnual * (1 - DESCUENTO_PRONTO) : patenteAnual;
  const ahorro = patenteAnual - patenteConDescuento;

  const _insight = {
    type: 'highlight' as const,
    icon: '🚗',
    text:
      `Un vehículo del año **${anioFabricacion}** (${antiguedad} ${antiguedad === 1 ? 'año' : 'años'} de antigüedad) ` +
      `deprecia un **${(depPct * 100).toFixed(0)}%**: valor fiscal **${fmtPYG(valorDepreciado)}**. ` +
      `La patente anual (0,3%) es **${fmtPYG(patenteAnual)}**` +
      (prontoPago ? `, y con el 12% de descuento por pronto pago pagás **${fmtPYG(patenteConDescuento)}** (ahorrás ${fmtPYG(ahorro)}).` : '.'),
  };

  const _table = {
    title: 'Cálculo de la patente del vehículo (Paraguay)',
    headers: ['Concepto', 'Valor'],
    rows: [
      ['Valor imponible (fiscal)', fmtPYG(valorImponible)],
      ['Antigüedad', `${antiguedad} ${antiguedad === 1 ? 'año' : 'años'}`],
      ['Depreciación aplicada', `${(depPct * 100).toFixed(0)}% (5%/año, tope 50%)`],
      ['Valor fiscal depreciado', fmtPYG(valorDepreciado)],
      ['Patente anual (0,3%)', fmtPYG(patenteAnual)],
      ['Descuento pronto pago (12%)', (prontoPago ? '− ' : '') + fmtPYG(prontoPago ? ahorro : 0)],
      ['Patente a pagar', fmtPYG(patenteConDescuento)],
    ],
    note: `Tasa 0,3% (Ley 7459) sobre el valor fiscal depreciado (5% por año, tope 50%). Cada municipio fija su propia tabla de valores y su calendario; el descuento por pronto pago (12%, generalmente en enero) lo define el municipio. Estimación de referencia.`,
  };

  return {
    antiguedad,
    valorDepreciado: Math.round(valorDepreciado),
    patenteAnual: Math.round(patenteAnual),
    patenteConDescuento: Math.round(patenteConDescuento),
    resumen: `${fmtPYG(valorDepreciado)} × 0,3% = ${fmtPYG(patenteAnual)}${prontoPago ? ` → ${fmtPYG(patenteConDescuento)} con pronto pago` : ''}`,
    _insight,
    _table,
  };
}
