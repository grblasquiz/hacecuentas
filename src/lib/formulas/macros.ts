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

  return {
    proteinaGramos: Math.round(gP),
    carbohidratosGramos: Math.round(gC),
    grasasGramos: Math.round(gG),
    proteinaKcal: Math.round(kcalP),
    carbohidratosKcal: Math.round(kcalC),
    grasasKcal: Math.round(kcalG),
    distribucion: `${Math.round(pctP * 100)}% P / ${Math.round(pctC * 100)}% C / ${Math.round(pctG * 100)}% G`,
  };
}
