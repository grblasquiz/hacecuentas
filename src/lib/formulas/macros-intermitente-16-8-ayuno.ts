/**
 * AI 16:8, 2 comidas 40/60.
 */

export interface MacrosIntermitente168AyunoInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosIntermitente168AyunoOutputs {
  comida1Kcal: number;
  comida2Kcal: number;
  proteinaDiaGramos: number;
  grasaDiaGramos: number;
  carbosDiaGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosIntermitente168Ayuno(inputs: MacrosIntermitente168AyunoInputs): MacrosIntermitente168AyunoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(
    __lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas'
  );
  const c1 = cal * 0.40;
  const c2 = cal * 0.60;
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.40) / 4;
  const _insight = {
    title: __lang === 'en' ? 'Your 8-hour eating window' : 'Tu ventana de 8 horas',
    text: __lang === 'en'
      ? `Eat all ${cal} kcal in two meals inside the 8-hour window: a lighter first meal of **${c1.toFixed(0)} kcal** and a larger second of **${c2.toFixed(0)} kcal**. Across the day that totals **${prot.toFixed(0)}g protein**, ${carbos.toFixed(0)}g carbs and ${grasa.toFixed(0)}g fat.`
      : `Comé las ${cal} kcal en dos comidas dentro de la ventana de 8 h: una primera más liviana de **${c1.toFixed(0)} kcal** y una segunda más fuerte de **${c2.toFixed(0)} kcal**. En el día suman **${prot.toFixed(0)}g de proteína**, ${carbos.toFixed(0)}g de carbos y ${grasa.toFixed(0)}g de grasa.`,
    tone: 'neutral' as const,
    icon: '⏱️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? '1st meal' : 'Comida 1', value: Math.round(c1) },
      { label: __lang === 'en' ? '2nd meal' : 'Comida 2', value: Math.round(c2) },
    ],
    prefix: '',
    centerValue: `${cal} kcal`,
    centerLabel: __lang === 'en' ? 'in 8 h' : 'en 8 h',
    ariaLabel: __lang === 'en'
      ? `Calorie split between two meals: ${c1.toFixed(0)} kcal and ${c2.toFixed(0)} kcal, total ${cal} kcal`
      : `Reparto de calorías entre dos comidas: ${c1.toFixed(0)} kcal y ${c2.toFixed(0)} kcal, total ${cal} kcal`,
  };
  return {
    comida1Kcal: Number(c1.toFixed(0)),
    comida2Kcal: Number(c2.toFixed(0)),
    proteinaDiaGramos: Number(prot.toFixed(0)),
    grasaDiaGramos: Number(grasa.toFixed(0)),
    carbosDiaGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `IF 16:8 ${cal} kcal: ${c1.toFixed(0)} + ${c2.toFixed(0)} kcal. Total ${prot.toFixed(0)}g protein.`
      : `AI 16:8 ${cal} kcal: ${c1.toFixed(0)} + ${c2.toFixed(0)} kcal. Total ${prot.toFixed(0)}g prot.`,
    _insight,
    _chart,
  };
}
