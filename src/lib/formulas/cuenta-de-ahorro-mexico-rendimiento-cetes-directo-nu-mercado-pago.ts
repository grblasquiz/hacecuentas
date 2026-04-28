export interface Inputs {
  monto_inicial: number;
  plazo_dias: number;
  tipo_cuenta: string;
  depositos_mensuales: number;
  incluir_inflacion: boolean;
}

export interface Outputs {
  tasa_anual_seleccionada: number;
  interes_bruto_total: number;
  retencion_isr: number;
  interes_neto: number;
  saldo_final: number;
  rendimiento_efectivo_anual: number;
  comparativa_ranking: string;
  mejor_opcion_perfil: string;
  poder_adquisitivo_real: number;
  ganancia_vs_inflacion: number;
}

export function compute(i: Inputs): Outputs {
  // Tasas anuales por plataforma (abril 2026, México)
  const tasas: Record<string, number> = {
    "cetes_directo": 0.1113,
    "nu_mexico": 0.1000,
    "mercado_pago": 0.0913,
    "stori": 0.0850,
    "klar": 0.0900,
    "hey_banco": 0.0920,
    "bbva_libreta": 0.0450,
    "banorte_inteligente": 0.0680
  };

  // Retención ISR sobre intereses (SAT 2026)
  const ISR_RATE = 0.0145;
  
  // Inflación México 2026 (Banxico proyección)
  const INFLACION_MEXICO = 0.0280;

  const tasa_anual = tasas[i.tipo_cuenta] || 0.10;
  
  // Cálculo de interés bruto sobre monto inicial
  const interes_bruto_inicial = i.monto_inicial * tasa_anual * (i.plazo_dias / 365);
  
  // Si hay depósitos mensuales, calcular interés escalonado
  let interes_bruto_depositos = 0;
  if (i.depositos_mensuales > 0) {
    const meses = Math.floor(i.plazo_dias / 30);
    for (let mes = 1; mes <= meses; mes++) {
      const dias_restantes = i.plazo_dias - (mes - 1) * 30;
      interes_bruto_depositos += i.depositos_mensuales * tasa_anual * (dias_restantes / 365);
    }
  }
  
  const interes_bruto_total = interes_bruto_inicial + interes_bruto_depositos;
  
  // Retención ISR
  const retencion_isr = interes_bruto_total * ISR_RATE;
  
  // Interés neto
  const interes_neto = interes_bruto_total - retencion_isr;
  
  // Depósitos totales
  const meses_totales = Math.floor(i.plazo_dias / 30);
  const depositos_totales = i.depositos_mensuales * meses_totales;
  
  // Saldo final
  const saldo_final = i.monto_inicial + depositos_totales + interes_neto;
  
  // Rendimiento efectivo anual neto
  const rendimiento_efectivo_anual = (interes_neto / (i.monto_inicial + depositos_totales)) * (365 / i.plazo_dias);
  
  // Poder adquisitivo real (ajustado inflación)
  const poder_adquisitivo_real = saldo_final / (1 + INFLACION_MEXICO);
  
  // Ganancia real vs inflación
  const ganancia_vs_inflacion = (interes_neto - (i.monto_inicial * INFLACION_MEXICO)) / (i.monto_inicial + depositos_totales);
  
  // Ranking comparativo (simulado)
  const ranking_map: Record<string, number> = {
    "cetes_directo": 1,
    "nu_mexico": 2,
    "klar": 3,
    "hey_banco": 4,
    "mercado_pago": 5,
    "stori": 6,
    "banorte_inteligente": 7,
    "bbva_libreta": 8
  };
  
  const posicion = ranking_map[i.tipo_cuenta] || 5;
  let comparativa_ranking = "";
  if (posicion === 1) {
    comparativa_ranking = `Posición 1/8: ${i.tipo_cuenta} es la opción con mayor tasa (${(tasa_anual * 100).toFixed(2)}% anual). Mejor rendimiento absoluto en México, respaldada por Tesorería.`;
  } else if (posicion <= 3) {
    comparativa_ranking = `Posición ${posicion}/8: ${i.tipo_cuenta} está entre las 3 mejores. Tasa competitiva (${(tasa_anual * 100).toFixed(2)}%) con buena liquidez.`;
  } else if (posicion <= 6) {
    comparativa_ranking = `Posición ${posicion}/8: ${i.tipo_cuenta} ofrece rendimiento medio (${(tasa_anual * 100).toFixed(2)}%). Balance entre seguridad, liquidez y ganancia.`;
  } else {
    comparativa_ranking = `Posición ${posicion}/8: ${i.tipo_cuenta} tiene menor tasa (${(tasa_anual * 100).toFixed(2)}%). Considera alternativas de fintech para mejor rendimiento.`;
  }
  
  // Recomendación por perfil
  let mejor_opcion_perfil = "";
  if (i.plazo_dias >= 365 && i.monto_inicial >= 5000) {
    mejor_opcion_perfil = "Perfil: Ahorrador a largo plazo. Recomendación: CetesDirecto o NU (máxima ganancia, capital seguro). Espera 1-2 días tras compra inicial en Cetes.";
  } else if (i.plazo_dias >= 180 && i.plazo_dias < 365) {
    mejor_opcion_perfil = "Perfil: Ahorrador mediano plazo. Recomendación: NU (10% garantizado) o Mercado Pago (9.1%, retiro diario). Sin comisiones, liquidez flexible.";
  } else if (i.plazo_dias < 180) {
    mejor_opcion_perfil = "Perfil: Emergencias, corto plazo. Recomendación: Mercado Pago, Stori o Klar. Retiro inmediato 1-2 horas, tasa 8.5-9.1%, sin comisiones.";
  } else if (i.monto_inicial > 100000) {
    mejor_opcion_perfil = "Perfil: Inversionista con capital alto. Recomendación: CetesDirecto (11.13%, Tesorería, seguridad estatal) o NU (10%, sin comisiones, crecimiento ágil).";
  } else {
    mejor_opcion_perfil = "Perfil: Ahorrador general. Recomendación: NU (10%) o Mercado Pago (9.1%). Ambas sin mínimo exigente, retiro flexible, sin comisiones.";
  }
  
  return {
    tasa_anual_seleccionada: tasa_anual,
    interes_bruto_total: Math.round(interes_bruto_total * 100) / 100,
    retencion_isr: Math.round(retencion_isr * 100) / 100,
    interes_neto: Math.round(interes_neto * 100) / 100,
    saldo_final: Math.round(saldo_final * 100) / 100,
    rendimiento_efectivo_anual: Math.max(0, Math.round(rendimiento_efectivo_anual * 10000) / 100),
    comparativa_ranking: comparativa_ranking,
    mejor_opcion_perfil: mejor_opcion_perfil,
    poder_adquisitivo_real: Math.round(poder_adquisitivo_real * 100) / 100,
    ganancia_vs_inflacion: Math.round(ganancia_vs_inflacion * 10000) / 100
  };
}
