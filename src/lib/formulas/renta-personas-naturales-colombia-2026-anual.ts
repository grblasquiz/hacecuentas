export interface Inputs {
  ingreso_cedula_general: number;
  ingreso_pensiones: number;
  ingreso_no_laboral: number;
  dividendos_intereses: number;
  aporte_afp: number;
  aporte_salud: number;
  pension_voluntaria: number;
  deduccion_dependientes: number;
  deduccion_salud_prepagada: number;
  deduccion_educacion: number;
  rentas_exentas: number;
  impuestos_pagados: number;
}

export interface Outputs {
  ingreso_total_bruto: number;
  deductible_total: number;
  base_gravable: number;
  impuesto_neto: number;
  saldo_a_favor: number;
  anticipo_2027: number;
  tarifa_marginal: number;
  efectividad: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 DIAN
  const UVT_2026 = 45351; // Resolución DIAN enero 2026
  const LIMITE_EXENTO_BASE = 95 * UVT_2026; // $4.308.245
  const TASA_AFP = 0.04; // 4% obligatorio
  const TASA_SALUD = 0.04; // 4% obligatorio
  const MAX_PENSION_VOLUNTARIA_PCT = 0.30; // 30% del ingreso laboral

  // 1. Ingreso total bruto (suma de cédulas)
  const ingreso_total_bruto = 
    (i.ingreso_cedula_general || 0) + 
    (i.ingreso_pensiones || 0) + 
    (i.ingreso_no_laboral || 0) + 
    (i.dividendos_intereses || 0);

  // 2. Deducciones permitidas
  const deductible_total = 
    (i.aporte_afp || 0) + 
    (i.aporte_salud || 0) + 
    Math.min(i.pension_voluntaria || 0, i.ingreso_cedula_general * MAX_PENSION_VOLUNTARIA_PCT) +
    (i.deduccion_dependientes || 0) + 
    Math.min(i.deduccion_salud_prepagada || 0, 8 * UVT_2026) +
    Math.min(i.deduccion_educacion || 0, 20 * UVT_2026) +
    (i.rentas_exentas || 0);

  // 3. Base gravable depurada
  const base_gravable = Math.max(0, ingreso_total_bruto - deductible_total);

  // 4. Impuesto según tarifa progresiva DIAN 2026
  let impuesto_calculado = 0;
  let tarifa_marginal = 0;

  if (base_gravable <= LIMITE_EXENTO_BASE) {
    // 0–95 UVT: 0%
    impuesto_calculado = 0;
    tarifa_marginal = 0;
  } else if (base_gravable <= 150 * UVT_2026) {
    // 95–150 UVT: 5%
    impuesto_calculado = (base_gravable - LIMITE_EXENTO_BASE) * 0.05;
    tarifa_marginal = 5;
  } else if (base_gravable <= 360 * UVT_2026) {
    // 150–360 UVT: 12%
    impuesto_calculado = 
      (150 * UVT_2026 - LIMITE_EXENTO_BASE) * 0.05 +
      (base_gravable - 150 * UVT_2026) * 0.12;
    tarifa_marginal = 12;
  } else if (base_gravable <= 816 * UVT_2026) {
    // 360–816 UVT: 17%
    impuesto_calculado = 
      (150 * UVT_2026 - LIMITE_EXENTO_BASE) * 0.05 +
      (360 * UVT_2026 - 150 * UVT_2026) * 0.12 +
      (base_gravable - 360 * UVT_2026) * 0.17;
    tarifa_marginal = 17;
  } else if (base_gravable <= 2630 * UVT_2026) {
    // 816–2.630 UVT: 26%
    impuesto_calculado = 
      (150 * UVT_2026 - LIMITE_EXENTO_BASE) * 0.05 +
      (360 * UVT_2026 - 150 * UVT_2026) * 0.12 +
      (816 * UVT_2026 - 360 * UVT_2026) * 0.17 +
      (base_gravable - 816 * UVT_2026) * 0.26;
    tarifa_marginal = 26;
  } else {
    // >2.630 UVT: 37%
    impuesto_calculado = 
      (150 * UVT_2026 - LIMITE_EXENTO_BASE) * 0.05 +
      (360 * UVT_2026 - 150 * UVT_2026) * 0.12 +
      (816 * UVT_2026 - 360 * UVT_2026) * 0.17 +
      (2630 * UVT_2026 - 816 * UVT_2026) * 0.26 +
      (base_gravable - 2630 * UVT_2026) * 0.37;
    tarifa_marginal = 37;
  }

