/** ROI de compra-venta de jugador considerando amortización contable */
export interface Inputs {
  precioCompraMEUR: number;
  duracionContratoAnos: number; // años del contrato original (para amortizar)
  anosTranscurridos: number; // años jugados en el club antes de venta
  precioVentaMEUR: number;
  comisionesVentaMEUR: number; // agentes, premios firma, etc.
  costosSalarialesAnualMEUR: number; // salario anual jugador
  solidarityFeeRecibidaPct: number; // si el club ahora recibe 5% solidarity (si vendió siendo el "último club formador")
}

export interface Outputs {
  amortizacionAcumulada: number;
  valorLibrosActual: number; // book value al momento de vender
  plusvaliaContable: number; // ganancia fiscal (venta - valor libros)
  ingresosBrutos: number;
  costosTotales: number;
  roiContablePct: number;
  roiNetoPct: number; // considerando salarios totales pagados
  solidarityFeeMEUR: number;
  moneda: string;
  resumen: string;
}

export function roiTransferJugador(i: Inputs): Outputs {
  const compra = Math.max(0, Number(i.precioCompraMEUR) || 0);
  const duracion = Math.max(1, Number(i.duracionContratoAnos) || 5);
  const transc = Math.max(0, Math.min(duracion, Number(i.anosTranscurridos) || 0));
  const venta = Math.max(0, Number(i.precioVentaMEUR) || 0);
  const comVenta = Math.max(0, Number(i.comisionesVentaMEUR) || 0);
  const salAnual = Math.max(0, Number(i.costosSalarialesAnualMEUR) || 0);
  const solPct = Math.max(0, Number(i.solidarityFeeRecibidaPct) || 0);

  const amortAnual = compra / duracion;
  const amortAcum = amortAnual * transc;
  const valorLibros = Math.max(0, compra - amortAcum);
  const plusvalia = venta - valorLibros;

  const solFee = venta * (solPct / 100);
  const ingresosBrutos = venta - comVenta + solFee;
  const salariosTotales = salAnual * transc;
  const costosTotales = compra + salariosTotales + comVenta;

  const roiContable = valorLibros > 0 ? (plusvalia / valorLibros) * 100 : 9999;
  const roiNeto = compra > 0 ? ((ingresosBrutos - compra) / compra) * 100 : 0;

  return {
    amortizacionAcumulada: Number(amortAcum.toFixed(2)),
    valorLibrosActual: Number(valorLibros.toFixed(2)),
    plusvaliaContable: Number(plusvalia.toFixed(2)),
    ingresosBrutos: Number(ingresosBrutos.toFixed(2)),
    costosTotales: Number(costosTotales.toFixed(2)),
    roiContablePct: Number(roiContable.toFixed(1)),
    roiNetoPct: Number(roiNeto.toFixed(1)),
    solidarityFeeMEUR: Number(solFee.toFixed(2)),
    moneda: 'EUR',
    resumen: `Compra €${compra}M → venta €${venta}M. Valor libros €${valorLibros.toFixed(1)}M → plusvalía contable **€${plusvalia.toFixed(1)}M** (ROI contable ${roiContable.toFixed(0)}%). ROI neto vs compra: **${roiNeto.toFixed(0)}%**.`,
  };
}
