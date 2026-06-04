export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/**
 * Daily Steps Calculator — evidence-based
 *
 * Sources:
 *  - Paluch et al. (2022) The Lancet Public Health: meta-analysis of 15 cohorts (n=47,471).
 *    Risk of all-cause mortality levels off at 6,000–8,000 steps/day for adults ≥60,
 *    and at 8,000–10,000 steps/day for adults <60.
 *  - WHO Guidelines on Physical Activity and Sedentary Behaviour (2020):
 *    150–300 min/week moderate-intensity ≈ 7,000–8,600 steps/day for adults.
 *  - Physical Activity Guidelines for Americans, 2nd ed. (HHS 2018).
 *  - Tudor-Locke & Bassett (2004) classification (sedentary/low active/somewhat active/active/very active).
 */
export function pasosDiariosRecomendadosCaminarSalud(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const pasosActuales = Math.round(Number(i.pasosActuales) || 0);
  const grupoEdad = String(i.grupoEdad || 'adulto');

  // Evidence-based targets per age group (Paluch 2022 + WHO 2020 + HHS 2018)
  const targets: Record<string, { min: number; optimo: number; label_es: string; label_en: string }> = {
    nino:    { min: 6000,  optimo: 10000, label_es: 'Niño/Adolescente (6–17)', label_en: 'Child/Adolescent (6–17)' },
    adulto:  { min: 7000,  optimo: 8000,  label_es: 'Adulto (18–59)',          label_en: 'Adult (18–59)' },
    mayor60: { min: 6000,  optimo: 7000,  label_es: 'Adulto mayor (60–79)',    label_en: 'Older adult (60–79)' },
    mayor80: { min: 4000,  optimo: 5500,  label_es: 'Adulto mayor (≥ 80)',     label_en: 'Older adult (≥ 80)' },
  };

  const target = targets[grupoEdad] ?? targets['adulto'];
  const metaOptima = target.optimo;
  const metaMinima = target.min;

  // Activity level classification (Tudor-Locke & Bassett 2004, adapted)
  // Sedentary <5000 / Low active 5000–7499 / Somewhat active 7500–9999 / Active 10000–12499 / Very active ≥12500
  // Adjusted thresholds per age group
  let nivel_es: string;
  let nivel_en: string;
  let tono: string;

  if (pasosActuales < 5000) {
    nivel_es = 'Sedentario';
    nivel_en = 'Sedentary';
    tono = 'negative';
  } else if (pasosActuales < metaMinima) {
    nivel_es = 'Bajo activo';
    nivel_en = 'Low active';
    tono = 'warning';
  } else if (pasosActuales < metaOptima) {
    nivel_es = 'Algo activo';
    nivel_en = 'Somewhat active';
    tono = 'neutral';
  } else if (pasosActuales < metaOptima * 1.25) {
    nivel_es = 'Activo';
    nivel_en = 'Active';
    tono = 'positive';
  } else {
    nivel_es = 'Muy activo';
    nivel_en = 'Very active';
    tono = 'positive';
  }

  // Gap to minimum healthy target
  const diferencia = metaMinima - pasosActuales; // negative = surplus
  const diferenciaAOptimo = metaOptima - pasosActuales;

  // Walking time equivalents: ~100 steps/min at moderate pace (3 METs)
  const minutosFaltantes = diferencia > 0 ? Math.round(diferencia / 100) : 0;
  const minutosFaltantesOptimo = diferenciaAOptimo > 0 ? Math.round(diferenciaAOptimo / 100) : 0;

  // % completion toward optimal target
  const porcentaje = metaOptima > 0 ? Math.min(Math.round((pasosActuales / metaOptima) * 100), 150) : 0;

  // Risk reduction estimate: ~8.5% per 1,000 steps up to ~7,500 steps (Paluch 2022)
  const beneficioPorMilPasos = 8.5;
  const pasosBeneficio = Math.min(pasosActuales, 7500);
  const reduccionRiesgo = Math.round((pasosBeneficio / 1000) * beneficioPorMilPasos);

  const nivel = __lang === 'en' ? nivel_en : nivel_es;
  const grupoLabel = __lang === 'en' ? target.label_en : target.label_es;

  let resumen: string;
  let insightTitle: string;
  let insightText: string;

  if (__lang === 'en') {
    const gapMsg = diferencia > 0
      ? `You need **${diferencia.toLocaleString('en')} more steps** (~${minutosFaltantes} min of walking) to reach the minimum healthy target of ${metaMinima.toLocaleString('en')} steps.`
      : `You have already exceeded the minimum healthy target of ${metaMinima.toLocaleString('en')} steps. ${diferenciaAOptimo > 0 ? `Add ${diferenciaAOptimo.toLocaleString('en')} more steps (~${minutosFaltantesOptimo} min) to reach the optimal ${metaOptima.toLocaleString('en')}.` : `You have reached or exceeded the optimal target of ${metaOptima.toLocaleString('en')} steps.`}`;

    resumen = `Level: ${nivel} | Group: ${grupoLabel} | Goal: ${metaOptima.toLocaleString('en')} steps/day | Progress: ${porcentaje}%. ${gapMsg}`;
    insightTitle = `${nivel} — ${porcentaje}% of goal`;
    insightText = `With **${pasosActuales.toLocaleString('en')} steps/day**, you are **${nivel.toLowerCase()}**. ${gapMsg} At this activity level, your estimated all-cause mortality risk reduction is approximately **${reduccionRiesgo}%** compared to a sedentary lifestyle (Paluch et al., Lancet Public Health, 2022).`;
  } else {
    const gapMsg = diferencia > 0
      ? `Necesitás **${diferencia.toLocaleString('es-AR')} pasos más** (~${minutosFaltantes} min de caminata) para alcanzar la meta mínima saludable de ${metaMinima.toLocaleString('es-AR')} pasos.`
      : `Ya superaste la meta mínima de ${metaMinima.toLocaleString('es-AR')} pasos. ${diferenciaAOptimo > 0 ? `Sumá ${diferenciaAOptimo.toLocaleString('es-AR')} pasos más (~${minutosFaltantesOptimo} min) para llegar al óptimo de ${metaOptima.toLocaleString('es-AR')}.` : `Alcanzaste o superaste la meta óptima de ${metaOptima.toLocaleString('es-AR')} pasos.`}`;

    resumen = `Nivel: ${nivel} | Grupo: ${grupoLabel} | Meta: ${metaOptima.toLocaleString('es-AR')} pasos/día | Progreso: ${porcentaje}%. ${gapMsg}`;
    insightTitle = `${nivel} — ${porcentaje}% de la meta`;
    insightText = `Con **${pasosActuales.toLocaleString('es-AR')} pasos/día**, tu nivel es **${nivel.toLowerCase()}**. ${gapMsg} Con tu nivel actual de actividad, la reducción estimada de riesgo de mortalidad por todas las causas es de aproximadamente **${reduccionRiesgo}%** frente a un estilo de vida sedentario (Paluch et al., Lancet Public Health, 2022).`;
  }

  const resultado = `${nivel} (${porcentaje}%)`;

  const _insight = {
    title: insightTitle,
    text: insightText,
    tone: tono,
    icon: '🚶',
  };

  // Gauge chart: 0–150% of optimal target
  const _chart = {
    type: 'gauge',
    value: Math.min(porcentaje, 150),
    min: 0,
    max: 150,
    label: __lang === 'en' ? `${porcentaje}% of goal` : `${porcentaje}% de la meta`,
    zones: __lang === 'en'
      ? [
          { upTo: 33,  color: '#ef4444', label: 'Sedentary' },
          { upTo: 65,  color: '#f97316', label: 'Low active' },
          { upTo: 90,  color: '#eab308', label: 'Somewhat active' },
          { upTo: 110, color: '#22c55e', label: 'Active' },
          { upTo: 150, color: '#10b981', label: 'Very active' },
        ]
      : [
          { upTo: 33,  color: '#ef4444', label: 'Sedentario' },
          { upTo: 65,  color: '#f97316', label: 'Bajo activo' },
          { upTo: 90,  color: '#eab308', label: 'Algo activo' },
          { upTo: 110, color: '#22c55e', label: 'Activo' },
          { upTo: 150, color: '#10b981', label: 'Muy activo' },
        ],
  };

  return { resultado, resumen, _insight, _chart };
}