  // 5. Impuesto neto (resta impuestos pagados)
  const impuesto_neto = Math.max(0, impuesto_calculado - (i.impuestos_pagados || 0));

  // 6. Saldo a favor / saldo a pagar
  const saldo_a_favor = impuesto_calculado > 0 
    ? Math.min((i.impuestos_pagados || 0) - impuesto_calculado, 0) 
    : 0;

  // 7. Anticipo 2027 (50% del impuesto neto)
  const anticipo_2027 = Math.max(0, impuesto_neto * 0.5);

  // 8. Tasa efectiva
  const efectividad = ingreso_total_bruto > 0 
    ? (impuesto_calculado / ingreso_total_bruto) * 100 
    : 0;

  const ingreso_r = Math.round(ingreso_total_bruto);
  const deduc_r = Math.round(deductible_total);
  const base_r = Math.round(base_gravable);
  const neto_r = Math.round(impuesto_neto);
  const favor_r = Math.round(saldo_a_favor);
  const efec_r = Math.round(efectividad * 100) / 100;
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  // INSIGHT — interpreta carga y situación de declaración
  const tone: 'good' | 'warn' | 'neutral' =
    neto_r > 0 ? 'warn' : favor_r < 0 ? 'good' : 'neutral';
  let situacion: string;
  if (neto_r > 0) {
    situacion = `Te queda **${fmtCOP(neto_r)} por pagar** a la DIAN, con un anticipo de renta 2027 de ${fmtCOP(anticipo_2027)}.`;
  } else if (favor_r < 0) {
    situacion = `Tenés un **saldo a favor de ${fmtCOP(Math.abs(favor_r))}** (retenciones superan el impuesto): podés solicitar devolución o compensación.`;
  } else {
    situacion = `No generás impuesto a cargo: tu base gravable queda en o por debajo del mínimo exento.`;
  }
  const _insight = {
    title: 'Tu declaración de renta 2026',
    text: `Sobre ${fmtCOP(ingreso_r)} de ingresos brutos, tras ${fmtCOP(deduc_r)} en deducciones y rentas exentas, tu base gravable es **${fmtCOP(base_r)}** y caés en la tarifa marginal del **${tarifa_marginal}%** (tasa efectiva ${efec_r}%). ${situacion}`,
    tone,
    icon: '🇨🇴',
  };

  // CHART — donut: ingreso bruto = base gravable + deducciones/exentas
  const _chart = (deduc_r > 0 && base_r > 0 && deduc_r + base_r === ingreso_r) ? {
    type: 'doughnut',
    slices: [
      { label: 'Base gravable', value: base_r },
      { label: 'Deducciones y exentas', value: deduc_r },
    ],
    prefix: '$',
    centerValue: fmtCOP(ingreso_r),
    centerLabel: 'Ingreso bruto',
    ariaLabel: `Composición del ingreso bruto de ${fmtCOP(ingreso_r)}: base gravable ${fmtCOP(base_r)} y deducciones/exentas ${fmtCOP(deduc_r)}.`,
  } : undefined;

  const out: Outputs = {
    ingreso_total_bruto: ingreso_r,
    deductible_total: deduc_r,
    base_gravable: base_r,
    impuesto_neto: neto_r,
    saldo_a_favor: favor_r,
    anticipo_2027: Math.round(anticipo_2027),
    tarifa_marginal: tarifa_marginal,
    efectividad: efec_r,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}
