export interface Inputs {
  capital_pendiente: number;
  euribor_anterior: number;
  euribor_actual: number;
  diferencial: number;
  cuota_mensual_actual: number;
  anos_restantes: number;
  periodicidad_revision: 'anual' | 'semestral';
}

export interface Outputs {
  tipo_interes_nuevo: number;
  tipo_interes_anterior: number;
  cuota_mensual_nueva: number;
  diferencia_cuota: number;
  impacto_anual: number;
  impacto_vida_restante: number;
  variacion_euribor: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España - Banco de España
  // Euribor 12 meses media abril 2026: 2,94% (fuente: BDE)
  
  // 1. Calcular tipos de interés
  const tipo_interes_anterior = i.euribor_anterior + i.diferencial;
  const tipo_interes_nuevo = i.euribor_actual + i.diferencial;
  
  // 2. Variación Euribor en puntos porcentuales
  const variacion_euribor = i.euribor_actual - i.euribor_anterior;
  
  // 3. Calcular cuota nueva con amortización francesa
  // Cuota = Capital × [r(1+r)^n] / [(1+r)^n - 1]
  // donde r = tipo mensual, n = meses restantes
  
  const meses_restantes = i.anos_restantes * 12;
  const tipo_mensual_nuevo = tipo_interes_nuevo / 100 / 12;
  
  let cuota_mensual_nueva: number;
  
  if (tipo_mensual_nuevo === 0) {
    // Si tipo es 0 (caso extremo), amortización lineal
    cuota_mensual_nueva = i.capital_pendiente / meses_restantes;
  } else {
    const numerador = tipo_mensual_nuevo * Math.pow(1 + tipo_mensual_nuevo, meses_restantes);
    const denominador = Math.pow(1 + tipo_mensual_nuevo, meses_restantes) - 1;
    cuota_mensual_nueva = i.capital_pendiente * (numerador / denominador);
  }
  
  // 4. Diferencia cuota (sobrecoste o ahorro)
  const diferencia_cuota = cuota_mensual_nueva - i.cuota_mensual_actual;
  
  // 5. Impacto anual
  const impacto_anual = diferencia_cuota * 12;
  
  // 6. Impacto vida restante (aproximado, asumiendo cuota constante)
  const impacto_vida_restante = diferencia_cuota * meses_restantes;
  
  return {
    tipo_interes_nuevo: Math.round(tipo_interes_nuevo * 100) / 100,
    tipo_interes_anterior: Math.round(tipo_interes_anterior * 100) / 100,
    cuota_mensual_nueva: Math.round(cuota_mensual_nueva * 100) / 100,
    diferencia_cuota: Math.round(diferencia_cuota * 100) / 100,
    impacto_anual: Math.round(impacto_anual * 100) / 100,
    impacto_vida_restante: Math.round(impacto_vida_restante * 100) / 100,
    variacion_euribor: Math.round(variacion_euribor * 100) / 100
  };
}
