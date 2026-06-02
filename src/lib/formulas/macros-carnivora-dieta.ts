/**
 * Carnívora 30/70/0.
 */

export interface MacrosCarnivoraDietaInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosCarnivoraDietaOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosCarnivoraDieta(inputs: MacrosCarnivoraDietaInputs): MacrosCarnivoraDietaOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(
    __lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas'
  );
  const prot = (cal * 0.30) / 4;
  const grasa = (cal * 0.70) / 9;
  const protG = Number(prot.toFixed(0));
  const grasaG = Number(grasa.toFixed(0));
  const resumen = __lang === 'en'
    ? `Carnivore ${cal} kcal: ${protG}g protein + ${grasaG}g fat. Zero carbs. Medical supervision required.`
    : `Carnívora ${cal} kcal: ${protG}g prot + ${grasaG}g grasa. Cero carbos. Supervisión médica.`;
  const totalKcal = protG * 4 + grasaG * 9;
  const _insight = {
    title: __lang === 'en' ? 'Your carnivore split' : 'Tu reparto carnívoro',
    text: __lang === 'en'
      ? `On ${cal} kcal: **${protG}g protein** and **${grasaG}g fat**, with **zero carbs**. Fat covers about **70%** of energy, so prioritise fatty cuts. This is a highly restrictive diet — get medical supervision before starting.`
      : `Con ${cal} kcal: **${protG}g de proteína** y **${grasaG}g de grasa**, con **cero carbos**. La grasa aporta cerca del **70%** de la energía, así que priorizá cortes grasos. Es una dieta muy restrictiva: arrancá con supervisión médica.`,
    tone: 'warn' as const,
    icon: '🥩',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: __lang === 'en' ? 'Protein' : 'Proteína', value: protG * 4 },
      { label: __lang === 'en' ? 'Fat' : 'Grasa', value: grasaG * 9 },
    ],
    centerValue: `${totalKcal}`,
    centerLabel: 'kcal',
    ariaLabel: __lang === 'en'
      ? `Calorie split: ${protG}g protein and ${grasaG}g fat, zero carbs`
      : `Reparto de calorías: ${protG}g proteína y ${grasaG}g grasa, cero carbos`,
  };
  return {
    proteinaGramos: protG,
    grasaGramos: grasaG,
    resumen,
    _insight,
    _chart,
  };
}
