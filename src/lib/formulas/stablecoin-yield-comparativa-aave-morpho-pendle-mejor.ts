export interface Inputs {
  capital: number;
  asset: string;
  protocol: string;
  dias: number;
  red: string;
  operaciones: string;
  nivelRiesgo: string;
}

export interface Outputs {
  apyBruto: number;
  apyAjustado: number;
  interessBruto: number;
  gasTotal: number;
  interesNeto: number;
  apyNetoEfectivo: number;
  nivelRiesgoLabel: string;
  liquidezLabel: string;
  nota: string;
}

// APYs de referencia Q1-Q2 2026 (fuente: interfaces de cada protocolo, valores orientativos)
// Estructura: APY_BASE[protocolo][asset] = fracción decimal
const APY_BASE: Record<string, Record<string, number>> = {
  aave:     { usdc: 0.058, usdt: 0.055, dai: 0.052, usde: 0.070 },
  morpho:   { usdc: 0.065, usdt: 0.060, dai: 0.058, usde: 0.078 },
  pendle:   { usdc: 0.060, usdt: 0.055, dai: 0.055, usde: 0.090 },
  compound: { usdc: 0.050, usdt: 0.048, dai: 0.000, usde: 0.000 },
  spark:    { usdc: 0.050, usdt: 0.000, dai: 0.065, usde: 0.000 },
  sky:      { usdc: 0.052, usdt: 0.000, dai: 0.068, usde: 0.000 },
};

// Costo de gas por transacción en USD (promedio conservador 2026)
const GAS_POR_TX_USD: Record<string, number> = {
  ethereum: 12.00,
  arbitrum: 0.20,
  base:     0.10,
  optimism: 0.15,
};

// Penalizador de riesgo (fracción anual a restar del APY)
const RISK_PENALTY: Record<string, number> = {
  ninguno:     0.000,
  moderado:    0.005,
  conservador: 0.015,
};

// Etiquetas de riesgo por protocolo
const RIESGO_LABEL: Record<string, string> = {
  aave:     "Bajo — múltiples auditorías, oracle Chainlink, mayor TVL del sector",
  compound: "Bajo — protocolo veterano, oracle Chainlink, gobernanza activa",
  spark:    "Bajo-medio — respaldado por MakerDAO/Sky, auditorías múltiples",
  sky:      "Bajo-medio — SSR de Sky (ex-Maker), riesgo sistémico DAI/USDS",
  morpho:   "Medio — mercados aislados, riesgo de curador de vault, auditorías OK",
  pendle:   "Medio-alto — tokenización de yield, riesgo de vencimiento y oracle complejo",
};

// Liquidez de retiro por protocolo
const LIQUIDEZ_LABEL: Record<string, string> = {
  aave:     "Inmediata (siempre que haya liquidez en el pool)",
  compound: "Inmediata (siempre que haya liquidez en el pool)",
  spark:    "Inmediata para sDAI; depende de liquidez del DSR",
  sky:      "Inmediata para sUSDS; depende de liquidez del SSR",
  morpho:   "Generalmente inmediata; puede haber retrasos en vaults con baja liquidez",
  pendle:   "Antes del vencimiento: precio de mercado del PT (posible descuento). Al vencimiento: 1:1",
};

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const dias = Number(i.dias) || 0;
  const ops = Number(i.operaciones) || 2;

  // Validaciones básicas
  if (capital <= 0) {
    return {
      apyBruto: 0,
      apyAjustado: 0,
      interessBruto: 0,
      gasTotal: 0,
      interesNeto: 0,
      apyNetoEfectivo: 0,
      nivelRiesgoLabel: "—",
      liquidezLabel: "—",
      nota: "Ingresá un capital mayor a 0.",
    };
  }

  if (dias <= 0 || dias > 3650) {
    return {
      apyBruto: 0,
      apyAjustado: 0,
      interessBruto: 0,
      gasTotal: 0,
      interesNeto: 0,
      apyNetoEfectivo: 0,
      nivelRiesgoLabel: "—",
      liquidezLabel: "—",
      nota: "El plazo debe estar entre 1 y 3.650 días.",
    };
  }

  const protocol = i.protocol || "aave";
  const asset = i.asset || "usdc";
  const red = i.red || "ethereum";
  const nivelRiesgo = i.nivelRiesgo || "moderado";

  // Obtener APY base
  const protocolRates = APY_BASE[protocol];
  if (!protocolRates) {
    return {
      apyBruto: 0,
      apyAjustado: 0,
      interessBruto: 0,
      gasTotal: 0,
      interesNeto: 0,
      apyNetoEfectivo: 0,
      nivelRiesgoLabel: "Protocolo no reconocido.",
      liquidezLabel: "—",
      nota: "Seleccioná un protocolo válido.",
    };
  }

  const apyBruto = protocolRates[asset] ?? 0;

  // Combinaciones no disponibles (ej. USDT en Spark)
  let notaBase = "";
  if (apyBruto === 0) {
    notaBase = `${asset.toUpperCase()} no está disponible o no tiene yield activo en ${protocol}. Probá otro asset o protocolo.`;
  }

  // Penalizador de riesgo
  const penalty = RISK_PENALTY[nivelRiesgo] ?? 0.005;
  const apyAjustado = Math.max(apyBruto - penalty, 0);

  // Cálculo de interés (interés simple proporcional al período)
  const fraccionAnio = dias / 365;
  const interessBruto = capital * apyAjustado * fraccionAnio;

  // Costo de gas
  const gasPorTx = GAS_POR_TX_USD[red] ?? 12.00;
  const gasTotal = gasPorTx * ops;

  // Interés neto
  const interesNeto = interessBruto - gasTotal;

  // APY neto efectivo (anualizado sobre el capital original)
  const apyNetoEfectivo = dias > 0
    ? (interesNeto / capital) * (365 / dias)
    : 0;

  // Etiquetas
  const nivelRiesgoLabel = RIESGO_LABEL[protocol] ?? "Sin información";
  const liquidezLabel = LIQUIDEZ_LABEL[protocol] ?? "Sin información";

  // Nota adicional
  let nota = notaBase;
  if (!nota) {
    if (protocol === "pendle") {
      nota = "Pendle usa yield fijo (PT). El APY es el implied fixed yield estimado al vencimiento; retiros anticipados pueden realizarse a descuento de mercado.";
    } else if (interesNeto < 0) {
      nota = "El costo de gas supera el rendimiento estimado para este capital y plazo. Considerá aumentar el capital, el plazo o usar una L2.";
    } else if (gasTotal / interessBruto > 0.3 && interessBruto > 0) {
      nota = `El gas representa el ${((gasTotal / interessBruto) * 100).toFixed(1)}% del rendimiento bruto. Considerá usar una L2 o aumentar el capital/plazo.`;
    } else {
      nota = "APYs orientativos Q1-Q2 2026. Verificá la tasa actual en la interfaz del protocolo antes de depositar.";
    }
  }

  return {
    apyBruto,
    apyAjustado,
    interessBruto,
    gasTotal,
    interesNeto,
    apyNetoEfectivo,
    nivelRiesgoLabel,
    liquidezLabel,
    nota,
  };
}
