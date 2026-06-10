/**
 * TDEE (Gasto Energético Total Diario) — ecuación de Mifflin-St Jeor.
 *
 * Referencia: Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO.
 * "A new predictive equation for resting energy expenditure in healthy
 * individuals". Am J Clin Nutr. 1990;51(2):241-247. Es la ecuación recomendada
 * por la Academy of Nutrition and Dietetics (precisión ±10% en ~80% de los
 * casos contra calorimetría indirecta).
 *
 *   TMB hombres = 10·peso(kg) + 6,25·altura(cm) − 5·edad(años) + 5
 *   TMB mujeres = 10·peso(kg) + 6,25·altura(cm) − 5·edad(años) − 161
 *   TDEE        = TMB × factor de actividad (1.2 sedentario … 1.9 muy activo)
 *
 * Objetivos derivados (heurística estándar de nutrición deportiva, alineada
 * con el contenido de la calc): bajar ~0,5 kg/sem → TDEE − 500 kcal;
 * subir masa magra → TDEE + 300 kcal.
 *
 * Fórmula DEDICADA a la calc ES (calculadora-tdee-calculadora-mifflin-st-jeor).
 * La calc EN (tdee-mifflin-st-jeor) usa tdee-calculadora-mifflin-st-jeor.ts:
 * NO compartir para no acoplar los outputs de ambos idiomas.
 */

export interface Inputs {
  peso: number | string;      // kg
  altura: number | string;    // cm
  edad: number | string;      // años
  sexo?: string;              // 'hombre' | 'mujer'
  actividad?: number | string; // 1.2 | 1.375 | 1.55 | 1.725 | 1.9
  __lang?: string;
}

export interface Outputs {
  tdee: number;
  tmb: number;
  objetivoBajar: number;
  objetivoSubir: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

const FACTORES_VALIDOS = [1.2, 1.375, 1.55, 1.725, 1.9];

// Guard de defaults: '' / null / undefined NO son 0 (Number('') === 0 pisa
// la validación de campos requeridos vacíos).
function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return NaN;
  return Number(v);
}

