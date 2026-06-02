export interface Inputs {
  ingresos_mensual_alimentante: number;
  descuentos_legales: number;
  numero_hijos: number;
  tipo_custodia: 'exclusiva_otro' | 'compartida_50' | 'compartida_alterno';
  tiene_otros_hijos: 'no' | 'si_cantidad';
  cantidad_otros_hijos?: number;
  gastos_educacion_anual?: number;
  gastos_salud_anual?: number;
  gastos_actividades?: number;
  capacidad_economica?: 'normal' | 'reducida' | 'superior';
}

export interface Outputs {
  ingreso_liquido: number;
  pension_base: number;
  ajuste_custodia: number;
  pension_custodia: number;
  gastos_extraordinarios: number;
  pension_total_estimada: number;
  rango_minimo: number;
  rango_maximo: number;
  modalidad_pago: string;
  advertencia: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - Ley 14.908
  const PORCENTAJE_MINIMO = 0.30; // 30% ingreso líquido (Decreto 993/1960)
  const PORCENTAJE_MAXIMO = 0.50; // 50% ingreso líquido
  const PORCENTAJE_NORMAL = 0.40; // 40% capacidad económica normal (jurisprudencia)
  
  // Ajustes custodia según tribunales familia
  const AJUSTES_CUSTODIA: Record<string, number> = {
    'exclusiva_otro': 0.0,      // Sin ajuste, aplica porcentaje íntegro
    'compartida_50': -0.30,     // Reduce 30% (c/progenitor aporta proporcionalmente)
    'compartida_alterno': -0.20 // Reduce 20% si alternancia semanas
  };
  
  // Ajuste capacidad económica (tribunal considera contexto)
  const AJUSTES_CAPACIDAD: Record<string, number> = {
    'normal': 0.0,
    'reducida': -0.10,    // Reduce a 25-30% si desempleo/enfermedad
    'superior': 0.10      // Aumenta a 45-50% si múltiples ingresos/patrimonio
  };

  // 1. CÁLCULO INGRESO LÍQUIDO
  // Se descuentan AFP (~10%), Isapre/Fonasa (~7%), impuesto (~5-20%)
  const descuento_decimal = i.descuentos_legales / 100;
  const ingreso_liquido = i.ingresos_mensual_alimentante * (1 - descuento_decimal);

  // 2. RANGO BASE (30-50%)
  const rango_minimo = ingreso_liquido * PORCENTAJE_MINIMO;
  const rango_maximo = ingreso_liquido * PORCENTAJE_MAXIMO;

  // 3. SELECCIONAR PORCENTAJE SEGÚN CAPACIDAD
  const ajuste_cap = AJUSTES_CAPACIDAD[i.capacidad_economica || 'normal'];
  const porcentaje_aplicable = PORCENTAJE_NORMAL + ajuste_cap;
  const pension_base = ingreso_liquido * porcentaje_aplicable;

  // 4. AJUSTE POR TIPO DE CUSTODIA
  const ajuste_custodia_decimal = AJUSTES_CUSTODIA[i.tipo_custodia] || 0;
  const pension_custodia = pension_base * (1 + ajuste_custodia_decimal);

  // 5. AJUSTE POR OTROS HIJOS ALIMENTANDOS
  // Si tiene otros hijos, se reduce proporcionalmente la cuota
  let pension_ajustada = pension_custodia;
  if (i.tiene_otros_hijos === 'si_cantidad' && i.cantidad_otros_hijos && i.cantidad_otros_hijos > 0) {
    const total_hijos = i.numero_hijos + i.cantidad_otros_hijos;
    const cuota_por_hijo = pension_custodia / i.numero_hijos;
    pension_ajustada = cuota_por_hijo * i.numero_hijos; // Se mantiene pero se considera prorrateo
    // En práctica tribunal puede reducir 10-20% por cada hijo adicional
    const factor_reduccion = 1 - (i.cantidad_otros_hijos * 0.05); // 5% por hijo adicional
    pension_ajustada = pension_custodia * Math.max(factor_reduccion, 0.60);
  }

