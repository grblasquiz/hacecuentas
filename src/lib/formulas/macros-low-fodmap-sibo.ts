/**
 * Low-FODMAP 20/30/50.
 */

export interface MacrosLowFodmapSiboInputs {
  calorias: number;
  __lang?: string;
}

export interface MacrosLowFodmapSiboOutputs {
  proteinaGramos: number;
  grasaGramos: number;
  carbosGramos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function macrosLowFodmapSibo(inputs: MacrosLowFodmapSiboInputs): MacrosLowFodmapSiboOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const cal = Number(inputs.calorias);
  if (!cal || cal <= 0) throw new Error(
    __lang === 'en' ? 'Enter valid calories' : 'Ingresá calorías válidas'
  );
  const prot = (cal * 0.20) / 4;
  const grasa = (cal * 0.30) / 9;
  const carbos = (cal * 0.50) / 4;
  const _insight = {
    title: __lang === 'en' ? 'Your low-FODMAP split' : 'Tu reparto low-FODMAP',
    text: __lang === 'en'
      ? `A balanced 20/30/50: **${carbos.toFixed(0)}g carbs** is your daily target, but on low-FODMAP they must come from **tolerated sources** (rice, oats, ripe banana) — not from onion, garlic, wheat or legumes. Protein sits at ${prot.toFixed(0)}g and fat at ${grasa.toFixed(0)}g.`
      : `Reparto equilibrado 20/30/50: **${carbos.toFixed(0)}g de carbos** es tu meta diaria, pero en low-FODMAP tienen que venir de **fuentes toleradas** (arroz, avena, banana madura), no de cebolla, ajo, trigo ni legumbres. La proteína queda en ${prot.toFixed(0)}g y la grasa en ${grasa.toFixed(0)}g.`,
    tone: 'neutral' as const,
    icon: '🌱',
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
    resumen: __lang === 'en'
      ? `Low-FODMAP ${cal} kcal: ${prot.toFixed(0)}g protein + ${grasa.toFixed(0)}g fat + ${carbos.toFixed(0)}g tolerated carbs.`
      : `Low-FODMAP ${cal} kcal: ${prot.toFixed(0)}g prot + ${grasa.toFixed(0)}g grasa + ${carbos.toFixed(0)}g carbos tolerados.`,
    _insight,
    _chart,
  };
}
