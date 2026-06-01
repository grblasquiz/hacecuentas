export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function anguloRefraccionSnell(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorIncomplete: 'Completá',
      totalReflectionTheta: 'Reflexión total',
      totalReflectionResumen: 'Ángulo de incidencia supera el crítico — reflexión total interna.',
      directionTowards: 'acerca',
      directionAway: 'aleja',
    },
    en: {
      errorIncomplete: 'Fill in all fields',
      totalReflectionTheta: 'Total reflection',
      totalReflectionResumen: 'Angle of incidence exceeds the critical angle — total internal reflection.',
      directionTowards: 'bends toward',
      directionAway: 'bends away from',
    },
  } as const)[__lang];
  const n1 = Number(i.n1); const t1 = Number(i.theta1); const n2 = Number(i.n2);
  if (!n1 || t1 === undefined || !n2) throw new Error(T.errorIncomplete);
  const sinT2 = n1 * Math.sin(t1 * Math.PI / 180) / n2;
  if (Math.abs(sinT2) > 1) return { theta2: T.totalReflectionTheta, resumen: T.totalReflectionResumen };
  const t2 = Math.asin(sinT2) * 180 / Math.PI;
  const direction = n2 > n1 ? T.directionTowards : T.directionAway;
  const resumen = __lang === 'en'
    ? `θ₂ = ${t2.toFixed(1)}° (ray ${direction} the normal).`
    : `θ₂ = ${t2.toFixed(1)}° (rayo se ${direction} de la normal).`;
  return { theta2: t2.toFixed(2) + '°', resumen };
}
