export interface Inputs {
  valor_patrimonio_bruto: number;
  pasivos_deudas: number;
  numero_herederos: number;
  parentesco_principal: 'conyuge' | 'hijo' | 'nieto' | 'ascendiente' | 'colateral' | 'extraño';
  hay_conyuge: 'si' | 'no';
  numero_hijos: number;
  incluir_gastos_sucesion: 'si' | 'no';
  gastos_sucesion_custom: number;
}

export interface Outputs {
  patrimonio_liquido: number;
  gastos_sucesion_total: number;
  herencia_distribuible: number;
  porcion_legitimaria_monto: number;
  cuota_heredero_principal: number;
  uvt_2026: number;
  exceso_uvt_permitido: number;
  ganancia_ocasional_heredero: number;
  impuesto_ganancia_ocasional: number;
  herencia_neta_heredero: number;
  tasa_efectiva: number;
  resumen_herederos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes DIAN 2026 Colombia
  const UVT_2026 = 45352; // COP, Resolución DIAN 2026
  const TARIFA_GANANCIA_OCASIONAL = 0.15; // 15% Art. 49 Ley 1739/2014
  const PORCENTAJE_LEGITIMA = 0.50; // 50% patrimonio líquido para cónyuge + hijos
  const PORCENTAJE_LEGITIMA_ASCENDIENTES = 0.33; // 33% para ascendientes sin hijos
  
  // Mapeo UVT exención por parentesco (Decreto 2053/2014)
  const uvrExencionPorParentesco: Record<string, number> = {
    'conyuge': 1000, // 1.000 UVT
    'hijo': 1000,
    'nieto': 100, // 100 UVT (2do grado)
    'ascendiente': 100,
    'colateral': 100,
    'extraño': 0 // Sin exención
  };
  
  // Paso 1: Calcular patrimonio líquido
  const patrimonio_bruto = Math.max(0, i.valor_patrimonio_bruto);
  const pasivos = Math.max(0, i.pasivos_deudas);
  
  let gastos_sucesion = 0;
  if (i.incluir_gastos_sucesion === 'si') {
    // Cálculo automático: 3% del patrimonio bruto menos pasivos
    gastos_sucesion = Math.max(0, (patrimonio_bruto - pasivos) * 0.03);
  } else {
    gastos_sucesion = Math.max(0, i.gastos_sucesion_custom);
  }
  
  const patrimonio_liquido = Math.max(0, patrimonio_bruto - pasivos - gastos_sucesion);
  
  // Paso 2: Calcular porción legitimaria
  // Si hay cónyuge y hijos: 50% patrimonio líquido es legitimario
  const hay_conyuge = i.hay_conyuge === 'si';
  const num_hijos = Math.max(0, i.numero_hijos);
  
  let porcion_legitimaria_monto = 0;
  let numero_herederos_legitimarios = 0;
  
  if (hay_conyuge && num_hijos > 0) {
    porcion_legitimaria_monto = patrimonio_liquido * PORCENTAJE_LEGITIMA;
    numero_herederos_legitimarios = 1 + num_hijos; // cónyuge + hijos
  } else if (num_hijos > 0 && !hay_conyuge) {
    porcion_legitimaria_monto = patrimonio_liquido * PORCENTAJE_LEGITIMA;
    numero_herederos_legitimarios = num_hijos;
  } else if (i.parentesco_principal === 'ascendiente' && !hay_conyuge && num_hijos === 0) {
    porcion_legitimaria_monto = patrimonio_liquido * PORCENTAJE_LEGITIMA_ASCENDIENTES;
    numero_herederos_legitimarios = 1;
  } else {
    // Otros casos: sin legitimaria o heredero extraño
    porcion_legitimaria_monto = 0;
    numero_herederos_legitimarios = i.numero_herederos || 1;
  }
  
