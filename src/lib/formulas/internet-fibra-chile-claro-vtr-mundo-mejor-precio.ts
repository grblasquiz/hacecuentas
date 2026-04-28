export interface Inputs {
  velocidad_mbps: number;
  region: string;
  operador: string;
  meses: number;
}

export interface Outputs {
  precio_mensual: number;
  costo_instalacion: number;
  permanencia_meses: number;
  costo_total_periodo: number;
  costo_mensual_promedio: number;
  valor_por_mbps: number;
  recomendacion: string;
}

// Precios mensuales por velocidad (CLP, IVA incluido) - abril 2026
const preciosPorOperador: Record<string, Record<number, number>> = {
  vtr: { 200: 15990, 300: 21990, 400: 29990, 500: 39990, 600: 49990, 800: 59990, 1000: 79990 },
  claro: { 200: 16990, 300: 24990, 400: 34990, 500: 44990, 600: 54990, 800: 64990, 1000: 89990 },
  mundo: { 200: 14990, 300: 19990, 400: 27990, 500: 34990, 600: 44990, 800: 54990, 1000: 74990 },
  gtd: { 200: 17990, 300: 25990, 400: 35990, 500: 45990, 600: 55990, 800: 65990, 1000: 85990 },
  movistar: { 200: 18990, 300: 27990, 400: 39990, 500: 49990, 600: 59990, 800: 69990, 1000: 89990 },
  entel: { 200: 19990, 300: 28990, 400: 44990, 500: 54990, 600: 64990, 800: 74990, 1000: 95990 }
};

// Costos de instalación por operador (rango: min-max) - promedio para cálculo
const instalacionPorOperador: Record<string, number> = {
  vtr: 24500,      // 0-49000
  claro: 49500,    // 0-99000
  mundo: 19500,    // 0-39000
  gtd: 64000,      // 49000-79000
  movistar: 29500, // 0-59000
  entel: 34500     // 0-69000
};

// Permanencia mínima por operador (meses)
const permanenciaPorOperador: Record<string, number> = {
  vtr: 24,
  claro: 24,
  mundo: 18,
  gtd: 18,
  movistar: 24,
  entel: 24
};

// Velocidades soportadas por región (simplificado)
const velocidadesPorRegion: Record<string, number[]> = {
  rm: [200, 300, 400, 500, 600, 800, 1000],
  valparaiso: [200, 300, 400, 500, 600, 800, 1000],
  biobio: [200, 300, 400, 500, 600, 800, 1000],
  araucania: [200, 300, 400, 500, 800],
  losrios: [200, 300, 400, 500, 800],
  loslagos: [200, 300, 400, 500, 800],
  arica: [200, 300, 400, 500],
  tarapaca: [200, 300, 400, 500],
  antofagasta: [200, 300, 400, 500, 600, 800],
  atacama: [200, 300, 400, 500],
  coquimbo: [200, 300, 400, 500, 600],
  osexo: [200, 300, 400, 500, 800],
  maule: [200, 300, 400, 500, 600],
  ohiggins: [200, 300, 400, 500, 600, 800],
  magallanes: [200, 300, 400, 500]
};

function obtenerPrecioMensual(operador: string, velocidad: number): number {
  const operadorLower = operador.toLowerCase();
  if (!(operadorLower in preciosPorOperador)) return 0;
  const precios = preciosPorOperador[operadorLower];
  if (!(velocidad in precios)) {
    // Si velocidad exacta no existe, retorna precio más cercano
    const velocidadesDisponibles = Object.keys(precios).map(Number).sort((a, b) => a - b);
    const closest = velocidadesDisponibles.reduce((prev, curr) =>
      Math.abs(curr - velocidad) < Math.abs(prev - velocidad) ? curr : prev
    );
    return precios[closest];
  }
  return precios[velocidad];
}

function obtenerInstalacion(operador: string): number {
  const operadorLower = operador.toLowerCase();
  return instalacionPorOperador[operadorLower] || 30000;
}

