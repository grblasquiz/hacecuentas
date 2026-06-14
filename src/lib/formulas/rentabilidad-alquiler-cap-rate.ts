/**
 * Calculadora de rentabilidad de alquiler (Cap Rate / tasa de capitalización)
 * Cap rate bruto = (alquiler × 12) / valor × 100
 * Cap rate neto = (alquiler × 12 − gastos) / valor × 100
 * Años de repago = valor / (alquiler × 12)
 */

export interface RentabilidadAlquilerCapRateInputs {
  valor_propiedad: number | string;
  alquiler_mensual: number | string;
  gastos_anuales?: number | string; // opcional: expensas + impuestos + mantenimiento
}

export interface RentabilidadAlquilerCapRateOutputs {
  capRateBruto: number;
  capRateNeto: number;
  ingresoAnualBruto: number;
  ingresoAnualNeto: number;
  aniosRepago: number;
  benchmark: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function rentabilidadAlquilerCapRate(
  i: RentabilidadAlquilerCapRateInputs
): RentabilidadAlquilerCapRateOutputs {
  const valor = num(i.valor_propiedad);
  const alquiler = num(i.alquiler_mensual);
  const gastos = Math.max(0, num(i.gastos_anuales));

  if (!valor || valor <= 0) throw new Error('Ingresá el valor de la propiedad');
  if (!alquiler || alquiler <= 0) throw new Error('Ingresá el alquiler mensual');

  const ingresoAnualBruto = alquiler * 12;
  const ingresoAnualNeto = ingresoAnualBruto - gastos;

  const capRateBruto = (ingresoAnualBruto / valor) * 100;
  const capRateNeto = (ingresoAnualNeto / valor) * 100;
  const aniosRepago = ingresoAnualBruto > 0 ? valor / ingresoAnualBruto : 0;

  let benchmark = '';
  if (capRateNeto >= 8) benchmark = '🚀 Excelente — rentabilidad muy por encima del promedio';
  else if (capRateNeto >= 5) benchmark = '✅ Bueno — rentabilidad sana para alquiler residencial';
  else if (capRateNeto >= 3) benchmark = '⚡ Aceptable — típico en zonas premium de bajo riesgo';
  else if (capRateNeto >= 0) benchmark = '⚠️ Bajo — el inmueble rinde poco como renta';
  else benchmark = '🔴 Negativo — los gastos superan al alquiler';

  const capBrutoR = Math.round(capRateBruto * 100) / 100;
  const capNetoR = Math.round(capRateNeto * 100) / 100;
  const aniosR = Math.round(aniosRepago * 10) / 10;

  const tone: 'good' | 'warn' | 'neutral' =
    capNetoR >= 5 ? 'good' : capNetoR >= 3 ? 'neutral' : 'warn';

  const insightText =
    capNetoR >= 5
      ? `Este inmueble rinde un **${capNetoR}% neto anual** (${capBrutoR}% bruto): por encima del umbral de referencia (≈5% neto) para alquiler residencial. Recuperás el valor de compra solo con la renta en **${aniosR} años**.`
      : capNetoR >= 0
        ? `Rinde **${capNetoR}% neto anual** (${capBrutoR}% bruto). Está por debajo del umbral orientativo de ~5% neto; tardás **${aniosR} años** en recuperar el capital solo con la renta. Sumá la revalorización esperada del inmueble para evaluar el retorno total.`
        : `Los gastos anuales superan al alquiler: cap rate neto **${capNetoR}%**. Revisá expensas, impuestos y vacancia, porque hoy el inmueble pierde plata como renta.`;

  const _insight = {
    title: 'Rentabilidad del alquiler',
    text: insightText,
    tone,
    icon: '🏠',
  };

  // Doughnut: ingreso bruto repartido entre lo que queda neto y lo que se va en gastos
  const gastosClamp = Math.min(gastos, ingresoAnualBruto);
  const netoSlice = Math.max(0, ingresoAnualBruto - gastosClamp);
  const _chart =
    ingresoAnualBruto > 0
      ? {
          type: 'doughnut',
          slices: [
            { label: 'Renta neta', value: Math.round(netoSlice) },
            { label: 'Gastos anuales', value: Math.round(gastosClamp) },
          ],
          prefix: '$',
          centerValue: `${capNetoR}%`,
          centerLabel: 'Cap rate neto',
          ariaLabel: `Gráfico de torta del ingreso anual bruto del alquiler ($${Math.round(ingresoAnualBruto).toLocaleString('es-AR')}) repartido entre renta neta y gastos`,
        }
      : undefined;

  const out: RentabilidadAlquilerCapRateOutputs = {
    capRateBruto: capBrutoR,
    capRateNeto: capNetoR,
    ingresoAnualBruto: Math.round(ingresoAnualBruto),
    ingresoAnualNeto: Math.round(ingresoAnualNeto),
    aniosRepago: aniosR,
    benchmark,
    detalle: `Cap rate bruto ${capBrutoR}% / neto ${capNetoR}%. Ingreso anual: $${Math.round(ingresoAnualBruto).toLocaleString('es-AR')} bruto, $${Math.round(ingresoAnualNeto).toLocaleString('es-AR')} neto. Repago por renta: ${aniosR} años.`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
