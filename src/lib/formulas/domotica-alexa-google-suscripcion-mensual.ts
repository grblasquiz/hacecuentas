/** Costo mensual ecosistema smart home (Alexa+, Nest Aware, Ring Protect, etc.) */
export interface Inputs { suscripcionAlexaPlus: number; suscripcionNestAware: number; suscripcionRingProtect: number; otrasSuscripcionesMensual: number; consumoElectricoKwhMes: number; precioKwh: number; }
export interface Outputs { costoSuscripcionesMensual: number; costoElectricidadMensual: number; costoTotalMensual: number; costoAnual: number; explicacion: string; _chart?: any; _insight?: any; }
export function domoticaAlexaGoogleSuscripcionMensual(i: Inputs): Outputs {
  const sAlexa = Number(i.suscripcionAlexaPlus) || 0;
  const sNest = Number(i.suscripcionNestAware) || 0;
  const sRing = Number(i.suscripcionRingProtect) || 0;
  const sOtras = Number(i.otrasSuscripcionesMensual) || 0;
  const kwh = Number(i.consumoElectricoKwhMes) || 0;
  const precio = Number(i.precioKwh) || 0;
  if (kwh < 0 || precio < 0) throw new Error('Valores no pueden ser negativos');
  const suscripciones = sAlexa + sNest + sRing + sOtras;
  const electricidad = kwh * precio;
  const total = suscripciones + electricidad;
  const anual = total * 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Suscripciones', value: Number(suscripciones.toFixed(2)) },
      { label: 'Electricidad', value: Number(electricidad.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total/mes',
    ariaLabel: 'Composición del costo mensual del ecosistema smart home: suscripciones frente a consumo eléctrico.',
  };
  const subsShare = total > 0 ? (suscripciones / total) * 100 : 0;
  const subsDomina = suscripciones >= electricidad;
  const insightTone: 'good' | 'warn' | 'neutral' =
    subsDomina && suscripciones > 0 ? 'warn' : 'neutral';
  const insightLectura = subsDomina && suscripciones > 0
    ? `El **${subsShare.toFixed(0)}%** son **suscripciones** ($${suscripciones.toFixed(2)}/mes): es gasto fijo que corre estés o no en casa, revisá cuáles usás de verdad`
    : suscripciones > 0
      ? `El grueso es **electricidad** ($${electricidad.toFixed(2)}/mes); las suscripciones pesan solo ${subsShare.toFixed(0)}%`
      : `Todo el costo es **electricidad** ($${electricidad.toFixed(2)}/mes), sin suscripciones atadas`;
  const insight = {
    title: 'A dónde va la plata',
    text: `Tu smart home te cuesta **$${total.toFixed(2)}/mes** = **$${anual.toFixed(2)}/año**. ${insightLectura}.`,
    tone: insightTone,
    icon: '🏠',
  };

  return {
    costoSuscripcionesMensual: Number(suscripciones.toFixed(2)),
    costoElectricidadMensual: Number(electricidad.toFixed(2)),
    costoTotalMensual: Number(total.toFixed(2)),
    costoAnual: Number(anual.toFixed(2)),
    explicacion: `Tu ecosistema smart home cuesta ${total.toFixed(2)} por mes (${suscripciones.toFixed(2)} suscripciones + ${electricidad.toFixed(2)} electricidad), equivalente a ${anual.toFixed(2)} por año.`,
    _chart: chart,
    _insight: insight,
  };
}
