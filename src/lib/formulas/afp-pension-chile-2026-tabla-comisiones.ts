export interface Inputs {
  sueldo_bruto: number;
  afp_seleccionada: 'modelo' | 'uno' | 'habitat' | 'provida' | 'capital' | 'cuprum' | 'planvital';
  fondo_seleccionado: 'A' | 'B' | 'C' | 'D' | 'E';
  edad: number;
}

export interface Outputs {
  salario_imponible: number;
  aporte_obligatorio_10: number;
  comision_afp: number;
  seguro_sis: number;
  descuento_total_mensual: number;
  descuento_anual: number;
  rentabilidad_fondo_historica: number;
  proyeccion_10_anos: number;
  comparativa_afp_ventaja: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 SII
  const TASA_IMPONIBLE = 0.98; // Aproximación: salario imponible ~98% bruto
  const APORTE_OBLIGATORIO = 0.10; // 10% obligatorio AFP
  const TASA_SIS_BASE = 0.0075; // SIS base ~0,75% (variable por edad, aquí promedio)
  
  // Comisiones AFP 2026 según SII
  const COMISIONES_AFP: Record<string, number> = {
    'capital': 0.0057,
    'uno': 0.0076,
    'habitat': 0.0080,
    'planvital': 0.0089,
    'modelo': 0.0119,
    'provida': 0.0148,
    'cuprum': 0.0149
  };
  
  // Rentabilidades históricas 2024 por fondo (anual)
  const RENTABILIDADES_FONDO: Record<string, number> = {
    'A': 8.5,
    'B': 7.2,
    'C': 6.1,
    'D': 5.5,
    'E': 5.2
  };
  
  // Ajuste SIS por edad (simplificado)
  const getSIS = (edad: number, base: number): number => {
    if (edad < 35) return base * 0.8; // Menor prima jóvenes
    if (edad < 50) return base;
    if (edad < 60) return base * 1.3;
    return base * 1.6; // Mayores 60 pagan más
  };
  
  // Cálculos
  const salario_imponible = i.sueldo_bruto * TASA_IMPONIBLE;
  const aporte_obligatorio_10 = salario_imponible * APORTE_OBLIGATORIO;
  const comision_afp = salario_imponible * (COMISIONES_AFP[i.afp_seleccionada] || COMISIONES_AFP['uno']);
  const seguro_sis = salario_imponible * getSIS(i.edad, TASA_SIS_BASE);
  const descuento_total_mensual = aporte_obligatorio_10 + comision_afp + seguro_sis;
  const descuento_anual = descuento_total_mensual * 12;
  const rentabilidad_fondo_historica = RENTABILIDADES_FONDO[i.fondo_seleccionado] || 6.1;
  
  // Proyección 10 años: suma aportes anuales + rendimiento compuesto
  const aporte_anual = descuento_total_mensual * 12;
  const tasa_rentabilidad_proyectada = 0.05; // 5% promedio anual para proyección lineal
  let saldo_proyectado = 0;
  for (let año = 0; año < 10; año++) {
    saldo_proyectado += aporte_anual;
    saldo_proyectado = saldo_proyectado * (1 + tasa_rentabilidad_proyectada);
  }
  const proyeccion_10_anos = Math.round(saldo_proyectado);
  
  // Comparativa vs AFP Cuprum (más cara)
  const comision_cuprum = salario_imponible * COMISIONES_AFP['cuprum'];
  const comparativa_afp_ventaja = Math.round(comision_cuprum - comision_afp);
  
  return {
    salario_imponible: Math.round(salario_imponible),
    aporte_obligatorio_10: Math.round(aporte_obligatorio_10),
    comision_afp: Math.round(comision_afp),
    seguro_sis: Math.round(seguro_sis),
    descuento_total_mensual: Math.round(descuento_total_mensual),
    descuento_anual: Math.round(descuento_anual),
    rentabilidad_fondo_historica: rentabilidad_fondo_historica,
    proyeccion_10_anos: proyeccion_10_anos,
    comparativa_afp_ventaja: comparativa_afp_ventaja
  };
}
