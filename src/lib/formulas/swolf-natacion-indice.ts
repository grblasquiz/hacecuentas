export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function swolfNatacionIndice(i: Inputs): Outputs {
  const t = Number(i.tiempo) || 0; const b = Number(i.brazadas) || 0;
  const sw = t + b;
  const nivel = sw < 40 ? 'Elite' : sw < 56 ? 'Avanzado' : sw < 70 ? 'Intermedio' : 'Principiante';
  return { swolf: sw.toString(), nivel, resumen: `SWOLF ${sw} — ${nivel}. Mejorá bajando tiempo O brazadas.` };
}
