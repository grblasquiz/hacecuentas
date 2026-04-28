export interface Inputs {
  precio_vehiculo: number;
  km_anuales: number;
  perfil_fiscal: 'particular' | 'autonomo' | 'empresa';
  tipo_irpf: number;
  anios: number;
  cuota_renting_mes: number;
  cuota_leasing_mes: number;
  opcion_compra_leasing: number;
  entrada_compra: number;
  tipo_interes_compra: number;
  seguro_anual_compra: number;
  mantenimiento_anual: number;
  ivtm_anual: number;
  valor_residual_compra: number;
}

export interface Outputs {
  tco_renting: number;
  tco_leasing: number;
  tco_compra: number;
  ahorro_fiscal_renting: number;
  ahorro_fiscal_leasing: number;
  ahorro_fiscal_compra: number;
  mejor_opcion: string;
  diferencia_renting_leasing: number;
  diferencia_renting_compra: number;
  coste_mes_renting: number;
  coste_mes_leasing: number;
  coste_mes_compra: number;
  advertencias: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes fiscales España 2026 ---
  // Fuente: art. 95.Tres LIVA y tablas amortizacion Ley 27/2014 (AEAT)
  const IVA = 0.21; // IVA general vehiculos 21%
  const TASA_AMORTIZACION_TURISMO = 0.16; // Coef. max. tablas AEAT turismos

  // Sanear inputs
  const precioSinIVA = Math.max(0, i.precio_vehiculo);
  const anios = Math.max(1, Math.min(10, Number(i.anios) || 4));
  const meses = anios * 12;
  const tipoMarginal = Math.max(0, Math.min(0.50, (i.tipo_irpf || 0) / 100));
  const cuotaRentingNeto = Math.max(0, i.cuota_renting_mes);
  const cuotaLeasingNeto = Math.max(0, i.cuota_leasing_mes);
  const valorResidualLeasingNeto = Math.max(0, i.opcion_compra_leasing);
  const entrada = Math.max(0, i.entrada_compra);
  const taeAnual = Math.max(0, i.tipo_interes_compra / 100);
  const seguroAnual = Math.max(0, i.seguro_anual_compra);
  const mantAnual = Math.max(0, i.mantenimiento_anual);
  const ivtmAnual = Math.max(0, i.ivtm_anual);
  const valorReventaCompra = Math.max(0, i.valor_residual_compra);

  // --- Porcentajes de deduccion segun perfil fiscal ---
  // Fuente: art. 95.Tres.4a LIVA; consultas vinculantes DGT V1553-20 y similares
  let pctDeduccionIVA = 0;
  let pctAfectacionGasto = 0;
  if (i.perfil_fiscal === 'autonomo') {
    pctDeduccionIVA = 0.50; // presuncion 50% uso mixto turismo
    pctAfectacionGasto = 0.50;
  } else if (i.perfil_fiscal === 'empresa') {
    pctDeduccionIVA = 1.00; // uso exclusivo empresarial (requiere acreditacion)
    pctAfectacionGasto = 1.00;
  }
  // particular: 0% en ambos

  // ==========================================================
  // RENTING
  // ==========================================================
  // Coste bruto: cuota mensual con IVA por el periodo completo
  // En renting la cuota incluye seguro, mantenimiento, ITV, IVTM
  const cuotaRentingConIVA = cuotaRentingNeto * (1 + IVA);
  const costeBrutoRenting = cuotaRentingConIVA * meses;

  // IVA soportado total renting
  const ivaSoportadoRenting = cuotaRentingNeto * IVA * meses;
  const ivaDeducibleRenting = ivaSoportadoRenting * pctDeduccionIVA;

  // Ahorro IRPF/IS: la cuota de renting es gasto deducible al 100% si uso exclusivo
  // o al 50% si uso mixto (autónomo). Para particular = 0.
  // Fuente: art. 30 LIRPF y art. 15 LIS
  const gastoDeducibleRentingBase = cuotaRentingNeto * meses * pctAfectacionGasto;
  const ahorroIRPFRenting = gastoDeducibleRentingBase * tipoMarginal;