function obtenerPermanencia(operador: string): number {
  const operadorLower = operador.toLowerCase();
  return permanenciaPorOperador[operadorLower] || 24;
}

function generarRecomendacion(operador: string, valorPorMbps: number, velocidad: number, precioMensual: number): string {
  const operadorLower = operador.toLowerCase();
  
  if (operadorLower === "comparar_todos") {
    return "Selecciona un operador específico para ver detalles. Compara con otros para elegir mejor opción.";
  }
  
  let msg = "";
  
  if (operadorLower === "mundo") {
    msg = "✓ Mejor relación precio/velocidad. Permanencia 18 meses, más flexible.";
  } else if (operadorLower === "vtr") {
    msg = "✓ Buena cobertura RM/Valparaíso. Instalación desde $0. Atención técnica 24/7.";
  } else if (operadorLower === "claro") {
    msg = "✓ Máxima velocidad disponible. Planes desde 200 hasta 1000 Mbps en zonas urbanas.";
  } else if (operadorLower === "gtd") {
    msg = "✓ Cobertura regional. Velocidades altas a precios competitivos en Bío Bío.";
  } else if (operadorLower === "movistar") {
    msg = "✓ Bundle disponible con móvil/TV. Permanencia 24 meses estándar.";
  } else if (operadorLower === "entel") {
    msg = "✓ Plan Fibra Entel con soporte premium. Bundles móvil/TV/internet disponibles.";
  }
  
  if (velocidad >= 800) {
    msg += " Plan 4K ready: gaming online, streaming 4K simultáneo.";
  } else if (velocidad >= 500) {
    msg += " Streaming HD + teletrabajo sin congestión.";
  } else if (velocidad >= 300) {
    msg += " Ideal para teletrabajo, streaming normal, redes sociales.";
  } else {
    msg += " Plan básico: navegación, correo, streaming SD.";
  }
  
  return msg;
}

export function compute(inputs: Inputs): Outputs {
  const { velocidad_mbps, region, operador, meses } = inputs;
  
  // Validaciones
  if (velocidad_mbps <= 0 || meses <= 0) {
    return {
      precio_mensual: 0,
      costo_instalacion: 0,
      permanencia_meses: 0,
      costo_total_periodo: 0,
      costo_mensual_promedio: 0,
      valor_por_mbps: 0,
      recomendacion: "Error: velocidad y meses deben ser mayores a 0"
    };
  }
  
  // Obtener precio mensual
  const precioMensual = obtenerPrecioMensual(operador, velocidad_mbps);
  if (precioMensual === 0) {
    return {
      precio_mensual: 0,
      costo_instalacion: 0,
      permanencia_meses: 0,
      costo_total_periodo: 0,
      costo_mensual_promedio: 0,
      valor_por_mbps: 0,
      recomendacion: `Operador ${operador} no disponible o velocidad ${velocidad_mbps} Mbps no soportada en región ${region}`
    };
  }
  
  // Calcular valores
  const costoInstalacion = obtenerInstalacion(operador);
  const permanencia = obtenerPermanencia(operador);
  const costoTotalPeriodo = (precioMensual * meses) + costoInstalacion;
  const costoMensualPromedio = costoTotalPeriodo / meses;
  const valorPorMbps = precioMensual / velocidad_mbps;
  
  // Generar recomendación
  const recomendacion = generarRecomendacion(operador, valorPorMbps, velocidad_mbps, precioMensual);
  
  return {
    precio_mensual: Math.round(precioMensual),
    costo_instalacion: Math.round(costoInstalacion),
    permanencia_meses: permanencia,
    costo_total_periodo: Math.round(costoTotalPeriodo),
    costo_mensual_promedio: Math.round(costoMensualPromedio),
    valor_por_mbps: Math.round((valorPorMbps * 100)) / 100,
    recomendacion: recomendacion
  };
}
