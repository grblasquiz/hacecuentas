export interface Inputs {
  tipo_inmueble: 'trastero' | 'garaje_simple' | 'garaje_doble';
  metros_cuadrados: number;
  zona: string;
  incluye_iva: boolean;
}

export interface Outputs {
  precio_base_mensual: number;
  precio_con_iva_mensual: number;
  precio_anual: number;
  rango_minimo: number;
  rango_maximo: number;
  precio_por_m2: number;
  nota_iva: string;
}

// Tarifas base €/m²/mes por zona y tipo — datos de mercado España 2026
// Fuente: Idealista, Fotocasa, CBRE España Q4-2025/Q1-2026
const TARIFAS: Record<string, Record<string, number>> = {
  madrid_centro:      { trastero: 9.5,  garaje_simple: 11.0, garaje_doble: 10.0 },
  madrid_periferia:   { trastero: 6.5,  garaje_simple: 7.5,  garaje_doble: 6.8  },
  barcelona_centro:   { trastero: 9.0,  garaje_simple: 10.5, garaje_doble: 9.5  },
  barcelona_periferia:{ trastero: 6.0,  garaje_simple: 7.0,  garaje_doble: 6.5  },
  bilbao_donostia:    { trastero: 7.5,  garaje_simple: 9.0,  garaje_doble: 8.0  },
  valencia:           { trastero: 5.5,  garaje_simple: 6.5,  garaje_doble: 5.8  },
  sevilla:            { trastero: 5.0,  garaje_simple: 6.0,  garaje_doble: 5.5  },
  malaga:             { trastero: 5.5,  garaje_simple: 6.5,  garaje_doble: 5.8  },
  zaragoza:           { trastero: 5.0,  garaje_simple: 5.8,  garaje_doble: 5.2  },
  alicante_murcia:    { trastero: 4.5,  garaje_simple: 5.5,  garaje_doble: 5.0  },
  ciudad_mediana:     { trastero: 4.0,  garaje_simple: 4.8,  garaje_doble: 4.3  },
  ciudad_pequena:     { trastero: 2.5,  garaje_simple: 3.0,  garaje_doble: 2.8  },
};

// Rangos de mercado (percentil 10-90) €/mes para referencia
// Fuente: análisis de anuncios activos en portales inmobiliarios España 2026
const RANGOS: Record<string, Record<string, [number, number]>> = {
  madrid_centro:      { trastero: [50, 180],  garaje_simple: [120, 220], garaje_doble: [200, 380] },
  madrid_periferia:   { trastero: [30, 90],   garaje_simple: [80,  140], garaje_doble: [130, 240] },
  barcelona_centro:   { trastero: [50, 170],  garaje_simple: [110, 200], garaje_doble: [180, 360] },
  barcelona_periferia:{ trastero: [28, 85],   garaje_simple: [70,  130], garaje_doble: [120, 220] },
  bilbao_donostia:    { trastero: [40, 130],  garaje_simple: [100, 180], garaje_doble: [160, 300] },
  valencia:           { trastero: [25, 90],   garaje_simple: [70,  120], garaje_doble: [110, 200] },
  sevilla:            { trastero: [22, 80],   garaje_simple: [60,  110], garaje_doble: [100, 180] },
  malaga:             { trastero: [25, 90],   garaje_simple: [65,  120], garaje_doble: [110, 200] },
  zaragoza:           { trastero: [20, 75],   garaje_simple: [55,  100], garaje_doble: [90,  170] },
  alicante_murcia:    { trastero: [18, 70],   garaje_simple: [50,  95],  garaje_doble: [85,  160] },
  ciudad_mediana:     { trastero: [15, 60],   garaje_simple: [40,  80],  garaje_doble: [70,  140] },
  ciudad_pequena:     { trastero: [8,  40],   garaje_simple: [20,  55],  garaje_doble: [35,  90]  },
};

// IVA aplicable al arrendamiento por empresarios/profesionales — Art. 20.Uno.23 LIVA
// Fuente: Ley 37/1992 del IVA y AEAT
const IVA = 0.21;

/**
 * Factor de ajuste por tamaño:
 * - Superficies muy pequeñas (<5 m²): +15% (mínimo fijo del arrendador)
 * - Superficies medianas (5-20 m²): sin ajuste
 * - Superficies grandes (>20 m²): -8% (economía de escala)
 */
function factorTamanio(m2: number): number {
  if (m2 < 5)  return 1.15;
  if (m2 > 20) return 0.92;
  return 1.00;
}

function redondear2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // Valores por defecto y validación de entradas
  const metros = Math.max(1, Math.min(200, Number(i.metros_cuadrados) || 10));
  const tipo = i.tipo_inmueble || 'garaje_simple';
  const zona = i.zona || 'ciudad_mediana';
  const conIva = i.incluye_iva !== false;

  // Obtener tarifa base, con fallback a ciudad_mediana si la zona no existe
  const tarifasZona = TARIFAS[zona] ?? TARIFAS['ciudad_mediana'];
  const tarifaBase = tarifasZona[tipo] ?? tarifasZona['garaje_simple'] ?? 4.8;

  // Precio base mensual con factor de tamaño
  const factor = factorTamanio(metros);
  const precioBase = redondear2(tarifaBase * metros * factor);

  // Precio con IVA 21%
  const precioConIva = redondear2(precioBase * (1 + IVA));

  // Precio que se muestra según preferencia del usuario
  const precioMensualFinal = conIva ? precioConIva : precioBase;

  // Coste anual
  const precioAnual = redondear2(precioMensualFinal * 12);

  // Precio por m² (sin IVA, para referencia de mercado)
  const precioPorM2 = redondear2(precioBase / metros);

  // Rangos de mercado para la zona y tipo
  const rangosZona = RANGOS[zona] ?? RANGOS['ciudad_mediana'];
  const rango = rangosZona[tipo] ?? rangosZona['garaje_simple'] ?? [30, 100];
  const rangoMin = conIva ? redondear2(rango[0] * (1 + IVA)) : rango[0];
  const rangoMax = conIva ? redondear2(rango[1] * (1 + IVA)) : rango[1];

  // Nota sobre IVA
  let notaIva: string;
  if (conIva) {
    notaIva = 'Precio con IVA del 21% incluido. El IVA aplica cuando el arrendador actúa como empresario o profesional (Art. 20.Uno.23 LIVA). Entre particulares el arrendamiento puede estar exento; consulta con la AEAT.';
  } else {
    notaIva = 'Precio sin IVA. Si el arrendador es empresario o profesional deberás añadir el 21% de IVA sobre esta cantidad.';
  }

  return {
    precio_base_mensual: precioBase,
    precio_con_iva_mensual: precioConIva,
    precio_anual: precioAnual,
    rango_minimo: rangoMin,
    rango_maximo: rangoMax,
    precio_por_m2: precioPorM2,
    nota_iva: notaIva,
  };
}
