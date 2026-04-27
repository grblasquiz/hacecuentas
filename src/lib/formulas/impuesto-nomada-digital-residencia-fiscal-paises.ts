export interface Inputs {
  ingresoAnual: number;
  tipoTrabajo: string; // 'freelance' | 'empleado'
  pais: string;
}

export interface Outputs {
  impuestoUSD: number;
  tasaEfectiva: number;
  ingresoNeto: number;
  detalle: string;
}

// Tipo de cambio referencial USD -> EUR (aproximado 2026)
const USD_TO_EUR = 0.92;

// Tramos IRPF Portugal estándar 2026 (en EUR, tasa marginal)
const TRAMOS_PORTUGAL: Array<{ hasta: number; tasa: number }> = [
  { hasta: 7703, tasa: 0.1325 },
  { hasta: 11623, tasa: 0.18 },
  { hasta: 16472, tasa: 0.23 },
  { hasta: 21321, tasa: 0.26 },
  { hasta: 27146, tasa: 0.3275 },
  { hasta: 39791, tasa: 0.37 },
  { hasta: 51997, tasa: 0.435 },
  { hasta: 81199, tasa: 0.45 },
  { hasta: Infinity, tasa: 0.48 },
];

// Tramos IRPF España estándar 2026 (en EUR, tasa marginal)
const TRAMOS_ESPANA: Array<{ hasta: number; tasa: number }> = [
  { hasta: 12450, tasa: 0.19 },
  { hasta: 20200, tasa: 0.24 },
  { hasta: 35200, tasa: 0.30 },
  { hasta: 60000, tasa: 0.37 },
  { hasta: 300000, tasa: 0.45 },
  { hasta: Infinity, tasa: 0.47 },
];

