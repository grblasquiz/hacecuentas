export interface Inputs {
  edad_actual: number;
  genero: 'hombre' | 'mujer';
  saldo_afp: number;
  aportes_mensuales_esperados: number;
  anos_aportacion_futura: number;
  rentabilidad_anual: number;
  modalidad: 'retiro_programado' | 'renta_vitalicia' | 'mixta';
  num_beneficiarios: number;
  tasa_mortalidad_seguro: number;
  esperanza_vida_personalizada: number;
}

export interface Outputs {
  saldo_proyectado_jubilacion: number;
  pension_retiro_programado_mensual: number;
  pension_retiro_programado_anual: number;
  pension_renta_vitalicia_mensual: number;
  pension_mixta_mensual: number;
  pgu_aplica: boolean;
  pension_con_pgu: number;
  ingreso_bruto_jubilacion_primer_ano: number;
  comparativa_modalidades: string;
  rentabilidad_implícita_renta_vitalicia: number;
  edad_legal_jubilacion: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes Chile 2026 (fuente: SII, CMF, Banco Central)
  const PGU_MINIMO_2026 = 185039; // Pensión Garantizada Universal en UF indexada
  const EDAD_JUBILACION_HOMBRE = 65;
  const EDAD_JUBILACION_MUJER = 60;
  const ESPERANZA_VIDA_HOMBRE_CHILE = 79; // Banco Central 2026
  const ESPERANZA_VIDA_MUJER_CHILE = 84;
  const COMISION_AFP_PORCENTAJE = 0.008; // 0,8% promedio (varía 0,47–1,2%)
  const COMISION_AFP_FIJA = 0; // simplificado, incluido en porcentaje
  
  // Validaciones y defaults
  const genero_norm = i.genero.toLowerCase();
  const edad_legal = genero_norm === 'mujer' ? EDAD_JUBILACION_MUJER : EDAD_JUBILACION_HOMBRE;
  const esperanza_vida = i.esperanza_vida_personalizada > 0 
    ? i.esperanza_vida_personalizada 
    : (genero_norm === 'mujer' ? ESPERANZA_VIDA_MUJER_CHILE : ESPERANZA_VIDA_HOMBRE_CHILE);
  
  const anos_futuros = Math.max(0, edad_legal - i.edad_actual);
  const rentabilidad_mensual = (1 + i.rentabilidad_anual / 100) ** (1 / 12) - 1;
  
  // === CÁLCULO SALDO PROYECTADO ===
  // Saldo actual capitalizado
  let saldo_capitalizado_actual = i.saldo_afp * Math.pow(1 + rentabilidad_mensual, anos_futuros * 12);
  
  // Aportes futuros capitalizados (flujo de caja)
  const aporte_neto = i.aportes_mensuales_esperados * (1 - COMISION_AFP_PORCENTAJE);
  const meses_aportacion = i.anos_aportacion_futura * 12;
  let saldo_aportes = 0;
  
  if (meses_aportacion > 0 && aporte_neto > 0) {
    // VF de anualidad: PMT × [((1+r)^n - 1) / r]
    saldo_aportes = aporte_neto * 
      (Math.pow(1 + rentabilidad_mensual, meses_aportacion) - 1) / rentabilidad_mensual;
  }
  
  const saldo_jubilacion = saldo_capitalizado_actual + saldo_aportes;
  
  // === CÁLCULO PENSIONES POR MODALIDAD ===
  
  // Retiro programado: saldo / (esperanza vida en meses) / beneficiarios
  const meses_esperanza_vida = esperanza_vida * 12;
  const pension_retiro_mensual = saldo_jubilacion / meses_esperanza_vida / i.num_beneficiarios;
  const pension_retiro_anual = pension_retiro_mensual * 12;
  
  // Renta vitalicia: saldo / (meses esperanza vida) / (1 - tasa mortalidad)
  // = saldo / (meses) * (1 / (1 - tasa_mort%))
  const factor_mortalidad = 1 - (i.tasa_mortalidad_seguro / 100);
  const pension_vitalicia_mensual = (saldo_jubilacion / meses_esperanza_vida) / factor_mortalidad;
  
