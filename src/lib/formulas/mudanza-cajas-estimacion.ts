export interface Inputs { m2Vivienda: number; ambientes: number; nivelLlenado?: string; }
export interface Outputs { cajasTotal: number; cajasGrandes: number; cajasMedianas: number; cajasChicas: number; }
const FACTOR: Record<string, number> = { poco: 0.6, medio: 1, mucho: 1.5 };
export function mudanzaCajasEstimacion(i: Inputs): Outputs {
  const m2 = Number(i.m2Vivienda); const amb = Number(i.ambientes);
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m²');
  const nivel = String(i.nivelLlenado || 'medio');
  const factor = FACTOR[nivel] || 1;
  const base = (m2 * 0.5 + amb * 5) * factor;
  const total = Math.round(base);
  const grandes = Math.round(total * 0.25);
  const medianas = Math.round(total * 0.45);
  const chicas = total - grandes - medianas;
  return { cajasTotal: total, cajasGrandes: grandes, cajasMedianas: medianas, cajasChicas: chicas };
}