/** MRR, ARR y crecimiento */
export interface Inputs {
  mrrInicial: number;
  mrrNuevo: number;
  mrrExpansion?: number;
  mrrContraccion?: number;
  mrrChurn?: number;
}
export interface Outputs {
  mrrFinal: number;
  mrrNeto: number;
  arr: number;
  crecimiento: number;
  netNewMrr: number;
  quickRatio: number;
  _insight?: any;
  _chart?: any;
}

export function mrr(i: Inputs): Outputs {
  const inicial = Number(i.mrrInicial) || 0;
  const nuevo = Number(i.mrrNuevo) || 0;
  const exp = Number(i.mrrExpansion) || 0;
  const contr = Number(i.mrrContraccion) || 0;
  const ch = Number(i.mrrChurn) || 0;

  const netNew = nuevo + exp - contr - ch;
  const final = inicial + netNew;
  const arr = final * 12;
  const crecimiento = inicial > 0 ? (netNew / inicial) * 100 : 0;

  // Quick Ratio = (New + Expansion) / (Contraction + Churn)
  const perdidas = contr + ch;
  const quick = perdidas > 0 ? (nuevo + exp) / perdidas : (nuevo + exp) > 0 ? 99 : 0;

  const fmtArs = (n: number) => '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n));
  const qr = Number(quick.toFixed(2));
  const crec = Number(crecimiento.toFixed(2));

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightTitle: string;
  let insightText: string;
  if (netNew < 0) {
    insightTone = 'warn';
    insightTitle = 'MRR en contracción';
    insightText = `Perdés más de lo que sumás: el Net New MRR es **${fmtArs(netNew)}** y el MRR cae a **${fmtArs(final)}** (${crec}%). La churn + contracción superan a lo nuevo + expansión; frenar la fuga es prioridad antes que crecer.`;
  } else if (qr >= 4) {
    insightTone = 'good';
    insightTitle = 'Crecimiento eficiente';
    insightText = `Tu Quick Ratio es **${qr}**: por cada $1 que perdés sumás $${qr.toFixed(1)} (nivel best-in-class para SaaS, >4). El MRR crece a **${fmtArs(final)}** (+${crec}%) y proyecta un ARR de **${fmtArs(arr)}**.`;
  } else if (qr >= 2) {
    insightTone = 'good';
    insightTitle = 'Crecimiento saludable';
    insightText = `Con un Quick Ratio de **${qr}** sumás más de $2 por cada $1 que perdés, el rango sano para SaaS. El MRR sube a **${fmtArs(final)}** (+${crec}%) y el ARR proyectado es **${fmtArs(arr)}**.`;
  } else {
    insightTone = 'warn';
    insightTitle = 'Crecimiento poco eficiente';
    insightText = `Tu Quick Ratio es **${qr}** (debajo de 2): crecés, pero la churn + contracción se comen buena parte de lo nuevo. El MRR queda en **${fmtArs(final)}** (+${crec}%); mejorar retención multiplica el crecimiento neto.`;
  }

  // Quick Ratio en zonas SaaS; el marker se acota para que la escala sea legible (99 = sin pérdidas)
  const qrMarker = Math.min(qr, 5);

  return {
    mrrFinal: Math.round(final),
    mrrNeto: Math.round(netNew),
    arr: Math.round(arr),
    crecimiento: crec,
    netNewMrr: Math.round(netNew),
    quickRatio: qr,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone: insightTone,
      icon: '📈',
    },
    _chart: {
      type: 'scale',
      marker: qrMarker,
      markerLabel: qr >= 99 ? 'Quick Ratio alto (sin pérdidas)' : `Quick Ratio ${qr}`,
      min: 0,
      segments: [
        { nombre: 'Contrae', max: 1, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Ineficiente', max: 2, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Saludable', max: 4, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Best-in-class', max: 6, color: '#0d9488', colorDark: '#2dd4bf' },
      ],
      ariaLabel: `Quick Ratio de ${qr} en la escala de eficiencia de crecimiento SaaS`,
    },
  };
}
