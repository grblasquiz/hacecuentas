export interface Inputs {
  ingresos_brutos_anuales: number;
  actividad_codigo: 'comercio_minorista' | 'servicios_personales' | 'transporte' | 'alojamiento_comida' | 'profesional' | 'otras_actividades' | 'agricultura';
  tiene_empleados: boolean;
  departamento: 'cundinamarca' | 'antioquia' | 'bogota' | 'valle' | 'atlantico' | 'otros';
}

export interface Outputs {
  tarifa_aplicable: number;
  impuesto_anual: number;
  anticipo_bimestral: number;
  cuotas_bimestrales: number;
  efectivo_liquido_anual: number;
  comparativa_ordinario: number;
  recomendacion: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // DIAN 2026 - Tarifas Régimen Simple por tramos e ingresos
  const LIMITE_REGIMEN_SIMPLE = 1447000000; // $1.447M
  
  let tarifa_base = 2.5; // default
  
  // Tarifas por actividad y tramo de ingresos (2026 DIAN)
  if (i.ingresos_brutos_anuales <= 50000000) {
    if (i.actividad_codigo === 'comercio_minorista') tarifa_base = 1.2;
    else if (i.actividad_codigo === 'servicios_personales') tarifa_base = 1.8;
    else if (i.actividad_codigo === 'transporte') tarifa_base = 2.1;
    else if (i.actividad_codigo === 'profesional') tarifa_base = 2.4;
    else tarifa_base = 1.8;
  } else if (i.ingresos_brutos_anuales <= 150000000) {
    if (i.actividad_codigo === 'comercio_minorista') tarifa_base = 1.8;
    else if (i.actividad_codigo === 'servicios_personales') tarifa_base = 2.4;
    else if (i.actividad_codigo === 'transporte') tarifa_base = 2.7;
    else if (i.actividad_codigo === 'profesional') tarifa_base = 3.0;
    else tarifa_base = 2.4;
  } else if (i.ingresos_brutos_anuales <= 400000000) {
    if (i.actividad_codigo === 'comercio_minorista') tarifa_base = 2.8;
    else if (i.actividad_codigo === 'servicios_personales') tarifa_base = 3.2;
    else if (i.actividad_codigo === 'transporte') tarifa_base = 3.5;
    else if (i.actividad_codigo === 'profesional') tarifa_base = 3.8;
    else if (i.actividad_codigo === 'alojamiento_comida') tarifa_base = 3.5;
    else tarifa_base = 3.2;
  } else if (i.ingresos_brutos_anuales <= 800000000) {
    if (i.actividad_codigo === 'comercio_minorista') tarifa_base = 4.5;
    else if (i.actividad_codigo === 'servicios_personales') tarifa_base = 5.0;
    else if (i.actividad_codigo === 'transporte') tarifa_base = 5.3;
    else if (i.actividad_codigo === 'profesional') tarifa_base = 5.6;
    else if (i.actividad_codigo === 'alojamiento_comida') tarifa_base = 5.1;
    else tarifa_base = 5.0;
  } else {
    // Tramo $800M-$1.447M
    if (i.actividad_codigo === 'comercio_minorista') tarifa_base = 6.5;
    else if (i.actividad_codigo === 'servicios_personales') tarifa_base = 7.2;
    else if (i.actividad_codigo === 'transporte') tarifa_base = 7.5;
    else if (i.actividad_codigo === 'profesional') tarifa_base = 8.3;
    else if (i.actividad_codigo === 'alojamiento_comida') tarifa_base = 7.4;
    else tarifa_base = 7.2;
  }
  
  // Ajuste por empleados: suma 0.8% si tiene
  let tarifa_final = tarifa_base;
  if (i.tiene_empleados) {
    tarifa_final = tarifa_base + 0.8;
  }
  
  // Límite superior: no puede superar 8.3%
  if (tarifa_final > 8.3) tarifa_final = 8.3;
  
