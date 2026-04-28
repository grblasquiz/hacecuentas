export interface Inputs {
  renta_mensual_cobrada: number;
  tipo_deduccion: 'real' | 'ciega';
  gastos_comprobables_mensual: number;
  ibi_predial_mensual: number;
  intereses_hipotecarios_mensual: number;
  mantenimiento_reparacion_mensual: number;
  retencion_inquilino_persona_moral: number;
  meses_calculo: number;
}

export interface Outputs {
  renta_total_periodo: number;
  deducciones_totales: number;
  porcentaje_deduccion: number;
  renta_neta: number;
  isr_calculado: number;
  menos_retencion: number;
  isr_a_pagar: number;
  tasa_efectiva: number;
  declaracion_tipo: string;
}

export function compute(i: Inputs): Outputs {
  // Validaciones y defaults
  const renta_mensual = Math.max(0, i.renta_mensual_cobrada || 0);
  const meses = Math.max(1, Math.min(12, i.meses_calculo || 1));
  const tipo_ded = i.tipo_deduccion || 'ciega';

  // Renta total del período
  const renta_total_periodo = renta_mensual * meses;

  // Deducciones permitidas
  let deducciones_totales = 0;
  let porcentaje_deduccion = 0;

  if (tipo_ded === 'real') {
    // Deducción real: suma gastos comprobados
    const ibi = Math.max(0, i.ibi_predial_mensual || 0);
    const intereses = Math.max(0, i.intereses_hipotecarios_mensual || 0);
    const mantenim = Math.max(0, i.mantenimiento_reparacion_mensual || 0);
    const otros_gastos = Math.max(0, i.gastos_comprobables_mensual || 0);

    const gastos_mensuales = ibi + intereses + mantenim + otros_gastos;
    deducciones_totales = gastos_mensuales * meses;

    // Limitar deducción a 35% de renta bruta (regla SAT)
    const limite_35_porciento = renta_total_periodo * 0.35;
    if (deducciones_totales > limite_35_porciento) {
      deducciones_totales = limite_35_porciento;
    }

    porcentaje_deduccion = renta_total_periodo > 0 ? (deducciones_totales / renta_total_periodo) * 100 : 0;
  } else {
    // Deducción ciega: 35% automático
    deducciones_totales = renta_total_periodo * 0.35;
    porcentaje_deduccion = 35;
  }

  // Renta neta (base gravable)
  const renta_neta = Math.max(0, renta_total_periodo - deducciones_totales);

  // Tarifa ISR 2026 progresiva (mensual)
  // Convertir a base mensual para aplicar tarifa
  const renta_neta_mensual = renta_neta / meses;

  function aplicar_tarifa_isr(base_mensual: number): number {
    // Tarifa ISR México 2026 (anual convertida a mensual)
    // Límites anuales ÷ 12 = límites mensuales
    const tramos = [
      { limite: 715.27, cuota_fija: 0, tasa: 0.0192 },      // 1.92%
      { limite: 7382.33, cuota_fija: 13.74, tasa: 0.064 },  // 6.40%
      { limite: 24607.78, cuota_fija: 493.34, tasa: 0.1088 }, // 10.88%
      { limite: 35453.26, cuota_fija: 2860.52, tasa: 0.16 }, // 16%
      { limite: 56722.90, cuota_fija: 4840.36, tasa: 0.196 }, // 19.60%
      { limite: 83760.15, cuota_fija: 9226.56, tasa: 0.24 }, // 24%
      { limite: Infinity, cuota_fija: 17316.49, tasa: 0.30 } // 30% (o 35% si > 362,858.23 anual)
    ];

    let isr = 0;
    for (let t = 0; t < tramos.length; t++) {
      if (base_mensual <= tramos[t].limite) {
        const limite_anterior = t > 0 ? tramos[t - 1].limite : 0;
        const base_en_tramo = base_mensual - limite_anterior;
        isr = tramos[t].cuota_fija + (base_en_tramo * tramos[t].tasa);
        break;
      }
    }

    return isr;
  }

  const isr_mensual = aplicar_tarifa_isr(renta_neta_mensual);
  const isr_calculado = isr_mensual * meses;

  // Retención acreditable (inquilino persona moral 10%)
  const retencion = Math.max(0, i.retencion_inquilino_persona_moral || 0);
  const menos_retencion = retencion;

  // ISR a pagar
  const isr_a_pagar = Math.max(-999999, isr_calculado - menos_retencion);

  // Tasa efectiva
  const tasa_efectiva = renta_total_periodo > 0 ? (isr_a_pagar / renta_total_periodo) * 100 : 0;

  // Tipo de declaración
  let declaracion_tipo = 'Anual definitiva';
  if (meses === 1) {
    declaracion_tipo = 'Estimativa mensual (opcional)';
  }

  return {
    renta_total_periodo: Math.round(renta_total_periodo * 100) / 100,
    deducciones_totales: Math.round(deducciones_totales * 100) / 100,
    porcentaje_deduccion: Math.round(porcentaje_deduccion * 100) / 100,
    renta_neta: Math.round(renta_neta * 100) / 100,
    isr_calculado: Math.round(isr_calculado * 100) / 100,
    menos_retencion: Math.round(menos_retencion * 100) / 100,
    isr_a_pagar: Math.round(isr_a_pagar * 100) / 100,
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    declaracion_tipo: declaracion_tipo
  };
}
