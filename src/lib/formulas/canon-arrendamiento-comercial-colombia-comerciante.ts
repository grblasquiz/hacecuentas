export interface Inputs {
  metros_cuadrados: number;
  departamento: string;
  zona_comercial: string;
  ingresos_negocio_anual: number;
  tipo_negocio: string;
  ipc_reajuste_anual: number;
}

export interface Outputs {
  canon_mensual_estimado: number;
  canon_anual: number;
  deposito_caution_tipico: number;
  canon_ano_2_reajustado: number;
  porcentaje_ingresos: number;
  valor_m2_mensual: number;
  duracion_contrato_minima: number;
}

// Tabla de valores m² mensual por departamento y zona (COP 2026)
// Fuente: DANE, Cámaras de Comercio regionales, estudios inmobiliarios
const preciosPorZona: Record<string, Record<string, number>> = {
  "Bogotá D.C.": {
    "Centro histórico / tradicional": 57500,
    "Zona comercial media": 32500,
    "Centro de negocios premium": 90000,
    "Sector industrial / comercial periférico": 16000,
    "Corredor vial / salida ciudad": 20000
  },
  "Antioquia": {
    "Centro histórico / tradicional": 35000,
    "Zona comercial media": 20500,
    "Centro de negocios premium": 55000,
    "Sector industrial / comercial periférico": 11000,
    "Corredor vial / salida ciudad": 14000
  },
  "Valle del Cauca": {
    "Centro histórico / tradicional": 23000,
    "Zona comercial media": 15000,
    "Centro de negocios premium": 40000,
    "Sector industrial / comercial periférico": 8000,
    "Corredor vial / salida ciudad": 11000
  },
  "Atlántico": {
    "Centro histórico / tradicional": 18500,
    "Zona comercial media": 12500,
    "Centro de negocios premium": 32500,
    "Sector industrial / comercial periférico": 6500,
    "Corredor vial / salida ciudad": 9000
  },
  "Cundinamarca": {
    "Centro histórico / tradicional": 20000,
    "Zona comercial media": 13000,
    "Centro de negocios premium": 35000,
    "Sector industrial / comercial periférico": 7000,
    "Corredor vial / salida ciudad": 10000
  },
  "Bolívar": {
    "Centro histórico / tradicional": 15500,
    "Zona comercial media": 10000,
    "Centro de negocios premium": 25000,
    "Sector industrial / comercial periférico": 5500,
    "Corredor vial / salida ciudad": 7500
  },
  "Córdoba": {
    "Centro histórico / tradicional": 12000,
    "Zona comercial media": 8000,
    "Centro de negocios premium": 20000,
    "Sector industrial / comercial periférico": 4500,
    "Corredor vial / salida ciudad": 6000
  },
  "Magdalena": {
    "Centro histórico / tradicional": 13000,
    "Zona comercial media": 8500,
    "Centro de negocios premium": 21000,
    "Sector industrial / comercial periférico": 4800,
    "Corredor vial / salida ciudad": 6500
  },
  "Santander": {
    "Centro histórico / tradicional": 19000,
    "Zona comercial media": 12000,
    "Centro de negocios premium": 30000,
    "Sector industrial / comercial periférico": 6500,
    "Corredor vial / salida ciudad": 9000
  },
  "Boyacá": {
    "Centro histórico / tradicional": 14000,
    "Zona comercial media": 9000,
    "Centro de negocios premium": 22000,
    "Sector industrial / comercial periférico": 5000,
    "Corredor vial / salida ciudad": 6800
  },
  "Nariño": {
    "Centro histórico / tradicional": 12500,
    "Zona comercial media": 8200,
    "Centro de negocios premium": 20500,
    "Sector industrial / comercial periférico": 4500,
    "Corredor vial / salida ciudad": 6000
  },
  "Cauca": {
    "Centro histórico / tradicional": 10000,
    "Zona comercial media": 6500,
    "Centro de negocios premium": 16000,
    "Sector industrial / comercial periférico": 3500,
    "Corredor vial / salida ciudad": 5000
  },
  "Huila": {
    "Centro histórico / tradicional": 11500,
    "Zona comercial media": 7500,
    "Centro de negocios premium": 18500,
    "Sector industrial / comercial periférico": 4000,
    "Corredor vial / salida ciudad": 5500
  },
  "Tolima": {
    "Centro histórico / tradicional": 12000,
    "Zona comercial media": 7800,
    "Centro de negocios premium": 19000,
    "Sector industrial / comercial periférico": 4200,
    "Corredor vial / salida ciudad": 5800
  },
  "Meta": {
    "Centro histórico / tradicional": 13500,
    "Zona comercial media": 8500,
    "Centro de negocios premium": 21000,
    "Sector industrial / comercial periférico": 4800,
    "Corredor vial / salida ciudad": 6500
  },
  "Cesar": {
    "Centro histórico / tradicional": 11000,
    "Zona comercial media": 7200,
    "Centro de negocios premium": 18000,
    "Sector industrial / comercial periférico": 4000,
    "Corredor vial / salida ciudad": 5500
  },
  "La Guajira": {
    "Centro histórico / tradicional": 9500,
    "Zona comercial media": 6200,
    "Centro de negocios premium": 15000,
    "Sector industrial / comercial periférico": 3300,
    "Corredor vial / salida ciudad": 4500
  },
  "Sucre": {
    "Centro histórico / tradicional": 10000,
    "Zona comercial media": 6500,
    "Centro de negocios premium": 16000,
    "Sector industrial / comercial periférico": 3500,
    "Corredor vial / salida ciudad": 5000
  },
  "Chocó": {
    "Centro histórico / tradicional": 8000,
    "Zona comercial media": 5200,
    "Centro de negocios premium": 13000,
    "Sector industrial / comercial periférico": 2800,
    "Corredor vial / salida ciudad": 3800
  },
  "Caldas": {
    "Centro histórico / tradicional": 14500,
    "Zona comercial media": 9200,
    "Centro de negocios premium": 23000,
    "Sector industrial / comercial periférico": 5200,
    "Corredor vial / salida ciudad": 7000
  },
  "Quindío": {
    "Centro histórico / tradicional": 13000,
    "Zona comercial media": 8500,
    "Centro de negocios premium": 21000,
    "Sector industrial / comercial periférico": 4800,
    "Corredor vial / salida ciudad": 6500
  },
  "Risaralda": {
    "Centro histórico / tradicional": 13500,
    "Zona comercial media": 8800,
    "Centro de negocios premium": 22000,
    "Sector industrial / comercial periférico": 5000,
    "Corredor vial / salida ciudad": 6800
  },
  "Putumayo": {
    "Centro histórico / tradicional": 10000,
    "Zona comercial media": 6500,
    "Centro de negocios premium": 16000,
    "Sector industrial / comercial periférico": 3500,
    "Corredor vial / salida ciudad": 5000
  },
  "Caquetá": {
    "Centro histórico / tradicional": 9500,
    "Zona comercial media": 6200,
    "Centro de negocios premium": 15000,
    "Sector industrial / comercial periférico": 3300,
    "Corredor vial / salida ciudad": 4500
  },
  "Guaviare": {
    "Centro histórico / tradicional": 8500,
    "Zona comercial media": 5500,
    "Centro de negocios premium": 14000,
    "Sector industrial / comercial periférico": 3000,
    "Corredor vial / salida ciudad": 4200
  },
  "Vaupés": {
    "Centro histórico / tradicional": 8000,
    "Zona comercial media": 5200,
    "Centro de negocios premium": 13000,
    "Sector industrial / comercial periférico": 2800,
    "Corredor vial / salida ciudad": 3800
  },
  "Vichada": {
    "Centro histórico / tradicional": 8200,
    "Zona comercial media": 5300,
    "Centro de negocios premium": 13200,
    "Sector industrial / comercial periférico": 2900,
    "Corredor vial / salida ciudad": 3900
  },
  "Arauca": {
    "Centro histórico / tradicional": 9000,
    "Zona comercial media": 5800,
    "Centro de negocios premium": 14500,
    "Sector industrial / comercial periférico": 3200,
    "Corredor vial / salida ciudad": 4300
  },
  "Casanare": {
    "Centro histórico / tradicional": 9500,
    "Zona comercial media": 6200,
    "Centro de negocios premium": 15000,
    "Sector industrial / comercial periférico": 3300,
    "Corredor vial / salida ciudad": 4500
  },
  "Guainía": {
    "Centro histórico / tradicional": 7500,
    "Zona comercial media": 4900,
    "Centro de negocios premium": 12000,
    "Sector industrial / comercial periférico": 2600,
    "Corredor vial / salida ciudad": 3500
  },
  "Norte Santander": {
    "Centro histórico / tradicional": 14000,
    "Zona comercial media": 9000,
    "Centro de negocios premium": 22000,
    "Sector industrial / comercial periférico": 5000,
    "Corredor vial / salida ciudad": 6800
  },
  "Amazonas": {
    "Centro histórico / tradicional": 7800,
    "Zona comercial media": 5100,
    "Centro de negocios premium": 12500,
    "Sector industrial / comercial periférico": 2700,
    "Corredor vial / salida ciudad": 3700
  }
};

