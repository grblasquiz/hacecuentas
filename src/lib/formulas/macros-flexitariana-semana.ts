/**
 * Flexitariana 20/30/50.
 */

export interface MacrosFlexitarianaSemanaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosFlexitarianaSemanaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  diasVegPorSemana: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosFlexitarianaSemana(inputs: MacrosFlexitarianaSemanaInputs): MacrosFlexitarianaSemanaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.50) / 4;
  const _insight = {
    title: __lang === 'en' ? 'Your flexitarian split' : 'Tu reparto flexitariano',
    text: __lang === 'en'
      ? `A 20/30/50 split: **${carbos.toFixed(0)}g carbs** lead the plate, with **${prot.toFixed(0)}g protein** and ${grasa.toFixed(0)}g fat. Spread protein across **5 plant-based days + 2 meat days** so legumes and grains carry most of it.`
      : `Reparto 20/30/50: **${carbos.toFixed(0)}g de carbos** lideran el plato, con **${prot.toFixed(0)}g de proteína** y ${grasa.toFixed(0)}g de grasa. Repartí la proteína en **5 días veggie + 2 con carne**, dejando que legumbres y cereales aporten el grueso.`,
    tone: 'neutral' as const,
    icon: '🥗',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Carbs' : 'Carbos', value: Math.round(cal * 0.50) },
      { label: __lang === 'en' ? 'Protein' : 'Proteína', value: Math.round(cal * 0.20) },
      { label: __lang === 'en' ? 'Fat' : 'Grasa', value: Math.round(cal * 0.30) },
    ],
    prefix: '',
    centerValue: `${cal} kcal`,
    centerLabel: __lang === 'en' ? 'per day' : 'por día',
    ariaLabel: __lang === 'en'
      ? `Calorie split: ${carbos.toFixed(0)}g carbs, ${prot.toFixed(0)}g protein and ${grasa.toFixed(0)}g fat, total ${cal} kcal`
      : `Reparto de calorías: ${carbos.toFixed(0)}g carbos, ${prot.toFixed(0)}g proteína y ${grasa.toFixed(0)}g grasa, total ${cal} kcal`,
  };
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    diasVegPorSemana: 5,
    resumen: __lang === 'en'
      ? `Flexi ${cal} kcal/day: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g carbs. 5 veggie + 2 meat days.`
      : `Flexi ${cal} kcal/día: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. 5 veggie + 2 carne.`,
    _insight,
    _chart,
  };
}
