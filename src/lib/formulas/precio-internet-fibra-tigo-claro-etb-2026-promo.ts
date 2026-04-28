export interface Inputs {
  operadora: 'tigo' | 'claro' | 'etb' | 'movistar';
  velocidad_mbps: 200 | 300 | 500 | 1000;
  tipo_paquete: 'internet_solo' | 'triple_play';
  meses_promo: 6 | 12;
}

export interface Outputs {
  precio_promo_mensual: number;
  precio_normal_mensual: number;
  descuento_mensual: number;
  costo_promo_total: number;
  costo_normal_total_12: number;
  ahorro_anual: number;
  mejor_opcion: string;
}

// Tabla de precios 2026 Colombia en pesos
// Fuente: Consulta operadoras 2026
const preciosBase: Record<string, Record<number, Record<string, number>>> = {
  tigo: {
    200: { internet_solo: 79900, triple_play: 129900 },
    300: { internet_solo: 89900, triple_play: 139900 },
    500: { internet_solo: 119900, triple_play: 169900 },
    1000: { internet_solo: 149900, triple_play: 199900 },
  },
  claro: {
    200: { internet_solo: 84900, triple_play: 134900 },
    300: { internet_solo: 99900, triple_play: 149900 },
    500: { internet_solo: 129900, triple_play: 179900 },
    1000: { internet_solo: 159900, triple_play: 209900 },
  },
  etb: {
    200: { internet_solo: 74900, triple_play: 124900 },
    300: { internet_solo: 89900, triple_play: 139900 },
    500: { internet_solo: 109900, triple_play: 159900 },
    1000: { internet_solo: 139900, triple_play: 189900 },
  },
  movistar: {
    200: { internet_solo: 79900, triple_play: 129900 },
    300: { internet_solo: 94900, triple_play: 144900 },
    500: { internet_solo: 124900, triple_play: 174900 },
    1000: { internet_solo: 154900, triple_play: 204900 },
  },
};

// Descuentos promocionales aplicados (porcentaje sobre precio normal)
const descuentosPromo: Record<string, Record<number, number>> = {
  tigo: {
    6: 0.50,
    12: 0.45,
  },
  claro: {
    6: 0.48,
    12: 0.43,
  },
  etb: {
    6: 0.50,
    12: 0.45,
  },
  movistar: {
    6: 0.48,
    12: 0.44,
  },
};

export function compute(i: Inputs): Outputs {
  // Obtener precio normal mensual
  const precioNormal =
    preciosBase[i.operadora]?.[i.velocidad_mbps]?.[i.tipo_paquete] || 99900;

  // Obtener descuento promocional
  const porcentajeDescuento = descuentosPromo[i.operadora]?.[i.meses_promo] || 0.45;

  // Calcular precio promocional
  const precioPromo = Math.round(precioNormal * (1 - porcentajeDescuento));

  // Descuento mensual
  const descuentoMensual = precioNormal - precioPromo;

  // Costo durante período promocional
  const costoPromoTotal = precioPromo * i.meses_promo;

  // Costo a precio normal en 12 meses
  const costoNormalTotal12 = precioNormal * 12;

  // Meses restantes a precio normal
  const mesesNormales = 12 - i.meses_promo;
  const costoMesesNormales = precioNormal * mesesNormales;

  // Costo total año 1
  const costoTotalAno1 = costoPromoTotal + costoMesesNormales;

  // Ahorro anual (diferencia entre 12 meses normal vs año 1 con promo)
  const ahorroAnual = costoNormalTotal12 - costoTotalAno1;

  // Determinar mejor opción: comparar con otras operadoras
  let mejorOpcion = i.operadora.toUpperCase();
  let costoMinimo = costoTotalAno1;

  const operadoras: Array<'tigo' | 'claro' | 'etb' | 'movistar'> = [
    'tigo',
    'claro',
    'etb',
    'movistar',
  ];
  for (const op of operadoras) {
    if (op === i.operadora) continue;
    const precioOp =
      preciosBase[op]?.[i.velocidad_mbps]?.[i.tipo_paquete] || 99900;
    const descOp = descuentosPromo[op]?.[i.meses_promo] || 0.45;
    const precioPromoOp = Math.round(precioOp * (1 - descOp));
    const mesesNormalesOp = 12 - i.meses_promo;
    const costoTotalOp = precioPromoOp * i.meses_promo + precioOp * mesesNormalesOp;
    if (costoTotalOp < costoMinimo) {
      costoMinimo = costoTotalOp;
      mejorOpcion = op.toUpperCase();
    }
  }

  return {
    precio_promo_mensual: precioPromo,
    precio_normal_mensual: precioNormal,
    descuento_mensual: descuentoMensual,
    costo_promo_total: costoPromoTotal,
    costo_normal_total_12: costoNormalTotal12,
    ahorro_anual: ahorroAnual,
    mejor_opcion:
      mejorOpcion === i.operadora.toUpperCase()
        ? `${mejorOpcion} ofrece el mejor precio ($${costoTotalAno1.toLocaleString('es-CO')})`
        : `${mejorOpcion} es más económica ($${costoMinimo.toLocaleString('es-CO')} vs $${costoTotalAno1.toLocaleString('es-CO')} en ${i.operadora.toUpperCase()})`,
  };
}
