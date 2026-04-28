export interface Inputs {
  salario_base_regulador: number;
  semanas_cotizadas: number;
  num_hijos_menores: number;
  num_padres_dependientes: number;
  tiene_minusvalidos: boolean;
  semanas_matrimonio: number;
}

export interface Outputs {
  pension_mensual_base: number;
  asignacion_familiar_mensual: number;
  pension_total_mensual: number;
  aguinaldo_anual: number;
  ingresos_anuales_brutos: number;
  cumple_requisitos: boolean;
  mensaje_validacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 IMSS (Ley del Seguro Social)
  const PORCENTAJE_PENSION_VIUDEZ = 0.90; // 90% pensión
  const PORCENTAJE_ASIGNACION_FAMILIAR = 0.10; // 10% por cada beneficiario
  const SEMANAS_COTIZADAS_MINIMO = 150; // Requisito legal
  const SEMANAS_MATRIMONIO_MINIMO = 52; // 1 año
  const FACTOR_AGUINALDO = 1.33; // 1 mes y 10 días

  // Validación de requisitos legales
  const cumple_semanas_cotizadas = i.semanas_cotizadas >= SEMANAS_COTIZADAS_MINIMO;
  const cumple_matrimonio = i.semanas_matrimonio >= SEMANAS_MATRIMONIO_MINIMO || i.num_hijos_menores > 0;
  const cumple_requisitos = cumple_semanas_cotizadas && cumple_matrimonio;

  // Construcción de mensaje de validación
  let mensaje_validacion = '';
  if (!cumple_semanas_cotizadas) {
    mensaje_validacion += `⚠ Semanas cotizadas insuficientes: ${i.semanas_cotizadas} (mínimo 150). `;
  } else {
    mensaje_validacion += `✓ Semanas cotizadas: ${i.semanas_cotizadas} (cumple). `;
  }

  if (!cumple_matrimonio) {
    if (i.num_hijos_menores === 0) {
      mensaje_validacion += `⚠ Matrimonio insuficiente: ${i.semanas_matrimonio} semanas (mínimo 52, o hijos en común). `;
    }
  } else {
    if (i.num_hijos_menores > 0) {
      mensaje_validacion += `✓ Hijos en común (dispensa de 1 año matrimonio). `;
    } else {
      mensaje_validacion += `✓ Matrimonio: ${i.semanas_matrimonio} semanas (cumple). `;
    }
  }

  if (cumple_requisitos) {
    mensaje_validacion += '✓ APTO para pensión de viudez IMSS.';
  } else {
    mensaje_validacion += '✗ NO APTO actualmente. Faltan requisitos legales.';
  }

  // Cálculo de pensión base (90% salario regulador)
  const pension_mensual_base = i.salario_base_regulador * PORCENTAJE_PENSION_VIUDEZ;

  // Cálculo de beneficiarios para asignación familiar
  // Máximo teórico: viudo/a + hijos + padres (hasta 3-4 beneficiarios)
  const num_beneficiarios_asignacion = i.num_hijos_menores + i.num_padres_dependientes;
  const asignacion_familiar_mensual = pension_mensual_base * PORCENTAJE_ASIGNACION_FAMILIAR * num_beneficiarios_asignacion;

  // Pensión total mensual
  const pension_total_mensual = pension_mensual_base + asignacion_familiar_mensual;

  // Aguinaldo anual (1.33 meses de pensión total)
  const aguinaldo_anual = pension_total_mensual * FACTOR_AGUINALDO;

  // Ingresos anuales brutos (12 meses + aguinaldo)
  const ingresos_anuales_brutos = pension_total_mensual * 12 + aguinaldo_anual;

  return {
    pension_mensual_base: Math.round(pension_mensual_base * 100) / 100,
    asignacion_familiar_mensual: Math.round(asignacion_familiar_mensual * 100) / 100,
    pension_total_mensual: Math.round(pension_total_mensual * 100) / 100,
    aguinaldo_anual: Math.round(aguinaldo_anual * 100) / 100,
    ingresos_anuales_brutos: Math.round(ingresos_anuales_brutos * 100) / 100,
    cumple_requisitos,
    mensaje_validacion
  };
}
