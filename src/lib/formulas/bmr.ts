/** BMR y TDEE — Mifflin-St Jeor */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: 'm' | 'f' | string;
  actividad?: 'sedentario' | 'ligero' | 'moderado' | 'alto' | 'muy-alto' | string;
}
export interface Outputs {
  bmr: number;
  tdee: number;
  paraBajar: number;
  paraMantener: number;
  paraSubir: number;
  factorActividad: number;
}

const FACTORES: Record<string, number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  alto: 1.725,
  'muy-alto': 1.9,
};

export function bmr(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const alt = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const act = String(i.actividad || 'sedentario');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');
  if (!alt || alt <= 0) throw new Error('Ingresá la altura');
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  // Mifflin-St Jeor
  let bmrVal = 10 * peso + 6.25 * alt - 5 * edad;
  bmrVal += sexo === 'f' ? -161 : 5;

  const factor = FACTORES[act] ?? 1.2;
  const tdeeVal = bmrVal * factor;

  return {
    bmr: Math.round(bmrVal),
    tdee: Math.round(tdeeVal),
    paraBajar: Math.round(tdeeVal - 500), // déficit 500 kcal → ~0.5 kg/sem
    paraMantener: Math.round(tdeeVal),
    paraSubir: Math.round(tdeeVal + 300),
    factorActividad: factor,
  };
}
