export interface Inputs {
  precio_vehiculo: number;
  cuota_inicial_porcentaje: number;
  plazo_meses: number;
  tasa_interes_anual: number;
  tasa_leasing_anual: number;
  valor_residual_porcentaje: number;
  tipo_financiacion: 'credito_vs_leasing_financiero' | 'credito_vs_leasing_operativo' | 'todos';
  incluir_seguros_mantenimiento: boolean;
  es_uso_empresarial: boolean;
}

export interface Outputs {
  cuota_credito_mensual: number;
  cuota_leasing_financiero_mensual: number;
  cuota_leasing_operativo_mensual: number;
  total_pagado_credito: number;
  total_pagado_leasing_financiero: number;
  total_pagado_leasing_operativo: number;
  ea_credito: number;
  ea_leasing_financiero: number;
  ea_leasing_operativo: number;
  depreciacion_anual_credito: number;
  beneficio_fiscal_credito_5anos: number;
  beneficio_fiscal_leasing_operativo_5anos: number;
  valor_residual_leasing: number;
  diferencia_costo_total: number;
  recomendacion: string;
}

// Constantes DIAN 2026 Colombia
const DEPRECIACION_VIDA_UTIL_ANOS = 5; // Resolución DIAN para vehículos
const DEPRECIACION_ANUAL_PORCENTAJE = 20; // 100% / 5 años
const IVA_PORCENTAJE = 19; // IVA Colombia 2026
const TASA_MARGINAL_PERSONA_NATURAL = 0.30; // 30% asumido personas naturales
const TASA_MARGINAL_PERSONA_JURIDICA = 0.37; // 37% personas jurídicas (Decreto 277/2014)
const SEGURO_MANTENIMIENTO_MENSUAL = 150000; // $150k/mes estimado DIAN
const TASA_OPERATIVO_AJUSTE = 0.015; // +1.5% EA para leasing operativo por riesgo residual

function calcularCuotaMensual(
  capitalFinanciado: number,
  tasaEAAnnual: number,
  plazoMeses: number
): number {
  // Conversión EA anual a tasa mensual (método compuesto)
  const tasaMensual = Math.pow(1 + tasaEAAnnual / 100, 1 / 12) - 1;
  
  // Fórmula cuota método francés: C = P * [i(1+i)^n] / [(1+i)^n - 1]
  const numerador = tasaMensual * Math.pow(1 + tasaMensual, plazoMeses);
  const denominador = Math.pow(1 + tasaMensual, plazoMeses) - 1;
  
  const cuota = capitalFinanciado * (numerador / denominador);
  return Math.round(cuota);
}

function calcularTotalPagado(
  cuotaInicial: number,
  cuotaMensual: number,
  plazoMeses: number,
  valorResidualFinal: number = 0
): number {
  return cuotaInicial + cuotaMensual * plazoMeses + valorResidualFinal;
}

function calcularBeneficioFiscalDepreciacion(
  precioVehiculo: number,
  plazoMeses: number,
  tasaMarginal: number
): number {
  // Depreciación DIAN: 20% anual durante 5 años
  const deprecacionAnual = precioVehiculo * (DEPRECIACION_ANUAL_PORCENTAJE / 100);
  const aniosPlazo = Math.min(Math.floor(plazoMeses / 12), DEPRECIACION_VIDA_UTIL_ANOS);
  
  const deprecacionTotal = deprecacionAnual * aniosPlazo;
  const beneficioFiscal = deprecacionTotal * tasaMarginal;
  
  return Math.round(beneficioFiscal);
}

