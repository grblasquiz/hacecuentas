/** Ahorro LED vs lámparas comunes */
export interface Inputs { cantidadLamparas: number; tipoActual: string; horasDia: number; precioKwh: number; precioLED?: number; }
export interface Outputs { ahorroAnual: number; ahorroMensual: number; inversion: number; mesesRecupero: number; reduccionConsumo: string; }

export function ahorroLedVsComun(i: Inputs): Outputs {
  const n = Number(i.cantidadLamparas);
  const hs = Number(i.horasDia);
  const precio = Number(i.precioKwh);
  const precioLED = Number(i.precioLED) || 2500;
  if (!n || n <= 0) throw new Error('Ingresá la cantidad de lámparas');
  if (!hs || hs <= 0) throw new Error('Ingresá las horas de uso');
  if (!precio || precio <= 0) throw new Error('Ingresá el precio del kWh');

  const wattsMap: Record<string, number> = { 'incandescente': 60, 'halogena': 42, 'bajo-consumo': 15 };
  const wattsActual = wattsMap[i.tipoActual] || 60;
  const wattsLED = 9;

  const kwhActualAnio = (n * wattsActual * hs * 365) / 1000;
  const kwhLEDAnio = (n * wattsLED * hs * 365) / 1000;
  const ahorroKwh = kwhActualAnio - kwhLEDAnio;
  const ahorroAnual = ahorroKwh * precio;
  const ahorroMensual = ahorroAnual / 12;
  const inversion = n * precioLED;
  const mesesRecupero = ahorroMensual > 0 ? inversion / ahorroMensual : 999;
  const reduccionPct = ((ahorroKwh / kwhActualAnio) * 100).toFixed(0);

  return {
    ahorroAnual: Math.round(ahorroAnual),
    ahorroMensual: Math.round(ahorroMensual),
    inversion: Math.round(inversion),
    mesesRecupero: Math.round(mesesRecupero * 10) / 10,
    reduccionConsumo: `${reduccionPct}% menos consumo (${Math.round(ahorroKwh)} kWh/año)`,
  };
}
