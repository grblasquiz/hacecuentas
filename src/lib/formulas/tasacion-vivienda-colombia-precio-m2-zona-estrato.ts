export interface Inputs {
  area_m2: number;
  ciudad: string;
  estrato: number;
  antiguedad_anos: number;
}

export interface Outputs {
  precio_m2_estimado: number;
  valor_tasacion_total: number;
  valor_hipoteca_80pct: number;
  valor_catastral_aprox: number;
  rango_mercado: string;
  factor_depreciacion: number;
}

// Fuente: DIAN 2026, IGAC, Superfinanciera
const PRECIOS_BASE_M2: Record<string, number> = {
  'bogota_chapinero': 6_500_000,
  'bogota_norte': 4_800_000,
  'bogota_centro': 2_500_000,
  'medellin_poblado': 5_800_000,
  'medellin_sabaneta': 4_200_000,
  'medellin_otros': 3_800_000,
  'cali_sur': 3_100_000,
  'cali_otros': 2_400_000,
  'barranquilla': 2_800_000,
  'cartagena': 3_900_000,
  'bucaramanga': 2_200_000,
  'cucuta': 1_800_000,
  'armenia': 1_900_000,
  'pereira': 2_000_000,
  'manizales': 1_950_000,
  'ibague': 1_700_000,
  'villavicencio': 1_600_000,
  'neiva': 1_500_000,
};

// Ajustes por estrato (multiplicador sobre base) - Fuente: DIAN
const AJUSTE_ESTRATO: Record<number, number> = {
  1: -0.20,
  2: -0.10,
  3: -0.05,
  4: 0.00,
  5: 0.12,
  6: 0.18,
};

export function compute(i: Inputs): Outputs {
  // Validar inputs
  const area = Math.max(20, Math.min(1000, i.area_m2 || 120));
  const ciudad = i.ciudad || 'bogota_chapinero';
  const estrato = Math.max(1, Math.min(6, i.estrato || 4));
  const antiguedad = Math.max(0, i.antiguedad_anos || 0);

  // Precio base por zona
  const precioBase = PRECIOS_BASE_M2[ciudad] || 3_000_000;

  // Ajuste por estrato
  const ajusteEstrato = AJUSTE_ESTRATO[estrato] || 0;
  const precioConEstrato = precioBase * (1 + ajusteEstrato);

  // Factor depreciación por antigüedad
  // Inmuebles nuevos (0-2 años): +5%
  // Jóvenes (3-10 años): sin ajuste
  // Medios (11-20 años): -0.5% anual
  // Antiguos (>20 años): -0.5% anual máx -30%
  let factorDepreciacion = 1.0;
  if (antiguedad < 3) {
    // Prima nuevecita: +5% distribuido linealmente
    factorDepreciacion = 1 + (0.05 * (3 - antiguedad) / 3);
  } else if (antiguedad >= 3) {
    // Depreciación: 0.5% anual
    const deprecEscalon = Math.min(0.30, (antiguedad - 2) * 0.005);
    factorDepreciacion = Math.max(0.70, 1 - deprecEscalon);
  }

  // Precio final por m²
  const precioM2Final = precioConEstrato * factorDepreciacion;

  // Valores de salida
  const valorTasacionTotal = precioM2Final * area;
  const valorHipoteca80 = valorTasacionTotal * 0.80;
  const valorCatastralAprox = valorTasacionTotal * 0.50; // DIAN 2026

  // Rango de mercado: típicamente 85-95% del tasado
  const rangoMin = Math.round(valorTasacionTotal * 0.85);
  const rangoMax = Math.round(valorTasacionTotal * 0.95);
  const rangoMercado = `$${(rangoMin / 1_000_000).toFixed(1)}M - $${(rangoMax / 1_000_000).toFixed(1)}M`;

  return {
    precio_m2_estimado: Math.round(precioM2Final),
    valor_tasacion_total: Math.round(valorTasacionTotal),
    valor_hipoteca_80pct: Math.round(valorHipoteca80),
    valor_catastral_aprox: Math.round(valorCatastralAprox),
    rango_mercado: rangoMercado,
    factor_depreciacion: Math.round(factorDepreciacion * 10000) / 10000,
  };
}
