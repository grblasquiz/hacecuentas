export interface Inputs {
  renta_anual_bruta: number;
  gastos_ibi: number;
  gastos_comunidad: number;
  gastos_reparaciones: number;
  intereses_hipoteca: number;
  otros_gastos: number;
  vivienda_habitual_inquilino: 'si_reduccion_60' | 'si_reduccion_50' | 'no';
  base_imponible_general: number;
}

export interface Outputs {
  rendimiento_bruto: number;
  gastos_totales_deducibles: number;
  rendimiento_neto_sin_reduccion: number;
  porcentaje_reduccion_aplicado: number;
  rendimiento_neto_final: number;
  tipo_marginal_irpf: number;
  cuota_irpf_estimada: number;
  nota_informativa: string;
}

export function compute(i: Inputs): Outputs {
  // Fuente: AEAT 2026, Ley Vivienda 2023, Ministerio Hacienda
  
  // Paso 1: Rendimiento bruto
  const rendimiento_bruto = i.renta_anual_bruta;
  
  // Paso 2: Gastos deducibles totales
  const gastos_totales_deducibles = 
    i.gastos_ibi + 
    i.gastos_comunidad + 
    i.gastos_reparaciones + 
    i.intereses_hipoteca + 
    i.otros_gastos;
  
  // Paso 3: Rendimiento neto sin reducción
  const rendimiento_neto_sin_reduccion = Math.max(
    0, 
    rendimiento_bruto - gastos_totales_deducibles
  );
  
  // Paso 4: Aplicar reducción por vivienda habitual
  let porcentaje_reduccion_aplicado = 0;
  let rendimiento_neto_final = rendimiento_neto_sin_reduccion;
  
  if (i.vivienda_habitual_inquilino === 'si_reduccion_60') {
    // Reducción del 60% (anterior Ley Vivienda 2023, contratos pre-2023)
    // Fuente: AEAT, normativa IRPF anterior 2023
    porcentaje_reduccion_aplicado = 60;
    rendimiento_neto_final = rendimiento_neto_sin_reduccion * 0.40;
  } else if (i.vivienda_habitual_inquilino === 'si_reduccion_50') {
    // Reducción del 50% (Ley Vivienda 2023, contratos 2023+)
    // Fuente: BOE, Ley 12/2023 de Vivienda
    porcentaje_reduccion_aplicado = 50;
    rendimiento_neto_final = rendimiento_neto_sin_reduccion * 0.50;
  } else {
    // Sin reducción (alquiler turístico, vivienda secundaria, no aplica)
    porcentaje_reduccion_aplicado = 0;
    rendimiento_neto_final = rendimiento_neto_sin_reduccion;
  }
  
  // Paso 5: Determinar tipo marginal IRPF 2026
  // Fuente: Ministerio de Hacienda, tramos IRPF 2026 para no residentes
  // Estos son tramos aproximados 2026; consultar AEAT para valores exactos vigentes
  const base_imponible_total = i.base_imponible_general + rendimiento_neto_final;
  
  let tipo_marginal_irpf = 0;
  
  if (base_imponible_total <= 10000) {
    tipo_marginal_irpf = 0.19; // 19%
  } else if (base_imponible_total <= 20000) {
    tipo_marginal_irpf = 0.21; // 21%
  } else if (base_imponible_total <= 35000) {
    tipo_marginal_irpf = 0.24; // 24%
  } else if (base_imponible_total <= 60000) {
    tipo_marginal_irpf = 0.30; // 30%
  } else if (base_imponible_total <= 300000) {
    tipo_marginal_irpf = 0.37; // 37%
  } else if (base_imponible_total <= 600000) {
    tipo_marginal_irpf = 0.45; // 45%
  } else {
    tipo_marginal_irpf = 0.45; // 45%
  }
  
  // Paso 6: Cuota IRPF estimada por alquiler
  // Nota: Esta es una estimación sobre el rendimiento neto final al tipo marginal.
  // La cuota final depende de deducciones personales, mínimo personal, retenciones practicadas, etc.
  const cuota_irpf_estimada = Math.max(0, rendimiento_neto_final * tipo_marginal_irpf);
  
  // Nota informativa
  let nota_informativa = '';
  if (i.vivienda_habitual_inquilino === 'si_reduccion_60') {
    nota_informativa = 
      'Reducción del 60% aplicada (contrato anterior 2023). ' +
      'Retención del inquilino: 19% de la renta bruta. ' +
      'Cuota estimada es orientativa; consulta tu declaración IRPF 2026 para resultado final.';
  } else if (i.vivienda_habitual_inquilino === 'si_reduccion_50') {
    nota_informativa = 
      'Reducción del 50% aplicada (Ley Vivienda 2023, contrato 2023+). ' +
      'Requiere: precio alquiler ≤ referencia autonómica, propietario persona física, vivienda habitual. ' +
      'Retención del inquilino: 19%. Cuota estimada; verifica con AEAT.';
  } else {
    nota_informativa = 
      'Sin reducción aplicada. Tributas el 100% del rendimiento neto. ' +
      'Retención 19% del inquilino se aplica. Cuota IRPF estimada; ' +
      'consulta tu base imponible y deducciones en AEAT.';
  }
  
  return {
    rendimiento_bruto: Math.round(rendimiento_bruto * 100) / 100,
    gastos_totales_deducibles: Math.round(gastos_totales_deducibles * 100) / 100,
    rendimiento_neto_sin_reduccion: Math.round(rendimiento_neto_sin_reduccion * 100) / 100,
    porcentaje_reduccion_aplicado,
    rendimiento_neto_final: Math.round(rendimiento_neto_final * 100) / 100,
    tipo_marginal_irpf: Math.round(tipo_marginal_irpf * 10000) / 100, // en porcentaje
    cuota_irpf_estimada: Math.round(cuota_irpf_estimada * 100) / 100,
    nota_informativa
  };
}
