/**
 * IIFYM 30/30/40.
 */

export interface MacrosIifymFlexibleInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosIifymFlexibleOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  flexibleKcal: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosIifymFlexible(inputs: MacrosIifymFlexibleInputs): MacrosIifymFlexibleOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.40) / 4;
  const flex = cal * 0.20;
  const _insight = {
    title: __lang === 'en' ? 'Hit these numbers, eat anything' : 'Pegá estos números, comé lo que quieras',
    text: __lang === 'en'
      ? `The IIFYM rule is simple: cover **${prot.toFixed(0)}g protein**, ${carbos.toFixed(0)}g carbs and ${grasa.toFixed(0)}g fat from whatever foods you like. Around **${flex.toFixed(0)} kcal** of that budget can be discretionary (treats) as long as the macros add up.`
      : `La regla IIFYM es simple: cubrí **${prot.toFixed(0)}g de proteína**, ${carbos.toFixed(0)}g de carbos y ${grasa.toFixed(0)}g de grasa con los alimentos que prefieras. Unas **${flex.toFixed(0)} kcal** de ese total pueden ser flexibles (gustos) mientras cierren los macros.`,
    tone: 'neutral' as const,
    icon: '🍩',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Carbs' : 'Carbos', value: Math.round(cal * 0.40) },
      { label: __lang === 'en' ? 'Protein' : 'Proteína', value: Math.round(cal * 0.30) },
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
    flexibleKcal: Number(flex.toFixed(0)),
    resumen: __lang === 'en'
      ? `IIFYM ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g carbs. ${flex.toFixed(0)} flex.`
      : `IIFYM ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos. ${flex.toFixed(0)} flex.`,
    _insight,
    _chart,
  };
}
