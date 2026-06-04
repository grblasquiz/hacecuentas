export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora de ingesta diaria segura de sodio
 * Fuente: WHO Guideline Sodium Intake for Adults and Children (2012),
 *         American Heart Association (2021),
 *         DASH Diet / NHLBI guidelines.
 *
 * Método: selección del límite diario recomendado según perfil de salud,
 *         comparación con la ingesta declarada y cálculo de equivalente en sal.
 *
 * Salt conversion: 1 g NaCl = 400 mg Na  → sodio_mg = sal_g * 400
 *                  sal_g = sodio_mg / 400  (NaCl es 40% Na en peso)
 *
 * Límites de referencia (mg/día de sodio):
 *   Adulto sano general          : 2300  (FDA / WHO / AHA upper limit)
 *   HTA o cardiovascular         : 1500  (AHA 2021, ACC/AHA 2017)
 *   Enfermedad renal crónica     : 1500  (KDIGO / AHA)
 *   Diabetes (mayor riesgo CV)   : 1500  (ADA 2023)
 *   Embarazo (sin HTA)           : 2000  (WHO; no restringir sin indicación médica)
 *   Embarazo con HTA/preeclampsia: 1500  (ACOG / ISSHP)
 *   Deportista (sudoración intensa): 3000 (ACSM; pérdidas por sudor ~1–2g/h)
 *   Adolescente 14-18 años       : 2300  (DRI / Institute of Medicine)
 *   Niño 9-13 años               : 2200  (DRI)
 *   Niño 4-8 años                : 1500  (DRI)
 *   Adulto mayor >65 años        : 1800  (ESC/ESH; mayor sensibilidad al sodio)
 */

const LIMITES: Record<string, number> = {
  sano:        2300,
  hta:         1500,
  renal:       1500,
  diabetes:    1500,
  embarazo:    2000,
  embarazo_hta: 1500,
  deportista:  3000,
  adolescente: 2300,
  nino_9_13:   2200,
  nino_4_8:    1500,
  mayor65:     1800,
};

const LABELS_ES: Record<string, string> = {
  sano:         'adulto sano',
  hta:          'hipertensión/cardiovascular',
  renal:        'enfermedad renal crónica',
  diabetes:     'diabetes',
  embarazo:     'embarazo (sin HTA)',
  embarazo_hta: 'embarazo con HTA / preeclampsia',
  deportista:   'deportista con sudoración intensa',
  adolescente:  'adolescente (14–18 años)',
  nino_9_13:    'niño/a (9–13 años)',
  nino_4_8:     'niño/a (4–8 años)',
  mayor65:      'adulto mayor de 65 años',
};

const LABELS_EN: Record<string, string> = {
  sano:         'healthy adult',
  hta:          'hypertension / cardiovascular disease',
  renal:        'chronic kidney disease',
  diabetes:     'diabetes',
  embarazo:     'pregnancy (no hypertension)',
  embarazo_hta: 'pregnancy with hypertension / pre-eclampsia',
  deportista:   'athlete with heavy sweating',
  adolescente:  'teenager (14–18 years)',
  nino_9_13:    'child (9–13 years)',
  nino_4_8:     'child (4–8 years)',
  mayor65:      'older adult (over 65)',
};

