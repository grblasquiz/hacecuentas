export interface Inputs {
  ciudad: 'cdmx' | 'guadalajara' | 'monterrey' | 'queretaro' | 'merida';
  recamaras: '1' | '2' | '3';
  colonia_nivel: 'premium' | 'medio_alto' | 'medio' | 'economico';
  incluir_servicios: 'si' | 'no';
}

export interface Outputs {
  renta_mensual: number;
  renta_minima: number;
  renta_maxima: number;
  deposito_garantia: number;
  renta_anual: number;
  servicios_estimado: number;
  costo_total_mes: number;
  aval_requerido: string;
}

function obtenerBaseRenta(ciudad: string, recamaras: string): { base: number; minimo: number; maximo: number } {
  // Datos 2026 mercado inmobiliario México (Inmuebles24, Vivanuncios)
  const tablas: Record<string, Record<string, { base: number; minimo: number; maximo: number }>> = {
    cdmx: {
      '1': { base: 22000, minimo: 18000, maximo: 40000 },
      '2': { base: 35000, minimo: 25000, maximo: 55000 },
      '3': { base: 48000, minimo: 35000, maximo: 70000 }
    },
    guadalajara: {
      '1': { base: 14000, minimo: 10000, maximo: 22000 },
      '2': { base: 21000, minimo: 15000, maximo: 32000 },
      '3': { base: 29000, minimo: 20000, maximo: 42000 }
    },
    monterrey: {
      '1': { base: 17000, minimo: 12000, maximo: 28000 },
      '2': { base: 26000, minimo: 18000, maximo: 40000 },
      '3': { base: 36000, minimo: 25000, maximo: 50000 }
    },
    queretaro: {
      '1': { base: 11000, minimo: 8000, maximo: 18000 },
      '2': { base: 16500, minimo: 12000, maximo: 25000 },
      '3': { base: 23000, minimo: 16000, maximo: 35000 }
    },
    merida: {
      '1': { base: 9000, minimo: 6000, maximo: 15000 },
      '2': { base: 14000, minimo: 10000, maximo: 22000 },
      '3': { base: 20000, minimo: 14000, maximo: 30000 }
    }
  };

  return tablas[ciudad]?.[recamaras] || tablas.cdmx['1'];
}

function ajusteNivelZona(base: number, nivel: string): number {
  const ajustes: Record<string, number> = {
    premium: 0.35,
    medio_alto: 0.20,
    medio: 0.05,
    economico: -0.15
  };
  return base * (1 + (ajustes[nivel] || 0));
}

function obtenerServiciosEstimado(ciudad: string): number {
  // Estimado luz, agua, gas, internet mensual (datos CFE, CONAGUA, proveedores 2026)
  const servicios: Record<string, number> = {
    cdmx: 1200,
    guadalajara: 1000,
    monterrey: 1100,
    queretaro: 950,
    merida: 900
  };
  return servicios[ciudad] || 1000;
}

function requiereAval(ciudad: string, nivel: string): string {
  if ((ciudad === 'cdmx' && (nivel === 'premium' || nivel === 'medio_alto')) ||
      (ciudad === 'monterrey' && nivel === 'premium')) {
    return 'Sí, típicamente requerido. Ingresos aval ≥3× renta mensual.';
  }
  if (nivel === 'medio' || nivel === 'economico') {
    return 'Posible según propietario. Pago 2-3 meses adelantado puede evitarlo.';
  }
  return 'Frecuente en zonas medianas. Verificar con propietario.';
}

export function compute(i: Inputs): Outputs {
  const { ciudad, recamaras, colonia_nivel, incluir_servicios } = i;

  // 1. Obtener renta base según ciudad y recámaras
  const baseData = obtenerBaseRenta(ciudad, recamaras);
  let rentaPromedio = baseData.base;

  // 2. Aplicar ajuste por nivel de zona
  rentaPromedio = ajusteNivelZona(rentaPromedio, colonia_nivel);

  // Redondear a múltiplo de 500 (convención mercado inmobiliario)
  rentaPromedio = Math.round(rentaPromedio / 500) * 500;

  // 3. Ajustar mínimo y máximo según nivel de zona
  let rentaMinima = Math.round((baseData.minimo * (1 + (colonia_nivel === 'premium' ? 0.25 : colonia_nivel === 'medio_alto' ? 0.10 : colonia_nivel === 'economico' ? -0.10 : 0))) / 500) * 500;
  let rentaMaxima = Math.round((baseData.maximo * (1 + (colonia_nivel === 'premium' ? 0.25 : colonia_nivel === 'medio_alto' ? 0.15 : colonia_nivel === 'economico' ? -0.15 : 0))) / 500) * 500;

  // 4. Depósito garantía (1.5 × renta promedio)
  const depositoGarantia = rentaPromedio * 1.5;

  // 5. Renta anual
  const rentaAnual = rentaPromedio * 12;

  // 6. Servicios estimados
  const serviciosEstimado = obtenerServiciosEstimado(ciudad);

  // 7. Costo total mensual (solo si usuario lo solicita)
  const costoTotalMes = incluir_servicios === 'si' ? rentaPromedio + serviciosEstimado : rentaPromedio;

  // 8. Requerimiento de aval
  const avalRequerido = requiereAval(ciudad, colonia_nivel);

  return {
    renta_mensual: Math.round(rentaPromedio),
    renta_minima: Math.round(rentaMinima),
    renta_maxima: Math.round(rentaMaxima),
    deposito_garantia: Math.round(depositoGarantia),
    renta_anual: Math.round(rentaAnual),
    servicios_estimado: Math.round(serviciosEstimado),
    costo_total_mes: Math.round(costoTotalMes),
    aval_requerido: avalRequerido
  };
}
