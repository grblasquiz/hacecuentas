export interface Inputs {
  precio_vehiculo: number;
  departamento: string;
  tipo_vehiculo: string;
  es_persona_natural: boolean;
  uvt_2026: number;
}

export interface Outputs {
  iva_electrico: number;
  iva_combustion: number;
  ahorro_iva: number;
  impuesto_circulacion: number;
  deduccion_renta: number;
  costo_total_electrico: number;
  costo_total_combustion: number;
  ahorro_total: number;
  ahorro_porcentaje: number;
}

// Tarifas impuesto circulación año 2+ por departamento (DIAN 2026)
// Año 1 es siempre 0% para eléctricos certificados
const tarifas_departamento: Record<string, number> = {
  "bogota": 0.015,          // 1,5%
  "antioquia": 0.012,       // 1,2%
  "valle": 0.018,           // 1,8%
  "atlantico": 0.010,       // 1,0%
  "cundinamarca": 0.013,    // 1,3%
  "santander": 0.010,       // 1,0%
  "nariño": 0.012,          // 1,2%
  "bolivar": 0.011,         // 1,1%
  "caldas": 0.009,          // 0,9%
  "cauca": 0.014,           // 1,4%
  "cesar": 0.008,           // 0,8%
  "cordoba": 0.008,         // 0,8%
  "huila": 0.010,           // 1,0%
  "la_guajira": 0.007,      // 0,7%
  "magdalena": 0.009,       // 0,9%
  "meta": 0.009,            // 0,9%
  "norte_santander": 0.008, // 0,8%
  "putumayo": 0.006,        // 0,6%
  "quindio": 0.010,         // 1,0%
  "risaralda": 0.011,       // 1,1%
  "sucre": 0.007,           // 0,7%
  "tolima": 0.012,          // 1,2%
  "arauca": 0.005,          // 0,5%
  "casanare": 0.006,        // 0,6%
  "guainia": 0.005,         // 0,5%
  "guaviare": 0.005,        // 0,5%
  "vaupés": 0.005,          // 0,5%
  "vichada": 0.005,         // 0,5%
  "choco": 0.008,           // 0,8%
  "caqueta": 0.007,         // 0,7%
  "amazonas": 0.006,        // 0,6%
  "san_andres": 0.010       // 1,0%
};

export function compute(i: Inputs): Outputs {
  // Validación de entrada
  const precio = Math.max(0, i.precio_vehiculo || 0);
  const uvt = Math.max(40000, Math.min(50000, i.uvt_2026 || 45600));
  const tarifa_dept = tarifas_departamento[i.departamento] || 0.010;
  
  // Constantes DIAN 2026
  const IVA_ELECTRICO = 0.05;      // Decreto 2365/2023
  const IVA_COMBUSTION = 0.19;     // Base comparativa
  const DEDUCCION_RENTA_PORCENTAJE = 0.10; // 10% UVT
  const EXENCION_AÑO_1 = 1.0;      // 100% exento primer año
  
  // Cálculos IVA
  const iva_electrico = precio * IVA_ELECTRICO;
  const iva_combustion = precio * IVA_COMBUSTION;
  const ahorro_iva = iva_combustion - iva_electrico; // $8.4M en ejemplo
  
  // Impuesto circulación: año 1 = 0%, mostrar año 2+
  // (Usuario verá que año 1 es exento en explicación)
  const impuesto_circ_año_2_plus = precio * tarifa_dept; // Ej: $900K Bogotá
  
  // Deducción fiscal renta (solo si persona natural)
  const deduccion_renta = i.es_persona_natural ? uvt * DEDUCCION_RENTA_PORCENTAJE : 0;
  
  // Costo total adquisición (año 1)
  const costo_total_electrico = precio + iva_electrico;
  const costo_total_combustion = precio + iva_combustion;
  
  // Ahorro total: diferencia IVA + deducción renta año 1
  const ahorro_total = ahorro_iva + deduccion_renta;
  
  // Ahorro como % del precio base
  const ahorro_porcentaje = precio > 0 ? ahorro_total / precio : 0;
  
  return {
    iva_electrico: Math.round(iva_electrico),
    iva_combustion: Math.round(iva_combustion),
    ahorro_iva: Math.round(ahorro_iva),
    impuesto_circulacion: Math.round(impuesto_circ_año_2_plus),
    deduccion_renta: Math.round(deduccion_renta),
    costo_total_electrico: Math.round(costo_total_electrico),
    costo_total_combustion: Math.round(costo_total_combustion),
    ahorro_total: Math.round(ahorro_total),
    ahorro_porcentaje: ahorro_porcentaje
  };
}
