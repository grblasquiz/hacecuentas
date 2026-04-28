export interface Inputs {
  precio_vivienda: number;
  cuota_inicial_porcentaje: number;
  tasa_hipoteca_uvr_anual: number;
  gastos_compra_porcentaje: number;
  administracion_mensual: number;
  predial_anual_porcentaje: number;
  canon_arriendo_mensual: number;
  ipc_anual_porcentaje: number;
  revalorizacion_inmueble_anual: number;
  rentabilidad_inversion_cuota_inicial: number;
  anos_horizonte: number;
}

export interface Outputs {
  cuota_inicial: number;
  monto_hipoteca: number;
  cuota_mensual_hipoteca: number;
  gastos_compra_total: number;
  coste_compra_10_anos: number;
  coste_arriendo_10_anos: number;
  diferencia_neta: number;
  opcion_mas_economica: string;
  ahorro_10_anos: number;
  valor_vivienda_10_anos: number;
  valor_cuota_inicial_invertida: number;
  deuda_pendiente_10_anos: number;
  patrimonio_neto_compra: number;
  breakeven_year: string;
  resumen_analisis: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes y cálculos iniciales
  const precioVivienda = i.precio_vivienda;
  const cuotaInicialPct = i.cuota_inicial_porcentaje / 100;
  const tasaUVRAnual = i.tasa_hipoteca_uvr_anual / 100;
  const gastoCompraPct = i.gastos_compra_porcentaje / 100;
  const adminMensual = i.administracion_mensual;
  const predialAnualPct = i.predial_anual_porcentaje / 100;
  const canonArriendoMensual = i.canon_arriendo_mensual;
  const ipcAnualPct = i.ipc_anual_porcentaje / 100;
  const revalPct = i.revalorizacion_inmueble_anual / 100;
  const rentabilidadPct = i.rentabilidad_inversion_cuota_inicial / 100;
  const anosHorizonte = Math.floor(i.anos_horizonte);
  const mesesHorizonte = anosHorizonte * 12;
  const plazHipotecaMeses = 20 * 12; // 240 meses, 20 años

  // ESCENARIO COMPRA
  const cuotaInicial = precioVivienda * cuotaInicialPct;
  const montoHipoteca = precioVivienda - cuotaInicial;
  const gastoCompraTotal = precioVivienda * gastoCompraPct;

  // Cuota mensual hipoteca: fórmula sistema amortización francés
  // C = M * [r(1+r)^n] / [(1+r)^n - 1]
  // donde r = tasa mensual, n = plazo meses, M = monto
  const tasaMensual = tasaUVRAnual / 12;
  const factor = Math.pow(1 + tasaMensual, plazHipotecaMeses);
  const cuotaMensualHipoteca = montoHipoteca * (tasaMensual * factor) / (factor - 1);

  // Cálculo deuda pendiente año 10
  // Usamos fórmula de saldo: S = M * [(1+r)^n - (1+r)^p] / [(1+r)^n - 1]
  // donde p = pagos realizados (120 para 10 años)
  const pagoRealizados = mesesHorizonte;
  const factorPagos = Math.pow(1 + tasaMensual, pagoRealizados);
  const deudaPendiente = montoHipoteca * (factor - factorPagos) / (factor - 1);

  // Pagos hipoteca 10 años
  const pagoHipotecaTotal = cuotaMensualHipoteca * mesesHorizonte;

  // Administración 10 años
  const adminTotal = adminMensual * mesesHorizonte;

  // Predial 10 años (ajustado por IPC anual)
  let predialTotal = 0;
  const predialAnoBase = precioVivienda * predialAnualPct;
  for (let ano = 0; ano < anosHorizonte; ano++) {
    const predialAno = predialAnoBase * Math.pow(1 + ipcAnualPct, ano);
    predialTotal += predialAno;
  }

  // Coste total compra
  const costeTotalCompra = cuotaInicial + gastoCompraTotal + pagoHipotecaTotal + adminTotal + predialTotal;

  // Valor vivienda año 10 (revalorización)
  const valorVivienda10Anos = precioVivienda * Math.pow(1 + revalPct, anosHorizonte);

  // Patrimonio neto compra
  const patrimonioNetoCompra = valorVivienda10Anos - deudaPendiente;

  // Coste neto compra (gastos menos patrimonio ganado)
  const costeNetoCompra = costeTotalCompra - patrimonioNetoCompra;

  // ESCENARIO ARRIENDO
  let costoTotalArriendo = 0;
  for (let mes = 0; mes < mesesHorizonte; mes++) {
    const anoActual = Math.floor(mes / 12);
    const canonAjustado = canonArriendoMensual * Math.pow(1 + ipcAnualPct, anoActual);
    costoTotalArriendo += canonAjustado;
  }

