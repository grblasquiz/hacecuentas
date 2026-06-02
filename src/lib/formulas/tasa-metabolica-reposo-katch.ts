/** TMR Katch-McArdle */
export interface Inputs { peso: number; grasaCorporal: number; actividad: string; }
export interface Outputs { tmr: number; tdee: number; masaMagra: number; masaGrasa: number; mensaje: string; _insight?: any; _chart?: any; }

export function tasaMetabolicaReposoKatch(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const bf = Number(i.grasaCorporal);
  const actividad = String(i.actividad || 'moderado');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (bf < 0 || bf > 60) throw new Error('Ingresá un % de grasa válido');

  const masaGrasa = Number((peso * bf / 100).toFixed(1));
  const masaMagra = Number((peso - masaGrasa).toFixed(1));

  // Katch-McArdle: BMR = 370 + (21.6 × LBM in kg)
  const tmr = Math.round(370 + 21.6 * masaMagra);

  const factores: Record<string, number> = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 };
  const tdee = Math.round(tmr * (factores[actividad] || 1.55));

  const _insight = {
    title: 'Tu metabolismo y composición',
    text: `Tu masa magra de **${masaMagra} kg** marca un TMR de **${tmr} kcal/día**; con tu nivel de actividad gastás unas **${tdee} kcal/día**. Comer en ese número mantiene tu peso, restar genera déficit y sumar, superávit.`,
    tone: 'neutral',
    icon: '🔥',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Masa magra', value: masaMagra },
      { label: 'Masa grasa', value: masaGrasa },
    ],
    prefix: '',
    centerValue: `${peso} kg`,
    centerLabel: 'Peso total',
    ariaLabel: `Composición corporal: ${masaMagra} kg de masa magra y ${masaGrasa} kg de masa grasa.`,
  };

  return {
    tmr, tdee, masaMagra, masaGrasa,
    mensaje: `TMR (Katch-McArdle): ${tmr} kcal/día. TDEE: ${tdee} kcal/día. Masa magra: ${masaMagra} kg, grasa: ${masaGrasa} kg.`,
    _insight, _chart,
  };
}