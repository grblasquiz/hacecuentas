export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function penduloSimplePeriodo(i: Inputs): Outputs {
  const L = Number(i.L); const g = Number(i.g) || 9.81;
  if (!L || L <= 0) throw new Error('Completá L');
  const T = 2 * Math.PI * Math.sqrt(L / g);
  return { periodo: T.toFixed(3) + ' s', frecuencia: (1/T).toFixed(3) + ' Hz', resumen: `Período T = ${T.toFixed(2)}s, frecuencia ${(1/T).toFixed(2)} Hz (L=${L}m).` };
}
