import type { CalcInput, CalcResult } from '../types';

// TDEE via the Mifflin-St Jeor equation.
//   BMR = 10·weight(kg) + 6.25·height(cm) − 5·age(y) + s
//     s = +5 for males, −161 for females
//   TDEE = BMR × activity factor (1.2 sedentary … 1.9 very active)
// Field ids kept in Spanish to match the shared schema/reference calc.
export function compute(input: CalcInput): CalcResult {
  const peso = Number(input.peso) || 0;          // weight, kg
  const altura = Number(input.altura) || 0;      // height, cm
  const edad = Number(input.edad) || 0;          // age, years
  const sexo = String(input.sexo || 'hombre');   // 'hombre' | 'mujer'
  const actividad = Number(input.actividad) || 1.2;

  const bmrBase = 10 * peso + 6.25 * altura - 5 * edad;
  const bmr = sexo === 'hombre' ? bmrBase + 5 : bmrBase - 161;
  const tdee = Math.round(bmr * actividad);

  const activityLabels: Record<string, string> = {
    '1.2': 'Sedentary',
    '1.375': 'Lightly active',
    '1.55': 'Moderately active',
    '1.725': 'Very active',
    '1.9': 'Extra active',
  };

  return {
    result: tdee,
    resultLabel: 'TDEE (kcal/day)',
    formula: `BMR (Mifflin-St Jeor) × ${actividad} activity factor`,
    breakdown: [
      { label: 'BMR (resting calories)', value: `${Math.round(bmr)} kcal/day` },
      { label: 'Activity level', value: activityLabels[String(actividad)] || `×${actividad}` },
      { label: 'TDEE (maintenance)', value: `${tdee} kcal/day` },
      { label: 'Mild weight loss (−0.5 kg/wk)', value: `${Math.max(0, tdee - 500)} kcal/day` },
      { label: 'Mild weight gain (+0.5 kg/wk)', value: `${tdee + 500} kcal/day` },
    ],
  };
}
