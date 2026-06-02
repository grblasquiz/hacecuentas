/**
 * DASH 18/27/55 + sodio <2300mg.
 */

export interface MacrosDashHipertensionInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosDashHipertensionOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  sodioMaxMg: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosDashHipertension(inputs: MacrosDashHipertensionInputs): MacrosDashHipertensionOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.18) / 4;
  const grasa = (cal * 0.27) / 9;
  const carbos = (cal * 0.55) / 4;
  const protG = Number(prot.toFixed(0));
  const grasaG = Number(grasa.toFixed(0));
  const carbosG = Number(carbos.toFixed(0));
  const totalKcal = protG * 4 + grasaG * 9 + carbosG * 4;
  const _insight = {
    title: __lang === 'en' ? 'Your DASH split' : 'Tu reparto DASH',
    text: __lang === 'en'
      ? `On ${cal} kcal: **${carbosG}g carbs** (55%), **${protG}g protein** (18%) and **${grasaG}g fat** (27%). The real lever for blood pressure is sodium: keep it **under 2,300 mg/day** (ideally 1,500 mg).`
      : `Con ${cal} kcal: **${carbosG}g de carbos** (55%), **${protG}g de proteína** (18%) y **${grasaG}g de grasa** (27%). La palanca real para la presión es el sodio: mantenelo **por debajo de 2.300 mg/día** (ideal 1.500 mg).`,
    tone: 'neutral' as const,
    icon: '🫀',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Protein' : 'Proteína', value: protG * 4 },
      { label: __lang === 'en' ? 'Fat' : 'Grasa', value: grasaG * 9 },
      { label: __lang === 'en' ? 'Carbs' : 'Carbos', value: carbosG * 4 },
    ],
    centerValue: `${totalKcal}`,
    centerLabel: 'kcal',
    ariaLabel: __lang === 'en'
      ? `Calorie split: ${protG}g protein, ${grasaG}g fat and ${carbosG}g carbohydrates`
      : `Reparto de calorías: ${protG}g proteína, ${grasaG}g grasa y ${carbosG}g carbohidratos`,
  };
  return {
    proteinaGramos: protG,
    grasaGramos: grasaG,
    carbosGramos: carbosG,
    sodioMaxMg: 2300,
    resumen: __lang === 'en'
      ? `DASH ${cal} kcal: ${protG}g protein + ${grasaG}g fat + ${carbosG}g carbs + sodium <2300 mg.`
      : `DASH ${cal} kcal: ${protG}g prot + ${grasaG}g grasa + ${carbosG}g carbos + sodio <2300 mg.`,
    _insight,
    _chart,
  };
}
