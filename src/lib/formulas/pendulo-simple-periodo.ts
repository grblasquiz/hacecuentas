export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function penduloSimplePeriodo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const L = Number(i.L); const g = Number(i.g) || 9.81;
  if (!L || L <= 0) throw new Error(__lang === 'en' ? 'Enter L' : 'Completá L');
  const T = 2 * Math.PI * Math.sqrt(L / g);
  const resumen = __lang === 'en'
    ? `Period T = ${T.toFixed(2)}s, frequency ${(1/T).toFixed(2)} Hz (L=${L}m).`
    : `Período T = ${T.toFixed(2)}s, frecuencia ${(1/T).toFixed(2)} Hz (L=${L}m).`;
  return { periodo: T.toFixed(3) + ' s', frecuencia: (1/T).toFixed(3) + ' Hz', resumen };
}
