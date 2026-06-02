export interface Inputs {
  ingreso_a: number;
  ingreso_b: number;
  gastos_totales: number;
}

export interface Outputs {
  porcentaje_a: number;
  porcentaje_b: number;
  monto_a: number;
  monto_b: number;
  diferencia_a_5050: number;
  diferencia_b_5050: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const ingresoA = Number(i.ingreso_a) || 0;
  const ingresoB = Number(i.ingreso_b) || 0;
  const gastosTotales = Number(i.gastos_totales) || 0;

  // Validaciones
  if (ingresoA < 0 || ingresoB < 0 || gastosTotales < 0) {
    return {
      porcentaje_a: 0,
      porcentaje_b: 0,
      monto_a: 0,
      monto_b: 0,
      diferencia_a_5050: 0,
      diferencia_b_5050: 0
    };
  }

  const ingresoTotal = ingresoA + ingresoB;

  // Si no hay ingreso, no hay cálculo
  if (ingresoTotal === 0) {
    return {
      porcentaje_a: 0,
      porcentaje_b: 0,
      monto_a: 0,
      monto_b: 0,
      diferencia_a_5050: 0,
      diferencia_b_5050: 0
    };
  }

  // Cálculo de proporciones
  const porcentajeA = (ingresoA / ingresoTotal) * 100;
  const porcentajeB = (ingresoB / ingresoTotal) * 100;

  // Cálculo de montos proporcionales
  const montoA = (ingresoA / ingresoTotal) * gastosTotales;
  const montoB = (ingresoB / ingresoTotal) * gastosTotales;

  // Cálculo de diferencia vs 50/50
  const monto5050 = gastosTotales / 2;
  const diferenciaA5050 = montoA - monto5050;
  const diferenciaB5050 = montoB - monto5050;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const aPagaMas = montoA >= montoB;
  const quienMas = aPagaMas ? 'Persona A' : 'Persona B';
  const pctMas = Math.round((aPagaMas ? porcentajeA : porcentajeB) * 10) / 10;
  const montoMas = aPagaMas ? montoA : montoB;
  const gapVs5050 = Math.abs(diferenciaA5050);
  const _insight = {
    title: 'Reparto proporcional al ingreso',
    text: gapVs5050 < 1
      ? `Ganan casi lo mismo, así que el reparto justo es prácticamente **50/50**: cada uno pone ~**$${fmt(montoA)}**.`
      : `Como **${quienMas}** gana más, le toca el **${pctMas}%** (**$${fmt(montoMas)}**) — son **$${fmt(gapVs5050)}** más que si dividieran 50/50.`,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🤝',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Persona A', value: Math.round(montoA) },
      { label: 'Persona B', value: Math.round(montoB) },
    ],
    prefix: '$',
    centerValue: '$' + fmt(gastosTotales),
    centerLabel: 'Gasto total',
    ariaLabel: `De $${fmt(gastosTotales)} en gastos, Persona A aporta $${fmt(montoA)} (${Math.round(porcentajeA)}%) y Persona B $${fmt(montoB)} (${Math.round(porcentajeB)}%).`,
  };

  return {
    porcentaje_a: Math.round(porcentajeA * 100) / 100,
    porcentaje_b: Math.round(porcentajeB * 100) / 100,
    monto_a: Math.round(montoA * 100) / 100,
    monto_b: Math.round(montoB * 100) / 100,
    diferencia_a_5050: Math.round(diferenciaA5050 * 100) / 100,
    diferencia_b_5050: Math.round(diferenciaB5050 * 100) / 100,
    _insight: _insight,
    _chart: _chart
  };
}
