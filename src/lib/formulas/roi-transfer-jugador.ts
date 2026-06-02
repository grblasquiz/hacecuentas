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
  _insight?: any;
  _chart?: any;
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

  const insight = {
    title: roiNeto >= 0 ? 'Operación con plusvalía' : 'Operación con pérdida',
    text: roiNeto >= 0
      ? `Compraste por €${compra}M y vendés por €${venta}M: con el valor en libros amortizado a **€${valorLibros.toFixed(1)}M**, la plusvalía contable es **€${plusvalia.toFixed(1)}M** (clave para el fair-play financiero). Neto de €${comVenta}M en comisiones${solPct > 0 ? ` y +€${solFee.toFixed(1)}M de solidarity` : ''}, el ROI sobre el fichaje es **${roiNeto.toFixed(0)}%**.`
      : `Vendés a €${venta}M por debajo de lo que invertiste (€${compra}M de fichaje${salariosTotales > 0 ? ` + €${salariosTotales.toFixed(1)}M de salarios` : ''}): ROI neto **${roiNeto.toFixed(0)}%**.${plusvalia >= 0 ? ` Igual registrás plusvalía contable de €${plusvalia.toFixed(1)}M porque el valor en libros ya estaba amortizado a €${valorLibros.toFixed(1)}M.` : ` Además se anota minusvalía contable de €${plusvalia.toFixed(1)}M sobre el valor en libros.`}`,
    tone: (roiNeto < 0 ? 'warn' : roiNeto >= 50 ? 'good' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '⚽',
  };

  // Gauge sobre el ROI neto vs compra; sólo si hubo compra (si compra=0, roiNeto no es informativo)
  let chart: any = undefined;
  if (compra > 0) {
    const roiN = Number(roiNeto.toFixed(0));
    chart = {
      type: 'scale' as const,
      marker: roiN,
      markerLabel: 'ROI neto: ' + roiN + '%',
      min: Math.min(-100, Math.floor(roiN)),
      unit: '%',
      segments: [
        { nombre: 'Pérdida', max: 0, color: '#fecaca', colorDark: '#b91c1c' },
        { nombre: 'Moderado', max: 50, color: '#fde68a', colorDark: '#b45309' },
        { nombre: 'Bueno', max: 150, color: '#bbf7d0', colorDark: '#166534' },
        { nombre: 'Excelente', max: Math.max(300, Math.ceil(roiN) + 100), color: '#86efac', colorDark: '#15803d' },
      ],
      ariaLabel: 'Escala de ROI neto del traspaso: pérdida, moderado, bueno, excelente.',
    };
  }

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
    _insight: insight,
    _chart: chart,
  };
}
