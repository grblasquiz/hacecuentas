/** LTV suscripcion SaaS */
export interface Inputs { arpu: number; grossMargin: number; churnMensual: number; cac: number; }
export interface Outputs { ltv: number; ltvCacRatio: number; mesesVida: number; paybackMeses: number; evaluacion: string; _insight?: any; _chart?: any; }
export function ltvLifetimeValueSuscripcion(i: Inputs): Outputs {
  const arpu = Number(i.arpu);
  const gm = Number(i.grossMargin) / 100;
  const churn = Number(i.churnMensual) / 100;
  const cac = Number(i.cac);
  if (arpu <= 0) throw new Error('ARPU inválido');
  if (churn <= 0) throw new Error('Churn debe ser >0');
  const ltv = (arpu * gm) / churn;
  const ratio = cac > 0 ? ltv / cac : 0;
  const vida = 1 / churn;
  const payback = (arpu * gm) > 0 ? cac / (arpu * gm) : 0;
  let evaluacion = 'bueno';
  if (ratio < 1) evaluacion = 'crítico - no rentable';
  else if (ratio < 3) evaluacion = 'bajo - revisar CAC o churn';
  else if (ratio > 5) evaluacion = 'excelente';
  const ratioR = Number(ratio.toFixed(2));
  let insightTone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insightText = '';
  if (cac <= 0) {
    insightTone = 'neutral';
    insightText = `Cada cliente vale **$${Math.round(ltv).toLocaleString('es-AR')}** de margen a lo largo de su vida (≈ **${vida.toFixed(1)} meses**). Cargá tu CAC para ver si la unidad económica cierra.`;
  } else if (ratioR < 1) {
    insightTone = 'warn';
    insightText = `Gastás **$${Math.round(cac).toLocaleString('es-AR')}** para captar un cliente que sólo deja **$${Math.round(ltv).toLocaleString('es-AR')}**: ratio **${ratioR}×**, perdés plata en cada alta. Bajá el CAC o reducí el churn ya.`;
  } else if (ratioR < 3) {
    insightTone = 'warn';
    insightText = `Ratio LTV/CAC de **${ratioR}×** y payback de **${payback.toFixed(1)} meses**: por debajo del 3× sano de SaaS. El negocio crece pero deja poco margen para reinvertir.`;
  } else if (ratioR > 5) {
    insightTone = 'good';
    insightText = `Ratio LTV/CAC de **${ratioR}×**: cada peso de adquisición devuelve más de 5. Recuperás el CAC en **${payback.toFixed(1)} meses** — probablemente puedas pisar el acelerador en marketing.`;
  } else {
    insightTone = 'good';
    insightText = `Ratio LTV/CAC de **${ratioR}×**, dentro del rango saludable (3–5×). Recuperás el costo de adquisición en **${payback.toFixed(1)} meses**.`;
  }

  const out: Outputs = {
    ltv: Math.round(ltv),
    ltvCacRatio: ratioR,
    mesesVida: Number(vida.toFixed(1)),
    paybackMeses: Number(payback.toFixed(1)),
    evaluacion,
    _insight: {
      title: 'Lectura de tu unidad económica',
      text: insightText,
      tone: insightTone,
      icon: '📊',
    },
  };

  if (cac > 0) {
    out._chart = {
      type: 'scale',
      marker: ratioR,
      markerLabel: `${ratioR}× LTV/CAC`,
      min: 0,
      segments: [
        { nombre: 'No rentable', max: 1, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Bajo', max: 3, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Saludable', max: 5, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Excelente', max: Math.max(7, Math.ceil(ratioR) + 1), color: '#10b981', colorDark: '#059669' },
      ],
      ariaLabel: `Ratio LTV/CAC de ${ratioR}, ubicado en la zona ${evaluacion}.`,
    };
  }

  return out;
}
