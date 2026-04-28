export interface Inputs {
  precio_vivienda: number;
  cuota_inicial_porcentaje: number;
  plazo_anos: number;
  tasa_real_uvr_anual: number;
  tasa_nominal_pesos_anual: number;
  ipc_esperado_anual: number;
}

export interface Outputs {
  valor_financiar: number;
  cuota_inicial_valor: number;
  cuota_mensual_uvr: number;
  cuota_mensual_pesos: number;
  interes_total_uvr: number;
  interes_total_pesos: number;
  diferencia_cuota_mensual: number;
  diferencia_intereses_totales: number;
  cuota_mensual_uvr_estimada_final: number;
  recomendacion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes y cálculos base
  // Fuente: Superfinanciera 2026, Banco República
  const precio = i.precio_vivienda;
  const porcentaje_inicial = i.cuota_inicial_porcentaje / 100;
  const cuota_inicial = precio * porcentaje_inicial;
  const saldo_inicial = precio - cuota_inicial;
  const meses = i.plazo_anos * 12;
  
  // Tasa real UVR mensual
  const tasa_real_uvr_mensual = Math.pow(1 + i.tasa_real_uvr_anual / 100, 1 / 12) - 1;
  
  // Tasa nominal pesos mensual
  const tasa_nominal_pesos_mensual = Math.pow(1 + i.tasa_nominal_pesos_anual / 100, 1 / 12) - 1;
  
  // Ajuste IPC mensual esperado
  const ipc_mensual = Math.pow(1 + i.ipc_esperado_anual / 100, 1 / 12) - 1;
  
  // Fórmula factor de cuota: i(1+i)^n / ((1+i)^n - 1)
  const factor_uvr = (tasa_real_uvr_mensual * Math.pow(1 + tasa_real_uvr_mensual, meses)) / 
                     (Math.pow(1 + tasa_real_uvr_mensual, meses) - 1);
  const factor_pesos = (tasa_nominal_pesos_mensual * Math.pow(1 + tasa_nominal_pesos_mensual, meses)) / 
                       (Math.pow(1 + tasa_nominal_pesos_mensual, meses) - 1);
  
  // Cuota mensual fija pesos
  const cuota_pesos = saldo_inicial * factor_pesos;
  
  // Cuota mensual UVR (mes 1)
  const cuota_uvr_mes1 = saldo_inicial * factor_uvr;
  
  // Cálculo iterativo para UVR con ajuste mensual de IPC
  let saldo_uvr = saldo_inicial;
  let total_pagado_uvr = 0;
  let cuota_uvr_actual = cuota_uvr_mes1;
  let cuota_uvr_final = cuota_uvr_mes1;
  
  for (let mes = 0; mes < meses; mes++) {
    // Interés de este mes
    const interes_mes = saldo_uvr * tasa_real_uvr_mensual;
    // Amortización a capital
    const amortizacion = cuota_uvr_actual - interes_mes;
    // Nuevo saldo
    saldo_uvr -= amortizacion;
    // Acumular pagado
    total_pagado_uvr += cuota_uvr_actual;
    
    // Ajustar cuota para próximo mes por IPC
    if (mes < meses - 1) {
      cuota_uvr_actual *= (1 + ipc_mensual);
      cuota_uvr_final = cuota_uvr_actual;
    }
  }
  
  const interes_total_uvr = total_pagado_uvr - saldo_inicial;
  
  // Cálculo para pesos (más simple, cuota fija)
  const total_pagado_pesos = cuota_pesos * meses;
  const interes_total_pesos = total_pagado_pesos - saldo_inicial;
  
  // Diferencias
  const diferencia_cuota_mes1 = cuota_pesos - cuota_uvr_mes1;
  const diferencia_intereses = interes_total_pesos - interes_total_uvr;
  
  // Lógica de recomendación
  let recomendacion = "";
  if (i.ipc_esperado_anual < (i.tasa_real_uvr_anual - i.tasa_nominal_pesos_anual + i.tasa_real_uvr_anual)) {
    // Si IPC esperado es bajo, UVR es mejor
    recomendacion = `Elige UVR: inflación esperada (${i.ipc_esperado_anual}%) es inferior a tasa real (${i.tasa_real_uvr_anual}%). Ahorras ~$${Math.round(diferencia_intereses).toLocaleString('es-CO')} en intereses. Cuota inicial ~$${Math.round(cuota_uvr_mes1).toLocaleString('es-CO')} pero crece con IPC.`;
  } else {
    recomendacion = `Considera pesos: inflación esperada (${i.ipc_esperado_anual}%) es igual o superior a diferencial (tasa pesos ${i.tasa_nominal_pesos_anual}% vs UVR real ${i.tasa_real_uvr_anual}%). Cuota fija en nominal $${Math.round(cuota_pesos).toLocaleString('es-CO')} facilita presupuesto, aunque pagas ~$${Math.round(diferencia_intereses).toLocaleString('es-CO')} más en intereses.`;
  }
  
  return {
    valor_financiar: Math.round(saldo_inicial),
    cuota_inicial_valor: Math.round(cuota_inicial),
    cuota_mensual_uvr: Math.round(cuota_uvr_mes1),
    cuota_mensual_pesos: Math.round(cuota_pesos),
    interes_total_uvr: Math.round(interes_total_uvr),
    interes_total_pesos: Math.round(interes_total_pesos),
    diferencia_cuota_mensual: Math.round(diferencia_cuota_mes1),
    diferencia_intereses_totales: Math.round(diferencia_intereses),
    cuota_mensual_uvr_estimada_final: Math.round(cuota_uvr_final),
    recomendacion: recomendacion
  };
}
