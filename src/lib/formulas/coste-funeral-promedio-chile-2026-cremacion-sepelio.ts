export interface Inputs {
  tipo_servicio: 'cremacion_basica' | 'cremacion_completa' | 'sepelio_tradicional' | 'sepelio_premium';
  region: 'rm' | 'valparaiso' | 'concepcion' | 'valdivia' | 'puertomontt' | 'otras';
  tipo_cementerio: 'publico' | 'privado';
  servicios_adicionales: ('traslado' | 'preparacion' | 'flores' | 'catering' | 'residencia_temporal')[];
  cantidad_asistentes: number;
}

export interface Outputs {
  costo_base: number;
  costo_adicionales: number;
  costo_total: number;
  rango_estimado: string;
  funerarias_comparacion: string;
  opciones_ahorro: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile (fuente: cotizaciones SII, funerarias)
  const COSTO_CREMACION_BASICA_RM = 450000; // $450K RM
  const COSTO_CREMACION_COMPLETA_RM = 680000; // $680K RM
  const COSTO_SEPELIO_TRADICIONAL_RM = 1800000; // $1.8M RM
  const COSTO_SEPELIO_PREMIUM_RM = 2800000; // $2.8M RM

  const AJUSTE_REGION: Record<string, number> = {
    rm: 1.0,
    valparaiso: 0.95,
    concepcion: 0.93,
    valdivia: 0.92,
    puertomontt: 0.90,
    otras: 0.88
  };

  const COSTO_DERECHOS_PUBLICO_RM = 100000; // $100K
  const COSTO_DERECHOS_PRIVADO_RM = 400000; // $400K perpetuo

  const COSTOS_ADICIONALES: Record<string, number> = {
    traslado: 175000,
    preparacion: 250000,
    flores: 200000,
    catering: 5000, // por persona
    residencia_temporal: 150000
  };

  // 1. Costo base según tipo servicio
  let costoBase = 0;
  if (i.tipo_servicio === 'cremacion_basica') {
    costoBase = COSTO_CREMACION_BASICA_RM * AJUSTE_REGION[i.region];
  } else if (i.tipo_servicio === 'cremacion_completa') {
    costoBase = COSTO_CREMACION_COMPLETA_RM * AJUSTE_REGION[i.region];
  } else if (i.tipo_servicio === 'sepelio_tradicional') {
    costoBase = COSTO_SEPELIO_TRADICIONAL_RM * AJUSTE_REGION[i.region];
  } else if (i.tipo_servicio === 'sepelio_premium') {
    costoBase = COSTO_SEPELIO_PREMIUM_RM * AJUSTE_REGION[i.region];
  }

  // 2. Agregar derechos cementerio
  if (i.tipo_cementerio === 'publico') {
    costoBase += COSTO_DERECHOS_PUBLICO_RM * AJUSTE_REGION[i.region];
  } else if (i.tipo_cementerio === 'privado') {
    costoBase += COSTO_DERECHOS_PRIVADO_RM * AJUSTE_REGION[i.region];
  }

  // 3. Calcular servicios adicionales
  let costoAdicionales = 0;
  for (const servicio of i.servicios_adicionales) {
    if (servicio === 'catering') {
      costoAdicionales += COSTOS_ADICIONALES[servicio] * i.cantidad_asistentes;
    } else {
      costoAdicionales += COSTOS_ADICIONALES[servicio] * AJUSTE_REGION[i.region];
    }
  }

  // 4. Costo total
  const costoTotal = costoBase + costoAdicionales;

  // 5. Rango estimado (±15% variabilidad por funeraria)
  const minimo = Math.round(costoTotal * 0.85);
  const maximo = Math.round(costoTotal * 1.15);

  // 6. Comparativa funerarias
  let funerariaTexto = '';
  if (i.region === 'rm') {
    if (i.tipo_servicio.includes('cremacion')) {
      funerariaTexto = 'Sendero: $480K-520K | Hogar Cristo: $520K-580K | IM Funeral: $450K-500K';
    } else {
      funerariaTexto = 'Sendero: $1.85M-2M | Hogar Cristo: $2.1M-2.3M | IM Funeral: $1.7M-1.9M';
    }
  } else {
    if (i.tipo_servicio.includes('cremacion')) {
      funerariaTexto = 'Sendero regional: $420K-480K | Bóveda Eterna: $400K-450K';
    } else {
      funerariaTexto = 'Sendero regional: $1.6M-1.8M | Bóveda Eterna: $1.55M-1.7M';
    }
  }

  // 7. Opciones de ahorro
  let ahorroTexto = '';
  if (i.tipo_servicio.includes('sepelio')) {
    ahorroTexto = 'Cambiar a cremación: ahorro ~$1.5M | Usar cementerio público: ahorro ~$300K | Reducir servicios adicionales: ahorro hasta $700K';
  } else {
    ahorroTexto = 'Cremación básica vs completa: ahorro $100K | Omitir catering: ahorro $200K-400K | Usar funeraria económica: ahorro 10-15%';
  }

  return {
    costo_base: Math.round(costoBase),
    costo_adicionales: Math.round(costoAdicionales),
    costo_total: Math.round(costoTotal),
    rango_estimado: `$${minimo.toLocaleString('es-CL')} - $${maximo.toLocaleString('es-CL')} (variación ±15% según funeraria)`,
    funerarias_comparacion: funerariaTexto,
    opciones_ahorro: ahorroTexto
  };
}
