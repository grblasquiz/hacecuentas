export interface Inputs { m2Vivienda: number; ambientes: number; nivelLlenado?: string; }
export interface Outputs { cajasTotal: number; cajasGrandes: number; cajasMedianas: number; cajasChicas: number; _chart?: any; _insight?: any; }
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
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Grandes', value: grandes },
      { label: 'Medianas', value: medianas },
      { label: 'Chicas', value: chicas },
    ],
    prefix: '',
    centerValue: String(total),
    centerLabel: 'Cajas',
    ariaLabel: 'Composición de cajas: grandes, medianas y chicas',
  };
  const nivelTxt: Record<string, string> = { poco: 'pocas cosas', medio: 'una carga media', mucho: 'mucha carga' };
  const insight = {
    title: 'Tu estimación de cajas',
    text: `Para **${m2} m²** con **${amb} ambiente${amb === 1 ? '' : 's'}** y ${nivelTxt[nivel] || 'una carga media'}, vas a necesitar unas **${total} cajas**: **${grandes}** grandes, **${medianas}** medianas y **${chicas}** chicas. Sumá un 10-15% extra por imprevistos.`,
    tone: 'neutral' as const,
    icon: '📦',
  };
  return { cajasTotal: total, cajasGrandes: grandes, cajasMedianas: medianas, cajasChicas: chicas, _chart: chart, _insight: insight };
}