/** Amortización contable del pase de un jugador — IFRS / UEFA FFP */
export interface Inputs {
  transferFeeEur: number;
  aniosContrato: number;
  valorResidualEur?: number;
  mesesTranscurridos?: number;
}
export interface Outputs {
  amortizacionAnual: number;
  amortizacionMensual: number;
  amortizacionAcumulada: number;
  valorLibroActual: number;
  aniosRestantes: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function amortizacionPaseFifa(i: Inputs): Outputs {
  const transfer = Math.max(0, Number(i.transferFeeEur) || 0);
  const anios = Math.max(1, Math.min(8, Number(i.aniosContrato) || 1));
  const residual = Math.max(0, Number(i.valorResidualEur) || 0);
  const meses = Math.max(0, Math.min(anios * 12, Number(i.mesesTranscurridos) || 0));

  const baseAmortizable = transfer - residual;
  const amortizacionAnual = baseAmortizable / anios;
  const amortizacionMensual = amortizacionAnual / 12;
  const amortizacionAcumulada = amortizacionMensual * meses;
  const valorLibro = transfer - amortizacionAcumulada;
  const mesesRestantes = anios * 12 - meses;
  const aniosRestantes = mesesRestantes / 12;

  const rLibro = Math.round(valorLibro);
  const rAcum = Math.round(amortizacionAcumulada);
  const pctAmort = transfer > 0 ? (amortizacionAcumulada / transfer) * 100 : 0;
  return {
    amortizacionAnual: Math.round(amortizacionAnual),
    amortizacionMensual: Math.round(amortizacionMensual),
    amortizacionAcumulada: rAcum,
    valorLibroActual: rLibro,
    aniosRestantes: Number(aniosRestantes.toFixed(2)),
    mensaje: `Amortización lineal: €${Math.round(amortizacionAnual).toLocaleString('es-AR')}/año. Valor en libros: €${Math.round(valorLibro).toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Cómo impacta el pase en el balance',
      text: `El club amortiza **€${Math.round(amortizacionAnual).toLocaleString('es-AR')} por año** del pase de €${transfer.toLocaleString('es-AR')} a lo largo de ${anios} año(s). Hoy ya descontó **€${rAcum.toLocaleString('es-AR')}** (${pctAmort.toFixed(0)}%) y el valor en libros es de **€${rLibro.toLocaleString('es-AR')}**, con ${aniosRestantes.toFixed(2)} año(s) de contrato restantes.${pctAmort >= 70 ? ' Con el pase casi amortizado, una venta ahora generaría plusvalía contable casi total.' : ''}`,
      tone: 'neutral',
      icon: '⚽',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Valor en libros', value: rLibro },
        { label: 'Amortización acumulada', value: rAcum },
      ],
      prefix: '€',
      centerValue: '€' + (rLibro + rAcum).toLocaleString('es-AR'),
      centerLabel: 'Costo del pase',
      ariaLabel: `Pase de €${(rLibro + rAcum).toLocaleString('es-AR')}: €${rLibro.toLocaleString('es-AR')} de valor en libros restante y €${rAcum.toLocaleString('es-AR')} ya amortizados.`,
    },
  };
}
