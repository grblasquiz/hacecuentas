/** Ingreso Airbnb host */
export interface Inputs { tarifaNoche: number; ocupacionPct: number; costoLimpieza: number; estadiaPromedio: number; gastosFijosMes: number; impuestosPct: number; }
export interface Outputs { ingresoNetoAnual: number; ingresoBrutoAnual: number; ingresoMensual: number; nochesAlAno: number; checkinsAno: number; }
export function ingresoUberAirbnbHost(i: Inputs): Outputs {
  const tarifa = Number(i.tarifaNoche);
  const ocup = Number(i.ocupacionPct) / 100;
  const limp = Number(i.costoLimpieza);
  const est = Number(i.estadiaPromedio);
  const fijos = Number(i.gastosFijosMes);
  const imp = Number(i.impuestosPct) / 100;
  if (tarifa < 0 || est < 1) throw new Error('Valores inválidos');
  const noches = 365 * ocup;
  const checkins = noches / est;
  const bruto = noches * tarifa;
  const fee = bruto * 0.03;
  const totalLimp = checkins * limp;
  const gastosFijosAnual = fijos * 12;
  const impuestos = bruto * imp;
  const neto = bruto - fee - totalLimp - gastosFijosAnual - impuestos;
  return {
    ingresoNetoAnual: Math.round(neto),
    ingresoBrutoAnual: Math.round(bruto),
    ingresoMensual: Math.round(neto / 12),
    nochesAlAno: Math.round(noches),
    checkinsAno: Math.round(checkins)
  };
}
