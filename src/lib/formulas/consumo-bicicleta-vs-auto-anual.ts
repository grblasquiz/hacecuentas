export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoBicicletaVsAutoAnual(i: Inputs): Outputs {
  const km = Number(i.kmDia) || 0; const d = Number(i.diasMes) || 0;
  const kmAño = km * d * 12;
  const co2 = kmAño * 0.2; const cal = kmAño * 25;
  return { kgCo2Año: co2.toFixed(0) + ' kg', caloriasAño: cal.toFixed(0), resumen: `Ahorrás ${co2.toFixed(0)} kg CO₂/año y quemás ${cal.toFixed(0)} kcal.` };
}