export function ingestaSodioDiariaMgSalHipertension(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Perfil de salud
  const perfil = (String(i.perfil || 'sano')).trim();
  // Ingesta actual declarada por el usuario (mg/día). Opcional.
  const ingestaActual = Number(i.ingesta_actual) > 0 ? Number(i.ingesta_actual) : null;

  const limiteKey = Object.prototype.hasOwnProperty.call(LIMITES, perfil) ? perfil : 'sano';
  const limiteSodio = LIMITES[limiteKey]; // mg/día
  // Sal equivalente: NaCl = Na / 0.40 → 1 g sal = 400 mg Na
  const limiteSalG = +(limiteSodio / 400).toFixed(2);

  // Resultado primario: límite en mg
  const resultado = limiteSodio;

  // Comparación con ingesta actual
  let diferencia: number | null = null;
  let porcentaje: number | null = null;
  if (ingestaActual !== null) {
    diferencia = ingestaActual - limiteSodio;
    porcentaje = Math.round((ingestaActual / limiteSodio) * 100);
  }

  // Resumen textual
  let resumen: string;
  if (__lang === 'en') {
    const lbl = LABELS_EN[limiteKey] || 'healthy adult';
    if (ingestaActual !== null && diferencia !== null && porcentaje !== null) {
      if (diferencia > 0) {
        resumen = `For a ${lbl}, the safe limit is **${limiteSodio} mg/day** (~${limiteSalG} g of salt). Your current intake of **${ingestaActual} mg** exceeds the limit by **${diferencia} mg** (${porcentaje}% of your limit). Reducing sodium is recommended.`;
      } else if (diferencia < 0) {
        resumen = `For a ${lbl}, the safe limit is **${limiteSodio} mg/day** (~${limiteSalG} g of salt). Your current intake of **${ingestaActual} mg** is within the limit (${porcentaje}% of your limit). Keep it up.`;
      } else {
        resumen = `For a ${lbl}, the safe limit is **${limiteSodio} mg/day** (~${limiteSalG} g of salt). Your current intake exactly meets the limit.`;
      }
    } else {
      resumen = `For a ${lbl}, the recommended daily sodium limit is **${limiteSodio} mg/day**, equivalent to **${limiteSalG} g of table salt**.`;
    }
  } else {
    const lbl = LABELS_ES[limiteKey] || 'adulto sano';
    if (ingestaActual !== null && diferencia !== null && porcentaje !== null) {
      if (diferencia > 0) {
        resumen = `Para ${lbl}, el límite seguro es **${limiteSodio} mg/día** (~${limiteSalG} g de sal). Tu ingesta actual de **${ingestaActual} mg** supera el límite en **${diferencia} mg** (${porcentaje}% de tu tope). Se recomienda reducir el consumo de sodio.`;
      } else if (diferencia < 0) {
        resumen = `Para ${lbl}, el límite seguro es **${limiteSodio} mg/día** (~${limiteSalG} g de sal). Tu ingesta actual de **${ingestaActual} mg** está dentro del límite (${porcentaje}% de tu tope). Bien mantenido.`;
      } else {
        resumen = `Para ${lbl}, el límite seguro es **${limiteSodio} mg/día** (~${limiteSalG} g de sal). Tu ingesta actual coincide exactamente con el límite.`;
      }
    } else {
      resumen = `Para ${lbl}, el límite diario recomendado de sodio es **${limiteSodio} mg/día**, equivalente a **${limiteSalG} g de sal de mesa**.`;
    }
  }

  // Tono e icono del insight según situación
  let tone: string;
  if (ingestaActual !== null && diferencia !== null) {
    tone = diferencia > 300 ? 'warning' : diferencia > 0 ? 'caution' : 'positive';
  } else {
    tone = 'neutral';
  }

  const _insight = {
    title: __lang === 'en' ? 'Your daily sodium limit' : 'Tu límite diario de sodio',
    text: __lang === 'en'
      ? `**${limiteSodio} mg of sodium / day** (~${limiteSalG} g of salt). ${ingestaActual !== null && diferencia !== null ? (diferencia > 0 ? `You are **${diferencia} mg over** the safe limit for your profile.` : `You are **${Math.abs(diferencia)} mg under** the safe limit — within range.`) : 'Enter your actual intake to compare against your limit.'}`
      : `**${limiteSodio} mg de sodio / día** (~${limiteSalG} g de sal). ${ingestaActual !== null && diferencia !== null ? (diferencia > 0 ? `Superás el límite seguro para tu perfil en **${diferencia} mg**.` : `Estás **${Math.abs(diferencia)} mg por debajo** del límite — dentro del rango.`) : 'Ingresá tu consumo actual para compararlo con tu límite.'}`,
    tone,
    icon: '🧂'
  };

  return {
    resultado,
    resumen,
    _insight
  };
}
