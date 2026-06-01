export interface Inputs {
  salario_mensual: number;
  meses_trabajados: number;
  tipo_fondo: 'privado' | 'solidario' | 'cuenta_individual';
  saldo_inicial_fondo: number;
  retiro_parcial_vivienda: number;
  retiro_parcial_educacion: number;
}

export interface Outputs {
  aporte_anual_empleador: number;
  aporte_mensual_empleador: number;
  saldo_fondo_acumulado: number;
  intereses_anuales_12pct: number;
  saldo_neto_disponible: number;
  retiro_total_solicitado: number;
  retiro_educacion_permitido: number;
  retiro_vivienda_permitido: number;
  aporte_total_empleador_con_intereses: number;
  proyeccion_5_anos: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026
  const PORCENTAJE_APORTE_CESANTIAS = 0.0833; // Art. 249 C.Sustan (8.33% exacto)
  const TASA_INTERES_ANUAL = 0.12; // 12% pagado empleador directo (Decreto 2057/2019)
  const MAXIMO_RETIRO_EDUCACION_PCT = 0.50; // 50% fondo anual para educación
  const MAXIMO_RETIRO_VIVIENDA_PCT = 1.0; // 100% fondo cada 5 años vivienda

  // Validaciones básicas
  const salario_valido = Math.max(0, i.salario_mensual || 0);
  const meses_valido = Math.max(1, Math.min(12, i.meses_trabajados || 12));
  const saldo_inicial = Math.max(0, i.saldo_inicial_fondo || 0);
  const retiro_vivienda = Math.max(0, i.retiro_parcial_vivienda || 0);
  const retiro_educacion = Math.max(0, i.retiro_parcial_educacion || 0);

  // Cálculo aporte mensual y anual (8.33% × meses trabajados)
  const aporte_mensual = salario_valido * PORCENTAJE_APORTE_CESANTIAS;
  const aporte_anual = aporte_mensual * meses_valido;

  // Saldo acumulado ANTES de retiros
  const saldo_acumulado_antes_retiros = saldo_inicial + aporte_anual;

  // Cálculo intereses 12% sobre saldo acumulado (antes retiros, paga empleador)
  const intereses_anuales = saldo_acumulado_antes_retiros * TASA_INTERES_ANUAL;

  // Saldo total con intereses ANTES de retiros
  const saldo_total_con_intereses = saldo_acumulado_antes_retiros + intereses_anuales;

  // Límites retiro educación: máximo 50% fondo
  const maximo_retiro_educacion = saldo_total_con_intereses * MAXIMO_RETIRO_EDUCACION_PCT;
  const retiro_educacion_permitido = Math.min(retiro_educacion, maximo_retiro_educacion);

  // Límites retiro vivienda: máximo 100% fondo
  // Nota: si solicita retiro vivienda Y educación, prioriza por lógica, pero calcula sobre saldo disponible post-educación
  const saldo_post_educacion = saldo_total_con_intereses - retiro_educacion_permitido;
  const maximo_retiro_vivienda = saldo_post_educacion;
  const retiro_vivienda_permitido = Math.min(retiro_vivienda, maximo_retiro_vivienda);

  // Total retiros autorizados
  const retiro_total = retiro_educacion_permitido + retiro_vivienda_permitido;

  // Saldo NETO disponible tras retiros
  const saldo_neto_disponible = saldo_total_con_intereses - retiro_total;

  // Obligación total empleador (aporte + intereses)
  const aporte_total_empleador_con_intereses = aporte_anual + intereses_anuales;

  // Proyección 5 años sin retiros (compuesto: año N = saldo N-1 * 1.12 + aporte anual)
  let proyeccion = saldo_total_con_intereses;
  for (let ano = 1; ano < 5; ano++) {
    proyeccion = proyeccion * (1 + TASA_INTERES_ANUAL) + aporte_anual;
  }
  const proyeccion_5_anos = proyeccion;

  // Insight: interpreta la obligación del empleador y el rol del interés 12%
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = {
    title: 'Lo que cuestan las cesantías',
    text: `Por un sueldo de **${fmtCOP(salario_valido)}** el empleador aporta **${fmtCOP(aporte_anual)}** al año (8,33%) más **${fmtCOP(intereses_anuales)}** de intereses del 12%: una obligación total de **${fmtCOP(aporte_total_empleador_con_intereses)}** que el trabajador acumula en su fondo.`,
    tone: 'neutral',
    icon: '🏦',
  };

  // Donut: composición del saldo del fondo (antes de retiros)
  const _chart = {
    type: 'doughnut',
    slices: [
      ...(saldo_inicial > 0 ? [{ label: 'Saldo inicial', value: Math.round(saldo_inicial) }] : []),
      { label: 'Aporte del año (8,33%)', value: Math.round(aporte_anual) },
      { label: 'Intereses (12%)', value: Math.round(intereses_anuales) },
    ],
    prefix: '$',
    centerValue: fmtCOP(saldo_total_con_intereses),
    centerLabel: 'fondo acumulado',
    ariaLabel: `Composición del fondo de cesantías: aporte anual de ${fmtCOP(aporte_anual)} e intereses de ${fmtCOP(intereses_anuales)}`,
  };

  return {
    aporte_anual_empleador: Math.round(aporte_anual),
    aporte_mensual_empleador: Math.round(aporte_mensual),
    saldo_fondo_acumulado: Math.round(saldo_acumulado_antes_retiros),
    intereses_anuales_12pct: Math.round(intereses_anuales),
    saldo_neto_disponible: Math.round(saldo_neto_disponible),
    retiro_total_solicitado: Math.round(retiro_total),
    retiro_educacion_permitido: Math.round(retiro_educacion_permitido),
    retiro_vivienda_permitido: Math.round(retiro_vivienda_permitido),
    aporte_total_empleador_con_intereses: Math.round(aporte_total_empleador_con_intereses),
    proyeccion_5_anos: Math.round(proyeccion_5_anos),
    _insight,
    _chart
  };
}
