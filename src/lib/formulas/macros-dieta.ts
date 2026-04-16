/** Calculadora de macronutrientes */
export interface Inputs {
  peso: number;
  altura: number;
  edad: number;
  sexo: string;
  actividad: string;
  objetivo: string;
}
export interface Outputs {
  caloriasTotal: number;
  proteinasG: number;
  carbosG: number;
  grasasG: number;
  proteinasCal: number;
  carbosCal: number;
  grasasCal: number;
  mensaje: string;
}

export function macrosDieta(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'm');
  const actividad = String(i.actividad || 'moderado');
  const objetivo = String(i.objetivo || 'mantener');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');
  if (!edad || edad <= 0) throw new Error('Ingresá tu edad');

  // Mifflin-St Jeor BMR
  let bmr: number;
  if (sexo === 'f') {
    bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  } else {
    bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  }

  // Multiplicador actividad
  const factores: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    alto: 1.725,
    muy_alto: 1.9,
  };
  const tdee = bmr * (factores[actividad] || 1.55);

  // Ajuste por objetivo
  let calorias: number;
  if (objetivo === 'perder') calorias = tdee - 500;
  else if (objetivo === 'ganar') calorias = tdee + 400;
  else calorias = tdee;

  // Distribución macros
  let protRatio: number, grasaRatio: number;
  if (objetivo === 'perder') { protRatio = 0.35; grasaRatio = 0.25; }
  else if (objetivo === 'ganar') { protRatio = 0.30; grasaRatio = 0.25; }
  else { protRatio = 0.25; grasaRatio = 0.30; }
  const carbRatio = 1 - protRatio - grasaRatio;

  const proteinasCal = calorias * protRatio;
  const carbosCal = calorias * carbRatio;
  const grasasCal = calorias * grasaRatio;

  const proteinasG = proteinasCal / 4;
  const carbosG = carbosCal / 4;
  const grasasG = grasasCal / 9;

  return {
    caloriasTotal: Math.round(calorias),
    proteinasG: Math.round(proteinasG),
    carbosG: Math.round(carbosG),
    grasasG: Math.round(grasasG),
    proteinasCal: Math.round(proteinasCal),
    carbosCal: Math.round(carbosCal),
    grasasCal: Math.round(grasasCal),
    mensaje: `${Math.round(calorias)} kcal/día: ${Math.round(proteinasG)}g proteínas, ${Math.round(carbosG)}g carbos, ${Math.round(grasasG)}g grasas.`,
  };
}
