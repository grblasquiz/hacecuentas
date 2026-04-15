/** Sentadilla y peso muerto relativo al peso corporal */
export interface Inputs {
  squatRm: number;
  deadliftRm: number;
  pesoCorporal: number;
  sexo: string;
}

export interface Outputs {
  ratioSquat: number;
  ratioDeadlift: number;
  categoriaSquat: string;
  categoriaDeadlift: string;
  sumaTotal: number;
  ratioTotal: number;
  resumen: string;
}

const STANDARDS: Record<string, Record<string, { sq: number; dl: number }>> = {
  hombre: {
    principiante: { sq: 1.0, dl: 1.3 },
    novato: { sq: 1.4, dl: 1.8 },
    intermedio: { sq: 1.9, dl: 2.3 },
    avanzado: { sq: 2.4, dl: 2.9 },
    elite: { sq: 3.0, dl: 3.5 },
  },
  mujer: {
    principiante: { sq: 0.6, dl: 0.8 },
    novato: { sq: 0.9, dl: 1.2 },
    intermedio: { sq: 1.3, dl: 1.7 },
    avanzado: { sq: 1.7, dl: 2.2 },
    elite: { sq: 2.1, dl: 2.8 },
  },
};

function categorizar(ratio: number, standards: Record<string, number>): string {
  if (ratio >= standards.elite) return 'Elite';
  if (ratio >= standards.avanzado) return 'Avanzado';
  if (ratio >= standards.intermedio) return 'Intermedio';
  if (ratio >= standards.novato) return 'Novato';
  return 'Principiante';
}

export function squatDeadliftRelativo(i: Inputs): Outputs {
  const sq = Number(i.squatRm);
  const dl = Number(i.deadliftRm);
  const peso = Number(i.pesoCorporal);
  const sexo = String(i.sexo || 'hombre');

  if (!sq || sq <= 0) throw new Error('Ingresá tu 1RM de sentadilla');
  if (!dl || dl <= 0) throw new Error('Ingresá tu 1RM de peso muerto');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal');

  const rSq = sq / peso;
  const rDl = dl / peso;
  const stds = STANDARDS[sexo] || STANDARDS.hombre;

  const sqStd = Object.fromEntries(Object.entries(stds).map(([k, v]) => [k, v.sq]));
  const dlStd = Object.fromEntries(Object.entries(stds).map(([k, v]) => [k, v.dl]));

  const catSq = categorizar(rSq, sqStd);
  const catDl = categorizar(rDl, dlStd);

  const suma = sq + dl;
  const ratioTotal = suma / peso;

  return {
    ratioSquat: Number(rSq.toFixed(2)),
    ratioDeadlift: Number(rDl.toFixed(2)),
    categoriaSquat: catSq,
    categoriaDeadlift: catDl,
    sumaTotal: Math.round(suma),
    ratioTotal: Number(ratioTotal.toFixed(2)),
    resumen: `Sentadilla **${rSq.toFixed(2)}x** (${catSq}), peso muerto **${rDl.toFixed(2)}x** (${catDl}). Total relativo: ${ratioTotal.toFixed(2)}x tu peso corporal.`,
  };
}
