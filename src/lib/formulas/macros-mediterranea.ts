/**
 * Macros Mediterránea 15/35/50.
 */

export interface MacrosMediterraneaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosMediterraneaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosMediterranea(inputs: MacrosMediterraneaInputs): MacrosMediterraneaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(__lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas');
  const prot = (cal * 0.15) / 4;
  const grasa = (cal * 0.35) / 9;
  const carbos = (cal * 0.50) / 4;
  const kcalProt = Math.round(cal * 0.15);
  const kcalGrasa = Math.round(cal * 0.35);
  const kcalCarbos = Math.round(cal * 0.50);
  const calFmt = cal.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR');
  return {
    proteinaGramos: Number(prot.toFixed(0)),
    grasaGramos: Number(grasa.toFixed(0)),
    carbosGramos: Number(carbos.toFixed(0)),
    resumen: __lang === 'en'
      ? `Mediterranean ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat (olive) + ${carbos.toFixed(0)}g whole-grain carbs.`
      : `Mediterránea ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa (oliva) + ${carbos.toFixed(0)}g carbos integrales.`,
    _insight: {
      title: __lang === 'en' ? 'Olive-forward balance' : 'Equilibrio con foco en oliva',
      text: __lang === 'en'
        ? `The Mediterranean profile leans on healthy fats: **${grasa.toFixed(0)}g of fat (35%)**, mostly olive oil, nuts and fish, plus **${carbos.toFixed(0)}g of whole-grain carbs** and **${prot.toFixed(0)}g of protein** in your ${calFmt} kcal.`
        : `El perfil mediterráneo apuesta a las grasas buenas: **${grasa.toFixed(0)}g de grasa (35%)**, sobre todo aceite de oliva, frutos secos y pescado, más **${carbos.toFixed(0)}g de carbos integrales** y **${prot.toFixed(0)}g de proteína** en tus ${calFmt} kcal.`,
      tone: 'good',
      icon: '🫒',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: __lang === 'en' ? 'Protein' : 'Proteína', value: kcalProt },
        { label: __lang === 'en' ? 'Fat (olive)' : 'Grasa (oliva)', value: kcalGrasa },
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
