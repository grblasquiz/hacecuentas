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
}

export function compute(i: Inputs): Outputs {
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

  return {
    tenencia_federal,
    tenencia_estatal,
    descuento_cdmx,
    refrendo,
    total_a_pagar: Math.max(0, total_a_pagar),
    antigüedad_años,
    tasa_tenencia: Math.round(tasa_tenencia * 10000) / 100 // En porcentaje
  };
}
