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
  _insight?: any;
  _chart?: any;
}

// Precios mensuales por velocidad (CLP, IVA incluido) - julio 2026.
// Precios promocionales de los primeros 12 meses (fuente: sitios oficiales Mundo/GTD +
// comparadores Comparaiso/Selectra, jun-jul 2026). Los operadores ya casi no venden
// planes <500 Mbps: las velocidades bajas colapsan al precio del plan de entrada vigente.
const preciosPorOperador: Record<string, Record<number, number>> = {
  vtr: { 200: 14990, 300: 14990, 400: 14990, 500: 14990, 600: 14990, 800: 20990, 1000: 20990 },
  claro: { 200: 15990, 300: 15990, 400: 15990, 500: 15990, 600: 15990, 800: 19990, 1000: 19990 },
  mundo: { 200: 15990, 300: 15990, 400: 15990, 500: 15990, 600: 15990, 800: 15990, 1000: 16990 },
  gtd: { 200: 17990, 300: 17990, 400: 17990, 500: 17990, 600: 17990, 800: 19990, 1000: 19990 },
  movistar: { 200: 14990, 300: 14990, 400: 14990, 500: 14990, 600: 14990, 800: 19990, 1000: 19990 },
  entel: { 200: 16990, 300: 16990, 400: 16990, 500: 16990, 600: 16990, 800: 20990, 1000: 20990 }
};

// Costos de instalación por operador - julio 2026: instalación incluida sin costo
// en los planes vigentes de todos los operadores.
const instalacionPorOperador: Record<string, number> = {
  vtr: 0,
  claro: 0,
  mundo: 0,
  gtd: 0,
  movistar: 0,
  entel: 0
};

// Permanencia mínima por operador (meses) - julio 2026: los planes fibra vigentes
// se comercializan sin permanencia (planes libres).
const permanenciaPorOperador: Record<string, number> = {
  vtr: 0,
  claro: 0,
  mundo: 0,
  gtd: 0,
  movistar: 0,
  entel: 0
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
  return instalacionPorOperador[operadorLower] ?? 0;
}

function obtenerPermanencia(operador: string): number {
  const operadorLower = operador.toLowerCase();
  return permanenciaPorOperador[operadorLower] ?? 0;
}

function generarRecomendacion(operador: string, valorPorMbps: number, velocidad: number, precioMensual: number): string {
  const operadorLower = operador.toLowerCase();
  
  if (operadorLower === "comparar_todos") {
    return "Selecciona un operador específico para ver detalles. Compara con otros para elegir mejor opción.";
  }
  
  let msg = "";
  
  if (operadorLower === "mundo") {
    msg = "✓ Mejor relación precio/velocidad en gigabit. Sin permanencia; ojo: parte del descuento es promocional.";
  } else if (operadorLower === "vtr") {
    msg = "✓ Buena cobertura RM/Valparaíso. Instalación incluida. Atención técnica 24/7.";
  } else if (operadorLower === "claro") {
    msg = "✓ Fibra Experto hasta 940 Mbps a precio competitivo en zonas urbanas.";
  } else if (operadorLower === "gtd") {
    msg = "✓ Cobertura regional fuerte (zona sur). Router Wi-Fi 6 incluido.";
  } else if (operadorLower === "movistar") {
    msg = "✓ Bundle disponible con móvil/TV. Planes libres, sin permanencia.";
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

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const mensualidades = precioMensual * meses;
  const totalRound = Math.round(costoTotalPeriodo);

  const _insight = {
    title: 'Costo real de tu plan de fibra',
    text: `A lo largo de ${meses} ${meses === 1 ? 'mes' : 'meses'} pagás **${fmt(totalRound)}** (${fmt(costoMensualPromedio)}/mes con la instalación prorrateada). El valor por velocidad es de **$${(Math.round(valorPorMbps * 100) / 100).toLocaleString('es-CL')}/Mbps**: cuanto más bajo, más conviene.`,
    tone: valorPorMbps <= 40 ? 'good' : valorPorMbps >= 60 ? 'warn' : 'neutral',
    icon: '🌐',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Mensualidades (${meses} × ${fmt(precioMensual)})`, value: Math.round(mensualidades) },
      { label: 'Instalación', value: Math.round(costoInstalacion) },
    ],
    prefix: '$',
    centerValue: fmt(totalRound),
    centerLabel: `Total ${meses} meses`,
    ariaLabel: `Desglose del costo total del plan: mensualidades por ${fmt(mensualidades)} más instalación por ${fmt(costoInstalacion)}.`,
  };

  return {
    precio_mensual: Math.round(precioMensual),
    costo_instalacion: Math.round(costoInstalacion),
    permanencia_meses: permanencia,
    costo_total_periodo: totalRound,
    costo_mensual_promedio: Math.round(costoMensualPromedio),
    valor_por_mbps: Math.round((valorPorMbps * 100)) / 100,
    recomendacion: recomendacion,
    _insight,
    _chart
  };
}
