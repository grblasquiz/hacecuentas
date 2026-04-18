export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function caloriasDeportivasBebidaIsotonica(i: Inputs): Outputs {
  const a = Number(i.azucarG) || 0;
  const kcal = a * 4;
  const pct = (a / 500) * 100;
  return { kcal: kcal.toFixed(0), choPorc: pct.toFixed(1) + '%', resumen: `${kcal.toFixed(0)} kcal con ${pct.toFixed(1)}% CHO (${a}g azúcar en 500ml).` };
}
