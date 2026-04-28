export interface Inputs {
  salario_mensual: number;
  num_dependientes: number;
  es_independiente: boolean;
}

export interface Outputs {
  deduccion_unitaria_mensual: number;
  deduccion_total_mensual: number;
  deduccion_total_anual: number;
  ahorro_impuesto_estimado: number;
  porcentaje_ingreso: number;
  detalle_calculo: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN
  const UVT_2026 = 43282; // Resolución DIAN 000052/2025
  const LIMITE_UVT_DEPENDIENTE = 32; // Artículo 31 Estatuto Tributario
  const PORCENTAJE_DEDUCCION = 0.10; // 10% ingreso laboral
  const TARIFA_IMPUESTO_ESTIMADA = 0.28; // Tarifa marginal promedio

  // Validaciones
  if (i.salario_mensual < 0) {
    return {
      deduccion_unitaria_mensual: 0,
      deduccion_total_mensual: 0,
      deduccion_total_anual: 0,
      ahorro_impuesto_estimado: 0,
      porcentaje_ingreso: 0,
      detalle_calculo: 'Error: Salario no puede ser negativo'
    };
  }

  if (i.num_dependientes < 0 || i.num_dependientes > 10) {
    return {
      deduccion_unitaria_mensual: 0,
      deduccion_total_mensual: 0,
      deduccion_total_anual: 0,
      ahorro_impuesto_estimado: 0,
      porcentaje_ingreso: 0,
      detalle_calculo: 'Error: Número de dependientes debe estar entre 0 y 10'
    };
  }

  // Cálculo deducción unitaria mensual
  const deduccion_por_porcentaje = i.salario_mensual * PORCENTAJE_DEDUCCION;
  const limite_uvt_pesos = LIMITE_UVT_DEPENDIENTE * UVT_2026;
  const deduccion_unitaria_mensual = Math.min(deduccion_por_porcentaje, limite_uvt_pesos);

  // Cálculo total
  const deduccion_total_mensual = deduccion_unitaria_mensual * i.num_dependientes;
  const deduccion_total_anual = deduccion_total_mensual * 12;

  // Ahorro impuesto estimado
  const ahorro_impuesto_estimado = deduccion_total_anual * TARIFA_IMPUESTO_ESTIMADA;

  // Porcentaje del ingreso deducido
  const porcentaje_ingreso = i.salario_mensual > 0 
    ? (deduccion_total_mensual / i.salario_mensual) * 100 
    : 0;

  // Detalle del cálculo
  const detalle = [
    `UVT 2026: $${UVT_2026.toLocaleString('es-CO')}`,
    `Límite UVT dependiente: ${LIMITE_UVT_DEPENDIENTE} = $${limite_uvt_pesos.toLocaleString('es-CO', {maximumFractionDigits: 0})}`,
    `10% de $${i.salario_mensual.toLocaleString('es-CO')} = $${deduccion_por_porcentaje.toLocaleString('es-CO', {maximumFractionDigits: 0})}`,
    `Deducción unitaria (menor de ambos): $${deduccion_unitaria_mensual.toLocaleString('es-CO', {maximumFractionDigits: 0})}`,
    `Por ${i.num_dependientes} dependiente(s): $${deduccion_total_mensual.toLocaleString('es-CO', {maximumFractionDigits: 0})}/mes`,
    `Deducción anual (×12 meses): $${deduccion_total_anual.toLocaleString('es-CO', {maximumFractionDigits: 0})}`,
    `Ahorro estimado renta (~28%): $${ahorro_impuesto_estimado.toLocaleString('es-CO', {maximumFractionDigits: 0})}/año`
  ].join('\n');

  return {
    deduccion_unitaria_mensual: Math.round(deduccion_unitaria_mensual),
    deduccion_total_mensual: Math.round(deduccion_total_mensual),
    deduccion_total_anual: Math.round(deduccion_total_anual),
    ahorro_impuesto_estimado: Math.round(ahorro_impuesto_estimado),
    porcentaje_ingreso: Math.round(porcentaje_ingreso * 100) / 100,
    detalle_calculo: detalle
  };
}
