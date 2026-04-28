export interface Inputs {
  salario_neto_mensual: number;
  plazo_meses: number;
  cat_tasa_anual: number;
  antigüedad_anos: number;
}

export interface Outputs {
  monto_maximo_prestable: number;
  monto_solicitado: number;
  mensualidad_descuento: number;
  total_intereses: number;
  total_pagado: number;
  costo_efectivo: number;
  requisitos_cumplidos: string;
  proximos_pasos: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes FONACOT 2026
  const MESES_SALARIO_MAXIMO = 4; // Máximo prestable
  const ANTIGÜEDAD_MINIMA_ANOS = 1; // Requisito SAT/IMSS
  const TASA_CAT_MINIMA = 16; // Mejor tasa disponible
  const TASA_CAT_MAXIMA = 25; // Tasa máxima publicada
  const PORCENTAJE_CAPACIDAD_PAGO_MAX = 0.15; // FONACOT exige cuota ≤ 15% salario
  const TASA_MENSUAL_MINIMA = TASA_CAT_MINIMA / 100 / 12;
  const TASA_MENSUAL_MAXIMA = TASA_CAT_MAXIMA / 100 / 12;

  // Inputs
  const salarioNeto = Math.max(0, i.salario_neto_mensual);
  const plazoMeses = Math.max(12, Math.min(36, i.plazo_meses));
  const catAnual = Math.max(TASA_CAT_MINIMA, Math.min(TASA_CAT_MAXIMA, i.cat_tasa_anual));
  const antigüedadAños = i.antigüedad_anos;

  // Cálculo de monto máximo prestable
  const montoMaximoPrestable = salarioNeto * MESES_SALARIO_MAXIMO;
  let montoSolicitado = montoMaximoPrestable;

  // Validación de requisitos
  const cumplerequisitoAntiguedad = antigüedadAños >= ANTIGÜEDAD_MINIMA_ANOS;
  const cumpleRequisitoSalario = salarioNeto >= 6000; // Piso mínimo típico FONACOT

  // Validación de capacidad de pago
  const tasaMensual = catAnual / 100 / 12;
  const denomCalculo = Math.pow(1 + tasaMensual, plazoMeses) - 1;
  const mensualidadMaxima = (montoMaximoPrestable * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / denomCalculo;
  const capacidadPagoMax = salarioNeto * PORCENTAJE_CAPACIDAD_PAGO_MAX;

  if (mensualidadMaxima > capacidadPagoMax) {
    // Recalcular monto máximo permitido por capacidad de pago
    montoSolicitado = (capacidadPagoMax * denomCalculo) / (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses));
  }

  // Asegurar monto mínimo razonable
  const montoFinal = Math.max(0, Math.min(montoSolicitado, montoMaximoPrestable));

  // Cálculo de mensualidad con sistema de amortización francés
  const numerador = montoFinal * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses);
  const denominador = Math.pow(1 + tasaMensual, plazoMeses) - 1;
  const mensualidad = numerador / denominador;

  // Cálculo de totales
  const totalPagado = mensualidad * plazoMeses;
  const totalIntereses = Math.max(0, totalPagado - montoFinal);
  const costoEfectivoMensual = totalIntereses / plazoMeses;

  // Texto de requisitos
  let requisitosTexto = "";
  const requisitosNoMet: string[] = [];
  if (!cumplerequisitoAntiguedad) {
    requisitosNoMet.push(`Antigüedad insuficiente (tienes ${antigüedadAños.toFixed(1)}, mínimo 1 año)`);
  }
  if (!cumpleRequisitoSalario) {
    requisitosNoMet.push(`Salario bajo (mínimo recomendado $6,000, tienes $${salarioNeto.toLocaleString('es-MX')})`);
  }
  if (requisitosNoMet.length === 0) {
    requisitosTexto = "✓ Cumples requisitos básicos de elegibilidad (antigüedad ≥ 1 año, salario ≥ $6,000). FONACOT validará tu historial en Buró de Crédito.";
  } else {
    requisitosTexto = "✗ No cumples: " + requisitosNoMet.join("; ");
  }

  // Texto de próximos pasos
  let proximosPasosTexto = "";
  if (requisitosNoMet.length === 0) {
    proximosPasosTexto = `1. Acude a sucursal FONACOT de tu ciudad con INE, CURP, comprobante domicilio, últimas 2 nóminas.\n2. Asesor consultará Buró de Crédito y asignará tu CAT.\n3. Con CAT confirmada, tu mensualidad será ~$${mensualidad.toLocaleString('es-MX', { maximumFractionDigits: 0 })}.\n4. Si autorizan, firma contrato; descuento comienza en siguiente nómina.\n5. Puedes amortizar anticipadamente sin penalización.`;
  } else {
    proximosPasosTexto = "Antes de solicitar: (1) Completa 1 año en tu empleo actual y reporta al IMSS; (2) Mejora tu historial crediticio (paga puntualmente tus deudas, consulta Buró).";
  }

  return {
    monto_maximo_prestable: Math.round(montoMaximoPrestable * 100) / 100,
    monto_solicitado: Math.round(montoFinal * 100) / 100,
    mensualidad_descuento: Math.round(mensualidad * 100) / 100,
    total_intereses: Math.round(totalIntereses * 100) / 100,
    total_pagado: Math.round(totalPagado * 100) / 100,
    costo_efectivo: Math.round(costoEfectivoMensual * 100) / 100,
    requisitos_cumplidos: requisitosTexto,
    proximos_pasos: proximosPasosTexto
  };
}
