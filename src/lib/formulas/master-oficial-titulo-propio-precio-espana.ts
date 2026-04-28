export interface Inputs {
  tipo_master: 'oficial_publico' | 'oficial_privado' | 'titulo_propio' | 'mba_top';
  universidad: string;
  duracion_anos: number;
  creditos_totales: number;
  tarifa_credito_personalizada?: number;
  gastos_adicionales?: number;
  solicitar_beca_mec: boolean;
  renta_familiar?: number;
}

export interface Outputs {
  coste_total_bruto: number;
  tarifa_credito_aplicada: number;
  coste_matricula: number;
  beca_mec_estimada: number;
  coste_neto: number;
  coste_anual_promedio: number;
  tipo_financiacion_recomendado: string;
  elegible_beca_mec: string;
}

export function compute(i: Inputs): Outputs {
  // Tarifas base 2026 España (€/ECTS) según CRUE y universidades
  const tarifasBase: Record<string, number> = {
    'oficial_publico': 27,      // Promedio CRUE 2026
    'oficial_privado': 180,     // IE, ESADE, Deusto, Comillas
    'titulo_propio': 90,        // Sin reconocimiento oficial
    'mba_top': 1000             // IE, IESE, ESADE MBA full-time
  };

  // Tarifa aplicada: personalizada o automática
  const tarifaCredito = i.tarifa_credito_personalizada || tarifasBase[i.tipo_master] || 27;
  
  // Gastos adicionales (libros, materiales, seguro)
  const gastosAdicionales = i.gastos_adicionales || 0;
  
  // Cálculo matrícula
  const costeMatricula = i.creditos_totales * tarifaCredito;
  const costeTotalBruto = costeMatricula + gastosAdicionales;
  
  // Cálculo beca MEC
  let becaMecEstimada = 0;
  let elegibleBecaMec = 'No';
  
  if (i.solicitar_beca_mec && i.tipo_master === 'oficial_publico') {
    elegibleBecaMec = 'Sí';
    const rentaFamiliar = i.renta_familiar || 30000;
    
    // Tramos beca MEC 2026 (estimados)
    if (rentaFamiliar < 22500) {
      // 100% cobertura, máximo 3.500€
      becaMecEstimada = Math.min(costeTotalBruto, 3500);
    } else if (rentaFamiliar < 35500) {
      // 50% cobertura
      becaMecEstimada = costeTotalBruto * 0.5;
    } else {
      elegibleBecaMec = 'No (renta superior)';
      becaMecEstimada = 0;
    }
  } else if (i.tipo_master !== 'oficial_publico') {
    elegibleBecaMec = 'No (tipo no elegible)';
  }
  
  const costeNeto = Math.max(0, costeTotalBruto - becaMecEstimada);
  const costeAnualPromedio = costeTotalBruto / i.duracion_anos;
  
  // Recomendación financiación según coste neto
  let tipoFinanciacion = 'Ahorro propio';
  if (costeNeto < 5000) {
    tipoFinanciacion = 'Ahorro propio o microcrédito (ICO Afianzador)';
  } else if (costeNeto < 15000) {
    tipoFinanciacion = 'Crédito educativo privado (Santander, BBVA, Bankinter) 4,5-6% TAE';
  } else if (costeNeto < 40000) {
    tipoFinanciacion = 'Crédito educativo ICO o privado a 8-10 años (cuota 400-600€/mes)';
  } else {
    tipoFinanciacion = 'Crédito privado senior (BanCaja, Sabadell) o equity release educativo';
  }
  
  return {
    coste_total_bruto: Math.round(costeTotalBruto * 100) / 100,
    tarifa_credito_aplicada: Math.round(tarifaCredito * 100) / 100,
    coste_matricula: Math.round(costeMatricula * 100) / 100,
    beca_mec_estimada: Math.round(becaMecEstimada * 100) / 100,
    coste_neto: Math.round(costeNeto * 100) / 100,
    coste_anual_promedio: Math.round(costeAnualPromedio * 100) / 100,
    tipo_financiacion_recomendado: tipoFinanciacion,
    elegible_beca_mec: elegibleBecaMec
  };
}
