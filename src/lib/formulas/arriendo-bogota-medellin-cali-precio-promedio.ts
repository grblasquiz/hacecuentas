export interface Inputs {
  ciudad: 'bogota' | 'medellin' | 'cali' | 'barranquilla';
  zona: 'premium' | 'media-alta' | 'media' | 'media-baja';
  alcobas: 1 | 2 | 3 | 4;
}

export interface Outputs {
  precio_minimo: number;
  precio_maximo: number;
  precio_promedio: number;
  deposito_minimo: number;
  deposito_maximo: number;
  administracion: number;
  gasto_total_primer_mes: number;
  rango_texto: string;
}

export function compute(i: Inputs): Outputs {
  // Precios base por ciudad 2026 (2 alcobas, zona media-alta)
  // Fuente: FINCA, DANE, portales inmobiliarios Colombia
  const preciosBaseCiudad: Record<string, number> = {
    bogota: 2800000,
    medellin: 2200000,
    cali: 1600000,
    barranquilla: 1700000,
  };

  // Factores multiplicadores por zona (estrato)
  const factoresZona: Record<string, { min: number; max: number }> = {
    premium: { min: 1.4, max: 1.6 },
    'media-alta': { min: 1.0, max: 1.2 },
    media: { min: 0.8, max: 1.0 },
    'media-baja': { min: 0.6, max: 0.8 },
  };

  // Factores multiplicadores por número de alcobas
  const factoresAlcobas: Record<number, { min: number; max: number }> = {
    1: { min: 0.62, max: 0.68 },
    2: { min: 0.95, max: 1.05 },
    3: { min: 1.35, max: 1.45 },
    4: { min: 1.7, max: 2.0 },
  };

  // Porcentaje administración por zona
  const porcentajeAdminZona: Record<string, { min: number; max: number }> = {
    premium: { min: 0.22, max: 0.26 },
    'media-alta': { min: 0.18, max: 0.22 },
    media: { min: 0.15, max: 0.18 },
    'media-baja': { min: 0.12, max: 0.15 },
  };

  const precioBase = preciosBaseCiudad[i.ciudad];
  const factorZona = factoresZona[i.zona];
  const factorAlcobas = factoresAlcobas[i.alcobas];
  const porcAdmin = porcentajeAdminZona[i.zona];

  // Calcular rango de precios
  const precioMinimo = Math.round(
    precioBase * factorZona.min * factorAlcobas.min
  );
  const precioMaximo = Math.round(
    precioBase * factorZona.max * factorAlcobas.max
  );
  const precioPromedio = Math.round((precioMinimo + precioMaximo) / 2);

  // Depósito caución (1-2 meses)
  const depositoMinimo = Math.round(precioPromedio * 1);
  const depositoMaximo = Math.round(precioPromedio * 2);

  // Administración promedio
  const adminMin = Math.round(precioPromedio * porcAdmin.min);
  const adminMax = Math.round(precioPromedio * porcAdmin.max);
  const administracion = Math.round((adminMin + adminMax) / 2);

  // Gasto total primer mes (canon + depósito máximo + administración)
  const gastoTotalPrimerMes = Math.round(
    precioPromedio + depositoMaximo + administracion
  );

  // Texto descriptivo del rango
  const ciudadNombre: Record<string, string> = {
    bogota: 'Bogotá',
    medellin: 'Medellín',
    cali: 'Cali',
    barranquilla: 'Barranquilla',
  };

  const zonaNombre: Record<string, string> = {
    premium: 'zona premium',
    'media-alta': 'zona media-alta',
    media: 'zona media',
    'media-baja': 'zona media-baja',
  };

  const alcobaNombre =
    i.alcobas === 1 ? '1 alcoba' : `${i.alcobas} alcobas`;

  const rangoTexto = `Apartamento de ${alcobaNombre} en ${zonaNombre[i.zona]} de ${ciudadNombre[i.ciudad]}: $${precioMinimo.toLocaleString('es-CO')} - $${precioMaximo.toLocaleString('es-CO')} mensuales. Depósito: $${depositoMinimo.toLocaleString('es-CO')} a $${depositoMaximo.toLocaleString('es-CO')}.`;

  return {
    precio_minimo: precioMinimo,
    precio_maximo: precioMaximo,
    precio_promedio: precioPromedio,
    deposito_minimo: depositoMinimo,
    deposito_maximo: depositoMaximo,
    administracion: administracion,
    gasto_total_primer_mes: gastoTotalPrimerMes,
    rango_texto: rangoTexto,
  };
}
