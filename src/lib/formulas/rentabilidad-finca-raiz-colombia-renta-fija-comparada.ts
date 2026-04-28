export interface Inputs {
  precio_propiedad: number;
  porcentaje_financiacion: number;
  tasa_hipotecaria_anual: number;
  canon_mensual: number;
  tasa_valorizacion_anual: number;
  gastos_operacionales_anual: number;
  tasa_renta_fija: number;
  capital_disponible: number;
  horizonte_años: number;
  marginal_tributario: number;
}

export interface Outputs {
  cuota_hipotecaria_mensual: number;
  yield_anual_finca_raiz: number;
  roi_10_años_finca_raiz: number;
  valor_propiedad_10_años: number;
  flujo_neto_acumulado_finca: number;
  roi_10_años_renta_fija: number;
  valor_final_renta_fija: number;
  flujo_neto_acumulado_rf: number;
  diferencia_roi: number;
  ventaja_absoluta: number;
  recomendacion: string;
  impuesto_venta_estimado: number;
  liquidez_score: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026
  const EXENCION_GANANCIA_CAPITAL_COP = 90000000; // Exención ganancia capital DIAN
  const ALICUOTA_GANANCIA_CAPITAL = 0.10; // 10% para personas naturales
  const LIMITE_DEDUCCION_INTERES_HIPOTECARIO = 3000000; // COP anuales
  const COMISION_VENTA_INMUEBLE = 0.04; // 4% comisión inmobiliaria típica
  const MARGEN_NOTARIAL_VENTA = 0.01; // 1% gastos notariales
  const MARGEN_IMPUESTO_PREDIAL = 0.006; // Incluido en gastos operacionales
  
  // Derivadas de input
  const capital_propio = i.capital_disponible;
  const capital_financiado = i.precio_propiedad * (i.porcentaje_financiacion / 100);
  const tasa_hipotecaria_mensual = i.tasa_hipotecaria_anual / 12 / 100;
  const meses_hipoteca = i.horizonte_años * 12;
  const canon_anual = i.canon_mensual * 12;
  
  // === RAMA FINCA RAÍZ ===
  
  // 1. Cuota hipotecaria mensual (sistema francés)
  let cuota_hipotecaria_mensual = 0;
  if (capital_financiado > 0 && tasa_hipotecaria_mensual > 0) {
    const numerador = tasa_hipotecaria_mensual * Math.pow(1 + tasa_hipotecaria_mensual, meses_hipoteca);
    const denominador = Math.pow(1 + tasa_hipotecaria_mensual, meses_hipoteca) - 1;
    cuota_hipotecaria_mensual = capital_financiado * (numerador / denominador);
  } else if (capital_financiado > 0) {
    cuota_hipotecaria_mensual = capital_financiado / meses_hipoteca;
  }
  
  // 2. Proyección finca raíz año a año
  let valor_propiedad = i.precio_propiedad;
  let deuda_hipotecaria = capital_financiado;
  let flujo_neto_acumulado_finca = 0;
  let interes_acumulado_hipoteca = 0;
  
  const flujos_finca = [];
  
  for (let año = 1; año <= i.horizonte_años; año++) {
    // Valorización propiedad
    valor_propiedad *= (1 + i.tasa_valorizacion_anual / 100);
    
    // Flujo anual bruto
    const canon_anual_año = canon_anual;
    const gastos_anuales = i.gastos_operacionales_anual;
    
    // Interés y amortización año (aproximación: 12 meses × cuota - amortización progresiva)
    let interes_año = 0;
    let amortizacion_año = 0;
    if (deuda_hipotecaria > 0) {
      for (let mes = 0; mes < 12; mes++) {
        const interes_mes = deuda_hipotecaria * tasa_hipotecaria_mensual;
        const amortizacion_mes = cuota_hipotecaria_mensual - interes_mes;
        interes_año += interes_mes;
        amortizacion_año += amortizacion_mes;
        deuda_hipotecaria -= amortizacion_mes;
      }
      interes_acumulado_hipoteca += interes_año;
    } else {
      interes_año = 0;
      amortizacion_año = 0;
    }
    
    // Deducibilidad interés (máximo límite DIAN)
    const interes_deducible = Math.min(interes_año, LIMITE_DEDUCCION_INTERES_HIPOTECARIO);
    
    // Rentas imponibles después deducción
    const rentas_imponibles = Math.max(0, canon_anual_año - gastos_anuales - interes_deducible);
    const impuesto_rentas = rentas_imponibles * (i.marginal_tributario / 100);
    
    // Cuota hipotecaria anual (12 meses)
    const cuota_anual = cuota_hipotecaria_mensual * 12;
    
    // Flujo neto del año
    const flujo_neto_año = canon_anual_año - gastos_anuales - cuota_anual - impuesto_rentas;
    flujo_neto_acumulado_finca += flujo_neto_año;
    
    flujos_finca.push({
      año: año,
      valor_propiedad: valor_propiedad,
      flujo_neto: flujo_neto_año,
      deuda_residual: Math.max(0, deuda_hipotecaria)
    });
  }
  
