/**
 * Calculadora de calorías diarias (TDEE)
 * BMR (Mifflin-St Jeor):
 *   - Hombres: 10*peso + 6.25*altura - 5*edad + 5
 *   - Mujeres: 10*peso + 6.25*altura - 5*edad - 161
 * TDEE = BMR × factor_actividad
 */

export interface TDEEInputs {
  peso: number; // kg
  altura: number; // cm
  edad: number; // años
  sexo: string; // masculino | femenino
  actividad: string; // sedentario | ligero | moderado | intenso | muy_intenso
  __lang?: string;
}

export interface TDEEOutputs {
  bmr: number;
  tdee: number;
  mantenimiento: number;
  paraBajarPeso: number;
  paraSubirPeso: number;
  nivelActividad: string;
}

const factoresActividad: Record<string, { factor: number; labelEs: string; labelEn: string }> = {
  sedentario: { factor: 1.2, labelEs: 'Sedentario (poco o ningún ejercicio)', labelEn: 'Sedentary (little or no exercise)' },
  ligero: { factor: 1.375, labelEs: 'Ligero (1-3 días/semana)', labelEn: 'Light (1-3 days/week)' },
  moderado: { factor: 1.55, labelEs: 'Moderado (3-5 días/semana)', labelEn: 'Moderate (3-5 days/week)' },
  intenso: { factor: 1.725, labelEs: 'Intenso (6-7 días/semana)', labelEn: 'Intense (6-7 days/week)' },
  muy_intenso: { factor: 1.9, labelEs: 'Muy intenso (2x/día o trabajo físico)', labelEn: 'Very intense (2x/day or physical job)' },
};

export function caloriasTDEE(inputs: TDEEInputs): TDEEOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const peso = Number(inputs.peso);
  const altura = Number(inputs.altura);
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'masculino';
  const actividad = inputs.actividad || 'moderado';

  if (!peso || peso <= 0) throw new Error(__lang === 'en' ? 'Enter your weight' : 'Ingresá tu peso');
  if (!altura || altura <= 0) throw new Error(__lang === 'en' ? 'Enter your height' : 'Ingresá tu altura');
  if (!edad || edad <= 0) throw new Error(__lang === 'en' ? 'Enter your age' : 'Ingresá tu edad');

  let bmr: number;
  if (sexo === 'femenino') {
    bmr = 10 * peso + 6.25 * altura - 5 * edad - 161;
  } else {
    bmr = 10 * peso + 6.25 * altura - 5 * edad + 5;
  }

  const factor = factoresActividad[actividad] || factoresActividad.moderado;
  const tdee = bmr * factor.factor;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    mantenimiento: Math.round(tdee),
    paraBajarPeso: Math.round(tdee - 500), // déficit ~0.5 kg/semana
    paraSubirPeso: Math.round(tdee + 500), // superávit ~0.5 kg/semana
    nivelActividad: __lang === 'en' ? factor.labelEn : factor.labelEs,
  };
}
