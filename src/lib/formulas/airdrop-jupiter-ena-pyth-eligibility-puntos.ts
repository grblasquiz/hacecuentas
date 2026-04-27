export interface Inputs {
  protocolo: string;
  volumenUSD: number;
  diasActivo: number;
  appsInteractuadas: number;
  txCount: number;
  liquidezProvista: string;
  nftHolder: string;
}

export interface Outputs {
  probabilidad: number;
  puntaje: number;
  tokensEstimados: string;
  nivel: string;
  recomendaciones: string;
}

interface ProtocolConfig {
  nombre: string;
  volumenMin: number;
  diasMin: number;
  appsMin: number;
  txMin: number;
  tokenSymbol: string;
  // Token ranges by tier [basico, intermedio, avanzado, powerUser]
  tokenRanges: [string, string, string, string];
}

const PROTOCOLS: Record<string, ProtocolConfig> = {
  layerzero: {
    nombre: "LayerZero",
    volumenMin: 5000,
    diasMin: 30,
    appsMin: 3,
    txMin: 15,
    tokenSymbol: "ZRO",
    tokenRanges: ["50 – 200 ZRO", "200 – 800 ZRO", "800 – 2,000 ZRO", "2,000 – 10,000 ZRO"],
  },
  linea: {
    nombre: "Linea",
    volumenMin: 2000,
    diasMin: 14,
    appsMin: 2,
    txMin: 10,
    tokenSymbol: "LINEA",
    tokenRanges: ["100 – 500 LINEA", "500 – 2,000 LINEA", "2,000 – 6,000 LINEA", "6,000 – 20,000 LINEA"],
  },
  scroll: {
    nombre: "Scroll",
    volumenMin: 1000,
    diasMin: 14,
    appsMin: 2,
    txMin: 10,
    tokenSymbol: "SCR",
    tokenRanges: ["50 – 300 SCR", "300 – 1,000 SCR", "1,000 – 4,000 SCR", "4,000 – 15,000 SCR"],
  },
  hyperliquid: {
    nombre: "Hyperliquid",
    volumenMin: 50000,
    diasMin: 60,
    appsMin: 4,
    txMin: 50,
    tokenSymbol: "HYPE",
    tokenRanges: ["10 – 50 HYPE", "50 – 300 HYPE", "300 – 1,000 HYPE", "1,000 – 5,000 HYPE"],
  },
  drift: {
    nombre: "Drift",
    volumenMin: 10000,
    diasMin: 45,
    appsMin: 3,
    txMin: 30,
    tokenSymbol: "DRIFT",
    tokenRanges: ["200 – 1,000 DRIFT", "1,000 – 5,000 DRIFT", "5,000 – 15,000 DRIFT", "15,000 – 50,000 DRIFT"],
  },
};

// Weights for each scoring component
const W_VOLUMEN = 35;
const W_DIAS = 25;
const W_APPS = 20;
const W_TX = 15;
const BONO_LP = 10;
const BONO_NFT = 5;
// Max raw score without bonuses = 95 (so bonuses can push to 100+)

export function compute(i: Inputs): Outputs {
  const protocolo = i.protocolo || "layerzero";
  const config = PROTOCOLS[protocolo] ?? PROTOCOLS["layerzero"];

  const volumenUSD = Math.max(0, Number(i.volumenUSD) || 0);
  const diasActivo = Math.max(0, Number(i.diasActivo) || 0);
  const appsInteractuadas = Math.max(0, Number(i.appsInteractuadas) || 0);
  const txCount = Math.max(0, Number(i.txCount) || 0);
  const tieneLP = i.liquidezProvista === "si";
  const tieneNFT = i.nftHolder === "si";

  // Normalize each component to [0, 1] capped at 1
  const pVolumen = Math.min(1, volumenUSD / config.volumenMin);
  const pDias = Math.min(1, diasActivo / config.diasMin);
  const pApps = Math.min(1, appsInteractuadas / config.appsMin);
  const pTx = Math.min(1, txCount / config.txMin);

  // Weighted score out of 95 base points
  const scoreBase =
    pVolumen * W_VOLUMEN +
    pDias * W_DIAS +
    pApps * W_APPS +
    pTx * W_TX;

  const bonoLP = tieneLP ? BONO_LP : 0;
  const bonoNFT = tieneNFT ? BONO_NFT : 0;

  const scoreRaw = scoreBase + bonoLP + bonoNFT;
  // Cap at 100
  const puntaje = Math.min(100, Math.round(scoreRaw));

  // Probability: score / 100, but require at least meeting 1 minimum criterion
  const meetsAnyMin =
    volumenUSD >= config.volumenMin ||
    diasActivo >= config.diasMin ||
    appsInteractuadas >= config.appsMin ||
    txCount >= config.txMin;

  const probabilidadRaw = meetsAnyMin ? puntaje : Math.round(puntaje * 0.5);
  const probabilidad = Math.min(100, probabilidadRaw) / 100;

  // Determine level
  let nivel: string;
  let tokenRangeIndex: number;
  if (puntaje < 40) {
    nivel = "Básico";
    tokenRangeIndex = 0;
  } else if (puntaje < 70) {
    nivel = "Intermedio";
    tokenRangeIndex = 1;
  } else if (puntaje < 90) {
    nivel = "Avanzado";
    tokenRangeIndex = 2;
  } else {
    nivel = "Power User";
    tokenRangeIndex = 3;
  }

  const tokensEstimados = config.tokenRanges[tokenRangeIndex];

  // Build recommendations
  const recs: string[] = [];
  if (volumenUSD < config.volumenMin) {
    const falta = (config.volumenMin - volumenUSD).toLocaleString("es");
    recs.push(`Aumentá tu volumen en $${falta} USD (mínimo: $${config.volumenMin.toLocaleString("es")} USD)`);
  }
  if (diasActivo < config.diasMin) {
    recs.push(`Necesitás ${config.diasMin - diasActivo} días más de actividad (mínimo: ${config.diasMin} días)`);
  }
  if (appsInteractuadas < config.appsMin) {
    recs.push(`Interactuá con ${config.appsMin - appsInteractuadas} app(s) más (mínimo: ${config.appsMin})`);
  }
  if (txCount < config.txMin) {
    recs.push(`Realizá ${config.txMin - txCount} transacciones más (mínimo: ${config.txMin})`);
  }
  if (!tieneLP) {
    recs.push("Proveer liquidez (LP) o hacer staking suma +10 puntos al puntaje");
  }
  if (!tieneNFT) {
    recs.push("Tener NFT o token nativo del ecosistema suma +5 puntos adicionales");
  }

  const recomendaciones =
    recs.length === 0
      ? `✅ Tu perfil cumple todos los criterios mínimos de ${config.nombre}. Mantené tu actividad activa hasta el snapshot.`
      : `Para mejorar tu elegibilidad en ${config.nombre}: ${recs.join(" | ")}`;

  return {
    probabilidad,
    puntaje,
    tokensEstimados,
    nivel,
    recomendaciones,
  };
}