  const ahorroFiscalRenting = ivaDeducibleRenting + ahorroIRPFRenting;
  const tcoRenting = Math.max(0, costeBrutoRenting - ahorroFiscalRenting);

  // ==========================================================
  // LEASING
  // ==========================================================
  // Cuotas con IVA durante el período
  const cuotaLeasingConIVA = cuotaLeasingNeto * (1 + IVA);
  const costeCuotasLeasingBruto = cuotaLeasingConIVA * meses;

  // Opción de compra con IVA
  const opcionCompraConIVA = valorResidualLeasingNeto * (1 + IVA);

  // Extras: seguro + mantenimiento + IVTM (no incluidos en leasing)
  const extrasLeasingBruto = (seguroAnual + mantAnual + ivtmAnual) * anios;

  const costeBrutoLeasing = costeCuotasLeasingBruto + opcionCompraConIVA + extrasLeasingBruto;

  // IVA deducible leasing (cuotas + opcion compra)
  const ivaSoportadoLeasing = (cuotaLeasingNeto * meses + valorResidualLeasingNeto) * IVA;
  const ivaDeducibleLeasing = ivaSoportadoLeasing * pctDeduccionIVA;

  // Gasto deducible IRPF/IS leasing:
  // La carga financiera de las cuotas es deducible. Aqui aproximamos
  // el total de cuotas netas como gasto (conservador: incluye capital + intereses).
  // Una liquidacion exacta requeriria el cuadro de amortizacion del leasing.
  // Fuente: art. 106 LIS (leasing financiero) y RIRPF actividades economicas
  const gastoDeducibleLeasingBase = cuotaLeasingNeto * meses * pctAfectacionGasto;
  const ahorroIRPFLeasing = gastoDeducibleLeasingBase * tipoMarginal;

  const ahorroFiscalLeasing = ivaDeducibleLeasing + ahorroIRPFLeasing;

  // Al final del leasing tienes el vehiculo (opcion compra ejercida)
  // Valor residual recuperado en la reventa al final del periodo
  const tcoLeasing = Math.max(0, costeBrutoLeasing - ahorroFiscalLeasing - valorReventaCompra);

  // ==========================================================
  // COMPRA CON FINANCIACION
  // ==========================================================
  const precioConIVA = precioSinIVA * (1 + IVA);
  const importeFinanciado = Math.max(0, precioConIVA - entrada);

  // Cuota mensual prestamo (formula francesa amortizacion constante)
  // Fuente: calculo estandar credito al consumo
  let totalPrestamo = 0;
  let cuotaMensualPrestamo = 0;
  if (importeFinanciado > 0 && taeAnual > 0) {
    const r = taeAnual / 12;
    const n = meses;
    cuotaMensualPrestamo = importeFinanciado * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    totalPrestamo = cuotaMensualPrestamo * n + entrada;
  } else if (importeFinanciado > 0) {
    // Sin intereses: devuelves exactamente lo financiado
    cuotaMensualPrestamo = importeFinanciado / meses;
    totalPrestamo = precioConIVA;
  } else {
    // Pago al contado total
    totalPrestamo = precioConIVA;
  }

  // Extras compra: seguro + mantenimiento + IVTM
  const extrasCompraBruto = (seguroAnual + mantAnual + ivtmAnual) * anios;

  const costeBrutoCompra = totalPrestamo + extrasCompraBruto;

  // IVA deducible compra (solo en el momento de adquisicion, una vez)
  const ivaDeducibleCompra = precioSinIVA * IVA * pctDeduccionIVA;

  // Amortizacion deducible IRPF/IS: coef. max. 16%/año (AEAT tablas LIS)
  // Solo sobre precio de adquisicion sin IVA, y segun pct afectacion
  // Fuente: tablas oficiales amortizacion Ley 27/2014, Anexo
  const baseAmortizacion = precioSinIVA * pctAfectacionGasto;
  const amortizacionAnual = baseAmortizacion * TASA_AMORTIZACION_TURISMO;
  const totalAmortizacionDeducible = amortizacionAnual * anios;
  const ahorroIRPFCompra = totalAmortizacionDeducible * tipoMarginal;

  const ahorroFiscalCompra = ivaDeducibleCompra + ahorroIRPFCompra;

