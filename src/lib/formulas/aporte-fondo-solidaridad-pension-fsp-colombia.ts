export interface Inputs {
  salario_base: number;
  smmlv_2026: number;
}

export interface Outputs {
  aporte_fsp_mensual: number;
  tarifa_aplicada: number;
  rango_smmlv: string;
  aporte_anual: number;
  aplica_fsp: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 FSP
  const UMBRAL_MINIMO_SMMLV = 4; // Aplica a partir de 4 SMMLV
  const SMMLV = i.smmlv_2026 || 1300000; // SMMLV 2026 Colombia (estimado)
  
  // Validar inputs
  const salario = Math.max(0, i.salario_base || 0);
  
  // Calcular rango en SMMLV
  const rangoSmmlv = salario / SMMLV;
  
  // Determinar si aplica FSP
  let aplicaFsp = false;
  let tarifaAplicada = 0;
  let rangoDescripcion = "Sin aplica";
  
  if (rangoSmmlv < UMBRAL_MINIMO_SMMLV) {
    // No aplica FSP
    aplicaFsp = false;
    tarifaAplicada = 0;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (< 4 SMMLV - Exento)`;
  } else if (rangoSmmlv >= 4 && rangoSmmlv < 16) {
    // Tarifa 1.0%
    aplicaFsp = true;
    tarifaAplicada = 0.01;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (4-16 SMMLV - Tarifa 1%)`;
  } else if (rangoSmmlv >= 16 && rangoSmmlv < 17) {
    // Tarifa 1.2%
    aplicaFsp = true;
    tarifaAplicada = 0.012;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (16-17 SMMLV - Tarifa 1.2%)`;
  } else if (rangoSmmlv >= 17 && rangoSmmlv < 18) {
    // Tarifa 1.4%
    aplicaFsp = true;
    tarifaAplicada = 0.014;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (17-18 SMMLV - Tarifa 1.4%)`;
  } else if (rangoSmmlv >= 18) {
    // Tarifa 1.5% (máxima)
    aplicaFsp = true;
    tarifaAplicada = 0.015;
    rangoDescripcion = `${rangoSmmlv.toFixed(2)} SMMLV (≥ 18 SMMLV - Tarifa 1.5% máxima)`;
  }
  
  // Calcular aportes
  const aporteMensual = salario * tarifaAplicada;
  const aporteAnual = aporteMensual * 12;
  
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = aplicaFsp
    ? {
        title: 'Pagás Fondo de Solidaridad',
        text: `Con un salario de **${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV** te aplica la tarifa del **${(tarifaAplicada * 100).toLocaleString('es-CO')}%**: **${fmtCOP(aporteMensual)}** al mes (**${fmtCOP(aporteAnual)}** al año) que se suman a tu cotización a pensión.`,
        tone: 'warn' as const,
        icon: '🤝',
      }
    : {
        title: 'Estás exento del FSP',
        text: `Tu salario equivale a **${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV**, por debajo del umbral de **4 SMMLV**. No pagás el Fondo de Solidaridad Pensional: **$0** de aporte extra.`,
        tone: 'good' as const,
        icon: '🤝',
      };

  const _chart = {
    type: 'scale',
    marker: Math.round(rangoSmmlv * 100) / 100,
    markerLabel: `${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV`,
    min: 0,
    segments: [
      { nombre: 'Exento', max: 4, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: '1%', max: 16, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: '1,2%', max: 17, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: '1,4%', max: 18, color: '#f97316', colorDark: '#fb923c' },
      { nombre: '1,5%', max: Math.max(22, Math.ceil(rangoSmmlv) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Salario de ${(Math.round(rangoSmmlv * 100) / 100).toLocaleString('es-CO')} SMMLV ubicado en el tramo de tarifa del FSP`,
  };

  return {
    aporte_fsp_mensual: Math.round(aporteMensual * 100) / 100,
    tarifa_aplicada: tarifaAplicada * 100, // En porcentaje para display
    rango_smmlv: rangoDescripcion,
    aporte_anual: Math.round(aporteAnual * 100) / 100,
    aplica_fsp: aplicaFsp ? "Sí, aplica FSP" : "No aplica FSP (salario < 4 SMMLV)",
    _insight,
    _chart
  };
}
