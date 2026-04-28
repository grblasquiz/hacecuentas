export interface Inputs {
  tipo_servicio: 'basico' | 'medio' | 'premium';
  tipo_disposicion: 'sepelio' | 'cremacion' | 'bovedar';
  ciudad: 'bogota' | 'medellin' | 'cali' | 'barranquilla' | 'cartagena' | 'bucaramanga' | 'interior';
  repatriacion: 'no' | 'si_vecino' | 'si_otro';
  seguro_contratado: 'si' | 'no';
}

export interface Outputs {
  rango_precio_min: number;
  rango_precio_max: number;
  precio_medio: number;
  ahorro_cremacion: number;
  costo_repatriacion: number;
  cobertura_seguro: string;
  comparativa_funerarias: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes de costo base por paquete (en pesos COP 2026)
  const costoPaqueteBase: Record<string, { min: number; max: number }> = {
    basico: { min: 3000000, max: 6000000 },
    medio: { min: 7000000, max: 15000000 },
    premium: { min: 15000000, max: 23000000 }
  };

  // Factor regional (ajuste por ciudad)
  const factorRegion: Record<string, number> = {
    bogota: 1.0,
    medellin: 0.95,
    cali: 0.90,
    barranquilla: 0.92,
    cartagena: 1.08,
    bucaramanga: 0.88,
    interior: 0.85
  };

  // Costo base del paquete seleccionado
  const baseCost = costoPaqueteBase[i.tipo_servicio];
  const minBase = baseCost.min * factorRegion[i.ciudad];
  const maxBase = baseCost.max * factorRegion[i.ciudad];
  const mediaBase = (minBase + maxBase) / 2;

  // Ajuste por tipo de disposición
  let ajusteDisposicion = 1.0;
  let ahorroCremaOptional = 0;

  if (i.tipo_disposicion === 'cremacion') {
    ajusteDisposicion = 0.65; // Ahorra 35%
    ahorroCremaOptional = mediaBase * 0.35;
  } else if (i.tipo_disposicion === 'bovedar') {
    ajusteDisposicion = 1.1; // Cuesta 10% más
  }

  const minAjustado = minBase * ajusteDisposicion;
  const maxAjustado = maxBase * ajusteDisposicion;
  const mediaAjustado = mediaBase * ajusteDisposicion;

  // Costo repatriación
  let costoRepatriacion = 0;
  if (i.repatriacion === 'si_vecino') {
    costoRepatriacion = 3000000; // Promedio $2M–$4M
  } else if (i.repatriacion === 'si_otro') {
    costoRepatriacion = 7500000; // Promedio $5M–$10M
  }

  // Precio final (mínimo, máximo, promedio)
  const rango_precio_min = Math.round(minAjustado + costoRepatriacion);
  const rango_precio_max = Math.round(maxAjustado + costoRepatriacion);
  const precio_medio = Math.round(mediaAjustado + costoRepatriacion);
  const ahorro_cremacion = Math.round(ahorroCremaOptional);

  // Cobertura seguros (texto informativo)
  let coberturaSeguros = '';
  if (i.seguro_contratado === 'si') {
    coberturaSeguros = 'Tiene seguro activo. Cobertura típica: $6M–$12M. Verifique póliza y exclusiones.';
  } else {
    coberturaSeguros = 'Sin seguro. Cobertura promedio mercado: básica $3M–$5M, estándar $6M–$12M, premium $12M–$25M. Primas: $30k–$300k/año.';
  }

  // Comparativa funerarias (texto informativo)
  let comparativaTexto = '';
  const ciudadNorm = i.ciudad;

  if (ciudadNorm === 'bogota' || ciudadNorm === 'medellin') {
    comparativaTexto = 'Bogotá/Medellín - Capillas Católicas: $8.5M–$16M (paquete medio). Los Olivos: $7.8M–$15M. Jardines Esperanza: $7M–$14.5M. Diferencia: hasta $1.5M en paquetes equivalentes.';
  } else if (ciudadNorm === 'cali' || ciudadNorm === 'barranquilla') {
    comparativaTexto = 'Cali/Barranquilla - Capillas Católicas: $8M–$15M. Los Olivos: $7.2M–$14M. Funerarias locales: $6M–$12.5M (10–20% descuento). Negocie directamente.';
  } else if (ciudadNorm === 'cartagena') {
    comparativaTexto = 'Cartagena - Precios 8–10% arriba del promedio nacional. Capillas Católicas: $9M–$17.5M. Alternativas: Bóvedas Heladeras (especialidad): $6.5M–$13M (cremación).';
  } else if (ciudadNorm === 'bucaramanga' || ciudadNorm === 'interior') {
    comparativaTexto = 'Bucaramanga/Interior - Funerarias locales predominan. Rango: $2.5M–$12M (paquete medio). Solicite presupuesto escrito y sin obligación antes de aceptar.';
  }

  return {
    rango_precio_min,
    rango_precio_max,
    precio_medio,
    ahorro_cremacion,
    costo_repatriacion,
    cobertura_seguro: coberturaSeguros,
    comparativa_funerarias: comparativaTexto
  };
}
