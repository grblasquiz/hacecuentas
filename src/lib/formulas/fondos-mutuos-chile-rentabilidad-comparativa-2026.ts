export interface Inputs {
  monto_inicial: number;
  plazo_meses: number;
  perfil_riesgo: 'conservador' | 'moderado' | 'agresivo';
  tipo_fondo: 'liquidez' | 'renta_fija' | 'mixto' | 'accionario';
  administradora: 'bci' | 'bancoestado' | 'banchile' | 'larrain_vial' | 'mbi';
  comision_base: number;
  rentabilidad_historica: number;
  /** Tasa marginal del Impuesto Global Complementario del contribuyente (%). 0 = tramo exento. */
  tasa_marginal_igc: number;
}

export interface Outputs {
  rentabilidad_bruta_total: number;
  rentabilidad_bruta_porcentaje: number;
  comisiones_totales: number;
  rentabilidad_neta_comisiones: number;
  ganancia_exenta: number;
  impuesto_igc: number;
  rentabilidad_neta_total: number;
  valor_final_cartera: number;
  tasa_retorno_neta_anual: number;
  recomendacion: string;
  comparativa_administradoras: string;
  _insight?: any;
  _chart?: any;
}

// Valor UTM junio 2026 según SII (https://www.sii.cl/valores_y_fechas/utm/utm2026.htm).
// ACTUALIZAR mensualmente: la exención se expresa en UTM, así que drifta con la UTM.
const UTM_VIGENTE = 71506;
// Art. 57 LIR (DL 824): el mayor valor obtenido en el rescate de cuotas de fondos mutuos está
// exento del Impuesto Global Complementario hasta 30 UTM al año (~$2.145.180 con UTM jun-2026),
// para trabajadores dependientes, pensionados y pequeños contribuyentes (Art. 42 N°1 / Art. 22).
// La exención opera "todo o nada": si el mayor valor anual supera las 30 UTM, tributa la ganancia
// completa (no solo el excedente). NO existe una retención fija del 17-19% para el ahorrista común;
// el régimen de retención solo aplica en casos puntuales (rescates sin certificación / no domiciliados).
const EXENCION_FM = 30 * UTM_VIGENTE;