  // 3. Ganancia capital al vender (año 10)
  const ganancia_capital_bruta = valor_propiedad - i.precio_propiedad;
  const ganancia_capital_imponible = Math.max(0, ganancia_capital_bruta - EXENCION_GANANCIA_CAPITAL_COP);
  const impuesto_ganancia_capital = ganancia_capital_imponible * ALICUOTA_GANANCIA_CAPITAL;
  
  // 4. Gastos venta (comisión + notaría)
  const gastos_venta = valor_propiedad * (COMISION_VENTA_INMUEBLE + MARGEN_NOTARIAL_VENTA);
  
  // 5. Patrimonio neto finca raíz (año 10)
  const patrimonio_neto_finca = valor_propiedad - Math.max(0, deuda_hipotecaria) - gastos_venta - impuesto_ganancia_capital;
  
  // 6. ROI finca raíz
  const roi_finca_raiz = ((flujo_neto_acumulado_finca + (patrimonio_neto_finca - capital_propio)) / capital_propio) * 100;
  
  // 7. Yield anual promedio (primeros años)
  const yield_anual_finca = ((canon_anual - i.gastos_operacionales_anual) / i.precio_propiedad) * 100;
  
  // === RAMA RENTA FIJA ===
  
  const tasa_rf_decimal = i.tasa_renta_fija / 100;
  const valor_final_renta_fija_bruto = capital_propio * Math.pow(1 + tasa_rf_decimal, i.horizonte_años);
  
  // Intereses acumulados
  const intereses_totales_rf = valor_final_renta_fija_bruto - capital_propio;
  const impuesto_intereses_rf = intereses_totales_rf * (i.marginal_tributario / 100);
  
  // Valor final con impuestos
  const valor_final_renta_fija_neto = valor_final_renta_fija_bruto - impuesto_intereses_rf;
  const flujo_neto_acumulado_rf = valor_final_renta_fija_neto - capital_propio;
  
  // ROI renta fija
  const roi_renta_fija = ((valor_final_renta_fija_neto - capital_propio) / capital_propio) * 100;
  
  // === COMPARATIVA ===
  
  const diferencia_roi = roi_finca_raiz - roi_renta_fija;
  const ventaja_absoluta = (flujo_neto_acumulado_finca + (patrimonio_neto_finca - capital_propio)) - (valor_final_renta_fija_neto - capital_propio);
  
  // Recomendación
  let recomendacion = "";
  if (diferencia_roi > 5 && yield_anual_finca > 3) {
    recomendacion = "Finca raíz: diferencia ROI +" + diferencia_roi.toFixed(1) + "pp. Favorable si horizonte >8 años y flujo positivo sostenido.";
  } else if (diferencia_roi < -5) {
    recomendacion = "Renta fija: diferencia ROI " + diferencia_roi.toFixed(1) + "pp. Menor riesgo, mayor liquidez, mejor para perfil conservador.";
  } else if (Math.abs(diferencia_roi) <= 5) {
    recomendacion = "Mixta (diversificación): diferencia ROI " + diferencia_roi.toFixed(1) + "pp. Considera 60% finca raíz + 40% renta fija.";
  }
  
  if (yield_anual_finca < 2) {
    recomendacion += " ⚠️ Yield muy bajo; verifica canon o reduce gasto operacional.";
  }
  
  // Liquidez score (1–10)
  let liquidez_score = "4/10 (finca raíz: 2–3 meses venta; renta fija: 1–5 días)";
  
  return {
    cuota_hipotecaria_mensual: isFinite(cuota_hipotecaria_mensual) ? cuota_hipotecaria_mensual : 0,
    yield_anual_finca_raiz: isFinite(yield_anual_finca) ? yield_anual_finca : 0,
    roi_10_años_finca_raiz: isFinite(roi_finca_raiz) ? roi_finca_raiz : 0,
    valor_propiedad_10_años: isFinite(valor_propiedad) ? valor_propiedad : 0,
    flujo_neto_acumulado_finca: isFinite(flujo_neto_acumulado_finca) ? flujo_neto_acumulado_finca : 0,
    roi_10_años_renta_fija: isFinite(roi_renta_fija) ? roi_renta_fija : 0,
    valor_final_renta_fija: isFinite(valor_final_renta_fija_neto) ? valor_final_renta_fija_neto : 0,
    flujo_neto_acumulado_rf: isFinite(flujo_neto_acumulado_rf) ? flujo_neto_acumulado_rf : 0,
    diferencia_roi: isFinite(diferencia_roi) ? diferencia_roi : 0,
    ventaja_absoluta: isFinite(ventaja_absoluta) ? ventaja_absoluta : 0,
    recomendacion: recomendacion,
    impuesto_venta_estimado: isFinite(impuesto_ganancia_capital + gastos_venta) ? impuesto_ganancia_capital + gastos_venta : 0,
    liquidez_score: liquidez_score
  };
}