  // Modalidad mixta: promedio 50/50 (configurable, aquí paridad)
  const pension_mixta = (pension_retiro_mensual + pension_vitalicia_mensual) / 2;
  
  // === PENSIÓN FINAL SEGÚN MODALIDAD ELEGIDA ===
  let pension_final_mensual = 0;
  
  switch (i.modalidad) {
    case 'retiro_programado':
      pension_final_mensual = pension_retiro_mensual;
      break;
    case 'renta_vitalicia':
      pension_final_mensual = pension_vitalicia_mensual;
      break;
    case 'mixta':
      pension_final_mensual = pension_mixta;
      break;
    default:
      pension_final_mensual = pension_retiro_mensual;
  }
  
  // === PENSIÓN GARANTIZADA UNIVERSAL (PGU) ===
  const pgu_aplica_boolean = pension_final_mensual < PGU_MINIMO_2026;
  const pension_con_pgu = pgu_aplica_boolean ? PGU_MINIMO_2026 : pension_final_mensual;
  
  const ingreso_bruto_anual = pension_con_pgu * 12;
  
  // === RENTABILIDAD IMPLÍCITA RENTA VITALICIA ===
  // TIR aproximada: saldo / (pensión_mensual × meses_esperanza_vida)
  // Inverso de factor de anualidad
  let rentabilidad_implicita = 0;
  if (pension_vitalicia_mensual > 0 && meses_esperanza_vida > 0) {
    const factor_actuarial = saldo_jubilacion / (pension_vitalicia_mensual * meses_esperanza_vida);
    // TIR ≈ 1 / factor - 1 (simplificado); real requiere iteración Newton-Raphson
    rentabilidad_implicita = Math.max(0, (1 / factor_actuarial - 1) * 100);
  }
  
  // === COMPARATIVA MODALIDADES (tabla resumida 12 años) ===
  let tabla_comparativa = 'Año | Edad | Retiro Programado ($/mes) | Renta Vitalicia | Mixta ($/mes) | Acumulado Retiro Prog.\n';
  tabla_comparativa += '---|---|---|---|---|---\n';
  
  let acumulado_retiro = 0;
  let saldo_temp = saldo_jubilacion;
  
  for (let ano = 1; ano <= 12; ano++) {
    const edad_en_ano = edad_legal + ano - 1;
    // Retiro programado decrece: recalc cada año con saldo reducido
    const meses_restantes = Math.max(0, (esperanza_vida - (ano - 1)) * 12);
    const pension_retiro_ano = meses_restantes > 0 
      ? saldo_temp / meses_restantes / i.num_beneficiarios 
      : 0;
    
    acumulado_retiro += pension_retiro_ano * 12;
    
    // Decrement saldo por retiro (simplificado: retiro sin rentabilidad futura)
    saldo_temp -= pension_retiro_ano * 12 * i.num_beneficiarios;
    saldo_temp = Math.max(0, saldo_temp);
    
    tabla_comparativa += `${ano} | ${edad_en_ano} | $${Math.round(pension_retiro_ano).toLocaleString('es-CL')} | $${Math.round(pension_vitalicia_mensual).toLocaleString('es-CL')} | $${Math.round(pension_mixta).toLocaleString('es-CL')} | $${Math.round(acumulado_retiro).toLocaleString('es-CL')}\n`;
  }
  
  return {
    saldo_proyectado_jubilacion: Math.round(saldo_jubilacion),
    pension_retiro_programado_mensual: Math.round(pension_retiro_mensual),
    pension_retiro_programado_anual: Math.round(pension_retiro_anual),
    pension_renta_vitalicia_mensual: Math.round(pension_vitalicia_mensual),
    pension_mixta_mensual: Math.round(pension_mixta),
    pgu_aplica: pgu_aplica_boolean,
    pension_con_pgu: Math.round(pension_con_pgu),
    ingreso_bruto_jubilacion_primer_ano: Math.round(ingreso_bruto_anual),
    comparativa_modalidades: tabla_comparativa,
    rentabilidad_implícita_renta_vitalicia: Math.round(rentabilidad_implicita * 100) / 100,
    edad_legal_jubilacion: edad_legal
  };
}
