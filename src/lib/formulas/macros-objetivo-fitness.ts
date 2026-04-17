/** Calculadora de macros según objetivo fitness */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  objetivo: string;
}
export interface Outputs {
  caloriasObjetivo: number;
  proteinaGr: number;
  carbsGr: number;
  grasaGr: number;
  tdee: number;
  mensaje: string;
}

export function macrosObjetivoFitness(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  const actividad = String(i.actividad || 'moderado');
  const objetivo = String(i.objetivo || 'mantenimiento');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor BMR
  let bmr: number;
  if (sexo === 'masculino') {
    bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  } else {
    bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  }

  const factores: Record<string, number> = {
    sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9
  };
  const tdee = Math.round(bmr * (factores[actividad] || 1.55));

  let caloriasObjetivo: number;
  let pctProt: number, pctCarbs: number, pctGrasa: number;

  if (objetivo === 'volumen') {
    caloriasObjetivo = tdee + 400;
    pctProt = 0.30; pctCarbs = 0.40; pctGrasa = 0.30;
  } else if (objetivo === 'definicion') {
    caloriasObjetivo = tdee - 500;
    pctProt = 0.40; pctCarbs = 0.35; pctGrasa = 0.25;
  } else {
    caloriasObjetivo = tdee;
    pctProt = 0.30; pctCarbs = 0.40; pctGrasa = 0.30;
  }

  const proteinaGr = Math.round((caloriasObjetivo * pctProt) / 4);
  const carbsGr = Math.round((caloriasObjetivo * pctCarbs) / 4);
  const grasaGr = Math.round((caloriasObjetivo * pctGrasa) / 9);

  const objLabel = objetivo === 'volumen' ? 'volumen (+400 kcal)' : objetivo === 'definicion' ? 'definición (-500 kcal)' : 'mantenimiento';

  return {
    caloriasObjetivo,
    proteinaGr,
    carbsGr,
    grasaGr,
    tdee,
    mensaje: `Objetivo ${objLabel}: ${caloriasObjetivo} kcal/día. Proteína: ${proteinaGr}g, Carbs: ${carbsGr}g, Grasa: ${grasaGr}g.`
  };
}