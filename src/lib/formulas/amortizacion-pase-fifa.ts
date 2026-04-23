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

  return {
    amortizacionAnual: Math.round(amortizacionAnual),
    amortizacionMensual: Math.round(amortizacionMensual),
    amortizacionAcumulada: Math.round(amortizacionAcumulada),
    valorLibroActual: Math.round(valorLibro),
    aniosRestantes: Number(aniosRestantes.toFixed(2)),
    mensaje: `Amortización lineal: €${Math.round(amortizacionAnual).toLocaleString('es-AR')}/año. Valor en libros: €${Math.round(valorLibro).toLocaleString('es-AR')}.`,
  };
}
