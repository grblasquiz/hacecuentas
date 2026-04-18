export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function frecuenciaEntrenamientoGrupoMuscular(i: Inputs): Outputs {
  const niv: Record<string, string> = { principiante: '3 (full body)', intermedio: '2-3 por grupo', avanzado: '3-4 por grupo' };
  const n = String(i.nivel);
  return { frecuencia: niv[n] || '2x', resumen: `Frecuencia: ${niv[n]} para nivel ${n}.` };
}