export function compute(i: Inputs): Outputs {
  // Comisiones administradoras referencia 2026
  const COMISIONES_ADMIN: Record<string, { min: number; max: number; promedio: number }> = {
    bci: { min: 0.8, max: 2.5, promedio: 1.5 },
    bancoestado: { min: 1.0, max: 2.0, promedio: 1.5 },
    banchile: { min: 1.2, max: 2.5, promedio: 1.8 },
    larrain_vial: { min: 1.5, max: 3.0, promedio: 2.2 },
    mbi: { min: 0.9, max: 2.2, promedio: 1.5 }
  };

  // Validación inputs
  const montoInicial = Math.max(100000, i.monto_inicial);
  const plazoAnios = Math.max(0.083, i.plazo_meses / 12); // mínimo 1 mes = 0.083 años
  const rentabilidadAnual = Math.max(0.01, i.rentabilidad_historica / 100);
  const comisionAnual = i.comision_base / 100;
  const tasaIgc = Math.max(0, Math.min(40, Number(i.tasa_marginal_igc) || 0)) / 100;

  // Cálculo rentabilidad bruta (fórmula interés compuesto)
  const factorCrecimiento = Math.pow(1 + rentabilidadAnual, plazoAnios);
  const rentabilidadBrutaTotal = montoInicial * (factorCrecimiento - 1);
  const rentabilidadBrutaPorcentaje = ((factorCrecimiento - 1) * 100);

  // Cálculo comisiones totales (aproximación lineal anual)
  const comisionesTotales = montoInicial * comisionAnual * plazoAnios;

  // Rentabilidad neta después de comisiones = mayor valor del rescate
  const rentabilidadNetaComisiones = rentabilidadBrutaTotal - comisionesTotales;
  const mayorValor = Math.max(0, rentabilidadNetaComisiones);

  // Impuesto Global Complementario: exención de 30 UTM (Art. 57 LIR). Solo el excedente tributa a
  // la tasa marginal del contribuyente. Si el tramo es 0 (exento), no hay impuesto.
  const gananciaExenta = Math.min(mayorValor, EXENCION_FM);
  const baseImponible = Math.max(0, mayorValor - EXENCION_FM);
  const impuestoIGC = Math.max(0, baseImponible * tasaIgc);

  // Rentabilidad neta total (después de impuesto)
  const rentabilidadNetaTotal = rentabilidadNetaComisiones - impuestoIGC;

  // Valor final cartera
  const valorFinalCartera = montoInicial + rentabilidadNetaTotal;

  // Cálculo TIR neta anual
  let tasaRetornoNetaAnual = 0;
  if (plazoAnios > 0 && valorFinalCartera > 0) {
    const factorFinal = valorFinalCartera / montoInicial;
    tasaRetornoNetaAnual = (Math.pow(factorFinal, 1 / plazoAnios) - 1) * 100;
  }

  // Recomendación según perfil riesgo
  let recomendacion = '';
  if (i.perfil_riesgo === 'conservador') {
    recomendacion = 'Perfil conservador: recomendamos fondos de Liquidez o Renta Fija. Bajo riesgo, rentabilidad 3-6% anual. Ideal para plazo <3 años o jubilados.';
  } else if (i.perfil_riesgo === 'moderado') {
    recomendacion = 'Perfil moderado: fondos Mixtos son ideales. Rentabilidad esperada 6-8% anual. Balance entre riesgo y retorno. Plazo recomendado 3-7 años.';
  } else if (i.perfil_riesgo === 'agresivo') {
    recomendacion = 'Perfil agresivo: fondos Accionarios ofrecen mayor potencial (8-12% anual). Mayor volatilidad. Requiere plazo >5-7 años y tolerancia riesgo alta. Diversifica entre tipos.';
  }

  // Comparativa administradoras (resumen simplificado)
  const comisionAdmin = COMISIONES_ADMIN[i.administradora as keyof typeof COMISIONES_ADMIN];
  const comisionPromedio = comisionAdmin?.promedio || 1.5;
  const rentabilidadAdminNetaEstimada = ((rentabilidadBrutaPorcentaje / 100 - comisionAnual) * 100);

  let comparativa = `Administradora seleccionada: ${i.administradora.toUpperCase()}. Comisión promedio: ${comisionPromedio.toFixed(2)}% anual. `;
  comparativa += `Rentabilidad neta estimada: ${rentabilidadAdminNetaEstimada.toFixed(2)}% anual (antes de impuesto). `;
  comparativa += `Verifica prospectos en CMF y webs oficiales para comisiones exactas según monto y fondo específico.`;

  // Insight: cuánto te queda neto y cuánto se llevan comisiones + impuesto
  const clp = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const brutaR = Math.round(rentabilidadBrutaTotal);
  const comR = Math.round(comisionesTotales);
  const impR = Math.round(impuestoIGC);
  const netaR = Math.round(rentabilidadNetaTotal);
  const cuotaCostos = brutaR > 0 ? Math.round(((comR + impR) / brutaR) * 100) : 0;
  const impuestoFrase = impR > 0
    ? `Como el mayor valor supera la exención de 30 UTM (${clp(EXENCION_FM)}/año), el excedente paga **${clp(impR)}** de Global Complementario a tu tramo marginal.`
    : `El mayor valor no supera la exención de 30 UTM (${clp(EXENCION_FM)}/año), así que no pagás Impuesto Global Complementario.`;
  const _insight = {
    title: 'Lo que te queda en el bolsillo',
    text: `De **${clp(brutaR)}** de rentabilidad bruta, las comisiones se llevan **${clp(comR)}**. ${impuestoFrase} Terminás con **${clp(netaR)}** netos (TIR ${tasaRetornoNetaAnual.toFixed(2)}% anual).`,
    tone: cuotaCostos >= 40 ? 'warn' : cuotaCostos >= 25 ? 'neutral' : 'good',
    icon: '📊'
  };

  // Donut: rentabilidad bruta = neta + comisiones + impuesto
  const _chart = (brutaR > 0 && netaR >= 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Rentabilidad neta', value: netaR },
      { label: 'Comisiones', value: comR },
      { label: 'Global Complementario', value: brutaR - netaR - comR }
    ],
    prefix: '$',
    centerValue: '$' + brutaR.toLocaleString('es-CL'),
    centerLabel: 'Rentab. bruta',
    ariaLabel: 'Reparto de la rentabilidad bruta entre neto, comisiones e impuesto Global Complementario'
  } : undefined;

  return {
    rentabilidad_bruta_total: Math.round(rentabilidadBrutaTotal),
    rentabilidad_bruta_porcentaje: Number(rentabilidadBrutaPorcentaje.toFixed(2)),
    comisiones_totales: Math.round(comisionesTotales),
    rentabilidad_neta_comisiones: Math.round(rentabilidadNetaComisiones),
    ganancia_exenta: Math.round(gananciaExenta),
    impuesto_igc: Math.round(impuestoIGC),
    rentabilidad_neta_total: Math.round(rentabilidadNetaTotal),
    valor_final_cartera: Math.round(valorFinalCartera),
    tasa_retorno_neta_anual: Number(tasaRetornoNetaAnual.toFixed(2)),
    recomendacion: recomendacion,
    comparativa_administradoras: comparativa,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
