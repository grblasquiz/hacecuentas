export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function anguloRefraccionSnell(i: Inputs): Outputs {
  const n1 = Number(i.n1); const t1 = Number(i.theta1); const n2 = Number(i.n2);
  if (!n1 || t1 === undefined || !n2) throw new Error('Completá');
  const sinT2 = n1 * Math.sin(t1 * Math.PI / 180) / n2;
  if (Math.abs(sinT2) > 1) return { theta2: 'Reflexión total', resumen: 'Ángulo de incidencia supera el crítico — reflexión total interna.' };
  const t2 = Math.asin(sinT2) * 180 / Math.PI;
  return { theta2: t2.toFixed(2) + '°', resumen: `θ₂ = ${t2.toFixed(1)}° (rayo se ${n2 > n1 ? 'acerca' : 'aleja'} de la normal).` };
}
