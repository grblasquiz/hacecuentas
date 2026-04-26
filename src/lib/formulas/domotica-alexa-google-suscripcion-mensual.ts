/** Costo mensual ecosistema smart home (Alexa+, Nest Aware, Ring Protect, etc.) */
export interface Inputs { suscripcionAlexaPlus: number; suscripcionNestAware: number; suscripcionRingProtect: number; otrasSuscripcionesMensual: number; consumoElectricoKwhMes: number; precioKwh: number; }
export interface Outputs { costoSuscripcionesMensual: number; costoElectricidadMensual: number; costoTotalMensual: number; costoAnual: number; explicacion: string; }
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
  return {
    costoSuscripcionesMensual: Number(suscripciones.toFixed(2)),
    costoElectricidadMensual: Number(electricidad.toFixed(2)),
    costoTotalMensual: Number(total.toFixed(2)),
    costoAnual: Number(anual.toFixed(2)),
    explicacion: `Tu ecosistema smart home cuesta ${total.toFixed(2)} por mes (${suscripciones.toFixed(2)} suscripciones + ${electricidad.toFixed(2)} electricidad), equivalente a ${anual.toFixed(2)} por año.`,
  };
}