function calcularEscala(
  baseEUR: number,
  tramos: Array<{ hasta: number; tasa: number }>
): number {
  let impuesto = 0;
  let baseRestante = baseEUR;
  let tramoAnterior = 0;

  for (const tramo of tramos) {
    if (baseRestante <= 0) break;
    const tamanioTramo = tramo.hasta - tramoAnterior;
    const baseEnTramo = Math.min(baseRestante, tamanioTramo);
    impuesto += baseEnTramo * tramo.tasa;
    baseRestante -= baseEnTramo;
    tramoAnterior = tramo.hasta;
  }

  return impuesto;
}

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoAnual) || 0;
  const pais = i.pais || "portugal_nhr";
  const tipo = i.tipoTrabajo || "freelance";

  if (ingreso <= 0) {
    return {
      impuestoUSD: 0,
      tasaEfectiva: 0,
      ingresoNeto: 0,
      detalle: "Ingresá un ingreso anual mayor a 0.",
    };
  }

  let impuestoUSD = 0;
  let detalle = "";

  switch (pais) {
    case "portugal_nhr": {
      // NHR / IFICI 2026: tasa flat 20% sobre ingresos de servicios de alto valor
      // Fuente: Portal das Finanças, Regime IFICI
      const TASA_NHR = 0.20;
      impuestoUSD = ingreso * TASA_NHR;
      detalle = `Portugal NHR/IFICI: tasa flat 20% sobre ingresos de fuente extranjera.\nBase: USD ${ingreso.toLocaleString("es")} × 20% = USD ${impuestoUSD.toLocaleString("es")}.\nNota: el nuevo IFICI (2024+) requiere calificación de actividad de alto valor añadido.`;
      break;
    }

    case "portugal_estandar": {
      // Escala progresiva Portugal, conversión a EUR
      const baseEUR = ingreso * USD_TO_EUR;
      const impuestoEUR = calcularEscala(baseEUR, TRAMOS_PORTUGAL);
      // Convertir impuesto de EUR a USD (inverso)
      impuestoUSD = impuestoEUR / USD_TO_EUR;
      detalle = `Portugal régimen estándar: escala progresiva hasta 48%.\nBase en EUR: ${baseEUR.toFixed(0)} EUR\nImpuesto calculado: ${impuestoEUR.toFixed(0)} EUR ≈ USD ${impuestoUSD.toFixed(0)}.\nTipo de cambio referencial: 1 USD = ${USD_TO_EUR} EUR.`;
      break;
    }

    case "espana_beckham": {
      // Ley Beckham: 24% hasta 600.000 USD equivalente, 47% sobre exceso
      // Fuente: Agencia Tributaria España
      const UMBRAL_BECKHAM_USD = 600000;
      const TASA_BECKHAM_BASE = 0.24;
      const TASA_BECKHAM_EXCESO = 0.47;
      if (ingreso <= UMBRAL_BECKHAM_USD) {
        impuestoUSD = ingreso * TASA_BECKHAM_BASE;
        detalle = `España Ley Beckham: tasa flat 24% (primeros 6 años de residencia).\nBase: USD ${ingreso.toLocaleString("es")} × 24% = USD ${impuestoUSD.toLocaleString("es")}.`;
      } else {
        const impuestoBase = UMBRAL_BECKHAM_USD * TASA_BECKHAM_BASE;
        const impuestoExceso = (ingreso - UMBRAL_BECKHAM_USD) * TASA_BECKHAM_EXCESO;
        impuestoUSD = impuestoBase + impuestoExceso;
        detalle = `España Ley Beckham: 24% sobre primeros USD 600.000 + 47% sobre exceso.\nPrimeros 600.000: USD ${impuestoBase.toLocaleString("es")}\nExceso: USD ${impuestoExceso.toFixed(0)}\nTotal: USD ${impuestoUSD.toFixed(0)}.`;
      }
      break;
    }

    case "espana_estandar": {
      // Escala progresiva España estándar, conversión a EUR
      const baseEUR = ingreso * USD_TO_EUR;
      const impuestoEUR = calcularEscala(baseEUR, TRAMOS_ESPANA);
      impuestoUSD = impuestoEUR / USD_TO_EUR;
      detalle = `España régimen estándar: escala progresiva hasta 47% (estatal + autonómica media).\nBase en EUR: ${baseEUR.toFixed(0)} EUR\nImpuesto calculado: ${impuestoEUR.toFixed(0)} EUR ≈ USD ${impuestoUSD.toFixed(0)}.\nTipo de cambio referencial: 1 USD = ${USD_TO_EUR} EUR.`;
      break;
    }

    case "estonia_digital": {
      // Estonia OÜ: 0% sobre beneficios retenidos, 22% sobre dividendos distribuidos
      // Fuente: Estonian Tax and Customs Board, 2026
      const TASA_ESTONIA_DISTRIBUCION = 0.22;
      // Para comparación conservadora asumimos distribución del 100%
      impuestoUSD = ingreso * TASA_ESTONIA_DISTRIBUCION;
      detalle = `Estonia e-Residency (empresa OÜ): 22% impuesto sobre dividendos distribuidos (2026).\nCálculo conservador: distribución total del ingreso.\nBase: USD ${ingreso.toLocaleString("es")} × 22% = USD ${impuestoUSD.toLocaleString("es")}.\nSi se reinvierten los beneficios: impuesto = USD 0 (diferido indefinidamente).\nNota: la e-Residency no otorga residencia fiscal automática en Estonia.`;
      break;
    }

    case "paraguay": {
      // Paraguay: ingresos de fuente extranjera exentos de IRP
      // Fuente: Ley 2421/2004, Decreto 9371/2012 — Ministerio de Hacienda Paraguay
      impuestoUSD = 0;
      detalle = `Paraguay: ingresos de fuente extranjera no están gravados por el IRP.\nTasa efectiva: 0%.\nRequisito: acreditar residencia fiscal (mínimo 120 días al año o centro de vida en Paraguay).\nBase: USD ${ingreso.toLocaleString("es")} × 0% = USD 0.`;
      break;
    }

    case "georgia": {
      // Georgia Virtual Zone: 0% para IT exportado
      // Small Business: 1% sobre facturación hasta GEL ~500.000
      // Se aplica 1% como aproximación conservadora para servicios digitales
      const TASA_GEORGIA = 0.01;
      impuestoUSD = ingreso * TASA_GEORGIA;
      detalle = `Georgia Virtual Zone / Small Business: 1% tasa efectiva sobre facturación de servicios digitales al exterior.\nBase: USD ${ingreso.toLocaleString("es")} × 1% = USD ${impuestoUSD.toLocaleString("es")}.\nNota: el régimen Virtual Zone exige que los servicios sean de tecnología de la información exportados fuera de Georgia.`;
      break;
    }

    case "dubai": {
      // Dubai / EAU: sin impuesto a la renta personal
      // Corporate Tax 9% aplica solo a empresas con beneficios > AED 375.000 (~USD 102.000)
      // Fuente: UAE Federal Tax Authority
      if (tipo === "freelance" && ingreso > 102000) {
        // Estimación orientativa: si opera como empresa con beneficios > umbral
        const TASA_CORP_UAE = 0.09;
        const UMBRAL_CORP_USD = 102000;
        impuestoUSD = (ingreso - UMBRAL_CORP_USD) * TASA_CORP_UAE;
        detalle = `Dubai / EAU: sin IRPF personal.\nSi operás como empresa con beneficios > USD 102.000: Corporate Tax 9% sobre el exceso (desde 2023).\nExceso: USD ${(ingreso - UMBRAL_CORP_USD).toLocaleString("es")} × 9% = USD ${impuestoUSD.toFixed(0)}.\nPersonas físicas freelancers sin estructura societaria: USD 0.`;
      } else {
        impuestoUSD = 0;
        detalle = `Dubai / EAU: no existe impuesto sobre la renta personal.\nTasa efectiva: 0%.\nBase: USD ${ingreso.toLocaleString("es")} × 0% = USD 0.\nNota: Corporate Tax del 9% aplica a empresas con beneficios > AED 375.000 (~USD 102.000).`;
      }
      break;
    }

    default: {
      impuestoUSD = 0;
      detalle = "Régimen no reconocido. Seleccioná una opción válida.";
    }
  }

  const tasaEfectiva = ingreso > 0 ? (impuestoUSD / ingreso) * 100 : 0;
  const ingresoNeto = ingreso - impuestoUSD;

  return {
    impuestoUSD: Math.round(impuestoUSD * 100) / 100,
    tasaEfectiva: Math.round(tasaEfectiva * 100) / 100,
    ingresoNeto: Math.round(ingresoNeto * 100) / 100,
    detalle,
  };
}