export function compute(i: Inputs): Outputs {
  // Obtener valor m² para la zona seleccionada
  // Fuente: DANE, Cámaras de Comercio, estudios inmobiliarios 2026
  const departamentoPrecios = preciosPorZona[i.departamento] || preciosPorZona["Bogotá D.C."];
  const valorM2Base = departamentoPrecios[i.zona_comercial] || departamentoPrecios["Zona comercial media"];

  // Cálculo canon base: Ley 820/2003 - valor m² × superficie
  let canonMensual = valorM2Base * i.metros_cuadrados;

  // Validación de viabilidad: canon no debe superar 8% de ingresos anuales
  // Recomendación mercado Colombia para viabilidad operativa negocio
  const ingresosQuotidianosCanon = (i.ingresos_negocio_anual * 0.08) / 12;
  if (canonMensual > ingresosQuotidianosCanon) {
    canonMensual = ingresosQuotidianosCanon;
  }

  // Cálculo canon anual (año 1, sin reajuste)
  const canonAnual = canonMensual * 12;

  // Depósito en garantía: típicamente 2 meses de canon - Ley 820/2003
  const depositoCaution = canonMensual * 2;

  // Canon año 2 con reajuste IPC máximo permitido
  // IPC máximo 2026: ~3.5%, controlado por DANE
  const canonAno2Reajustado = canonMensual * (1 + i.ipc_reajuste_anual / 100);

  // Porcentaje de canon respecto a ingresos anuales
  const porcentajeIngresos = (canonAnual / i.ingresos_negocio_anual) * 100;

  // Valor m² mensual (referencia mercado)
  const valorM2Mensual = canonMensual / i.metros_cuadrados;

  // Duración mínima contrato comercial: 1 año obligatorio - Ley 820/2003 Art. 10
  const duracionMinimaAnos = 1;

  return {
    canon_mensual_estimado: Math.round(canonMensual),
    canon_anual: Math.round(canonAnual),
    deposito_caution_tipico: Math.round(depositoCaution),
    canon_ano_2_reajustado: Math.round(canonAno2Reajustado),
    porcentaje_ingresos: Math.round(porcentajeIngresos * 100) / 100,
    valor_m2_mensual: Math.round(valorM2Mensual),
    duracion_contrato_minima: duracionMinimaAnos
  };
}
