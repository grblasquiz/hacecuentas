export interface Inputs {
  monto_prestamo: number;
  plazo_meses: number;
  tasa_ea_cooperativa: number;
  es_asociado: 'si' | 'no';
  tasa_ea_banco: number;
}

export interface Outputs {
  cuota_mensual_cooperativa: number;
  tasa_mensual_cooperativa: number;
  interes_total_cooperativa: number;
  cuota_mensual_banco: number;
  interes_total_banco: number;
  ahorro_mensual: number;
  ahorro_total: number;
  porcentaje_ahorro: number;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  if (i.monto_prestamo <= 0 || i.plazo_meses <= 0 || i.tasa_ea_cooperativa <= 0 || i.tasa_ea_banco <= 0) {
    return {
      cuota_mensual_cooperativa: 0,
      tasa_mensual_cooperativa: 0,
      interes_total_cooperativa: 0,
      cuota_mensual_banco: 0,
      interes_total_banco: 0,
      ahorro_mensual: 0,
      ahorro_total: 0,
      porcentaje_ahorro: 0
    };
  }

  // Aplicar descuento por asociado: -1% EA si es asociado (típico según Superfinanciera)
  const descuento_asociado = i.es_asociado === 'si' ? 1 : 0;
  const tasa_ea_cooperativa_ajustada = i.tasa_ea_cooperativa - descuento_asociado;

  // Convertir EA a tasa mensual: TEM = (1 + EA)^(1/12) - 1
  const tasa_mensual_coop = Math.pow(1 + tasa_ea_cooperativa_ajustada / 100, 1 / 12) - 1;
  const tasa_mensual_banco = Math.pow(1 + i.tasa_ea_banco / 100, 1 / 12) - 1;

  // Fórmula cuota: P × [i(1+i)^n] / [(1+i)^n - 1]
  // donde P = monto, i = tasa mensual, n = plazo en meses
  const potencia_coop = Math.pow(1 + tasa_mensual_coop, i.plazo_meses);
  const cuota_coop = (i.monto_prestamo * tasa_mensual_coop * potencia_coop) / (potencia_coop - 1);

  const potencia_banco = Math.pow(1 + tasa_mensual_banco, i.plazo_meses);
  const cuota_banco = (i.monto_prestamo * tasa_mensual_banco * potencia_banco) / (potencia_banco - 1);

  // Intereses totales: (cuota × n) - monto
  const interes_coop = cuota_coop * i.plazo_meses - i.monto_prestamo;
  const interes_banco = cuota_banco * i.plazo_meses - i.monto_prestamo;

  // Ahorros
  const ahorro_mensual = cuota_banco - cuota_coop;
  const ahorro_total = interes_banco - interes_coop;
  const porcentaje_ahorro = interes_banco > 0 ? (ahorro_total / interes_banco) * 100 : 0;

  return {
    cuota_mensual_cooperativa: Math.round(cuota_coop * 100) / 100,
    tasa_mensual_cooperativa: Math.round(tasa_mensual_coop * 10000) / 100, // en %
    interes_total_cooperativa: Math.round(interes_coop * 100) / 100,
    cuota_mensual_banco: Math.round(cuota_banco * 100) / 100,
    interes_total_banco: Math.round(interes_banco * 100) / 100,
    ahorro_mensual: Math.round(ahorro_mensual * 100) / 100,
    ahorro_total: Math.round(ahorro_total * 100) / 100,
    porcentaje_ahorro: Math.round(porcentaje_ahorro * 100) / 100
  };
}
