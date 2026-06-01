export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rmSentadillaEstimador(i: Inputs): Outputs {
  const __lang = i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { label: '1RM estimado', desde: 'desde' },
    pt: { label: '1RM estimado', desde: 'de' },
  } as const)[__lang];
  const p = Number(i.peso) || 0; const r = Number(i.reps) || 1;
  const rm = p * (1 + r / 30);
  return { rm1: rm.toFixed(1) + ' kg', resumen: `${T.label}: ${rm.toFixed(0)} kg ${T.desde} ${p}kg × ${r} reps.` };
}
