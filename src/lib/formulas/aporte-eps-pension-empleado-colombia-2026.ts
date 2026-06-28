export interface Inputs {
  salario_base_mensual: number;
  es_pequena_empresa: boolean;
  clase_riesgo_arl: string;
}

export interface Outputs {
  aporte_eps_empleado: number;
  aporte_pension_empleado: number;
  total_descuentos_empleado: number;
  aporte_eps_empleador: number;
  aporte_pension_empleador: number;
  aporte_arl_empleador: number;
  total_aportes_empleador: number;
  costo_total_empleado: number;
  porcentaje_descuento: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).es_pequena_empresa = (i as any).es_pequena_empresa === true || (i as any).es_pequena_empresa === 'true';
  // Constantes 2026 Colombia - DIAN
  const TASA_EPS_EMPLEADO = 0.04; // 4% Seguro de salud empleado
  const TASA_PENSION_EMPLEADO = 0.04; // 4% Fondo pensión empleado
  const TASA_EPS_EMPLEADOR = 0.085; // 8.5% Seguro de salud empleador
  const TASA_PENSION_EMPLEADOR = 0.12; // 12% Fondo pensión empleador

  // Tarifas ARL por clase de riesgo (Superfinanciera 2026)
  const TASA_ARL: Record<string, number> = {
    "I": 0.00522,    // Mínimo - Bancos, seguros
    "II": 0.01044,   // Bajo - Agricultura
    "III": 0.02436,  // Medio - Industria
    "IV": 0.04350,   // Alto - Construcción
    "V": 0.06960     // Muy alto - Químicos, explosivos
  };

  const salario = Math.max(0, i.salario_base_mensual);

  // Aportes Empleado
  const aporte_eps_empleado = salario * TASA_EPS_EMPLEADO;
  const aporte_pension_empleado = salario * TASA_PENSION_EMPLEADO;
  const total_descuentos_empleado = aporte_eps_empleado + aporte_pension_empleado;

  // Aportes Empleador
  const aporte_eps_empleador = i.es_pequena_empresa ? 0 : salario * TASA_EPS_EMPLEADOR;
  const aporte_pension_empleador = salario * TASA_PENSION_EMPLEADOR;
  const tasa_arl = TASA_ARL[i.clase_riesgo_arl] || TASA_ARL["III"];
  const aporte_arl_empleador = salario * tasa_arl;
  const total_aportes_empleador = aporte_eps_empleador + aporte_pension_empleador + aporte_arl_empleador;

  // Costo Total
  const costo_total_empleado = salario + total_aportes_empleador;
  const porcentaje_descuento = salario > 0 ? (total_descuentos_empleado / salario) * 100 : 0;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const netoEmpleado = salario - total_descuentos_empleado;
  const _insight = {
    title: 'Descuentos y costo real del empleo',
    text: `Al trabajador le descuentan **${fmtCOP(total_descuentos_empleado)}** (**${(Math.round(porcentaje_descuento * 100) / 100).toLocaleString('es-CO')}%**: 4% salud + 4% pensión), quedando un neto de **${fmtCOP(netoEmpleado)}**. Para la empresa, ese sueldo cuesta **${fmtCOP(costo_total_empleado)}** sumando sus aportes.`,
    tone: 'warn' as const,
    icon: '🇨🇴',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salario base', value: Math.round(salario) },
      ...(aporte_eps_empleador > 0 ? [{ label: 'Salud empleador (8,5%)', value: Math.round(aporte_eps_empleador) }] : []),
      { label: 'Pensión empleador (12%)', value: Math.round(aporte_pension_empleador) },
      { label: 'ARL empleador', value: Math.round(aporte_arl_empleador) },
    ],
    prefix: '$',
    centerValue: fmtCOP(costo_total_empleado),
    centerLabel: 'costo empresa',
    ariaLabel: `Costo total para la empresa de ${fmtCOP(costo_total_empleado)}: salario de ${fmtCOP(salario)} más aportes patronales de ${fmtCOP(total_aportes_empleador)}`,
  };

  return {
    aporte_eps_empleado: Math.round(aporte_eps_empleado),
    aporte_pension_empleado: Math.round(aporte_pension_empleado),
    total_descuentos_empleado: Math.round(total_descuentos_empleado),
    aporte_eps_empleador: Math.round(aporte_eps_empleador),
    aporte_pension_empleador: Math.round(aporte_pension_empleador),
    aporte_arl_empleador: Math.round(aporte_arl_empleador),
    total_aportes_empleador: Math.round(total_aportes_empleador),
    costo_total_empleado: Math.round(costo_total_empleado),
    porcentaje_descuento: Math.round(porcentaje_descuento * 100) / 100,
    _insight,
    _chart
  };
}
