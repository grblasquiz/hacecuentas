export interface Inputs {
  salario_mensual: number;
  monto_solicitado: number;
  plazo_meses: number;
  tasa_ea: number;
  descuentos_legales_pct: number;
}

export interface Outputs {
  ingreso_disponible: number;
  cuota_maxima_permitida: number;
  cuota_mensual: number;
  pct_ingreso_disponible: number;
  intereses_totales: number;
  valor_total_pagado: number;
  maximo_prestable: number;
  es_viable: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  const salario = Math.max(1000000, i.salario_mensual || 3000000);
  const monto = Math.max(1000000, i.monto_solicitado || 10000000);
  const plazo = Math.max(12, Math.min(72, i.plazo_meses || 60));
  const tareaEA = Math.max(8.5, Math.min(16.0, i.tasa_ea || 11.5));
  const descuentos = Math.max(8.0, Math.min(25.0, i.descuentos_legales_pct || 12.5));

  // Cálculo de ingreso disponible
  // Fuente: Ministerio del Trabajo Colombia - Descuentos legales AFP 4% + EPS 4% + retención 2.5-8%
  const ingresoDisponible = salario * (1 - descuentos / 100);

  // Cuota máxima permitida: 50% del ingreso disponible
  // Fuente: Superfinanciera - Limitación de endeudamiento en libranza
  const cuotaMaximaPermitida = ingresoDisponible * 0.5;

  // Tasa de interés mensual desde EA (Tasa Efectiva Anual)
  // Conversión: tasa_mensual = (1 + EA/100)^(1/12) - 1
  const tasaMensual = Math.pow(1 + tareaEA / 100, 1 / 12) - 1;

  // Fórmula cuota mensual - Sistema Francés
  // C = P * [i(1+i)^n] / [(1+i)^n - 1]
  // Donde: C = cuota, P = principal, i = tasa mensual, n = plazo en meses
  const numerador = tasaMensual * Math.pow(1 + tasaMensual, plazo);
  const denominador = Math.pow(1 + tasaMensual, plazo) - 1;
  const cuotaMensual = monto * (numerador / denominador);

  // Porcentaje de cuota sobre ingreso disponible
  const pctIngresoDisponible = ingresoDisponible > 0 ? (cuotaMensual / ingresoDisponible) * 100 : 0;

  // Intereses totales = (cuota * plazo) - monto
  const valorTotalPagado = cuotaMensual * plazo;
  const interesesTotales = valorTotalPagado - monto;

  // Máximo prestable: despejar P de la fórmula de cuota, con límite cuota_máxima
  // P_máx = C_máx * [(1+i)^n - 1] / [i(1+i)^n]
  const maximoPrestable = cuotaMaximaPermitida * (denominador / numerador);

  // Viabilidad: monto <= máximo prestable AND cuota <= 50% ingreso disponible
  const esViable = monto <= maximoPrestable && cuotaMensual <= cuotaMaximaPermitida ? "Sí" : "No";

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const viable = esViable === "Sí";
  const pct = Math.round(pctIngresoDisponible * 100) / 100;
  const _insight = {
    title: viable ? 'El crédito es viable por libranza' : 'No pasa el tope de libranza',
    text: viable
      ? `Tu cuota de **${fmt(cuotaMensual)}** ocupa el **${pct}%** de tu ingreso disponible, dentro del tope legal del 50%. Podrías pedir hasta **${fmt(maximoPrestable)}** con estas condiciones.`
      : `La cuota de **${fmt(cuotaMensual)}** equivale al **${pct}%** de tu ingreso disponible y supera el tope legal del 50%. El máximo que te prestarían por libranza es **${fmt(maximoPrestable)}**; bajá el monto o estirá el plazo.`,
    tone: viable ? 'good' : 'warn',
    icon: '💼'
  };
  const _chart = {
    type: 'scale',
    marker: pct,
    markerLabel: `${pct}% del disponible`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 35, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Al límite', max: 50, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'No permitido', max: Math.max(70, Math.ceil(pct) + 5), color: '#dc2626', colorDark: '#ef4444' }
    ],
    ariaLabel: `La cuota representa ${pct}% del ingreso disponible; el tope legal de libranza es 50%.`
  };

  return {
    ingreso_disponible: Math.round(ingresoDisponible),
    cuota_maxima_permitida: Math.round(cuotaMaximaPermitida),
    cuota_mensual: Math.round(cuotaMensual),
    pct_ingreso_disponible: Math.round(pctIngresoDisponible * 100) / 100,
    intereses_totales: Math.round(interesesTotales),
    valor_total_pagado: Math.round(valorTotalPagado),
    maximo_prestable: Math.round(maximoPrestable),
    es_viable: esViable,
    _insight,
    _chart
  };
}
