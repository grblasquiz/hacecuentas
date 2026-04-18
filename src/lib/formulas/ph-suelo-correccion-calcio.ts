export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function phSueloCorreccionCalcio(i: Inputs): Outputs {
  const pa = Number(i.phActual) || 7; const pi = Number(i.phIdeal) || 6.5; const m = Number(i.m2) || 0;
  const dif = pi - pa;
  const kg = dif * 0.5 * m;
  return { kgCal: kg.toFixed(1) + ' kg', resumen: kg > 0 ? `Agregar ${kg.toFixed(1)} kg cal en ${m} m² para subir pH.` : 'pH ya alcanza o supera ideal.' };
}
