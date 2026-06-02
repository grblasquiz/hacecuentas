/** Índice Tobillo-Brazo */
export interface Inputs { presionTobillo: number; presionBrazo: number; }
export interface Outputs { itb: number; clasificacion: string; recomendacion: string; mensaje: string; _chart?: any; _insight?: any; }

export function indiceTobilloBrazo(i: Inputs): Outputs {
  const tobillo = Number(i.presionTobillo);
  const brazo = Number(i.presionBrazo);
  if (!tobillo || !brazo) throw new Error('Ingresá ambas presiones');
  if (brazo <= 0) throw new Error('Presión del brazo inválida');

  const itb = Number((tobillo / brazo).toFixed(2));

  let clasificacion: string;
  let recomendacion: string;
  if (itb > 1.3) {
    clasificacion = '⚠️ Arterias calcificadas (no compresibles)';
    recomendacion = 'Resultado no confiable por calcificación arterial. Consultar especialista vascular para estudio con otros métodos.';
  } else if (itb >= 1.0) {
    clasificacion = '🟢 Normal';
    recomendacion = 'Circulación arterial periférica normal. Control de rutina según factores de riesgo.';
  } else if (itb >= 0.91) {
    clasificacion = '🟡 Limítrofe';
    recomendacion = 'Valor limítrofe. Repetir en 6-12 meses. Controlar factores de riesgo cardiovascular.';
  } else if (itb >= 0.71) {
    clasificacion = '🟠 EAP leve';
    recomendacion = 'Enfermedad arterial periférica leve. Consultar médico. Ejercicio supervisado y control de factores de riesgo.';
  } else if (itb >= 0.41) {
    clasificacion = '🔴 EAP moderada';
    recomendacion = 'EAP moderada. Derivación a cirugía vascular. Riesgo significativo de eventos cardiovasculares.';
  } else {
    clasificacion = '🔴 EAP severa / isquemia crítica';
    recomendacion = 'Isquemia crítica. Derivación urgente a cirugía vascular. Riesgo de amputación.';
  }

  const topSeg = Math.max(1.4, Math.ceil(itb * 10) / 10 + 0.1);
  const chart = {
    type: 'scale' as const,
    marker: itb,
    markerLabel: 'Tu ITB: ' + itb,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'EAP severa', max: 0.40, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'EAP moderada', max: 0.70, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'EAP leve', max: 0.90, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Limítrofe', max: 0.99, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 1.30, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Calcificado', max: topSeg, color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala del índice tobillo-brazo (ITB): de enfermedad arterial periférica severa a calcificación arterial.',
  };

  const clasifLimpia = clasificacion.replace(/[🟢🟡🟠🔴⚠️]/g, '').trim();
  const insightTone = itb >= 1.0 && itb <= 1.3 ? 'good' : (itb >= 0.91 && itb < 1.0) ? 'neutral' : 'warn';
  const insight = {
    title: itb >= 1.0 && itb <= 1.3 ? 'Circulación periférica normal' : `Resultado: ${clasifLimpia.toLowerCase()}`,
    text: itb >= 1.0 && itb <= 1.3
      ? `Un ITB de **${itb}** indica flujo arterial periférico normal (rango 1,00–1,30). Sin signos de enfermedad arterial periférica; control de rutina según factores de riesgo.`
      : itb > 1.3
      ? `Un ITB de **${itb}** sugiere arterias calcificadas (no compresibles): el valor no es confiable y conviene un estudio vascular con otro método.`
      : itb >= 0.91
      ? `Un ITB de **${itb}** queda en zona limítrofe (0,91–0,99): conviene repetir en 6–12 meses y controlar los factores de riesgo cardiovascular.`
      : `Un ITB de **${itb}** es compatible con **${clasifLimpia.toLowerCase()}**. ${recomendacion}`,
    tone: insightTone,
    icon: itb >= 1.0 && itb <= 1.3 ? '🦵' : (itb >= 0.91 && itb < 1.0) ? '🩺' : '⚠️',
  };
  return { itb, clasificacion, recomendacion, mensaje: `ITB: ${itb}. ${clasificacion}.`, _chart: chart, _insight: insight };
}