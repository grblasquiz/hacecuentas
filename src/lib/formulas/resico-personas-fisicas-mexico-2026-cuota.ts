export interface Inputs {
  ingresos_mensuales: number;
  meses_actividad: number;
  aportaciones_imss: number;
}

export interface Outputs {
  ingresos_anuales: number;
  tasa_isr_aplicable: number;
  isr_provisional_anual: number;
  descuento_imss: number;
  isr_neto_anual: number;
  isr_mensual: number;
  tasa_efectiva: number;
  cuota_minima_aplicada: string;
  cumple_tope_anual: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes RESICO 2026 según SAT
  const TOPE_ANUAL_RESICO = 3_500_000; // $3.5M límite anual
  const DESCUENTO_IMSS_PORCENTAJE = 0.50; // máximo 50% del ISR provisional

  // Tramos y tasas RESICO 2026
  const tramos = [
    { limite: 25_000, tasa: 0.01 },      // 1%
    { limite: 50_000, tasa: 0.011 },     // 1.1%
    { limite: 83_333, tasa: 0.015 },     // 1.5%
    { limite: 208_333, tasa: 0.02 },     // 2%
    { limite: Infinity, tasa: 0.025 }    // 2.5%
  ];

  // 1. Calcular ingresos anuales
  const ingresos_anuales = i.ingresos_mensuales * i.meses_actividad;

  // 2. Verificar tope anual
  const cumple_tope = ingresos_anuales <= TOPE_ANUAL_RESICO;

  // 3. Determinar tasa ISR según último ingreso mensual
  let tasa_isr = 0.01; // valor por defecto
  for (const tramo of tramos) {
    if (i.ingresos_mensuales <= tramo.limite) {
      tasa_isr = tramo.tasa;
      break;
    }
  }

  // 4. Calcular ISR provisional anual
  const isr_provisional_anual = ingresos_anuales * tasa_isr;

  // 5. Calcular descuento por aportaciones IMSS (máximo 50% del provisional)
  const descuento_maximo_imss = isr_provisional_anual * DESCUENTO_IMSS_PORCENTAJE;
  const descuento_imss = Math.min(i.aportaciones_imss, descuento_maximo_imss);

  // 6. Calcular ISR neto anual
  const isr_neto_anual = Math.max(0, isr_provisional_anual - descuento_imss);

  // 7. ISR mensual aproximado
  const isr_mensual = isr_neto_anual / 12;

  // 8. Tasa efectiva
  const tasa_efectiva = ingresos_anuales > 0 
    ? (isr_neto_anual / ingresos_anuales) * 100 
    : 0;

  // 9. Mensajes descriptivos
  const cuota_minima_aplicada = cumple_tope 
    ? "No supera tope; verifica cuota mínima en SAT" 
    : "⚠️ SUPERA TOPE: debe cambiar a régimen general";

  const cumple_tope_anual = cumple_tope 
    ? `✓ Sí ($${ingresos_anuales.toLocaleString('es-MX', {maximumFractionDigits: 0})} ≤ $3.5M)` 
    : `✗ No ($${ingresos_anuales.toLocaleString('es-MX', {maximumFractionDigits: 0})} > $3.5M)`;

  // ── Gráfico: ISR provisional = ISR neto a pagar + descuento por IMSS ──
  const mxn = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const chart = descuento_imss > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'ISR neto a pagar', value: Math.round(isr_neto_anual) },
      { label: 'Descuento por IMSS', value: Math.round(descuento_imss) },
    ],
    prefix: '$',
    centerValue: mxn(isr_provisional_anual),
    centerLabel: 'ISR provisional anual',
    ariaLabel: 'ISR provisional anual dividido en ISR neto a pagar y descuento por aportaciones al IMSS',
  } : undefined;

  // ── Insight dinámico ──
  let insight;
  if (!cumple_tope) {
    insight = {
      title: 'Superaste el tope del RESICO',
      text: `Tus ingresos anuales (**${mxn(ingresos_anuales)}**) pasan el límite de **$3.5M**, así que ya no podés tributar en RESICO: debés migrar al **régimen general**, donde el ISR es bastante más alto.`,
      tone: 'warn' as const,
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Tu cuota en RESICO',
      text: `Con **${mxn(i.ingresos_mensuales)}/mes** caés en la tasa del **${(tasa_isr * 100).toFixed(2)}%**, lo que da un ISR de unos **${mxn(isr_mensual)}/mes** (**${mxn(isr_neto_anual)}** al año)${descuento_imss > 0 ? `, ya descontando **${mxn(descuento_imss)}** por tus aportaciones al IMSS` : ''}. Tu tasa efectiva queda en **${tasa_efectiva.toFixed(2)}%**, una de las grandes ventajas del régimen.`,
      tone: 'good' as const,
      icon: '🇲🇽',
    };
  }

  return {
    ingresos_anuales: Math.round(ingresos_anuales),
    tasa_isr_aplicable: tasa_isr * 100,
    isr_provisional_anual: Math.round(isr_provisional_anual),
    descuento_imss: Math.round(descuento_imss),
    isr_neto_anual: Math.round(isr_neto_anual),
    isr_mensual: Math.round(isr_mensual),
    tasa_efectiva: Number(tasa_efectiva.toFixed(2)),
    cuota_minima_aplicada,
    cumple_tope_anual,
    _chart: chart,
    _insight: insight
  };
}