  // Cálculo de impuesto
  const impuesto_anual = i.ingresos_brutos_anuales * (tarifa_final / 100);
  const anticipo_bimestral = impuesto_anual / 6;
  const cuotas_bimestrales = 6;
  const efectivo_liquido_anual = i.ingresos_brutos_anuales - impuesto_anual;
  
  // Comparativa con régimen ordinario (estimado)
  // En ordinario: Renta progresiva 8%-37%, IVA 19%, Parafiscales 9%, Patrimonio
  // Estimación conservadora: 18% del ingreso en ordinario
  const impuesto_ordinario_estimado = i.ingresos_brutos_anuales * 0.18;
  const comparativa_ordinario = impuesto_ordinario_estimado - impuesto_anual;
  
  // Recomendación
  let recomendacion = '';
  if (i.ingresos_brutos_anuales > LIMITE_REGIMEN_SIMPLE) {
    recomendacion = `⚠️ Ingresos exceden límite ($${(LIMITE_REGIMEN_SIMPLE / 1000000).toFixed(0)}M). Debes estar en régimen ordinario.`;
  } else if (comparativa_ordinario > 0) {
    const ahorro_pct = ((comparativa_ordinario / impuesto_ordinario_estimado) * 100).toFixed(1);
    recomendacion = `✅ Régimen Simple es **${ahorro_pct}%** más económico que ordinario. Mantente en Simple.`;
  } else {
    recomendacion = `ℹ️ Régimen Simple comparable con ordinario. Valida costos deducibles en ordinario si crecen ingresos.`;
  }
  
  const impuestoR = Math.round(impuesto_anual);
  const liquidoR = Math.round(efectivo_liquido_anual);
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Efectivo líquido', value: liquidoR },
      { label: 'Impuesto Simple', value: impuestoR },
    ],
    prefix: '$',
    centerValue: fmtCOP(i.ingresos_brutos_anuales),
    centerLabel: 'Ingresos brutos',
    ariaLabel: 'Composición de los ingresos brutos anuales: efectivo líquido más impuesto del Régimen Simple',
  };

  const excede = i.ingresos_brutos_anuales > LIMITE_REGIMEN_SIMPLE;
  let _insight;
  if (excede) {
    _insight = {
      title: 'Excedés el Régimen Simple',
      text: `Con ingresos de **${fmtCOP(i.ingresos_brutos_anuales)}** superás el tope del Régimen Simple ($${(LIMITE_REGIMEN_SIMPLE / 1000000).toFixed(0)}M). Tenés que tributar en el **régimen ordinario**.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else if (comparativa_ordinario > 0) {
    const ahorroPct = ((comparativa_ordinario / (i.ingresos_brutos_anuales * 0.18)) * 100).toFixed(1);
    _insight = {
      title: 'El Régimen Simple te conviene',
      text: `Pagás una tarifa del **${(Math.round(tarifa_final * 100) / 100)}%** sobre tus ingresos: **${fmtCOP(impuestoR)}** al año (anticipo de ${fmtCOP(anticipo_bimestral)} cada bimestre). Frente al régimen ordinario ahorrás cerca de **${fmtCOP(comparativa_ordinario)}** (~${ahorroPct}%).`,
      tone: 'good',
      icon: '✅',
    };
  } else {
    _insight = {
      title: 'Régimen Simple vs ordinario',
      text: `Con tarifa del **${(Math.round(tarifa_final * 100) / 100)}%** pagás **${fmtCOP(impuestoR)}** al año y te quedan **${fmtCOP(liquidoR)}** líquidos. A este nivel de ingresos el ordinario es comparable: revisá tus costos deducibles antes de decidir.`,
      tone: 'neutral',
      icon: '📊',
    };
  }

  return {
    tarifa_aplicable: Math.round(tarifa_final * 100) / 100,
    impuesto_anual: impuestoR,
    anticipo_bimestral: Math.round(anticipo_bimestral),
    cuotas_bimestrales,
    efectivo_liquido_anual: liquidoR,
    comparativa_ordinario: Math.round(comparativa_ordinario),
    recomendacion,
    _chart,
    _insight,
  };
}
