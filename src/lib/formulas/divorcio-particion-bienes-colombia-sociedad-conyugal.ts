export interface Inputs {
  patrimonio_total_actual: number;
  bienes_propios_conyuge1: number;
  bienes_propios_conyuge2: number;
  deudas_sociales: number;
  deudas_personales_c1: number;
  deudas_personales_c2: number;
  gastos_notaria_registro: number;
  hay_pensión_alimentaria: 'si' | 'no';
  monto_pensión_mensual?: number;
}

export interface Outputs {
  patrimonio_social: number;
  patrimonio_social_neto: number;
  gastos_totales_liquidacion: number;
  patrimonio_a_repartir: number;
  corresponde_conyuge1: number;
  corresponde_conyuge2: number;
  ajuste_conyuge1: number;
  ajuste_conyuge2: number;
  porcentaje_conyuge1: number;
  porcentaje_conyuge2: number;
  saldo_ajuste: number;
}

export function compute(i: Inputs): Outputs {
  // Fuente: Código Civil Colombiano Arts. 1760-1810, DIAN 2026
  
  const deudas_c1 = i.deudas_personales_c1 || 0;
  const deudas_c2 = i.deudas_personales_c2 || 0;
  const gastos = i.gastos_notaria_registro || 0;
  const monto_pensión = i.monto_pensión_mensual || 0;
  
  // Paso 1: Calcular patrimonio social (total - bienes propios)
  const patrimonio_social = i.patrimonio_total_actual - i.bienes_propios_conyuge1 - i.bienes_propios_conyuge2;
  
  // Paso 2: Deudas sociales se restan del patrimonio social
  const patrimonio_social_neto = Math.max(0, patrimonio_social - i.deudas_sociales);
  
  // Paso 3: Gastos de partición (notaría, registro, abogados)
  const gastos_totales_liquidacion = gastos;
  
  // Paso 4: Patrimonio neto a repartir 50/50
  const patrimonio_a_repartir = Math.max(0, patrimonio_social_neto - gastos_totales_liquidacion);
  
  // Paso 5: Cada cónyuge recibe 50% del patrimonio a repartir
  const mitad_social = patrimonio_a_repartir / 2;
  
  // Paso 6: Considerar pensión alimentaria (capitalización simple)
  // Si hay pensión, se asume 240 meses (20 años) como estándar
  let capitalización_pensión = 0;
  if (i.hay_pensión_alimentaria === 'si' && monto_pensión > 0) {
    const meses_estimados = 240; // 20 años como promedio Colombia
    capitalización_pensión = monto_pensión * meses_estimados;
  }
  
  // Paso 7: Asignar pensión al cónyuge alimentante (generalmente el de mayor ingreso)
  // Por defecto, se deduce 50/50 de quien pague pensión
  // Esta calculadora asume se resta del patrimonio del obligado
  const ajuste_por_pensión = Math.min(mitad_social, capitalización_pensión / 2);
  
  // Paso 8: Corresponde a cada cónyuge (bienes propios + 50% social - ajustes)
  const corresponde_conyuge1 = i.bienes_propios_conyuge1 + mitad_social - ajuste_por_pensión;
  const corresponde_conyuge2 = i.bienes_propios_conyuge2 + mitad_social - ajuste_por_pensión;
  
  // Paso 9: Gastos se reparten 50/50 (o según sentencia)
  const ajuste_gastos = gastos_totales_liquidacion / 2;
  const ajuste_conyuge1 = ajuste_gastos;
  const ajuste_conyuge2 = ajuste_gastos;
  
  // Paso 10: Valores finales después de ajustes
  const corresponde_final_c1 = corresponde_conyuge1 - ajuste_conyuge1;
  const corresponde_final_c2 = corresponde_conyuge2 - ajuste_conyuge2;
  
  // Paso 11: Porcentajes del patrimonio total
  const patrimonio_total_min = 1; // Evitar división por 0
  const porcentaje_conyuge1 = (corresponde_final_c1 / Math.max(i.patrimonio_total_actual, patrimonio_total_min)) * 100;
  const porcentaje_conyuge2 = (corresponde_final_c2 / Math.max(i.patrimonio_total_actual, patrimonio_total_min)) * 100;
  
  // Paso 12: Saldo de ajuste (diferencia por redondeos o deudas personales no compensadas)
  const saldo_ajuste = corresponde_final_c1 - corresponde_final_c2;
  
  return {
    patrimonio_social: Math.max(0, patrimonio_social),
    patrimonio_social_neto: Math.max(0, patrimonio_social_neto),
    gastos_totales_liquidacion: Math.max(0, gastos_totales_liquidacion),
    patrimonio_a_repartir: Math.max(0, patrimonio_a_repartir),
    corresponde_conyuge1: Math.max(0, corresponde_final_c1),
    corresponde_conyuge2: Math.max(0, corresponde_final_c2),
    ajuste_conyuge1: Math.max(0, ajuste_conyuge1),
    ajuste_conyuge2: Math.max(0, ajuste_conyuge2),
    porcentaje_conyuge1: Math.round(porcentaje_conyuge1 * 100) / 100,
    porcentaje_conyuge2: Math.round(porcentaje_conyuge2 * 100) / 100,
    saldo_ajuste: Math.round(saldo_ajuste * 100) / 100
  };
}
