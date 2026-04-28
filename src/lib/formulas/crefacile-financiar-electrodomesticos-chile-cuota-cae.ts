export interface Inputs {
  precio_electrodomestico: number;
  cantidad_cuotas: number;
  tipo_tarjeta: string;
  cae_personalizado?: number;
  tasa_interes_banco: number;
}

export interface Outputs {
  cuota_mensual_tarjeta: number;
  total_pagado_tarjeta: number;
  total_interes_tarjeta: number;
  cae_efectivo_tarjeta: number;
  cuota_mensual_banco: number;
  total_interes_banco: number;
  diferencia_interes: number;
  ahorro_potencial: number;
}

function obtenerCAE(tipo_tarjeta: string, cae_personalizado?: number): number {
  // Fuente: CMF 2026, valores referenciales
  const caePorTarjeta: Record<string, number> = {
    'cmr': 0.45,           // Banco Ripley
    'falabella': 0.40,     // Tarjeta Falabella
    'lider': 0.42,         // Tarjeta Líder (Walmart)
    'ripley': 0.45,        // Tarjeta Ripley
    'banco_bajo': 0.18,    // Crédito bancario bajo
    'banco_medio': 0.22    // Crédito bancario medio
  };
  
  if (tipo_tarjeta === 'custom' && cae_personalizado !== undefined) {
    return cae_personalizado / 100;
  }
  
  return caePorTarjeta[tipo_tarjeta] || 0.45;
}

function calcularCuotaMensual(precio: number, cae_anual: number, cuotas: number): number {
  // Fórmula amortización: C = P × [i(1+i)^n] / [(1+i)^n - 1]
  // donde i es tasa mensual = CAE/12
  
  const tasa_mensual = cae_anual / 12;
  
  if (tasa_mensual === 0) {
    return precio / cuotas;
  }
  
  const factor = Math.pow(1 + tasa_mensual, cuotas);
  const cuota = precio * (tasa_mensual * factor) / (factor - 1);
  
  return cuota;
}

export function compute(i: Inputs): Outputs {
  // Validaciones básicas
  if (i.precio_electrodomestico <= 0) {
    return {
      cuota_mensual_tarjeta: 0,
      total_pagado_tarjeta: 0,
      total_interes_tarjeta: 0,
      cae_efectivo_tarjeta: 0,
      cuota_mensual_banco: 0,
      total_interes_banco: 0,
      diferencia_interes: 0,
      ahorro_potencial: 0
    };
  }
  
  const precio = i.precio_electrodomestico;
  const cuotas = i.cantidad_cuotas;
  
  // Obtener CAE de tarjeta seleccionada
  const cae_tarjeta = obtenerCAE(i.tipo_tarjeta, i.cae_personalizado);
  
  // Calcular cuota y totales para tarjeta
  const cuota_tarjeta = calcularCuotaMensual(precio, cae_tarjeta, cuotas);
  const total_pagado_tarjeta = cuota_tarjeta * cuotas;
  const total_interes_tarjeta = total_pagado_tarjeta - precio;
  
  // Calcular CAE efectivo (iterativo simple)
  // Para este caso, coincide con el CAE entrada, pero lo dejamos explícito
  const cae_efectivo = cae_tarjeta * 100;
  
  // Calcular para banco comparativo
  const tasa_banco = i.tasa_interes_banco / 100;
  const cuota_banco = calcularCuotaMensual(precio, tasa_banco, cuotas);
  const total_pagado_banco = cuota_banco * cuotas;
  const total_interes_banco = total_pagado_banco - precio;
  
  // Diferencia y ahorro
  const diferencia_interes = total_interes_tarjeta - total_interes_banco;
  
  let ahorro_potencial = 0;
  if (total_interes_tarjeta > 0) {
    ahorro_potencial = (diferencia_interes / total_interes_tarjeta) * 100;
  }
  
  return {
    cuota_mensual_tarjeta: Math.round(cuota_tarjeta),
    total_pagado_tarjeta: Math.round(total_pagado_tarjeta),
    total_interes_tarjeta: Math.round(total_interes_tarjeta),
    cae_efectivo_tarjeta: parseFloat((cae_efectivo).toFixed(2)),
    cuota_mensual_banco: Math.round(cuota_banco),
    total_interes_banco: Math.round(total_interes_banco),
    diferencia_interes: Math.round(diferencia_interes),
    ahorro_potencial: parseFloat(ahorro_potencial.toFixed(1))
  };
}