  // 6. GASTOS EXTRAORDINARIOS (se suman a pensión)
  let gastos_extraordinarios = 0;
  
  if (i.gastos_educacion_anual && i.gastos_educacion_anual > 0) {
    gastos_extraordinarios += i.gastos_educacion_anual / 12;
  }
  if (i.gastos_salud_anual && i.gastos_salud_anual > 0) {
    gastos_extraordinarios += i.gastos_salud_anual / 12;
  }
  if (i.gastos_actividades && i.gastos_actividades > 0) {
    gastos_extraordinarios += i.gastos_actividades;
  }

  // 7. PENSIÓN TOTAL ESTIMADA
  const pension_total_estimada = pension_ajustada + gastos_extraordinarios;

  // 8. MODALIDAD DE PAGO
  let modalidad_pago = 'Pago mensual mediante depósito a cuenta madre o tutor';
  if (pension_total_estimada > 2000000) {
    modalidad_pago = 'Pago mensual (depósito) + acuerdo para gastos extra (educación/salud con documentación)';
  }
  if (i.tipo_custodia === 'compartida_50') {
    modalidad_pago = 'Pago mensual reducido por custodia compartida + aportes proporcionales gastos extraordinarios';
  }

  // 9. ADVERTENCIA LEGAL
  const advertencia = 'ADVERTENCIA: Esta calculadora es ESTIMATIVA. El tribunal de familia establece monto final según pruebas (boletas, contrato, SII, patrimonio). No reemplaza sentencia. Actualiza cada 2 años o ante cambio ingresos. Mora genera reajuste UTM + 1,5% mensual. Consulta abogado familia antes de procedimiento.';

  // Redondear a miles (pesos chilenos)
  const redondear = (val: number) => Math.round(val / 1000) * 1000;

  const totalDisp = redondear(pension_total_estimada);
  const pensionDisp = redondear(pension_ajustada);
  const gastosDisp = redondear(gastos_extraordinarios);
  const liquidoDisp = redondear(ingreso_liquido);
  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const pctLiquido = liquidoDisp > 0 ? (totalDisp / liquidoDisp) * 100 : 0;

  const _insight = {
    title: 'Pensión estimada',
    text: `Sobre un ingreso líquido de **${fmtCLP(liquidoDisp)}**, la pensión estimada es **${fmtCLP(totalDisp)}** al mes (≈${pctLiquido.toFixed(0)}% de tu líquido)${gastosDisp > 0 ? `, incluyendo ${fmtCLP(gastosDisp)} de gastos extraordinarios` : ''}. El rango legal típico va de ${fmtCLP(redondear(rango_minimo))} a ${fmtCLP(redondear(rango_maximo))}. Es una estimación: el tribunal fija el monto final.`,
    tone: totalDisp > redondear(rango_maximo) ? 'warn' : 'neutral',
    icon: '⚖️',
  };

  // Donut solo si hay gastos extraordinarios que sumar a la pensión base
  const gastosSlice = totalDisp - pensionDisp;
  const _chart = (gastosDisp > 0 && gastosSlice > 0 && pensionDisp > 0) ? {
    type: 'doughnut',
    slices: [
      { label: 'Pensión mensual', value: pensionDisp },
      { label: 'Gastos extraordinarios', value: gastosSlice },
    ],
    prefix: '$',
    centerValue: fmtCLP(totalDisp),
    centerLabel: 'Total/mes',
    ariaLabel: `Pensión total de ${fmtCLP(totalDisp)}: ${fmtCLP(pensionDisp)} de pensión mensual más ${fmtCLP(gastosSlice)} de gastos extraordinarios`,
  } : undefined;

  return {
    ingreso_liquido: liquidoDisp,
    pension_base: redondear(pension_base),
    ajuste_custodia: Math.round(ajuste_custodia_decimal * 100),
    pension_custodia: pensionDisp,
    gastos_extraordinarios: gastosDisp,
    pension_total_estimada: totalDisp,
    rango_minimo: redondear(rango_minimo),
    rango_maximo: redondear(rango_maximo),
    modalidad_pago: modalidad_pago,
    advertencia: advertencia,
    _insight,
    _chart
  };
}
