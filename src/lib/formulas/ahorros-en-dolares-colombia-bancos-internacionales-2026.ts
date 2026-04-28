export interface Inputs {
  monto_usd: number;
  banco_seleccionado: string;
  meses_a_calcular: number;
  tasa_interes_anual: number;
  tasa_cambio_referencia: number;
}

export interface Outputs {
  comision_mensual_usd: number;
  comision_total_periodo: number;
  comision_anual_cop: number;
  interes_generado_usd: number;
  saldo_neto_usd: number;
  rendimiento_neto_pct: number;
  obligacion_declarativa: string;
  retenciones_estimadas: number;
  comparativa_entidades: string;
}

export function compute(i: Inputs): Outputs {
  // Comisiones mensuales según entidad (DIAN 2026, datos Superfinanciera)
  const comisiones_mensuales: { [key: string]: number } = {
    'bancolombia_global': 2.50,      // USD, Global Account
    'bbva_dolares': 1.50,             // USD, Cuenta Dólares
    'davivienda_usd': 2.00,           // USD, Cuenta USD
    'itau_dolares': 2.20,             // USD, Dólares Itaú
    'charles_schwab': 0,              // USD, Sin comisión si saldo > USD 1.000
    'interactive_brokers': 5          // USD, Promedio con cuota inactividad
  };

  // Tasas de interés anuales referencia Banco de la República 2026
  const tasas_banco: { [key: string]: number } = {
    'bancolombia_global': 0.65,       // %
    'bbva_dolares': 0.85,              // %
    'davivienda_usd': 0.70,            // %
    'itau_dolares': 0.75,              // %
    'charles_schwab': 4.90,            // % (Money Market Fund)
    'interactive_brokers': 2.50        // % (CORE Cash variable)
  };

  // Obtener comisión mensual
  const comision_mensual_usd = comisiones_mensuales[i.banco_seleccionado] || 2.00;
  
  // Comisión total en período
  const comision_total_periodo = comision_mensual_usd * i.meses_a_calcular;
  
  // Comisión anualizada en COP
  const comision_anual_usd = comision_mensual_usd * 12;
  const comision_anual_cop = comision_anual_usd * i.tasa_cambio_referencia;
  
  // Interés generado (fórmula: Capital × (tasa/100) × (meses/12))
  const tasa_a_usar = i.tasa_interes_anual > 0 ? i.tasa_interes_anual : tasas_banco[i.banco_seleccionado] || 0.75;
  const interes_generado_usd = (i.monto_usd * (tasa_a_usar / 100) * (i.meses_a_calcular / 12));
  
  // Retención en la fuente 4% sobre intereses (Art. 401 Estatuto Tributario)
  const retenciones_estimadas_usd = interes_generado_usd * 0.04;
  const retenciones_estimadas = retenciones_estimadas_usd * i.tasa_cambio_referencia;
  
  // Saldo neto: Capital + Intereses - Comisiones - Retención
  const interes_neto = interes_generado_usd - retenciones_estimadas_usd;
  const saldo_neto_usd = i.monto_usd + interes_neto - comision_total_periodo;
  
  // Rendimiento neto %
  const ganancia_neta = saldo_neto_usd - i.monto_usd;
  const rendimiento_neto_pct = (ganancia_neta / i.monto_usd) * 100;
  
  // Obligación declarativa DIAN (Decreto 1330/2022)
  let obligacion_declarativa = '';
  if (i.monto_usd >= 10000) {
    obligacion_declarativa = `OBLIGATORIO: Declarar en Formulario 1771 antes del 10 de junio. Saldo USD ${i.monto_usd.toFixed(0)} ≥ USD 10.000. Multa por incumplimiento: 80 UVT (~COP 2.740.000 en 2026)`;
  } else if (i.monto_usd >= 3000) {
    obligacion_declarativa = `RECOMENDADO: Declarar en Formulario 1771 si es residente fiscal. USD ${i.monto_usd.toFixed(0)} < USD 10.000 (exención de ganancias ocasionales hasta USD 3.000/año).`;
  } else {
    obligacion_declarativa = `No obligatorio si USD ${i.monto_usd.toFixed(0)} es único activo. Sin embargo, si tienes más de USD 1.000 en el exterior, declara para evitar sanciones.`;
  }
  
  // Comparativa con otras entidades
  let comparativa_entidades = '';
  
  if (i.banco_seleccionado === 'bancolombia_global') {
    comparativa_entidades = `Bancolombia Global Account: Comisión USD ${comision_total_periodo.toFixed(2)}, Interés neto USD ${interes_neto.toFixed(2)}. Alternativa BBVA (USD ${(1.50 * i.meses_a_calcular).toFixed(2)} comisión) sería USD ${((1.50 * i.meses_a_calcular) - comision_total_periodo).toFixed(2)} más barata. Charles Schwab (sin comisión, 4.9% interés) generaría USD ${((i.monto_usd * 0.049 * (i.meses_a_calcular / 12)) - (((i.monto_usd * 0.049 * (i.meses_a_calcular / 12)) * 0.04))).toFixed(2)} neto.`;
  } else if (i.banco_seleccionado === 'charles_schwab') {
    comparativa_entidades = `Charles Schwab: Sin comisión, interés 4.9% anual. MÁS VENTAJOSO que bancos locales. Requiere ITIN de EE.UU. y Formulario 1771 ante DIAN. Retención EE.UU. adicional 30% en algunas jurisdicciones; total retenido aquí: USD ${retenciones_estimadas_usd.toFixed(2)} (4% colombiano).`;
  } else {
    comparativa_entidades = `${i.banco_seleccionado}: Comisión USD ${comision_total_periodo.toFixed(2)}, interés neto USD ${interes_neto.toFixed(2)}. Compara con Charles Schwab (sin comisión, mejor tasa) o Bancolombia (cuenta inversión con comisiones ajustables).`;
  }
  
  return {
    comision_mensual_usd: parseFloat(comision_mensual_usd.toFixed(2)),
    comision_total_periodo: parseFloat(comision_total_periodo.toFixed(2)),
    comision_anual_cop: parseFloat(comision_anual_cop.toFixed(0)),
    interes_generado_usd: parseFloat(interes_generado_usd.toFixed(2)),
    saldo_neto_usd: parseFloat(saldo_neto_usd.toFixed(2)),
    rendimiento_neto_pct: parseFloat(rendimiento_neto_pct.toFixed(2)),
    obligacion_declarativa,
    retenciones_estimadas: parseFloat(retenciones_estimadas.toFixed(0)),
    comparativa_entidades
  };
}
