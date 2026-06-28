export interface Inputs {
  valor_nominal: number;
  plazo_anos: number;
  tasa_cupon_anual: number;
  frecuencia_pago: 'anual' | 'semestral';
  precio_compra: number;
  incluir_fiscalidad: boolean;
}

export interface FlujoCupon {
  ano: number;
  cupon_bruto: number;
  impuesto_10: number;
  cupon_neto: number;
  flujo_total: number;
}

export interface Outputs {
  cupon_anual_bruto: number;
  total_cupones_brutos: number;
  impuesto_ganancia_ocasional: number;
  total_cupones_netos: number;
  ganancia_descuento_prima: number;
  tir_anual_bruta: number;
  tir_anual_neta: number;
  valor_total_vencimiento: number;
  rentabilidad_total_neta: number;
  detalle_flujos: FlujoCupon[];
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).incluir_fiscalidad = (i as any).incluir_fiscalidad === true || (i as any).incluir_fiscalidad === 'true';
  // Constantes DIAN 2026
  const TASA_IMPUESTO_GANANCIA_OCASIONAL = 0.10; // 10% DIAN Decreto 560/2024
  const VALOR_PAR = 100; // TES se expresan como % del par

  // Validaciones básicas
  if (i.valor_nominal <= 0 || i.tasa_cupon_anual < 0 || i.precio_compra <= 0 || i.plazo_anos <= 0) {
    return {
      cupon_anual_bruto: 0,
      total_cupones_brutos: 0,
      impuesto_ganancia_ocasional: 0,
      total_cupones_netos: 0,
      ganancia_descuento_prima: 0,
      tir_anual_bruta: 0,
      tir_anual_neta: 0,
      valor_total_vencimiento: 0,
      rentabilidad_total_neta: 0,
      detalle_flujos: []
    };
  }

  const VN = i.valor_nominal;
  const plazo = i.plazo_anos;
  const tasaCupon = i.tasa_cupon_anual / 100; // Convertir a decimal
  const precioPorcentaje = i.precio_compra / 100;
  const inversionInicial = VN * precioPorcentaje;

  // Frecuencia de pago
  const periodsPerYear = i.frecuencia_pago === 'anual' ? 1 : 2;
  const totalPeriods = plazo * periodsPerYear;
  const tasaPeriodo = tasaCupon / periodsPerYear;

  // Cupón por período
  const cuponPeriodico = VN * tasaPeriodo;
  const cuponAnualBruto = VN * tasaCupon;

  // Construcción de flujos de caja
  const flujos: FlujoCupon[] = [];
  let totalCuponessBrutos = 0;
  let totalImpuestos = 0;
  let totalCuponesNetos = 0;

  for (let periodo = 1; periodo <= totalPeriods; periodo++) {
    const ano = Math.ceil(periodo / periodsPerYear);
    const cuponBruto = cuponPeriodico;
    const impuesto = i.incluir_fiscalidad ? cuponBruto * TASA_IMPUESTO_GANANCIA_OCASIONAL : 0;
    const cuponNeto = cuponBruto - impuesto;

    let flujoTotal = cuponNeto;
    if (periodo === totalPeriods) {
      flujoTotal += VN; // Retorno del principal al vencimiento
    }

    if (periodo % periodsPerYear === 0 || periodo === totalPeriods) {
      flujos.push({
        ano: ano,
        cupon_bruto: cuponBruto * periodsPerYear,
        impuesto_10: impuesto * periodsPerYear,
        cupon_neto: cuponNeto * periodsPerYear,
        flujo_total: flujoTotal + (periodo > 1 && periodo % periodsPerYear === 0 ? 0 : 0)
      });
    }

    totalCuponessBrutos += cuponBruto;
    totalImpuestos += impuesto;
    totalCuponesNetos += cuponNeto;
  }

  // Reorganizar flujos por año completo
  const flujosPorAno: FlujoCupon[] = [];
  let acumuladorCuponBruto = 0;
  let acumuladorImpuesto = 0;
  let anoActual = 0;

  for (let ano = 1; ano <= plazo; ano++) {
    let cuponAnoBruto = 0;
    let impuestoAno = 0;
    let flujoAno = 0;

    const periodoInicio = (ano - 1) * periodsPerYear + 1;
    const periodoFin = ano * periodsPerYear;

    for (let p = periodoInicio; p <= periodoFin; p++) {
      cuponAnoBruto += cuponPeriodico;
      impuestoAno += i.incluir_fiscalidad ? cuponPeriodico * TASA_IMPUESTO_GANANCIA_OCASIONAL : 0;
      flujoAno += (cuponPeriodico - (i.incluir_fiscalidad ? cuponPeriodico * TASA_IMPUESTO_GANANCIA_OCASIONAL : 0));
    }

    if (ano === plazo) {
      flujoAno += VN; // Principal final
    }

    flujosPorAno.push({
      ano: ano,
      cupon_bruto: cuponAnoBruto,
      impuesto_10: impuestoAno,
      cupon_neto: cuponAnoBruto - impuestoAno,
      flujo_total: flujoAno
    });
  }

  // Totales
  const totalCuponesBrutosFinales = VN * tasaCupon * plazo;
  const totalImpuestosFinales = i.incluir_fiscalidad ? totalCuponesBrutosFinales * TASA_IMPUESTO_GANANCIA_OCASIONAL : 0;
  const totalCuponesNetosFinales = totalCuponesBrutosFinales - totalImpuestosFinales;

  // Ganancia/pérdida por precio
  const gananciaPerdidaPrecio = VN - inversionInicial;

  // Valor total al vencimiento (sin reinversión)
  const valorTotalVencimiento = VN + totalCuponesNetosFinales;

  // Rentabilidad total neta
  const rentabilidadTotalNeta = (valorTotalVencimiento - inversionInicial) / inversionInicial * 100;

  // TIR Bruta (iteración numérica - método Newton-Raphson simplificado)
  const calcularTIR = (cupones: number[], invInit: number, fiscal: boolean): number => {
    let tir = 0.05; // Aproximación inicial 5%
    let vpn = 0;

    for (let i = 0; i < 100; i++) {
      vpn = -invInit;
      let derivada = 0;

      for (let t = 1; t <= cupones.length; t++) {
        const flujo = t === cupones.length ? cupones[t - 1] + VN : cupones[t - 1];
        const factor = Math.pow(1 + tir, -t);
        vpn += flujo * factor;
        derivada -= t * flujo * factor / (1 + tir);
      }

      if (Math.abs(vpn) < 0.01) break;
      tir = tir - vpn / derivada;
      if (tir < -0.5) tir = 0.001; // Evitar divergencia
    }

    return Math.max(tir * 100, 0); // Retornar en porcentaje
  };

  const cuponesParaTIRBruta = flujosPorAno.map(f => f.cupon_bruto);
  const tirBruta = calcularTIR(cuponesParaTIRBruta, inversionInicial, false);

  const cuponesParaTIRNeta = flujosPorAno.map(f => f.cupon_neto);
  const tirNeta = calcularTIR(cuponesParaTIRNeta, inversionInicial, i.incluir_fiscalidad);

  const fmtCop = (n: number) => Math.round(n).toLocaleString('es-CO');
  const tirNetaPct = tirNeta.toFixed(2);
  const rentPct = rentabilidadTotalNeta.toFixed(1);
  const compradoPrima = i.precio_compra > 100; // pagaste sobre el par → prima
  const insTone = rentabilidadTotalNeta <= 0
    ? 'warn'
    : (compradoPrima || tirNeta < 8 ? 'neutral' : 'good');
  const precioNota = compradoPrima
    ? `Lo compraste **sobre el par** (${i.precio_compra}%), así que al vencimiento perdés **$${fmtCop(Math.abs(gananciaPerdidaPrecio))}** por precio.`
    : i.precio_compra < 100
      ? `Lo compraste **con descuento** (${i.precio_compra}%): al par sumás **$${fmtCop(gananciaPerdidaPrecio)}** extra de ganancia por precio.`
      : `Lo compraste a la par (${i.precio_compra}%), sin ganancia ni pérdida por precio.`;

  return {
    cupon_anual_bruto: cuponAnualBruto,
    total_cupones_brutos: totalCuponesBrutosFinales,
    impuesto_ganancia_ocasional: totalImpuestosFinales,
    total_cupones_netos: totalCuponesNetosFinales,
    ganancia_descuento_prima: gananciaPerdidaPrecio,
    tir_anual_bruta: tirBruta,
    tir_anual_neta: tirNeta,
    valor_total_vencimiento: valorTotalVencimiento,
    rentabilidad_total_neta: rentabilidadTotalNeta,
    detalle_flujos: flujosPorAno,
    _insight: {
      title: `TIR neta del ${tirNetaPct}% anual`,
      text: `Manteniendo el TES hasta el vencimiento recibís **$${fmtCop(valorTotalVencimiento)}** (${rentPct}% de rentabilidad total neta sobre tu inversión de $${fmtCop(inversionInicial)}). ${precioNota}${i.incluir_fiscalidad ? ` Ya descontamos el **10% DIAN** sobre los cupones ($${fmtCop(totalImpuestosFinales)}).` : ''}`,
      tone: insTone,
      icon: '🇨🇴',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Capital (valor nominal)', value: Math.round(VN) },
        { label: 'Cupones netos', value: Math.round(totalCuponesNetosFinales) },
      ],
      prefix: '$',
      centerValue: '$' + fmtCop(valorTotalVencimiento),
      centerLabel: 'Total al vencimiento',
      ariaLabel: `Total al vencimiento de $${fmtCop(valorTotalVencimiento)} dividido en $${fmtCop(VN)} de capital y $${fmtCop(totalCuponesNetosFinales)} de cupones netos`,
    },
  };
}
