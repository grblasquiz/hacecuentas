export interface Inputs {
  monto_bruto_honorario: number;
  incluye_iva: boolean;
  anio_factura: number;
}

export interface Outputs {
  monto_bruto_neto: number;
  tasa_retencion_aplicada: number;
  monto_retencion: number;
  monto_liquido_recibir: number;
  iva_a_pagar: number;
  total_costo_empresa: number;
  obligacion_declaracion: string;
  proyeccion_anual_12_meses: number;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Tasas retención por año - Ley 21.133 (2019), gradualidad hasta 2028
  // Fuente SII: https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html
  const tasas_por_anio: { [key: number]: number } = {
    2026: 0.1525,  // 15,25% vigente 2026 (subió desde 14,5% en 2025)
    2027: 0.16,    // 16% vigente 2027 (+0,75 pp)
    2028: 0.17,    // 17% vigente 2028+ (+1 pp, tope final)
  };

  // Obtener tasa aplicable
  const tasa_retencion = tasas_por_anio[i.anio_factura] || 0.17;

  // Separar IVA si está incluido en monto
  let monto_bruto_neto = i.monto_bruto_honorario;
  let iva_incluido = 0;

  if (i.incluye_iva) {
    // Monto bruto = Total ÷ 1.19 (IVA 19%)
    monto_bruto_neto = i.monto_bruto_honorario / 1.19;
    iva_incluido = i.monto_bruto_honorario - monto_bruto_neto;
  } else {
    iva_incluido = monto_bruto_neto * 0.19;
  }

  // Calcular retención sobre monto bruto neto
  const monto_retencion = monto_bruto_neto * tasa_retencion;

  // Líquido a recibir profesional
  const monto_liquido_recibir = monto_bruto_neto - monto_retencion;

  // Costo total para empresa (bruto + IVA)
  const total_costo_empresa = monto_bruto_neto + iva_incluido;

  // Obligación SII - texto dinámico
  const tasaPctTxt = (tasa_retencion * 100).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const obligacion_declaracion = `Quien paga (empresa/pagador) retiene el ${tasaPctTxt}% y lo declara/entera en SII (F-29) dentro de los 12 primeros días del mes siguiente. El profesional reconcilia en la Operación Renta de abril.`;

  // Proyección anual (12 meses con mismo monto)
  const proyeccion_anual_12_meses = monto_retencion * 12;

  const brutoR = Math.round(monto_bruto_neto);
  const retR = Math.round(monto_retencion);
  const liquidoR = Math.round(monto_liquido_recibir);
  const tasaPct = Math.round(tasa_retencion * 1000) / 10;
  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const chart = brutoR > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido a recibir', value: liquidoR },
      { label: 'Retención SII', value: retR },
    ],
    prefix: '$',
    centerValue: fmtCLP(brutoR),
    centerLabel: 'Honorario bruto',
    ariaLabel: 'Composición del honorario bruto: líquido a recibir más retención',
  } : undefined;

  const insight = brutoR > 0 ? {
    title: 'Cuánto te retienen',
    text: `Sobre **${fmtCLP(brutoR)}** de honorario, el SII retiene el **${tasaPct}%** (${fmtCLP(retR)}): recibís **${fmtCLP(liquidoR)}** líquidos. En 12 meses iguales acumularías **${fmtCLP(proyeccion_anual_12_meses)}** retenidos, recuperables en la declaración de abril.`,
    tone: 'warn' as const,
    icon: '🇨🇱',
  } : undefined;

  return {
    monto_bruto_neto: brutoR,
    tasa_retencion_aplicada: tasa_retencion * 100,
    monto_retencion: retR,
    monto_liquido_recibir: liquidoR,
    iva_a_pagar: Math.round(iva_incluido),
    total_costo_empresa: Math.round(total_costo_empresa),
    obligacion_declaracion: obligacion_declaracion,
    proyeccion_anual_12_meses: Math.round(proyeccion_anual_12_meses),
    _chart: chart,
    _insight: insight,
  };
}
