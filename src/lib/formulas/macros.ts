/** Distribución de macros a partir de calorías objetivo */
export interface Inputs {
  calorias: number;
  objetivo?: 'balanceado' | 'lowcarb' | 'highprotein' | 'keto' | string;
  peso?: number;
}
export interface Outputs {
  proteinaGramos: number;
  carbohidratosGramos: number;
  grasasGramos: number;
  proteinaKcal: number;
  carbohidratosKcal: number;
  grasasKcal: number;
  distribucion: string;
  _insight?: any;
  _chart?: any;
}

export function macros(i: Inputs): Outputs {
  const kcal = Number(i.calorias);
  const obj = String(i.objetivo || 'balanceado');
  if (!kcal || kcal <= 0) throw new Error('Ingresá las calorías diarias');

  let pctP = 0, pctC = 0, pctG = 0;
  if (obj === 'balanceado') { pctP = 0.25; pctC = 0.45; pctG = 0.30; }
  else if (obj === 'lowcarb') { pctP = 0.30; pctC = 0.25; pctG = 0.45; }
  else if (obj === 'highprotein') { pctP = 0.35; pctC = 0.40; pctG = 0.25; }
  else if (obj === 'keto') { pctP = 0.25; pctC = 0.05; pctG = 0.70; }
  else { pctP = 0.25; pctC = 0.45; pctG = 0.30; }

  const kcalP = kcal * pctP;
  const kcalC = kcal * pctC;
  const kcalG = kcal * pctG;

  // 1g proteína = 4 kcal; 1g carbo = 4 kcal; 1g grasa = 9 kcal
  const gP = kcalP / 4;
  const gC = kcalC / 4;
  const gG = kcalG / 9;

  const gPr = Math.round(gP);
  const gCr = Math.round(gC);
  const gGr = Math.round(gG);
  const kPr = Math.round(kcalP);
  const kCr = Math.round(kcalC);
  const kGr = Math.round(kcalG);
  const kcalFmt = kcal.toLocaleString('es-AR');

  let insight: any;
  if (obj === 'keto') {
    insight = {
      title: 'Reparto cetogénico',
      text: `Keto al extremo: las grasas dominan con **${gGr}g (70%)** y los carbos caen a **${gCr}g (5%)**, con **${gPr}g de proteína**, sobre tus ${kcalFmt} kcal. Carbos tan bajos buscan inducir cetosis.`,
      tone: 'warn',
      icon: '🥑',
    };
  } else if (obj === 'lowcarb') {
    insight = {
      title: 'Reparto low-carb',
      text: `Carbos reducidos a **${gCr}g (25%)**, con grasa alta (**${gGr}g**) y **${gPr}g de proteína** sobre tus ${kcalFmt} kcal.`,
      tone: 'neutral',
      icon: '🥗',
    };
  } else if (obj === 'highprotein') {
    insight = {
      title: 'Reparto alto en proteína',
      text: `La proteína sube a **${gPr}g (35%)** —ideal para preservar o ganar músculo—, con **${gCr}g de carbos** y **${gGr}g de grasa** sobre tus ${kcalFmt} kcal.`,
      tone: 'good',
      icon: '🥩',
    };
  } else {
    insight = {
      title: 'Reparto balanceado',
      text: `Distribución equilibrada de tus ${kcalFmt} kcal: **${gPr}g de proteína, ${gCr}g de carbos y ${gGr}g de grasa** (25/45/30).`,
      tone: 'neutral',
      icon: '🍽️',
    };
  }

  return {
    proteinaGramos: gPr,
    carbohidratosGramos: gCr,
    grasasGramos: gGr,
    proteinaKcal: kPr,
    carbohidratosKcal: kCr,
    grasasKcal: kGr,
    distribucion: `${Math.round(pctP * 100)}% P / ${Math.round(pctC * 100)}% C / ${Math.round(pctG * 100)}% G`,
    _insight: insight,
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Proteína', value: kPr },
        { label: 'Carbos', value: kCr },
        { label: 'Grasa', value: kGr },
      ],
      centerValue: `${kcalFmt} kcal`,
      centerLabel: 'Total diario',
      ariaLabel: `Reparto de calorías: ${kPr} kcal proteína, ${kCr} kcal carbos, ${kGr} kcal grasa`,
    },
  };
}
