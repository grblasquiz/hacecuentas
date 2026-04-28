export interface Inputs {
  tipo_vehiculo: 'moto' | 'autoparticular' | 'autocomercial' | 'busminibus' | 'camion' | 'motoneta';
  cilindraje: number; // cc
  antiguedad_anos: number;
  aseguradora: 'sura' | 'mapfre' | 'bolivar' | 'ace' | 'solidaria';
  pago_anticipado: boolean;
}

export interface Outputs {
  tarifa_base_anual: number; // COP
  descuento_pronto_pago: number; // COP
  precio_final_soat: number; // COP
  comparativa_aseguradoras: Array<{
    aseguradora: string;
    tarifa_base: number;
    descuento: number;
    precio_final: number;
  }>;
  multa_sin_soat: number; // COP
  validez_soat: string;
}

export function compute(i: Inputs): Outputs {
  // Tarifas base por tipo vehículo y cilindraje (COP 2026)
  // Fuente: Superintendencia Financiera
  const MULTA_SIN_SOAT = 2_400_000; // COP 2026

  let tarifaBase = 0;

  // Cálculo tarifa base según categoría
  if (i.tipo_vehiculo === 'motoneta') {
    tarifaBase = 415_000; // motoneta/ciclomotor rango medio
  } else if (i.tipo_vehiculo === 'moto') {
    if (i.cilindraje <= 125) {
      tarifaBase = 500_000; // 125cc rango medio $420-580K
    } else if (i.cilindraje <= 250) {
      tarifaBase = 635_000; // 125-250cc rango medio $520-750K
    } else {
      tarifaBase = 775_000; // >250cc rango medio $650-900K
    }
  } else if (i.tipo_vehiculo === 'autoparticular') {
    if (i.cilindraje <= 1500) {
      tarifaBase = 990_000; // 1.0-1.5L rango medio $780-1.2M
    } else if (i.cilindraje <= 2000) {
      tarifaBase = 1_100_000; // 1.5-2.0L rango medio $850-1.35M
    } else {
      tarifaBase = 1_300_000; // >2.0L
    }
  } else if (i.tipo_vehiculo === 'autocomercial') {
    tarifaBase = 1_450_000; // taxi/comercial rango medio $1.1-1.8M
  } else if (i.tipo_vehiculo === 'busminibus') {
    tarifaBase = 2_100_000; // bus/minibus
  } else if (i.tipo_vehiculo === 'camion') {
    if (i.cilindraje <= 3000) {
      tarifaBase = 1_800_000;
    } else {
      tarifaBase = 2_500_000;
    }
  }

  // Ajuste por antigüedad (vehículos >10 años pueden tener recargo)
  if (i.antiguedad_anos > 10) {
    const recargoAntigüedad = Math.min(i.antiguedad_anos - 10, 10) * 0.02; // 2% por año >10, máx 20%
    tarifaBase = tarifaBase * (1 + recargoAntigüedad);
  }

  // Variación aseguradora (±3% respecto base)
  const varacionAseguradora: Record<string, number> = {
    'sura': 0.00,      // referencia
    'mapfre': -0.01,   // -1%
    'bolivar': -0.02,  // -2%
    'ace': 0.02,       // +2%
    'solidaria': 0.01  // +1%
  };
  const tarifaAseguradora = tarifaBase * (1 + (varacionAseguradora[i.aseguradora] || 0));

  // Descuento pronto pago
  const descuentoPorcentaje: Record<string, number> = {
    'sura': 0.10,      // 10%
    'mapfre': 0.08,    // 8%
    'bolivar': 0.12,   // 12%
    'ace': 0.05,       // 5%
    'solidaria': 0.07  // 7%
  };
  const descuentoPct = i.pago_anticipado ? (descuentoPorcentaje[i.aseguradora] || 0.08) : 0;
  const montoDescuento = tarifaAseguradora * descuentoPct;
  const precioFinal = tarifaAseguradora - montoDescuento;

  // Comparativa aseguradoras (todas con mismo tipo vehículo, descuento si aplica)
  const aseguradoras = ['sura', 'mapfre', 'bolivar', 'ace', 'solidaria'];
  const comparativa = aseguradoras.map(aseg => {
    const variacion = varacionAseguradora[aseg] || 0;
    const tarifa = tarifaBase * (1 + variacion);
    const descPct = i.pago_anticipado ? (descuentoPorcentaje[aseg] || 0.08) : 0;
    const descuento = tarifa * descPct;
    const final = tarifa - descuento;
    return {
      aseguradora: aseg.charAt(0).toUpperCase() + aseg.slice(1),
      tarifa_base: Math.round(tarifa),
      descuento: Math.round(descuento),
      precio_final: Math.round(final)
    };
  });

  const validezSoat = 'Anual (se renueva cada año antes de vencer)';

  return {
    tarifa_base_anual: Math.round(tarifaAseguradora),
    descuento_pronto_pago: Math.round(montoDescuento),
    precio_final_soat: Math.round(precioFinal),
    comparativa_aseguradoras: comparativa,
    multa_sin_soat: MULTA_SIN_SOAT,
    validez_soat: validezSoat
  };
}