function calcularBeneficioFiscalLeasing(
  cuotaMensual: number,
  plazoMeses: number,
  tasaMarginal: number,
  incluirIVA: boolean = true
): number {
  // Leasing operativo: cuota 100% deducible, incluido IVA para responsables IVA
  let cuotaDeducible = cuotaMensual;
  
  if (incluirIVA) {
    // La cuota incluye IVA 19%; para responsable IVA, el 19% adicional es deducible
    // Pero aquí asumimos cuota ya neta de cálculo, así que aplicamos factor
    cuotaDeducible = cuotaMensual * (1 + IVA_PORCENTAJE / 100);
  }
  
  const totalCuotasDeducibles = cuotaDeducible * plazoMeses;
  const beneficioFiscal = totalCuotasDeducibles * tasaMarginal;
  
  return Math.round(beneficioFiscal);
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  if (i.precio_vehiculo <= 0 || i.plazo_meses <= 0) {
    return {
      cuota_credito_mensual: 0,
      cuota_leasing_financiero_mensual: 0,
      cuota_leasing_operativo_mensual: 0,
      total_pagado_credito: 0,
      total_pagado_leasing_financiero: 0,
      total_pagado_leasing_operativo: 0,
      ea_credito: 0,
      ea_leasing_financiero: 0,
      ea_leasing_operativo: 0,
      depreciacion_anual_credito: 0,
      beneficio_fiscal_credito_5anos: 0,
      beneficio_fiscal_leasing_operativo_5anos: 0,
      valor_residual_leasing: 0,
      diferencia_costo_total: 0,
      recomendacion: 'Valores inválidos. Revisa precio y plazo.'
    };
  }

  // Cálculos base
  const cuotaInicialPesos = i.precio_vehiculo * (i.cuota_inicial_porcentaje / 100);
  const capitalCreditoSinResidual = i.precio_vehiculo - cuotaInicialPesos;
  
  // Valor residual para leasing
  const valorResidualPesos = i.precio_vehiculo * (i.valor_residual_porcentaje / 100);
  const capitalLeasingFinanciero = i.precio_vehiculo - valorResidualPesos - cuotaInicialPesos;
  
  // CRÉDITO TRADICIONAL (Método francés, EA nominal)
  const cuotaCreditoMensual = calcularCuotaMensual(
    capitalCreditoSinResidual,
    i.tasa_interes_anual,
    i.plazo_meses
  );
  
  const totalPagadoCreditoBase = calcularTotalPagado(
    cuotaInicialPesos,
    cuotaCreditoMensual,
    i.plazo_meses,
    0 // Sin residual en crédito
  );
  
  const totalPagadoCredito = i.incluir_seguros_mantenimiento
    ? totalPagadoCreditoBase + (SEGURO_MANTENIMIENTO_MENSUAL * i.plazo_meses)
    : totalPagadoCreditoBase;
  
  // LEASING FINANCIERO (Capital = Precio - Residual)
  const cuotaLeasingFinancieroMensual = calcularCuotaMensual(
    capitalLeasingFinanciero,
    i.tasa_leasing_anual,
    i.plazo_meses
  );
  
  const totalPagadoLeasingFinancieroBase = calcularTotalPagado(
    cuotaInicialPesos,
    cuotaLeasingFinancieroMensual,
    i.plazo_meses,
    valorResidualPesos // Opción compra final
  );
  
  const totalPagadoLeasingFinanciero = i.incluir_seguros_mantenimiento
    ? totalPagadoLeasingFinancieroBase + (SEGURO_MANTENIMIENTO_MENSUAL * i.plazo_meses * 0.5) // Lesadora cubre parcial
    : totalPagadoLeasingFinancieroBase;
  
  // LEASING OPERATIVO (Cuota más alta por riesgo residual, sin opción compra)
  const tasaLeasingOperativoAjustada = i.tasa_leasing_anual + TASA_OPERATIVO_AJUSTE;
  const cuotaLeasingOperativoMensual = calcularCuotaMensual(
    i.precio_vehiculo - cuotaInicialPesos,
    tasaLeasingOperativoAjustada,
    i.plazo_meses
  );
  
  const totalPagadoLeasingOperativoBase = calcularTotalPagado(
    cuotaInicialPesos,
    cuotaLeasingOperativoMensual,
    i.plazo_meses,
    0 // Sin opción compra
  );
  
  const totalPagadoLeasingOperativo = i.incluir_seguros_mantenimiento
    ? totalPagadoLeasingOperativoBase // Lesadora cubre (incluido en cuota)
    : totalPagadoLeasingOperativoBase;
  
  // DEPRECIACIÓN CRÉDITO (DIAN 20% anual)
  const deprecacionAnualCredito = i.precio_vehiculo * (DEPRECIACION_ANUAL_PORCENTAJE / 100);
  
  // BENEFICIOS FISCALES
  const tasaMarginal = i.es_uso_empresarial ? TASA_MARGINAL_PERSONA_JURIDICA : TASA_MARGINAL_PERSONA_NATURAL;
  
  const beneficioFiscalCredito5Anos = i.es_uso_empresarial
    ? calcularBeneficioFiscalDepreciacion(
        i.precio_vehiculo,
        i.plazo_meses,
        tasaMarginal
      )
    : 0; // Sin beneficio fiscal si no es uso empresarial
  
  const beneficioFiscalLeasingOperativo5Anos = i.es_uso_empresarial
    ? calcularBeneficioFiscalLeasing(
        cuotaLeasingOperativoMensual,
        i.plazo_meses,
        tasaMarginal,
        true // Incluir IVA deducible
      )
    : 0;
  
  // EA reportada (la misma que entrada, ya que es tasa contratada)
  const eaCreditoReportado = i.tasa_interes_anual;
  const eaLeasingFinancieroReportado = i.tasa_leasing_anual;
  const eaLeasingOperativoReportado = tasaLeasingOperativoAjustada;
  
  // Diferencia de costo total (crédito vs leasing financiero)
  const diferenciaCostoTotal = totalPagadoCredito - totalPagadoLeasingFinanciero;
  
  // RECOMENDACIÓN
  let recomendacion = '';
  
  if (i.incluir_seguros_mantenimiento) {
    const cuotaCreditoConGastos = cuotaCreditoMensual + (SEGURO_MANTENIMIENTO_MENSUAL);
    const cuotaLeasingFinancieroConGastos = cuotaLeasingFinancieroMensual + (SEGURO_MANTENIMIENTO_MENSUAL * 0.5);
    const cuotaLeasingOperativoIncluido = cuotaLeasingOperativoMensual; // Gastos incluidos
    
    if (cuotaCreditoMensual < cuotaLeasingFinancieroMensual) {
      recomendacion = `Crédito más económico en cuota ($${cuotaCreditoMensual.toLocaleString('es-CO')}). Pero si usas laboralmente, compara beneficio fiscal depreciación ($${beneficioFiscalCredito5Anos.toLocaleString('es-CO')} en 5 años) contra leasing operativo ($${beneficioFiscalLeasingOperativo5Anos.toLocaleString('es-CO')}).`;
    } else if (cuotaLeasingOperativoMensual < cuotaCreditoMensual) {
      recomendacion = `Leasing operativo mejor para uso empresarial: cuota $${cuotaLeasingOperativoMensual.toLocaleString('es-CO')} + máximo beneficio fiscal $${beneficioFiscalLeasingOperativo5Anos.toLocaleString('es-CO')}. Sin riesgo residual.`;
    } else {
      recomendacion = `Leasing financiero opción intermedia: opción compra definida (${i.valor_residual_porcentaje}%), cuota $${cuotaLeasingFinancieroMensual.toLocaleString('es-CO')}.`;
    }
  } else {
    const costoTotalCredito = totalPagadoCredito + beneficioFiscalCredito5Anos; // Ajustado por beneficio
    const costoTotalLeasingFinanciero = totalPagadoLeasingFinanciero;
    
    if (costoTotalCredito < costoTotalLeasingFinanciero) {
      recomendacion = `Crédito ventajoso: total $${Math.round(costoTotalCredito).toLocaleString('es-CO')} con beneficio fiscal. Ideal si kilometraje bajo (<15k km/año).`;
    } else {
      recomendacion = `Leasing financiero más económico: total $${costoTotalLeasingFinanciero.toLocaleString('es-CO')}. Mejor para alto kilometraje (>25k km/año).`;
    }
  }
  
  return {
    cuota_credito_mensual: cuotaCreditoMensual,
    cuota_leasing_financiero_mensual: cuotaLeasingFinancieroMensual,
    cuota_leasing_operativo_mensual: cuotaLeasingOperativoMensual,
    total_pagado_credito: Math.round(totalPagadoCredito),
    total_pagado_leasing_financiero: Math.round(totalPagadoLeasingFinanciero),
    total_pagado_leasing_operativo: Math.round(totalPagadoLeasingOperativo),
    ea_credito: parseFloat(eaCreditoReportado.toFixed(2)),
    ea_leasing_financiero: parseFloat(eaLeasingFinancieroReportado.toFixed(2)),
    ea_leasing_operativo: parseFloat(eaLeasingOperativoReportado.toFixed(2)),
    depreciacion_anual_credito: Math.round(deprecacionAnualCredito),
    beneficio_fiscal_credito_5anos: Math.round(beneficioFiscalCredito5Anos),
    beneficio_fiscal_leasing_operativo_5anos: Math.round(beneficioFiscalLeasingOperativo5Anos),
    valor_residual_leasing: Math.round(valorResidualPesos),
    diferencia_costo_total: Math.round(diferenciaCostoTotal),
    recomendacion: recomendacion
  };
}
