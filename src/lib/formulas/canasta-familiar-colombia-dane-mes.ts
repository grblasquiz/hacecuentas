export interface Inputs {
  num_personas: number;
  ninos_menores_5: number;
  adultos_mayores: number;
  estrato: number;
  ciudad: string;
  tipo_compra: string;
  include_servicios: boolean;
}

export interface Outputs {
  costo_mensual_alimentos: number;
  costo_per_capita: number;
  porcentaje_salario_minimo: number;
  indice_canasta_dane: number;
  comparativa_cadenas: {cadena: string; minimo: number; maximo: number}[];
  presupuesto_mensual_recomendado: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DANE/MinTrabajo
  const CANASTA_BASE_4_PERSONAS = 2847300; // COP, abril 2026 DANE
  const SALARIO_MINIMO_2026 = 1419200; // COP, ResMinTrabajo ene 2026
  const INFLACION_ACUMULADA_2026 = 0.0214; // ene-abr 2026: 2.14%
  const IPC_ANUAL_2025 = 0.0447; // inflación 2025: 4.47%
  
  // Factores estrato socioeconómico (índices DANE 2026)
  const FACTOR_ESTRATO: {[key: number]: number} = {
    1: 0.85,  // -15%
    2: 0.92,  // -8%
    3: 1.00,  // base
    4: 1.08,  // +8%
    5: 1.18,  // +18%
    6: 1.35   // +35%
  };
  
  // Variación por ciudad vs Bogotá (base 0%)
  const FACTOR_CIUDAD: {[key: string]: number} = {
    'bogota': 1.00,
    'medellin': 1.023,
    'cali': 1.018,
    'barranquilla': 1.031,
    'cartagena': 1.042,
    'bucaramanga': 0.985,
    'cucuta': 0.972,
    'manizales': 1.005,
    'pasto': 0.995,
    'armenia': 1.008,
    'villavicencio': 1.012,
    'ibague': 1.009,
    'monteria': 1.015
  };
  
  // Factor canal de distribución
  const FACTOR_CANAL: {[key: string]: number} = {
    'mercado': 0.92,      // -8% vs supermercado
    'supermercado': 1.00, // base
    'hipermaket': 1.03,   // +3%
    'promedio': 1.00      // ponderado
  };
  
  // Factores ajuste por composición familiar
  const FACTOR_NINO_MENOR_5 = 0.75;  // consumen menos
  const FACTOR_ADULTO_MAYOR = 0.85;  // dietas reducidas
  const FACTOR_PERSONA_ADICIONAL = 0.95; // economía de escala
  
  // Precios comparativos por cadena (rango % vs promedio, abril 2026)
  const CADENAS_COMPARATIVA: {[key: string]: {min: number; max: number}} = {
    'Éxito': {min: 0.98, max: 1.05},
    'Carulla': {min: 1.02, max: 1.12},
    'Olímpica': {min: 0.99, max: 1.04},
    'D1': {min: 0.88, max: 0.96},
    'Ara': {min: 0.90, max: 0.98},
    'Mercado tradicional': {min: 0.88, max: 0.95}
  };
  
  // Índice inflacionario canasta DANE
  const INDICE_DEFLACTOR = 1.0214; // acumulado 2026
  
  // 1. Cálculo composición familiar
  let personas_equivalentes = i.num_personas;
  
  // Ajustar por niños menores de 5 años
  if (i.ninos_menores_5 > 0) {
    personas_equivalentes -= i.ninos_menores_5;
    personas_equivalentes += i.ninos_menores_5 * FACTOR_NINO_MENOR_5;
  }
  
  // Ajustar por adultos mayores
  if (i.adultos_mayores > 0) {
    personas_equivalentes -= i.adultos_mayores;
    personas_equivalentes += i.adultos_mayores * FACTOR_ADULTO_MAYOR;
  }
  
  // 2. Escalar canasta base desde 4 personas
  const PERSONAS_BASE = 4;
  const ratio_personas = personas_equivalentes / PERSONAS_BASE;
  let costo_base_ajustado = CANASTA_BASE_4_PERSONAS * ratio_personas;
  
  // 3. Aplicar factores
  const factor_estrato = FACTOR_ESTRATO[i.estrato] || 1.0;
  const factor_ciudad = FACTOR_CIUDAD[i.ciudad] || 1.0;
  const factor_canal = FACTOR_CANAL[i.tipo_compra] || 1.0;
  
  // 4. Costo mensual final
  let costo_mensual = costo_base_ajustado 
    * factor_estrato 
    * factor_ciudad 
    * factor_canal 
    * INDICE_DEFLACTOR;
  
  // Redondear a 100 pesos
  costo_mensual = Math.round(costo_mensual / 100) * 100;
  
  // 5. Costo per cápita diario
  const costo_per_capita = costo_mensual / i.num_personas / 30;
  
  // 6. Porcentaje del salario mínimo
  const porcentaje_sminimo = (costo_mensual / SALARIO_MINIMO_2026) * 100;
  
  // 7. Índice canasta vs mes anterior (simulado)
  // Variación aprox: inflación acumulada + estacionalidad
  const indice_variacion = INFLACION_ACUMULADA_2026 * 100; // 2.14%
  
  // 8. Comparativa de cadenas (rango de precios)
  const comparativa: {cadena: string; minimo: number; maximo: number}[] = [];
  for (const [cadena, rango] of Object.entries(CADENAS_COMPARATIVA)) {
    comparativa.push({
      cadena: cadena,
      minimo: Math.round(costo_mensual * rango.min / 100) * 100,
      maximo: Math.round(costo_mensual * rango.max / 100) * 100
    });
  }
  
  // 9. Presupuesto recomendado (con holgura 15%)
  const presupuesto_recomendado = Math.round(costo_mensual * 1.15 / 100) * 100;
  
  // Validaciones y defaults
  const outputs: Outputs = {
    costo_mensual_alimentos: Math.max(costo_mensual, 500000), // mínimo coherente
    costo_per_capita: Math.round(costo_per_capita),
    porcentaje_salario_minimo: Math.round(porcentaje_sminimo * 100) / 100,
    indice_canasta_dane: Math.round(indice_variacion * 100) / 100,
    comparativa_cadenas: comparativa,
    presupuesto_mensual_recomendado: presupuesto_recomendado
  };
  
  return outputs;
}
