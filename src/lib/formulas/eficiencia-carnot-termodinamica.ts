export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function eficienciaCarnotTermodinamica(i: Inputs): Outputs {
  const tc = Number(i.tCalor); const tf = Number(i.tFrio);
  if (!tc || !tf) throw new Error('Completá T_h y T_c');
  if (tf >= tc) throw new Error('T fría debe ser menor');
  const eta = 1 - tf / tc;
  return { eficiencia: (eta * 100).toFixed(2) + '%', resumen: `Eficiencia Carnot máx ${(eta*100).toFixed(1)}% entre ${tc}K y ${tf}K.` };
}