  // Cuota inicial invertida durante 10 años
  const valorCuotaInicialInvertida = cuotaInicial * Math.pow(1 + rentabilidadPct, anosHorizonte);

  // Coste neto arriendo (incluye cuota inicial invertida que no se recupera en vivienda)
  const costeNetoArriendo = costoTotalArriendo + cuotaInicial; // cuota inicial se suma como "pérdida"

  // Comparación
  const diferencia = costeNetoCompra - costeNetoArriendo; // positivo = compra más cara, negativo = compra más barata
  const opcionMasEconomica = diferencia >= 0 ? "Arriendo" : "Compra";
  const ahorroConOpcion = Math.abs(diferencia);

  // Cálculo breakeven year
  let breakeven = "N/A";
  let costoCompraAcumulado = cuotaInicial + gastoCompraTotal; // primeros gastos
  let costoArriendoAcumulado = 0;
  for (let ano = 1; ano <= anosHorizonte; ano++) {
    // Suma de cuota hipoteca + admin + predial ese año
    for (let mes = (ano - 1) * 12; mes < ano * 12; mes++) {
      costoCompraAcumulado += cuotaMensualHipoteca;
      costoCompraAcumulado += adminMensual;
    }
    const predialAno = predialAnoBase * Math.pow(1 + ipcAnualPct, ano - 1);
    costoCompraAcumulado += predialAno;

    // Suma canon arriendo ese año
    for (let mes = (ano - 1) * 12; mes < ano * 12; mes++) {
      const canonAjustado = canonArriendoMensual * Math.pow(1 + ipcAnualPct, ano - 1);
      costoArriendoAcumulado += canonAjustado;
    }

    // Patrimonio acumulado compra
    const valorViviendaAno = precioVivienda * Math.pow(1 + revalPct, ano);
    const deudaPendienteAno = montoHipoteca * Math.pow(1 + tasaMensual, 12 * (20 - ano)) / 
                              (Math.pow(1 + tasaMensual, plazHipotecaMeses) - 1) * 
                              (Math.pow(1 + tasaMensual, plazHipotecaMeses) - Math.pow(1 + tasaMensual, 12 * ano));
    const patrimonioAno = Math.max(0, valorViviendaAno - deudaPendienteAno);
    const costeNetoCompraAno = costoCompraAcumulado - patrimonioAno;
    const costeNetoArriendoAno = costoArriendoAcumulado + cuotaInicial;

    if (costeNetoCompraAno <= costeNetoArriendoAno && breakeven === "N/A") {
      breakeven = `Año ${ano}`;
    }
  }

  // Resumen análisis
  let resumenAnalisis = "";
  if (diferencia >= 0) {
    resumenAnalisis = `A ${anosHorizonte} años, **ARRENDAR es más económico** que comprar en esta vivienda. ` +
                      `Ahorras aproximadamente $${Math.round(ahorroConOpcion).toLocaleString('es-CO')} COP eligiendo arriendo. ` +
                      `Sin embargo, al final compra tienes patrimonio de $${Math.round(patrimonioNetoCompra).toLocaleString('es-CO')} COP; ` +
                      `arriendo no genera activo. Considera horizonte temporal > 10 años si planeas quedarte.`;
  } else {
    resumenAnalisis = `A ${anosHorizonte} años, **COMPRAR es más económico** que arrendar. ` +
                      `Ahorras aproximadamente $${Math.round(ahorroConOpcion).toLocaleString('es-CO')} COP eligiendo compra. ` +
                      `Además, construyes patrimonio de $${Math.round(patrimonioNetoCompra).toLocaleString('es-CO')} COP. ` +
                      `Breakeven ocurre en ${breakeven}, después del cual compra es cada vez más ventajosa.`;
  }

  return {
    cuota_inicial: Math.round(cuotaInicial),
    monto_hipoteca: Math.round(montoHipoteca),
    cuota_mensual_hipoteca: Math.round(cuotaMensualHipoteca),
    gastos_compra_total: Math.round(gastoCompraTotal),
    coste_compra_10_anos: Math.round(costeTotalCompra),
    coste_arriendo_10_anos: Math.round(costoTotalArriendo),
    diferencia_neta: Math.round(diferencia),
    opcion_mas_economica: opcionMasEconomica,
    ahorro_10_anos: Math.round(ahorroConOpcion),
    valor_vivienda_10_anos: Math.round(valorVivienda10Anos),
    valor_cuota_inicial_invertida: Math.round(valorCuotaInicialInvertida),
    deuda_pendiente_10_anos: Math.round(deudaPendiente),
    patrimonio_neto_compra: Math.round(patrimonioNetoCompra),
    breakeven_year: breakeven,
    resumen_analisis: resumenAnalisis
  };
}
