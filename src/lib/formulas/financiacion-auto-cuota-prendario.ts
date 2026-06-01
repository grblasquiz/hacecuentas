/** Calcula la cuota mensual de un crédito prendario automotor (sistema francés) */
export interface Inputs {
  montoFinanciar: number;
  tasaAnual: number;
  plazoMeses: number;
}
export interface Outputs {
  cuotaMensual: number;
  totalAPagar: number;
  totalIntereses: number;
  cft: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function financiacionAutoCuotaPrendario(i: Inputs): Outputs {
  const monto = Number(i.montoFinanciar);
  const tna = Number(i.tasaAnual);
  const plazo = Number(i.plazoMeses);

  if (!monto || monto < 500000) throw new Error('Ingresá el monto a financiar (mínimo $500.000)');
  if (!tna || tna < 1 || tna > 200) throw new Error('La tasa nominal anual debe estar entre 1% y 200%');
  if (!plazo || plazo < 6 || plazo > 84) throw new Error('El plazo debe estar entre 6 y 84 meses');

  const tasaMensual = tna / 12 / 100;

  // Fórmula sistema francés
  const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);

  const totalAPagar = cuotaMensual * plazo;
  const totalIntereses = totalAPagar - monto;
  const cft = totalAPagar / monto;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalAPagar).toLocaleString('es-AR'),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total del crédito prendario: capital financiado vs intereses',
  };

  const interesPctTotal = totalAPagar > 0 ? (totalIntereses / totalAPagar) * 100 : 0;
  const insightTone = totalIntereses >= monto ? 'warn' : (interesPctTotal >= 35 ? 'warn' : 'neutral');
  const insight = {
    title: `Intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')} sobre el préstamo`,
    text: `En ${plazo} meses pagás **$${Math.round(totalAPagar).toLocaleString('es-AR')}** por **$${Math.round(monto).toLocaleString('es-AR')}** financiados: los intereses son **$${Math.round(totalIntereses).toLocaleString('es-AR')}** (**${interesPctTotal.toFixed(0)}%** del total, ${cft.toFixed(2)}× el capital).${totalIntereses >= monto ? ' Pagás más de intereses que de auto: acortá el plazo o subí el anticipo.' : ''}`,
    tone: insightTone,
    icon: '🚗',
  };

  return {
    cuotaMensual: Math.round(cuotaMensual),
    totalAPagar: Math.round(totalAPagar),
    totalIntereses: Math.round(totalIntereses),
    cft: Number(cft.toFixed(2)),
    detalle: `Cuota mensual: $${Math.round(cuotaMensual).toLocaleString('es-AR')} × ${plazo} meses. Total a pagar: $${Math.round(totalAPagar).toLocaleString('es-AR')} (${cft.toFixed(1)}x el monto). Intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')}.`,
    _chart: chart,
    _insight: insight,
  };
}
