/**
 * Macros Vegana 20/25/55.
 */

export interface MacrosVeganaDietaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosVeganaDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosVeganaDieta(inputs: MacrosVeganaDietaInputs): MacrosVeganaDietaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.25) / 9;
  const carbos = (cal * 0.55) / 4;
  const kcalProt = Math.round(cal * 0.20);
  const kcalGrasa = Math.round(cal * 0.25);
  const kcalCarbos = cal - kcalProt - kcalGrasa;
  const calFmt = cal.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `Vegan ${cal} kcal: ${prot.toFixed(0)}g plant protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g carbs. Supplement B12.`
      : `Vegana ${cal} kcal: ${prot.toFixed(0)}g prot vegetal + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. Suplementá B12.`,
    _insight: {
      title: __lang === 'en' ? 'Carb-led plant plan' : 'Plan vegetal con base de carbos',
      text: __lang === 'en'
        ? `Carbs lead at **${carbos.toFixed(0)}g (55%)** from grains, legumes and fruit, with **${prot.toFixed(0)}g of plant protein** and **${grasa.toFixed(0)}g of fat** in your ${calFmt} kcal. Remember to supplement **vitamin B12**, which plant foods don't provide.`
        : `Los carbos lideran con **${carbos.toFixed(0)}g (55%)** de cereales, legumbres y fruta, más **${prot.toFixed(0)}g de proteína vegetal** y **${grasa.toFixed(0)}g de grasa** en tus ${calFmt} kcal. Acordate de suplementar **vitamina B12**, que los vegetales no aportan.`,
      tone: 'warn',
      icon: '🌱',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: __lang === 'en' ? 'Plant protein' : 'Proteína vegetal', value: kcalProt },
        { label: __lang === 'en' ? 'Fat' : 'Grasa', value: kcalGrasa },
        { label: __lang === 'en' ? 'Carbs' : 'Carbos', value: kcalCarbos },
      ],
      centerValue: `${calFmt} kcal`,
      centerLabel: __lang === 'en' ? 'Daily total' : 'Total diario',
      ariaLabel: __lang === 'en'
        ? `Calorie split: ${kcalProt} kcal protein, ${kcalGrasa} kcal fat, ${kcalCarbos} kcal carbs`
        : `Reparto de calorías: ${kcalProt} kcal proteína, ${kcalGrasa} kcal grasa, ${kcalCarbos} kcal carbos`,
    },
  };
}
