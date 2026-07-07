export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function anguloRefraccionSnell(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorIncomplete: 'Completá',
      totalReflectionTheta: 'Reflexión total',
      totalReflectionResumen: 'Ángulo de incidencia supera el crítico — reflexión total interna.',
      directionTowards: 'acerca',
      directionAway: 'aleja',
      insightTitleRefr: 'Cómo se desvía el rayo',
      insightTitleTIR: 'Reflexión total interna',
      insightDenser: 'más denso',
      insightLessDense: 'menos denso',
      insightTIRText: 'Con incidencia de **{t1}°** y el rayo pasando a un medio menos denso (n₁ **{n1}** → n₂ **{n2}**), se supera el ángulo crítico: la luz **no atraviesa** y se refleja por completo. Es el principio detrás de la fibra óptica.',
    },
    en: {
      errorIncomplete: 'Fill in all fields',
      totalReflectionTheta: 'Total reflection',
      totalReflectionResumen: 'Angle of incidence exceeds the critical angle — total internal reflection.',
      directionTowards: 'bends toward',
      directionAway: 'bends away from',
      insightTitleRefr: 'How the ray bends',
      insightTitleTIR: 'Total internal reflection',
      insightDenser: 'denser',
      insightLessDense: 'less dense',
      insightTIRText: 'With a **{t1}°** angle of incidence and the ray passing into a less dense medium (n₁ **{n1}** → n₂ **{n2}**), it exceeds the critical angle: light **does not pass through** and reflects entirely. This is the principle behind optical fiber.',
    },
  } as const)[__lang];
  const n1 = Number(i.n1); const t1 = Number(i.theta1); const n2 = Number(i.n2);
  if (!n1 || t1 === undefined || !n2) throw new Error(T.errorIncomplete);
  const sinT2 = n1 * Math.sin(t1 * Math.PI / 180) / n2;
  if (Math.abs(sinT2) > 1) return {
    theta2: T.totalReflectionTheta,
    resumen: T.totalReflectionResumen,
    _insight: {
      title: T.insightTitleTIR,
      text: T.insightTIRText.replace('{t1}', String(t1)).replace('{n1}', String(n1)).replace('{n2}', String(n2)),
      tone: 'warn',
      icon: '🔦',
    },
  };
  const t2 = Math.asin(sinT2) * 180 / Math.PI;
  const direction = n2 > n1 ? T.directionTowards : T.directionAway;
  const resumen = __lang === 'en'
    ? `θ₂ = ${t2.toFixed(1)}° (ray ${direction} the normal).`
    : `θ₂ = ${t2.toFixed(1)}° (rayo se ${direction} de la normal).`;
  const medioDensidad = n2 > n1 ? T.insightDenser : T.insightLessDense;
  const insightText = __lang === 'en'
    ? `A ray hitting the surface at **${t1}°** refracts to **${t2.toFixed(1)}°**. Going from n₁ **${n1}** to a **${medioDensidad}** medium (n₂ **${n2}**), it **${direction}** the normal.`
    : `Un rayo que incide a **${t1}°** se refracta a **${t2.toFixed(1)}°**. Al pasar de n₁ **${n1}** a un medio **${medioDensidad}** (n₂ **${n2}**), se **${direction}** de la normal.`;
  return {
    theta2: t2.toFixed(2) + '°',
    resumen,
    _insight: {
      title: T.insightTitleRefr,
      text: insightText,
      tone: 'neutral',
      icon: '🔦',
    },
  };
}
