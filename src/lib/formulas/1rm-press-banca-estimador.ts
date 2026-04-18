export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rmPressBancaEstimador(i: Inputs): Outputs {
  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  return { rm1: rm.toFixed(1) + ' kg', resumen: `1RM estimado: ${rm.toFixed(0)} kg desde ${p}kg × ${r} reps.` };
}
