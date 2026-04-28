export interface Inputs {
  tipo_vuelo: 'domestico' | 'internacional_usa' | 'internacional_latinoamerica' | 'internacional_europa';
  tarifa_base_cop: number;
  aeropuerto_salida: 'bog' | 'mde' | 'cali' | 'bta' | 'otro';
  numero_pasajeros: number;
}

export interface Outputs {
  tarifa_base_total: number;
  iva_domestico: number;
  tasa_seguridad: number;
  contribucion_turismo: number;
  tasa_salida_internacional: number;
  derechos_administrativos: number;
  impuestos_totales: number;
  precio_final_cop: number;
  precio_final_usd: number;
  porcentaje_impuestos: number;
  costo_por_pasajero: number;
  desglose_conceptos: Record<string, number>;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - fuentes DIAN, Aerocivil, ACDAC, Fontur
  const TRM_2026 = 4000; // TRM promedio 2026 COP/USD (DIAN)
  const IVA_DOMESTICO = 0.05; // 5% IVA vuelos domésticos (Decreto 1165/2017)
  
  // Tasas por tipo vuelo (COP por pasajero) - Aerocivil 2026
  const tasas_domestico = {
    seguridad: 10500, // ACDAC + servicios aeronavegación
    fontur: 4200, // Contribución desarrollo turístico
    administrativo: 2800, // Derechos gestión aeroportuaria
  };
  
  const tasas_internacional = {
    salida_usd: 90, // Tasa salida internacional ~$90 USD (Aerocivil)
    seguridad: 17000, // Mayor para internacionales
    fontur: 6000, // Contribución turismo internacional
    administrativo: 4000, // Derechos administrativos
  };

  const tarifa_base_total = i.tarifa_base_cop * i.numero_pasajeros;
  let iva_domestico = 0;
  let tasa_seguridad = 0;
  let contribucion_turismo = 0;
  let tasa_salida_internacional = 0;
  let derechos_administrativos = 0;

  if (i.tipo_vuelo === 'domestico') {
    // Vuelo doméstico: aplica IVA 5%
    iva_domestico = tarifa_base_total * IVA_DOMESTICO;
    tasa_seguridad = tasas_domestico.seguridad * i.numero_pasajeros;
    contribucion_turismo = tasas_domestico.fontur * i.numero_pasajeros;
    derechos_administrativos = tasas_domestico.administrativo * i.numero_pasajeros;
  } else {
    // Vuelos internacionales: exención IVA, aplica tasa salida
    iva_domestico = 0; // Exención servicios internacionales (DIAN)
    tasa_salida_internacional = tasas_internacional.salida_usd * TRM_2026 * i.numero_pasajeros;
    tasa_seguridad = tasas_internacional.seguridad * i.numero_pasajeros;
    contribucion_turismo = tasas_internacional.fontur * i.numero_pasajeros;
    derechos_administrativos = tasas_internacional.administrativo * i.numero_pasajeros;
  }

  const impuestos_totales = iva_domestico + tasa_seguridad + contribucion_turismo + tasa_salida_internacional + derechos_administrativos;
  const precio_final_cop = tarifa_base_total + impuestos_totales;
  const precio_final_usd = precio_final_cop / TRM_2026;
  const porcentaje_impuestos = tarifa_base_total > 0 ? (impuestos_totales / tarifa_base_total) * 100 : 0;
  const costo_por_pasajero = i.numero_pasajeros > 0 ? precio_final_cop / i.numero_pasajeros : 0;

  const desglose_conceptos: Record<string, number> = {
    tarifa_base_total,
    iva_domestico,
    tasa_seguridad,
    contribucion_turismo,
    tasa_salida_internacional,
    derechos_administrativos,
    impuestos_totales,
    precio_final_cop,
  };

  return {
    tarifa_base_total: Math.round(tarifa_base_total),
    iva_domestico: Math.round(iva_domestico),
    tasa_seguridad: Math.round(tasa_seguridad),
    contribucion_turismo: Math.round(contribucion_turismo),
    tasa_salida_internacional: Math.round(tasa_salida_internacional),
    derechos_administrativos: Math.round(derechos_administrativos),
    impuestos_totales: Math.round(impuestos_totales),
    precio_final_cop: Math.round(precio_final_cop),
    precio_final_usd: Math.round(precio_final_usd * 100) / 100,
    porcentaje_impuestos: Math.round(porcentaje_impuestos * 10) / 10,
    costo_por_pasajero: Math.round(costo_por_pasajero),
    desglose_conceptos,
  };
}