  // Paso 3: Calcular cuota heredero principal (distribución legal sin testamento)
  // Cuota = patrimonio_liquido / número_herederos (simplificado; en sucesión real es más complejo)
  const numero_herederos = Math.max(1, i.numero_herederos);
  const cuota_heredero_principal = patrimonio_liquido / numero_herederos;
  
  // Paso 4: Exención UVT por parentesco
  const uxt_exencion = uvrExencionPorParentesco[i.parentesco_principal] || 0;
  const monto_exento = uxt_exencion * UVT_2026;
  
  // Paso 5: Calcular exceso y ganancia ocasional
  const exceso_uvt_permitido = Math.max(0, cuota_heredero_principal - monto_exento);
  const ganancia_ocasional_heredero = exceso_uvt_permitido; // La ganancia ocasional ES el exceso
  
  // Paso 6: Calcular impuesto 15%
  const impuesto_ganancia_ocasional = ganancia_ocasional_heredero * TARIFA_GANANCIA_OCASIONAL;
  
  // Paso 7: Herencia neta al heredero principal
  const herencia_neta_heredero = cuota_heredero_principal - impuesto_ganancia_ocasional;
  
  // Paso 8: Tasa efectiva
  const tasa_efectiva = patrimonio_bruto > 0 
    ? (impuesto_ganancia_ocasional / patrimonio_bruto) * 100 
    : 0;
  
  // Paso 9: Generar resumen herederos (simplificado)
  let resumen_herederos = 'Resumen distribución herencia por heredero:\n\n';
  resumen_herederos += `Heredero Principal (${i.parentesco_principal}):\n`;
  resumen_herederos += `  Cuota: $${Math.round(cuota_heredero_principal).toLocaleString('es-CO')}\n`;
  resumen_herederos += `  Exención UVT: ${uxt_exencion} UVT = $${Math.round(monto_exento).toLocaleString('es-CO')}\n`;
  resumen_herederos += `  Ganancia Ocasional: $${Math.round(ganancia_ocasional_heredero).toLocaleString('es-CO')}\n`;
  resumen_herederos += `  Impuesto (15%): $${Math.round(impuesto_ganancia_ocasional).toLocaleString('es-CO')}\n`;
  resumen_herederos += `  Herencia Neta: $${Math.round(herencia_neta_heredero).toLocaleString('es-CO')}\n\n`;
  
  if (num_hijos > 0 && hay_conyuge) {
    const cuota_hijo = patrimonio_liquido / (1 + num_hijos);
    const impuesto_hijo = Math.max(0, (cuota_hijo - monto_exento) * TARIFA_GANANCIA_OCASIONAL);
    const herencia_neta_hijo = cuota_hijo - impuesto_hijo;
    resumen_herederos += `Cada hijo (${num_hijos} total):\n`;
    resumen_herederos += `  Cuota: $${Math.round(cuota_hijo).toLocaleString('es-CO')}\n`;
    resumen_herederos += `  Impuesto (15%): $${Math.round(impuesto_hijo).toLocaleString('es-CO')}\n`;
    resumen_herederos += `  Herencia Neta: $${Math.round(herencia_neta_hijo).toLocaleString('es-CO')}`;
  }
  
  return {
    patrimonio_liquido: Math.round(patrimonio_liquido),
    gastos_sucesion_total: Math.round(gastos_sucesion),
    herencia_distribuible: Math.round(patrimonio_liquido),
    porcion_legitimaria_monto: Math.round(porcion_legitimaria_monto),
    cuota_heredero_principal: Math.round(cuota_heredero_principal),
    uvt_2026: UVT_2026,
    exceso_uvt_permitido: Math.round(exceso_uvt_permitido),
    ganancia_ocasional_heredero: Math.round(ganancia_ocasional_heredero),
    impuesto_ganancia_ocasional: Math.round(impuesto_ganancia_ocasional),
    herencia_neta_heredero: Math.round(herencia_neta_heredero),
    tasa_efectiva: Math.round(tasa_efectiva * 100) / 100,
    resumen_herederos: resumen_herederos
  };
}
