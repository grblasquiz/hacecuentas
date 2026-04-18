export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function luzNaturalAhorroIluminacion(i: Inputs): Outputs {
  const h = Number(i.horas) || 0; const w = Number(i.watts) || 0;
  const kWhMes = (h * w * 30) / 1000;
  const pesos = kWhMes * 80;
  return { kwhMes: kWhMes.toFixed(2) + ' kWh', pesosMes: '$' + pesos.toFixed(0), resumen: `Ahorrás ${kWhMes.toFixed(1)} kWh/mes ($${pesos.toFixed(0)}) usando luz natural.` };
}
