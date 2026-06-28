export interface Inputs {
  valor_factura: number;
  anio_modelo: number;
  estado: 'cdmx' | 'edomex' | 'jalisco' | 'queretaro' | 'otros';
  es_motocicleta: boolean;
}

export interface Outputs {
  tenencia_federal: number;
  tenencia_estatal: number;
  descuento_cdmx: number;
  refrendo: number;
  total_a_pagar: number;
  antigüedad_años: number;
  tasa_tenencia: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).es_motocicleta = (i as any).es_motocicleta === true || (i as any).es_motocicleta === 'true';
  // Año actual: 2026
  const anio_actual = 2026;
  const antigüedad_años = anio_actual - i.anio_modelo;

  // Factor de antigüedad según años
  let factor_antigüedad = 1.0;
  if (antigüedad_años >= 16) {
    factor_antigüedad = 0.4;
  } else if (antigüedad_años >= 11) {
    factor_antigüedad = 0.6;
  } else if (antigüedad_años >= 7) {
    factor_antigüedad = 0.8;
  } else if (antigüedad_años >= 4) {
    factor_antigüedad = 0.95;
  }

  // Factor motocicleta: 50% de la tarifa normal
  const factor_moto = i.es_motocicleta ? 0.5 : 1.0;

  let tenencia_federal = 0;
  let tenencia_estatal = 0;
  let descuento_cdmx = 0;
  let refrendo = 0;
  let tasa_tenencia = 0;

  // CDMX: Subsidio 100% si valor < $250,000
  if (i.estado === 'cdmx') {
    if (i.valor_factura < 250000) {
      // Subsidio completo
      tenencia_federal = 0;
      tenencia_estatal = 0;
      descuento_cdmx = 0; // Ya está incluido en 0
      refrendo = i.es_motocicleta ? 40 : 75;
      tasa_tenencia = 0;
    } else {
      // Sin subsidio, aplica tarifa
      tasa_tenencia = 0.018; // 1.8% intermedio
      tenencia_federal = i.valor_factura * 0.016 * factor_antigüedad * factor_moto;
      tenencia_estatal = i.valor_factura * 0.010 * factor_antigüedad * factor_moto;
      descuento_cdmx = 0;
      refrendo = i.es_motocicleta ? 45 : 85;
    }
  }
  // EdoMex: 0.5%-1.5% según valor
  else if (i.estado === 'edomex') {
    tasa_tenencia = i.valor_factura < 200000 ? 0.005 : i.valor_factura < 400000 ? 0.012 : 0.015;
    tenencia_federal = 0; // Incluido en estatal
    tenencia_estatal = Math.max(100, i.valor_factura * tasa_tenencia * factor_antigüedad * factor_moto);
    descuento_cdmx = 0;
    refrendo = i.es_motocicleta ? 35 : 85;
  }
  // Jalisco: 1.6%-4.0% según valor
  else if (i.estado === 'jalisco') {
    tasa_tenencia = i.valor_factura < 200000 ? 0.016 : i.valor_factura < 500000 ? 0.025 : 0.040;
    tenencia_federal = 0;
    tenencia_estatal = Math.max(200, i.valor_factura * tasa_tenencia * factor_antigüedad * factor_moto);
    descuento_cdmx = 0;
    refrendo = i.es_motocicleta ? 40 : 125;
  }
  // Querétaro: 0.8%-2.5% según valor
  else if (i.estado === 'queretaro') {
    tasa_tenencia = i.valor_factura < 200000 ? 0.008 : i.valor_factura < 400000 ? 0.015 : 0.025;
    tenencia_federal = 0;
    tenencia_estatal = Math.max(80, i.valor_factura * tasa_tenencia * factor_antigüedad * factor_moto);
    descuento_cdmx = 0;
    refrendo = i.es_motocicleta ? 35 : 100;
  }
  // Otros estados: 0.5%-2.0%
  else {
    tasa_tenencia = i.valor_factura < 250000 ? 0.005 : i.valor_factura < 500000 ? 0.012 : 0.020;
    tenencia_federal = 0;
    tenencia_estatal = Math.max(50, i.valor_factura * tasa_tenencia * factor_antigüedad * factor_moto);
    descuento_cdmx = 0;
    refrendo = i.es_motocicleta ? 30 : 90;
  }

  // Redondear al próximo peso
  tenencia_federal = Math.ceil(tenencia_federal);
  tenencia_estatal = Math.ceil(tenencia_estatal);
  refrendo = Math.ceil(refrendo);

  const total_a_pagar = tenencia_federal + tenencia_estatal + refrendo - descuento_cdmx;
  const total = Math.max(0, total_a_pagar);

  const mxn = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const estadoLabel: Record<string, string> = {
    cdmx: 'CDMX', edomex: 'Estado de México', jalisco: 'Jalisco', queretaro: 'Querétaro', otros: 'tu estado',
  };
  const eLabel = estadoLabel[i.estado] ?? 'tu estado';
  const tenenciaTotal = tenencia_federal + tenencia_estatal;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (i.estado === 'cdmx' && i.valor_factura < 250000) {
    insightTone = 'good';
    insightText = `En **CDMX** un auto facturado en **${mxn(i.valor_factura)}** queda **subsidiado al 100%**: solo pagás el refrendo de **${mxn(refrendo)}**. Ese es tu total anual.`;
  } else if (tenenciaTotal > 0) {
    insightTone = 'warn';
    insightText = `La tenencia ${i.es_motocicleta ? 'de tu moto ' : ''}en **${eLabel}** suma **${mxn(tenenciaTotal)}** más **${mxn(refrendo)}** de refrendo: total **${mxn(total)}** al año (tasa ${(Math.round(tasa_tenencia * 10000) / 100).toFixed(2)}%${antigüedad_años >= 4 ? `, con descuento por ${antigüedad_años} años de antigüedad` : ''}).`;
  } else {
    insightTone = 'neutral';
    insightText = `En **${eLabel}** pagás **${mxn(total)}** al año por este vehículo.`;
  }

  const slices = [
    { label: 'Tenencia federal', value: tenencia_federal },
    { label: 'Tenencia estatal', value: tenencia_estatal },
    { label: 'Refrendo', value: refrendo },
  ].filter((s) => s.value > 0);

  const out: Outputs = {
    tenencia_federal,
    tenencia_estatal,
    descuento_cdmx,
    refrendo,
    total_a_pagar: total,
    antigüedad_años,
    tasa_tenencia: Math.round(tasa_tenencia * 10000) / 100, // En porcentaje
    _insight: {
      title: 'Tu pago anual',
      text: insightText,
      tone: insightTone,
      icon: '🚗',
    },
  };

  if (slices.length >= 2 && total > 0) {
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: mxn(total),
      centerLabel: 'Total anual',
      ariaLabel: `Desglose del pago anual de ${mxn(total)} en ${eLabel}`,
    };
  }

  return out;
}
