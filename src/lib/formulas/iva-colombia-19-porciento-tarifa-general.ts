export interface Inputs {
  precio_sin_iva: number;
  tarifa_iva: 0 | 5 | 19;
  es_autorretenedor: boolean;
  modo_inverso: boolean;
}

export interface Outputs {
  iva_calculado: number;
  precio_total: number;
  precio_sin_iva_inverso: number | null;
  retencion_iva: number;
  neto_a_pagar: number;
}

export function compute(i: Inputs): Outputs {
  // Fuente: DIAN - Tarifas IVA 2026
  const TARIFA_GENERAL = 19;
  const TARIFA_REDUCIDA = 5;
  const TARIFA_CERO = 0;
  const RETENCION_IVA_AUTORRETENEDOR = 1.0; // 100%

  let iva_calculado = 0;
  let precio_total = 0;
  let precio_sin_iva_inverso: number | null = null;
  let retencion_iva = 0;
  let neto_a_pagar = 0;

  if (i.modo_inverso) {
    // Modo inverso: usuario ingresa precio CON IVA, calculamos base
    // Formula: Base = Total / (1 + Tarifa/100)
    const divisor = 1 + i.tarifa_iva / 100;
    precio_sin_iva_inverso = i.precio_sin_iva / divisor;
    iva_calculado = i.precio_sin_iva - precio_sin_iva_inverso;
    precio_total = i.precio_sin_iva; // El input ya es el total
  } else {
    // Modo normal: usuario ingresa precio SIN IVA
    // Formula: IVA = Base × (Tarifa / 100)
    iva_calculado = i.precio_sin_iva * (i.tarifa_iva / 100);
    precio_total = i.precio_sin_iva + iva_calculado;
  }

  // Retención en la fuente para autorretenedores
  if (i.es_autorretenedor) {
    retencion_iva = iva_calculado * RETENCION_IVA_AUTORRETENEDOR;
    // Neto a pagar = Precio total - Retención
    neto_a_pagar = precio_total - retencion_iva;
  } else {
    retencion_iva = 0;
    neto_a_pagar = precio_total;
  }

  return {
    iva_calculado: Math.round(iva_calculado * 100) / 100,
    precio_total: Math.round(precio_total * 100) / 100,
    precio_sin_iva_inverso: precio_sin_iva_inverso
      ? Math.round(precio_sin_iva_inverso * 100) / 100
      : null,
    retencion_iva: Math.round(retencion_iva * 100) / 100,
    neto_a_pagar: Math.round(neto_a_pagar * 100) / 100
  };
}
