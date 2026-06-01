export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rmPressBancaEstimador(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  const resumen = __lang === 'pt'
    ? `1RM estimado: ${rm.toFixed(0)} kg a partir de ${p}kg × ${r} reps.`
    : `1RM estimado: ${rm.toFixed(0)} kg desde ${p}kg × ${r} reps.`;
  return { rm1: rm.toFixed(1) + ' kg', resumen };
}
