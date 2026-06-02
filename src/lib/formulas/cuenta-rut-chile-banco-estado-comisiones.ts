export interface Inputs {
  giros_mensuales: number;
  retiros_atm_mensuales: number;
  transferencias_mensuales: number;
  depositos_mensuales: number;
  monto_transferencia_promedio: number;
  consultas_saldo: number;
  meses_analisis: number;
}

export interface Outputs {
  comision_giros: number;
  comision_retiros_atm: number;
  comision_transferencias: number;
  comision_consultas: number;
  comision_total_periodo: number;
  comision_promedio_mensual: number;
  mantention_cuenta_corriente_equivalente: number;
  ahorro_respecto_cc: number;
  recomendacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Fuente: BancoEstado Tarifario 2026, CMF Chile
  // Comisiones vigentes abril 2026

  const COMISION_GIRO_EXCESO = 600; // $ por giro adicional después de 3 gratis
  const GIROS_GRATIS = 3;
  const COMISION_RETIRO_ATM_EXCESO = 800; // $ por retiro ATM adicional después de 3 gratis
  const RETIROS_ATM_GRATIS = 3;
  const COMISION_TRANSFERENCIA_INTERBANCO = 800; // $ por transferencia entre bancos
  const COMISION_CONSULTA_SALDO_EXCESO = 50; // $ por consulta adicional después de 5 gratis
  const CONSULTAS_GRATIS = 5;
  const MANTENTION_CC_PROMEDIO = 3000; // $ promedio mantención Cuenta Corriente BancoEstado 2026

  // 1. Comisión Giros en Caja
  const comision_giros = Math.max(0, i.giros_mensuales - GIROS_GRATIS) * COMISION_GIRO_EXCESO;

  // 2. Comisión Retiros ATM
  const comision_retiros_atm = Math.max(0, i.retiros_atm_mensuales - RETIROS_ATM_GRATIS) * COMISION_RETIRO_ATM_EXCESO;

  // 3. Comisión Transferencias (todas entre bancos = $800 c/u, BB-BB internas = $0)
  // Se asume que todas las transferencias son interbanco
  const comision_transferencias = i.transferencias_mensuales * COMISION_TRANSFERENCIA_INTERBANCO;

  // 4. Comisión Consultas de Saldo (cajero, teléfono; app/web sin costo)
  const comision_consultas = Math.max(0, i.consultas_saldo - CONSULTAS_GRATIS) * COMISION_CONSULTA_SALDO_EXCESO;

  // 5. Comisión Total Mensual
  const comision_mensual = comision_giros + comision_retiros_atm + comision_transferencias + comision_consultas;

  // 6. Comisión Total Período
  const comision_total_periodo = comision_mensual * i.meses_analisis;

  // 7. Promedio mensual
  const comision_promedio_mensual = comision_total_periodo / i.meses_analisis;

  // 8. Equivalente a mantención CC (para comparativa)
  const mantention_cuenta_corriente_equivalente = MANTENTION_CC_PROMEDIO;

  // 9. Ahorro anual respecto a CC
  // Si CuentaRUT cuesta menos que CC, hay ahorro positivo
  const ahorro_anual_cuentarut = (MANTENTION_CC_PROMEDIO * 12) - (comision_promedio_mensual * 12);
  const ahorro_respecto_cc = ahorro_anual_cuentarut;

  // 10. Recomendación basada en perfil
  let recomendacion = "";
  if (comision_promedio_mensual < MANTENTION_CC_PROMEDIO * 0.5) {
    recomendacion = "✅ CuentaRUT es excelente opción para tu perfil. Bajo uso = bajo costo. Recomendamos mantenerla.";
  } else if (comision_promedio_mensual < MANTENTION_CC_PROMEDIO) {
    recomendacion = "✅ CuentaRUT es buena opción. Costo operacional inferior a Cuenta Corriente. Vale la pena.";
  } else if (comision_promedio_mensual >= MANTENTION_CC_PROMEDIO && comision_promedio_mensual < MANTENTION_CC_PROMEDIO * 1.5) {
    recomendacion = "⚠️ Costo similar a Cuenta Corriente. Si haces muchas operaciones interbanco, Cuenta Corriente podría convenir más (sin límites operacionales).";
  } else {
    recomendacion = "❌ Costo muy alto. Con este perfil de uso intenso, Cuenta Corriente BancoEstado (~$" + MANTENTION_CC_PROMEDIO.toLocaleString("es-CL") + "/mes sin límites) es mejor opción.";
  }

  // --- Insight + gráfico ---
  const fmtCL = (n: number) => Math.round(n).toLocaleString("es-CL");
  const caroComoCC = comision_promedio_mensual >= MANTENTION_CC_PROMEDIO;
  const _insight = {
    title: "Tu costo real con CuentaRUT",
    text: caroComoCC
      ? `Pagás unos **$${fmtCL(comision_promedio_mensual)}/mes** en comisiones (**$${fmtCL(comision_total_periodo)}** en ${i.meses_analisis} ${i.meses_analisis === 1 ? "mes" : "meses"}), igual o más que una Cuenta Corriente (~$${fmtCL(MANTENTION_CC_PROMEDIO)}/mes sin límites). Con este nivel de uso, **conviene comparar** con la CC.`
      : comision_total_periodo === 0
        ? `No pagás **nada** en comisiones: tu uso entra dentro de las operaciones gratuitas de CuentaRUT. Frente a una Cuenta Corriente te ahorrás unos **$${fmtCL(ahorro_respecto_cc)}** al año.`
        : `Pagás unos **$${fmtCL(comision_promedio_mensual)}/mes** en comisiones (**$${fmtCL(comision_total_periodo)}** en ${i.meses_analisis} ${i.meses_analisis === 1 ? "mes" : "meses"}), bastante menos que una Cuenta Corriente. Te ahorrás unos **$${fmtCL(ahorro_respecto_cc)}** al año.`,
    tone: caroComoCC ? "warn" : "good",
    icon: "🏧",
  };

  const slicesCL = [
    { label: "Giros en caja", value: Math.round(comision_giros * i.meses_analisis) },
    { label: "Retiros ATM", value: Math.round(comision_retiros_atm * i.meses_analisis) },
    { label: "Transferencias", value: Math.round(comision_transferencias * i.meses_analisis) },
    { label: "Consultas saldo", value: Math.round(comision_consultas * i.meses_analisis) },
  ].filter((s) => s.value > 0);

  let _chart: any = undefined;
  if (comision_total_periodo > 0 && slicesCL.length > 0) {
    _chart = {
      type: "doughnut",
      slices: slicesCL,
      prefix: "$",
      centerValue: "$" + fmtCL(comision_total_periodo),
      centerLabel: "Comisiones",
      ariaLabel: `Desglose de las comisiones de CuentaRUT en ${i.meses_analisis} meses por tipo de operación.`,
    };
  }

  return {
    comision_giros: Math.round(comision_giros),
    comision_retiros_atm: Math.round(comision_retiros_atm),
    comision_transferencias: Math.round(comision_transferencias),
    comision_consultas: Math.round(comision_consultas),
    comision_total_periodo: Math.round(comision_total_periodo),
    comision_promedio_mensual: Math.round(comision_promedio_mensual),
    mantention_cuenta_corriente_equivalente: Math.round(mantention_cuenta_corriente_equivalente),
    ahorro_respecto_cc: Math.round(ahorro_respecto_cc),
    recomendacion: recomendacion,
    _insight,
    _chart
  };
}
