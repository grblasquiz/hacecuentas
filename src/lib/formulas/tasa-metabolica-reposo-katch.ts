/** TMR Katch-McArdle */
export interface Inputs { peso: number; grasaCorporal: number; actividad: string; }
export interface Outputs { tmr: number; tdee: number; masaMagra: number; masaGrasa: number; mensaje: string; }

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

  return {
    tmr, tdee, masaMagra, masaGrasa,
    mensaje: `TMR (Katch-McArdle): ${tmr} kcal/día. TDEE: ${tdee} kcal/día. Masa magra: ${masaMagra} kg, grasa: ${masaGrasa} kg.`
  };
}