/**
 * Rentabilidad del alquiler para el propietario (España) — bruta y neta.
 * Bruta = alquiler anual ÷ precio de compra. Neta = (ingresos − gastos anuales) ÷ inversión total.
 * Gastos típicos del casero en España: IBI, comunidad, seguro de hogar, mantenimiento, tasa de basura.
 * Fórmula pura en euros (es-ES).
 */

const fmtEur = (n: number, dec = 2): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec)) + ' €';
const fmtPct = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' %';

export interface Inputs {
  precioCompra: number | string;
  alquilerMensual: number | string;
  gastosCompra?: number | string;      // ITP/IVA + notaría + registro + gestoría (opcional)
  ibiAnual?: number | string;
  comunidadMensual?: number | string;
  seguroAnual?: number | string;
  otrosGastosAnual?: number | string;  // mantenimiento, tasa de basura, IBI de comunidad, etc.
  mesesVacio?: number | string;        // meses/año sin inquilino
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const precio = Number(i.precioCompra) || 0;
  const alquiler = Number(i.alquilerMensual) || 0;
  const gastosCompra = Number(i.gastosCompra) || 0;
  const ibi = Number(i.ibiAnual) || 0;
  const comunidad = Number(i.comunidadMensual) || 0;
  const seguro = Number(i.seguroAnual) || 0;
  const otros = Number(i.otrosGastosAnual) || 0;
  const mesesVacio = Math.min(Math.max(Number(i.mesesVacio) || 0, 0), 11);

  if (precio <= 0) throw new Error('Introduce el precio de compra de la vivienda');
  if (alquiler <= 0) throw new Error('Introduce el alquiler mensual');

  const inversionTotal = precio + gastosCompra;
  const mesesAlquilado = 12 - mesesVacio;
  const ingresoBrutoAnual = alquiler * mesesAlquilado;
  const gastosAnuales = ibi + comunidad * 12 + seguro + otros;
  const ingresoNetoAnual = ingresoBrutoAnual - gastosAnuales;

  const rentBruta = (alquiler * 12 / precio) * 100;
  const rentNeta = (ingresoNetoAnual / inversionTotal) * 100;

  const netaR = Math.round(rentNeta * 100) / 100;
  let calificacion = 'baja';
  if (netaR >= 6) calificacion = 'alta';
  else if (netaR >= 4) calificacion = 'buena';
  else if (netaR >= 2) calificacion = 'media';

  const _insight = {
    title: 'Tu rentabilidad neta',
    text: `Con un alquiler de **${fmtEur(alquiler)}/mes** sobre una vivienda de **${fmtEur(precio)}**, la rentabilidad **bruta es del ${fmtPct(rentBruta)}**. Descontando ${fmtEur(gastosAnuales)}/año de gastos${gastosCompra > 0 ? ` y ${fmtEur(gastosCompra)} de compra` : ''}, la **neta baja al ${fmtPct(rentNeta)}** (${fmtEur(ingresoNetoAnual)} limpios al año). Es una rentabilidad **${calificacion}** para el mercado inmobiliario español.`,
    tone: netaR >= 4 ? 'good' : netaR >= 2 ? 'neutral' : 'warn',
    icon: '🏠',
  };

  const _chart = {
    type: 'scale',
    marker: Math.max(netaR, 0),
    markerLabel: fmtPct(rentNeta),
    min: 0,
    segments: [
      { nombre: 'Baja', max: 2, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Media', max: 4, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Buena', max: 6, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Alta', max: Math.max(8, Math.ceil(netaR) + 1), color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Rentabilidad neta anual del ${fmtPct(rentNeta)} sobre una escala de 0% a 8%.`,
  };

  return {
    rentabilidadBruta: fmtPct(rentBruta),
    rentabilidadNeta: fmtPct(rentNeta),
    ingresoNetoAnual: fmtEur(ingresoNetoAnual),
    ingresoNetoMensual: fmtEur(ingresoNetoAnual / 12),
    gastosAnuales: fmtEur(gastosAnuales),
    detalle: `Bruta = ${fmtEur(alquiler * 12)} ÷ ${fmtEur(precio)} = ${fmtPct(rentBruta)}. Ingreso neto = ${fmtEur(ingresoBrutoAnual)} − ${fmtEur(gastosAnuales)} = ${fmtEur(ingresoNetoAnual)}. Neta = ${fmtEur(ingresoNetoAnual)} ÷ ${fmtEur(inversionTotal)} = ${fmtPct(rentNeta)}.`,
    _insight,
    _chart,
  };
}
