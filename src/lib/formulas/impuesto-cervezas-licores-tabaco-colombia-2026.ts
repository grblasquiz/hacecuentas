export interface Inputs {
  tipo_producto: 'cerveza' | 'vino' | 'licor_destilado' | 'tabaco';
  volumen_litros: number;
  grado_alcohol?: number;
  precio_base_unidad: number;
  cantidad_unidades: number;
}

export interface Outputs {
  impuesto_especifico: number;
  impuesto_ad_valorem: number;
  subtotal_impuesto_consumo: number;
  base_iva: number;
  iva_19: number;
  total_final: number;
  tarifa_efectiva: number;
  costo_unitario_final: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 - Impuesto al Consumo
  // Fuente: DIAN Resolución de Tarifas 2026
  const TARIFA_CERVEZA_POR_LITRO = 1400; // $/L cerveza ≤6% vol
  const TARIFA_VINO_POR_LITRO = 150; // $/L vino >6% vol
  const TARIFA_LICOR_POR_GRADO_POR_LITRO = 200; // $/°/L licor destilado
  const TARIFA_TABACO_AD_VALOREM = 0.37; // 37% sobre precio base
  const IVA = 0.19; // 19% - IVA normal

  // Validaciones
  if (i.volumen_litros <= 0) {
    return {
      impuesto_especifico: 0,
      impuesto_ad_valorem: 0,
      subtotal_impuesto_consumo: 0,
      base_iva: 0,
      iva_19: 0,
      total_final: 0,
      tarifa_efectiva: 0,
      costo_unitario_final: 0,
    };
  }

  if (i.precio_base_unidad < 0 || i.cantidad_unidades < 1) {
    return {
      impuesto_especifico: 0,
      impuesto_ad_valorem: 0,
      subtotal_impuesto_consumo: 0,
      base_iva: 0,
      iva_19: 0,
      total_final: 0,
      tarifa_efectiva: 0,
      costo_unitario_final: 0,
    };
  }

  // Precio base total = precio unitario × cantidad
  const precio_base_total = i.precio_base_unidad * i.cantidad_unidades;
  const volumen_total = i.volumen_litros * i.cantidad_unidades;

  let impuesto_especifico = 0;
  let impuesto_ad_valorem = 0;

  switch (i.tipo_producto) {
    case 'cerveza':
      // IC Específico = volumen total × tarifa por litro
      impuesto_especifico = volumen_total * TARIFA_CERVEZA_POR_LITRO;
      impuesto_ad_valorem = 0;
      break;

    case 'vino':
      // IC Específico = volumen total × tarifa por litro
      impuesto_especifico = volumen_total * TARIFA_VINO_POR_LITRO;
      impuesto_ad_valorem = 0;
      break;

    case 'licor_destilado':
      // IC Específico = volumen × grado alcohol × tarifa
      // Si grado_alcohol no se proporciona, asumir 40° por defecto
      const grado = i.grado_alcohol ?? 40;
      const grado_valido = Math.max(0, Math.min(96, grado)); // 0-96%
      impuesto_especifico = volumen_total * grado_valido * TARIFA_LICOR_POR_GRADO_POR_LITRO;
      impuesto_ad_valorem = 0;
      break;

    case 'tabaco':
      // IC Ad valorem = precio base × 37%
      impuesto_especifico = 0;
      impuesto_ad_valorem = precio_base_total * TARIFA_TABACO_AD_VALOREM;
      break;

    default:
      impuesto_especifico = 0;
      impuesto_ad_valorem = 0;
  }

  // Subtotal IC
  const subtotal_impuesto_consumo = impuesto_especifico + impuesto_ad_valorem;

  // Base para IVA = precio base + IC
  const base_iva = precio_base_total + subtotal_impuesto_consumo;

  // IVA 19%
  const iva_19 = base_iva * IVA;

  // Total con impuestos
  const total_final = precio_base_total + subtotal_impuesto_consumo + iva_19;

  // Tarifa efectiva combinada = (IC + IVA) / precio base × 100%
  // Si precio base es 0, retornar 0
  const tarifa_efectiva = precio_base_total > 0
    ? ((subtotal_impuesto_consumo + iva_19) / precio_base_total) * 100
    : 0;

  // Costo unitario final = total / cantidad unidades
  const costo_unitario_final = i.cantidad_unidades > 0
    ? total_final / i.cantidad_unidades
    : 0;

  // Redondeo a 2 decimales para moneda
  const redondear = (val: number) => Math.round(val * 100) / 100;

  return {
    impuesto_especifico: redondear(impuesto_especifico),
    impuesto_ad_valorem: redondear(impuesto_ad_valorem),
    subtotal_impuesto_consumo: redondear(subtotal_impuesto_consumo),
    base_iva: redondear(base_iva),
    iva_19: redondear(iva_19),
    total_final: redondear(total_final),
    tarifa_efectiva: redondear(tarifa_efectiva),
    costo_unitario_final: redondear(costo_unitario_final),
  };
}