export function tdeeMifflinStJeorEs(i: Inputs): Outputs {
  const lang = i.__lang === 'en' ? 'en' : 'es';
  const T = (
    {
      es: {
        errPeso: 'Ingresá un peso válido entre 30 y 300 kg',
        errAltura: 'Ingresá una altura válida entre 100 y 250 cm',
        errEdad: 'Ingresá una edad válida entre 15 y 100 años (la ecuación fue validada en adultos)',
        labels: {
          '1.2': 'sedentario',
          '1.375': 'actividad ligera',
          '1.55': 'actividad moderada',
          '1.725': 'muy activo',
          '1.9': 'extra activo',
        } as Record<string, string>,
        resumen: (tmb: number, factor: number, label: string, tdee: number, bajar: number, subir: number) =>
          `TMB ${tmb.toLocaleString('es-AR')} kcal × ${String(factor).replace('.', ',')} (${label}) = ${tdee.toLocaleString('es-AR')} kcal/día de mantenimiento. Para bajar ~0,5 kg/semana: ${bajar.toLocaleString('es-AR')} kcal/día · para subir masa: ${subir.toLocaleString('es-AR')} kcal/día.`,
        insightTitle: 'Tus calorías diarias',
        insightText: (tdee: number, label: string, tmb: number, bajar: number, subir: number) =>
          `Para mantener tu peso necesitás unas **${tdee.toLocaleString('es-AR')} kcal/día** (${label}). Tu cuerpo quema **${tmb.toLocaleString('es-AR')} kcal** solo en reposo. Para un déficit moderado apuntá a **${bajar.toLocaleString('es-AR')} kcal/día**; para ganar masa, **${subir.toLocaleString('es-AR')} kcal/día**.`,
        insightWarn: (tmb: number) =>
          ` Ojo: ese objetivo queda por debajo de tu TMB (${tmb.toLocaleString('es-AR')} kcal) — no lo sostengas sin supervisión profesional.`,
        chartReposo: 'Reposo (TMB)',
        chartActividad: 'Actividad',
        chartCenter: 'kcal/día',
        chartAria: 'Desglose de las calorías diarias en metabolismo en reposo y actividad, que suman el gasto energético total diario.',
      },
      en: {
        errPeso: 'Enter a valid weight between 30 and 300 kg',
        errAltura: 'Enter a valid height between 100 and 250 cm',
        errEdad: 'Enter a valid age between 15 and 100 years (the equation was validated in adults)',
        labels: {
          '1.2': 'sedentary',
          '1.375': 'lightly active',
          '1.55': 'moderately active',
          '1.725': 'very active',
          '1.9': 'extra active',
        } as Record<string, string>,
        resumen: (tmb: number, factor: number, label: string, tdee: number, bajar: number, subir: number) =>
          `BMR ${tmb.toLocaleString('en-US')} kcal × ${factor} (${label}) = ${tdee.toLocaleString('en-US')} kcal/day maintenance. To lose ~0.5 kg/week: ${bajar.toLocaleString('en-US')} kcal/day · to gain mass: ${subir.toLocaleString('en-US')} kcal/day.`,
        insightTitle: 'Your daily calorie needs',
        insightText: (tdee: number, label: string, tmb: number, bajar: number, subir: number) =>
          `To maintain your weight you need about **${tdee.toLocaleString('en-US')} kcal/day** (${label}). Your body burns **${tmb.toLocaleString('en-US')} kcal** just at rest. For a mild cut aim for **${bajar.toLocaleString('en-US')} kcal/day**; to gain, **${subir.toLocaleString('en-US')} kcal/day**.`,
        insightWarn: (tmb: number) =>
          ` Heads up: that target is below your BMR (${tmb.toLocaleString('en-US')} kcal) — do not sustain it without professional supervision.`,
        chartReposo: 'Resting (BMR)',
        chartActividad: 'Activity',
        chartCenter: 'kcal/day',
        chartAria: 'Breakdown of daily calories into resting metabolism and activity, summing to total daily energy expenditure.',
      },
    } as const
  )[lang];

  const peso = num(i.peso);
  const altura = num(i.altura);
  const edad = num(i.edad);
  const sexo = String(i.sexo || 'hombre').toLowerCase();
  const actividadRaw = num(i.actividad);
  const actividad = FACTORES_VALIDOS.includes(actividadRaw) ? actividadRaw : 1.2;

  if (!Number.isFinite(peso) || peso < 30 || peso > 300) throw new Error(T.errPeso);
  if (!Number.isFinite(altura) || altura < 100 || altura > 250) throw new Error(T.errAltura);
  if (!Number.isFinite(edad) || edad < 15 || edad > 100) throw new Error(T.errEdad);

  // Mifflin-St Jeor (1990)
  const tmbBase = 10 * peso + 6.25 * altura - 5 * edad;
  const tmb = Math.round(sexo === 'mujer' ? tmbBase - 161 : tmbBase + 5);
  const tdee = Math.round((sexo === 'mujer' ? tmbBase - 161 : tmbBase + 5) * actividad);

  const objetivoBajar = Math.max(0, tdee - 500);
  const objetivoSubir = tdee + 300;
  const actividadKcal = Math.max(0, tdee - tmb);
  const label = T.labels[String(actividad)] || `×${actividad}`;

  const resumen = T.resumen(tmb, actividad, label, tdee, objetivoBajar, objetivoSubir);

  let insightText = T.insightText(tdee, label, tmb, objetivoBajar, objetivoSubir);
  const belowBmr = objetivoBajar < tmb;
  if (belowBmr) insightText += T.insightWarn(tmb);

  const _insight = {
    title: T.insightTitle,
    text: insightText,
    tone: belowBmr ? 'warning' : 'neutral',
    icon: '🔥',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.chartReposo, value: tmb },
      { label: T.chartActividad, value: actividadKcal },
    ],
    suffix: ' kcal',
    centerValue: tdee.toLocaleString(lang === 'en' ? 'en-US' : 'es-AR'),
    centerLabel: T.chartCenter,
    ariaLabel: T.chartAria,
  };

  return { tdee, tmb, objetivoBajar, objetivoSubir, resumen, _insight, _chart };
}
