export interface Inputs {
  valor_comercial: number;
  departamento: string;
  pago_anticipado: 'no' | 'si_10' | 'si_5';
}

export interface Outputs {
  tarifa_aplicable: number;
  impuesto_anual_base: number;
  descuento_pago_anticipado: number;
  impuesto_neto: number;
  ahorro_anual: number;
}

// Tarifas máximas por departamento Colombia 2026 (DIAN)
const TARIFAS_DEPARTAMENTALES: Record<string, number> = {
  'amazonas': 1.5,
  'antioquia': 2.5,
  'arauca': 1.5,
  'atlantico': 2.5,
  'bolivar': 2.0,
  'boyaca': 2.0,
  'caldas': 2.0,
  'caqueta': 1.5,
  'cartagena': 2.5,
  'cauca': 1.5,
  'cesar': 2.0,
  'choco': 1.5,
  'cordoba': 2.0,
  'cundinamarca': 2.5,
  'distago': 2.5,
  'guainia': 1.5,
  'guaviare': 1.5,
  'huila': 2.0,
  'la_guajira': 2.0,
  'magdalena': 2.0,
  'meta': 2.0,
  'nariño': 1.5,
  'norte_santander': 2.0,
  'putumayo': 1.5,
  'quindio': 2.0,
  'risaralda': 2.0,
  'san_andres': 1.5,
  'santander': 2.5,
  'sucre': 2.0,
  'tolima': 2.0,
  'valle': 2.5,
  'vichada': 1.5
};

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  if (i.valor_comercial <= 0) {
    return {
      tarifa_aplicable: 0,
      impuesto_anual_base: 0,
      descuento_pago_anticipado: 0,
      impuesto_neto: 0,
      ahorro_anual: 0
    };
  }

  // Determinar tarifa base según valor comercial (Resolución DIAN 2026)
  let tarifa_base: number;
  if (i.valor_comercial < 50000000) {
    tarifa_base = 1.5; // < $50M: 1.5%
  } else if (i.valor_comercial <= 110000000) {
    tarifa_base = 2.5; // $50M - $110M: 2.5%
  } else {
    tarifa_base = 3.5; // > $110M: 3.5%
  }

  // Obtener tarifa máxima departamental
  const tarifa_dept = TARIFAS_DEPARTAMENTALES[i.departamento] || 2.5;

  // Aplicar tarifa: se usa la MENOR entre base y departamental
  const tarifa_aplicable = Math.min(tarifa_base, tarifa_dept);

  // Impuesto anual base
  const impuesto_anual_base = i.valor_comercial * (tarifa_aplicable / 100);

  // Descuento por pago anticipado
  let descuento_pago_anticipado = 0;
  if (i.pago_anticipado === 'si_10') {
    descuento_pago_anticipado = impuesto_anual_base * 0.10; // 10% descuento
  } else if (i.pago_anticipado === 'si_5') {
    descuento_pago_anticipado = impuesto_anual_base * 0.05; // 5% descuento
  }

  // Impuesto neto
  const impuesto_neto = impuesto_anual_base - descuento_pago_anticipado;

  // Ahorro anual
  const ahorro_anual = descuento_pago_anticipado;

  return {
    tarifa_aplicable: Math.round(tarifa_aplicable * 100) / 100,
    impuesto_anual_base: Math.round(impuesto_anual_base),
    descuento_pago_anticipado: Math.round(descuento_pago_anticipado),
    impuesto_neto: Math.round(impuesto_neto),
    ahorro_anual: Math.round(ahorro_anual)
  };
}
