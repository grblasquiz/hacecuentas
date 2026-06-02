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
  _insight?: any;
  _chart?: any;
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

  const calRound = Math.round(calorias);
  const protGRound = Math.round(proteinasG);
  const carbGRound = Math.round(carbosG);
  const grasaGRound = Math.round(grasasG);
  const protKcalRound = Math.round(proteinasCal);
  const carbKcalRound = Math.round(carbosCal);
  const grasaKcalRound = Math.round(grasasCal);
  const tdeeRound = Math.round(tdee);
  const diff = calRound - tdeeRound;

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (objetivo === 'perder') {
    insightText = `Para bajar de peso comés **${calRound} kcal/día**, unas ${Math.abs(diff)} kcal por debajo de tu gasto (${tdeeRound}). La proteína sube a **${protGRound}g** para proteger músculo durante el déficit.`;
    insightTone = 'good';
  } else if (objetivo === 'ganar') {
    insightText = `Para ganar masa comés **${calRound} kcal/día**, unas ${Math.abs(diff)} kcal por encima de tu gasto (${tdeeRound}). Apuntá a **${protGRound}g de proteína** y **${carbGRound}g de carbos** para alimentar el entrenamiento.`;
    insightTone = 'good';
  } else {
    insightText = `Para mantenerte comés **${calRound} kcal/día**, igualando tu gasto estimado. El reparto queda en **${protGRound}g proteína**, ${carbGRound}g carbos y ${grasaGRound}g grasa.`;
    insightTone = 'neutral';
  }
  const _insight = {
    title: 'Tu objetivo en números',
    text: insightText,
    tone: insightTone,
    icon: '🍽️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Carbos', value: carbKcalRound },
      { label: 'Proteínas', value: protKcalRound },
      { label: 'Grasas', value: grasaKcalRound },
    ],
    prefix: '',
    centerValue: `${calRound} kcal`,
    centerLabel: 'por día',
    ariaLabel: `Reparto de calorías diarias: ${carbGRound}g carbos, ${protGRound}g proteínas y ${grasaGRound}g grasas, total ${calRound} kcal`,
  };

  return {
    caloriasTotal: calRound,
    proteinasG: protGRound,
    carbosG: carbGRound,
    grasasG: grasaGRound,
    proteinasCal: protKcalRound,
    carbosCal: carbKcalRound,
    grasasCal: grasaKcalRound,
    mensaje: `${calRound} kcal/día: ${protGRound}g proteínas, ${carbGRound}g carbos, ${grasaGRound}g grasas.`,
    _insight,
    _chart,
  };
}
