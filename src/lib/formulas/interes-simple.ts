/** Interés simple: I = C × i × t */
export interface Inputs {
  capital: number;
  tasa: number;
  tiempo: number;
  unidad?: string;
  __lang?: string;
}
export interface Outputs {
  interes: number;
  montoFinal: number;
  interesMensual: number;
  interesDiario: number;
  formula: string;
}

export function interesSimple(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá capital, tasa y tiempo',
      years: 'años',
    },
    en: {
      errorRequired: 'Please enter capital, rate and time',
      years: 'years',
    },
  } as const)[__lang];

  const C = Number(i.capital);
  const tasa = Number(i.tasa) / 100;
  let t = Number(i.tiempo);
  const unidad = String(i.unidad || 'anos');
  if (!C || !tasa || !t) throw new Error(T.errorRequired);

  // Convertir tiempo a años (la tasa es anual)
  if (unidad === 'meses') t = t / 12;
  else if (unidad === 'dias') t = t / 365;

  const interes = C * tasa * t;
  const monto = C + interes;

  return {
    interes: Math.round(interes),
    montoFinal: Math.round(monto),
    interesMensual: Math.round(interes / (t * 12)),
    interesDiario: Math.round(interes / (t * 365)),
    formula: `I = ${Math.round(C)} × ${(tasa * 100).toFixed(2)}% × ${t.toFixed(4)} ${T.years} = ${Math.round(interes)}`,
  };
}
