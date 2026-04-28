export interface Inputs {
  aporte_mensual_clp: number;
  modalidad: 'A' | 'B';
  fondo: 'A' | 'B' | 'C' | 'D' | 'E';
  anos_ahorro: number;
  tasa_impositiva: number;
  comision_afp: number;
  seguro_invalidez: number;
}

export interface Outputs {
  aporte_anual_total: number;
  rebaja_rgc_anual: number;
  ahorro_fiscal_anual: number;
  tasa_retorno_neta: number;
  capital_final_sin_interes: number;
  capital_final_con_interes: number;
  rendimiento_total: number;
  ahorro_fiscal_total: number;
  capital_efectivo_neto: number;
  comparativa_modalidad: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile
  const UF_2026 = 30200; // Valor UF promedio 2026 (CLP), Banco Central
  const LIMITE_RGC_UF = 600; // Límite Rebaja Global Complementario en UF
  const LIMITE_RGC_CLP = LIMITE_RGC_UF * UF_2026; // ~18.120.000 CLP
  
  // Tasas retorno bruto fondos multifondos (% anual histórico estimado)
  const TASA_FONDO: { [key: string]: number } = {
    'A': 0.08,  // 8% - Renta variable alta
    'B': 0.07,  // 7% - Renta variable moderada
    'C': 0.055, // 5.5% - Mixto (40% variable)
    'D': 0.04,  // 4% - Conservador (20% variable)
    'E': 0.03   // 3% - Deuda pública
  };
  
  // Inputs validados
  const aporte_mensual = Math.max(0, i.aporte_mensual_clp);
  const modalidad = i.modalidad || 'B';
  const fondo = i.fondo || 'C';
  const anos = Math.max(1, i.anos_ahorro);
  const tasa_imp = Math.max(0, Math.min(i.tasa_impositiva / 100, 0.45)); // 0-45%
  const comision = Math.max(0, i.comision_afp / 100); // Como decimal
  const seguro = Math.max(0, i.seguro_invalidez / 100);
  
  // 1. Aporte anual total
  const aporte_anual = aporte_mensual * 12;
  
  // 2. Rebaja RGC (solo modalidad B, limitado a 600 UF)
  let rebaja_rgc_anual = 0;
  if (modalidad === 'B') {
    rebaja_rgc_anual = Math.min(aporte_anual, LIMITE_RGC_CLP);
  }
  
  // 3. Ahorro fiscal anual (RGC × tasa impositiva)
  const ahorro_fiscal_anual = rebaja_rgc_anual * tasa_imp;
  
  // 4. Tasa retorno bruta (del fondo elegido)
  const tasa_bruta = TASA_FONDO[fondo] || TASA_FONDO['C'];
  
  // 5. Tasa retorno neta (bruta - comisión - seguro)
  const tasa_retorno_neta = tasa_bruta - comision - seguro;
  const tasa_neta = Math.max(-0.05, tasa_retorno_neta); // Piso -5% por prudencia
  
  // 6. Capital final sin interés (solo aportes)
  const capital_final_sin_interes = aporte_anual * anos;
  
  // 7. Capital final con interés (capitalización compuesta anual)
  // Fórmula: Saldo_final = Aporte × [((1 + r)^n - 1) / r] × (1 + r)
  // Simplificado: suma año a año
  let capital_modalidad_a = 0;
  let capital_modalidad_b = 0;
  
  for (let anio = 1; anio <= anos; anio++) {
    // Modalidad A: solo aportes + rendimiento, sin ahorro fiscal
    capital_modalidad_a = capital_modalidad_a * (1 + tasa_neta) + aporte_anual;
    
    // Modalidad B: aportes + rendimiento + ahorro fiscal reinvertido
    capital_modalidad_b = capital_modalidad_b * (1 + tasa_neta) + aporte_anual;
    if (anio <= anos) {
      // Reinvertimos el ahorro fiscal anual con la misma tasa
      capital_modalidad_b += ahorro_fiscal_anual;
    }
  }
  
  const capital_final_con_interes = modalidad === 'A' ? capital_modalidad_a : capital_modalidad_b;
  
  // 8. Rendimiento acumulado
  const rendimiento_total = capital_final_con_interes - capital_final_sin_interes;
  
  // 9. Ahorro fiscal total (suma anual)
  const ahorro_fiscal_total = ahorro_fiscal_anual * anos;
  
  // 10. Capital efectivo neto (capital final + ahorro fiscal acumulado, si se reinvierte)
  // Ya incluido en capital_modalidad_b, pero para claridad:
  const capital_efectivo_neto = modalidad === 'B' ? capital_final_con_interes : capital_final_con_interes + (ahorro_fiscal_total * Math.pow(1 + tasa_neta, anos / 2));
  
  // 11. Comparativa A vs B
  // Ventaja B = Capital B (con ahorro fiscal reinvertido) - Capital A
  const comparativa_modalidad = capital_modalidad_b - capital_modalidad_a;
  
  // 12. Tasa retorno neta como porcentaje para output
  const tasa_retorno_neta_pct = tasa_neta * 100;
  
  return {
    aporte_anual_total: Math.round(aporte_anual),
    rebaja_rgc_anual: Math.round(rebaja_rgc_anual),
    ahorro_fiscal_anual: Math.round(ahorro_fiscal_anual),
    tasa_retorno_neta: tasa_retorno_neta_pct,
    capital_final_sin_interes: Math.round(capital_final_sin_interes),
    capital_final_con_interes: Math.round(capital_final_con_interes),
    rendimiento_total: Math.round(rendimiento_total),
    ahorro_fiscal_total: Math.round(ahorro_fiscal_total),
    capital_efectivo_neto: Math.round(capital_efectivo_neto),
    comparativa_modalidad: Math.round(comparativa_modalidad)
  };
}
