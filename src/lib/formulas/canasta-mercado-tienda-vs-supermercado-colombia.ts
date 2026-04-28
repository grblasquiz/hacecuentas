export interface Inputs {
  canasta_tienda_barrio: number;
  porcentaje_descuento_supermercado: number;
  porcentaje_descuento_hipermercado: number;
  costo_membresia_anual: number;
  frecuencia_compra_semanas: number;
  costo_transporte_hipermercado: number;
}

export interface Outputs {
  gasto_mensual_tienda: number;
  gasto_mensual_supermercado: number;
  ahorro_mensual_supermercado: number;
  gasto_mensual_hipermercado: number;
  costo_hipermercado_anualizado: number;
  ahorro_mensual_hipermercado: number;
  ahorro_anual_supermercado: number;
  ahorro_anual_hipermercado: number;
  canal_mas_economico: string;
  diferencia_super_vs_hiper: number;
  punto_equilibrio_membesia_meses: number;
}

export function compute(i: Inputs): Outputs {
  // Valores por defecto
  const descSuper = i.porcentaje_descuento_supermercado ?? 8;
  const descHiper = i.porcentaje_descuento_hipermercado ?? 12;
  const membresia = i.costo_membresia_anual ?? 80000;
  const transporte = i.costo_transporte_hipermercado ?? 0;
  const frecuencia = i.frecuencia_compra_semanas ?? 1;
  
  const gastoTienda = i.canasta_tienda_barrio || 850000;
  
  // Gasto supermercado: aplica descuento simple
  const gastoSuper = gastoTienda * (1 - descSuper / 100);
  const ahorroMensualSuper = gastoTienda - gastoSuper;
  const ahorroAnualSuper = ahorroMensualSuper * 12;
  
  // Gasto hipermercado: descuento + transporte + membresía anualizada
  const gastoHiperBruto = gastoTienda * (1 - descHiper / 100);
  const transportePorMes = transporte * frecuencia * 4.33; // 4.33 semanas/mes promedio
  const membresiaMensual = membresia / 12;
  const gastoHiperNeto = gastoHiperBruto + transportePorMes + membresiaMensual;
  const ahorroMensualHiper = gastoTienda - gastoHiperNeto;
  const ahorroAnualHiper = ahorroMensualHiper * 12;
  
  // Punto equilibrio membresía: cuántos meses para que ahorro bruto cubra membresía
  const ahorroMensualHiperBruto = gastoTienda - gastoHiperBruto; // Sin membresía/transporte
  const puntosEquilibrioMeses = ahorroMensualHiperBruto > 0 ? membresia / ahorroMensualHiperBruto : 999;
  
  // Diferencia super vs hiper
  const diferenciaHiperVsSuper = gastoSuper - gastoHiperNeto; // Positivo = hiper es más barato
  
  // Determinar canal más económico
  let canalMasEconomico = "Tienda barrio";
  let minGasto = gastoTienda;
  
  if (gastoSuper < minGasto) {
    canalMasEconomico = "Supermercado (Éxito, Olímpica, Carrefour)";
    minGasto = gastoSuper;
  }
  
  if (gastoHiperNeto < minGasto) {
    canalMasEconomico = "Hipermercado (Makro, PriceSmart)";
    minGasto = gastoHiperNeto;
  }
  
  // Si ahorros son negativos (no conviene), reajusta mensaje
  if (ahorroMensualSuper <= 0) {
    canalMasEconomico = "Tienda barrio (sin descuentos significativos en supermercado)";
  }
  
  if (ahorroMensualHiper <= 0) {
    if (ahorroMensualSuper > 0) {
      canalMasEconomico = "Supermercado (membresía hipermercado no rentable para tu compra)";
    }
  }
  
  return {
    gasto_mensual_tienda: Math.round(gastoTienda),
    gasto_mensual_supermercado: Math.round(gastoSuper),
    ahorro_mensual_supermercado: Math.round(ahorroMensualSuper),
    gasto_mensual_hipermercado: Math.round(gastoHiperBruto),
    costo_hipermercado_anualizado: Math.round(gastoHiperNeto),
    ahorro_mensual_hipermercado: Math.round(ahorroMensualHiper),
    ahorro_anual_supermercado: Math.round(ahorroAnualSuper),
    ahorro_anual_hipermercado: Math.round(ahorroAnualHiper),
    canal_mas_economico: canalMasEconomico,
    diferencia_super_vs_hiper: Math.round(diferenciaHiperVsSuper),
    punto_equilibrio_membesia_meses: Math.round(puntosEquilibrioMeses * 10) / 10
  };
}
