export interface Inputs {
  canon_mensual: number;
  meses_activos: number;
  gasto_mantenimiento_anual: number;
  impuesto_predial_anual: number;
  interes_hipoteca_anual: number;
  valor_inmueble: number;
  tasa_depreciacion: number;
  cedulante_empleado: 'no' | 'si';
  inquilino_tipo: 'persona_natural' | 'persona_moral';
}

export interface Outputs {
  canon_anual: number;
  total_deducciones: number;
  depreciacion_anual: number;
  renta_liquida_cedular: number;
  retencion_inquilino: number;
  tarifa_marginal: number;
  isr_estimado: number;
  flujo_neto_anual: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 DIAN Colombia
  const UVT_2026 = 368348; // Aproximado, sujeto a confirmación DIAN

  // Tramos ISR renta no laboral 2026 (límites en UVT)
  const TRAMOS = [
    { limite_uvt: 107, tarifa: 0.0, limite_pesos: 107 * UVT_2026 },
    { limite_uvt: 223, tarifa: 0.08, limite_pesos: 223 * UVT_2026 },
    { limite_uvt: 445, tarifa: 0.14, limite_pesos: 445 * UVT_2026 },
    { limite_uvt: 890, tarifa: 0.19, limite_pesos: 890 * UVT_2026 },
    { limite_uvt: Infinity, tarifa: 0.24, limite_pesos: Infinity },
  ];

  const RETENCION_PERSONA_MORAL = 0.035; // 3.5% por Resolución DIAN

  // Cálculos base
  const canon_anual = i.canon_mensual * i.meses_activos;
  const depreciacion_anual = i.valor_inmueble > 0 ? i.valor_inmueble * (i.tasa_depreciacion / 100) : 0;
  const total_deducciones =
    (i.gasto_mantenimiento_anual || 0) +
    (i.impuesto_predial_anual || 0) +
    (i.interes_hipoteca_anual || 0) +
    depreciacion_anual;

  const renta_liquida_cedular = Math.max(0, canon_anual - total_deducciones);

  // Retención en la fuente
  const retencion_inquilino =
    i.inquilino_tipo === 'persona_moral' ? canon_anual * RETENCION_PERSONA_MORAL : 0;

  // Determinación tarifa marginal ISR
  let tarifa_marginal = 0.0;
  for (const tramo of TRAMOS) {
    if (renta_liquida_cedular <= tramo.limite_pesos) {
      tarifa_marginal = tramo.tarifa;
      break;
    }
  }

  // ISR estimado
  const isr_estimado = Math.max(0, renta_liquida_cedular * tarifa_marginal - retencion_inquilino);

  // Flujo neto
  const flujo_neto_anual = canon_anual - total_deducciones - isr_estimado;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const canonR = Math.round(canon_anual);
  const dedR = Math.round(total_deducciones);
  const isrR = Math.round(isr_estimado);
  const flujoR = Math.round(flujo_neto_anual);
  const rentabilidad = canonR > 0 ? Math.round((flujoR / canonR) * 1000) / 10 : 0;

  const _insight = {
    title: flujoR < 0 ? 'El arriendo no cubre los costos' : 'Flujo neto del arriendo',
    text: flujoR < 0
      ? `Tras deducciones (**${fmtCOP(dedR)}**) e ISR, el inmueble te deja un flujo negativo de **${fmtCOP(flujoR)}** al año: los gastos superan el canon recibido.`
      : `De un canon anual de **${fmtCOP(canonR)}** te quedan **${fmtCOP(flujoR)}** netos tras deducciones e ISR (tarifa marginal **${Math.round(tarifa_marginal * 100)}%**). Conservás el **${rentabilidad}%** del arriendo bruto.`,
    tone: flujoR < 0 ? 'warn' : rentabilidad >= 70 ? 'good' : 'neutral',
    icon: '🏠',
  };

  const out: Outputs = {
    canon_anual: canonR,
    total_deducciones: dedR,
    depreciacion_anual: Math.round(depreciacion_anual),
    renta_liquida_cedular: Math.round(renta_liquida_cedular),
    retencion_inquilino: Math.round(retencion_inquilino),
    tarifa_marginal,
    isr_estimado: isrR,
    flujo_neto_anual: flujoR,
    _insight,
  };

  // Donut: destino del canon bruto = flujo neto + deducciones + ISR (suman el canon anual)
  if (canonR > 0 && flujoR >= 0) {
    // flujo derivado de los componentes redondeados para que las slices sumen EXACTO el canon
    const flujoSlice = canonR - dedR - isrR;
    const slices = [
      { label: 'Flujo neto para vos', value: flujoSlice },
      { label: 'Deducciones (gastos, predial, etc.)', value: dedR },
      { label: 'ISR estimado', value: isrR },
    ].filter(s => s.value > 0);
    if (slices.length >= 2) {
      out._chart = {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtCOP(canonR),
        centerLabel: 'Canon anual',
        ariaLabel: 'Destino del canon anual bruto entre flujo neto, deducciones e ISR',
      };
    }
  }

  return out;
}