  // TCO compra: costes brutos - ahorro fiscal - valor reventa
  const tcoCompra = Math.max(0, costeBrutoCompra - ahorroFiscalCompra - valorReventaCompra);

  // ==========================================================
  // COSTES MENSUALES NETOS
  // ==========================================================
  const costeMesRenting = tcoRenting / meses;
  const costeMesLeasing = tcoLeasing / meses;
  const costeMesCompra = tcoCompra / meses;

  // ==========================================================
  // MEJOR OPCION
  // ==========================================================
  const tcos: { nombre: string; valor: number }[] = [
    { nombre: 'Renting', valor: tcoRenting },
    { nombre: 'Leasing', valor: tcoLeasing },
    { nombre: 'Compra', valor: tcoCompra },
  ];
  tcos.sort((a, b) => a.valor - b.valor);
  const mejorOpcion = tcos[0].nombre;
  const mejorTCO = tcos[0].valor;
  const segundoTCO = tcos[1].valor;
  const diferenciaConSegundo = segundoTCO - mejorTCO;

  const mejorOpcionTexto = `${mejorOpcion} (${mejorTCO.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} € TCO neto), ${diferenciaConSegundo.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} € más barato que la segunda opción (${tcos[1].nombre}).`;

  // ==========================================================
  // DIFERENCIAS
  // ==========================================================
  const diferenciaRentingLeasing = tcoRenting - tcoLeasing;
  const diferenciaRentingCompra = tcoRenting - tcoCompra;

  // ==========================================================
  // ADVERTENCIAS
  // ==========================================================
  const avisos: string[] = [];

  if (i.km_anuales > 30000) {
    avisos.push('Con más de 30.000 km/año el renting puede aplicar penalizaciones por exceso de kilometraje (0,05-0,15 €/km extra) no incluidas en este cálculo.');
  }
  if (i.perfil_fiscal === 'empresa' && pctDeduccionIVA === 1.0) {
    avisos.push('La deducción del 100% del IVA en vehículos de empresa requiere acreditar uso exclusivo empresarial ante la AEAT. Para turismos de uso mixto se aplica el 50%.');
  }
  if (valorReventaCompra > precioConIVA * 0.7) {
    avisos.push('El valor de reventa indicado parece elevado (>70% del precio de compra). Revisa el dato: un turismo pierde habitualmente entre el 40% y el 60% en 4 años.');
  }
  if (entrada > precioConIVA) {
    avisos.push('La entrada supera el precio total del vehículo con IVA. Revisa los importes.');
  }
  if (taeAnual > 0.12) {
    avisos.push('El tipo de interés introducido supera el 12% TAE. Verifica el dato o considera alternativas de financiación.');
  }
  if (i.perfil_fiscal === 'particular' && ahorroFiscalRenting === 0) {
    avisos.push('Como particular no puedes deducir IVA ni gastos del vehículo. El TCO que ves es el coste real sin ningún beneficio fiscal.');
  }

  const advertenciasTexto = avisos.length > 0 ? avisos.join(' | ') : 'Sin advertencias para los datos introducidos.';

  return {
    tco_renting: Math.round(tcoRenting * 100) / 100,
    tco_leasing: Math.round(tcoLeasing * 100) / 100,
    tco_compra: Math.round(tcoCompra * 100) / 100,
    ahorro_fiscal_renting: Math.round(ahorroFiscalRenting * 100) / 100,
    ahorro_fiscal_leasing: Math.round(ahorroFiscalLeasing * 100) / 100,
    ahorro_fiscal_compra: Math.round(ahorroFiscalCompra * 100) / 100,
    mejor_opcion: mejorOpcionTexto,
    diferencia_renting_leasing: Math.round(diferenciaRentingLeasing * 100) / 100,
    diferencia_renting_compra: Math.round(diferenciaRentingCompra * 100) / 100,
    coste_mes_renting: Math.round(costeMesRenting * 100) / 100,
    coste_mes_leasing: Math.round(costeMesLeasing * 100) / 100,
    coste_mes_compra: Math.round(costeMesCompra * 100) / 100,
    advertencias: advertenciasTexto,
  };
}
