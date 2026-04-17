/**
 * Calculadora Renovación de Pasaporte
 */
export interface PasaporteRenovacionCostoTiempoInputs {
  pais: string;
  tipoTramite: string;
  aniosVigencia: string;
}
export interface PasaporteRenovacionCostoTiempoOutputs {
  costoLocal: string;
  tiempoEntrega: string;
  documentacion: string;
}
const PRECIOS: Record<string, {normal: string, express: string, moneda: string}> = {
  argentina: { normal: "ARS 90.000", express: "ARS 180.000", moneda: "ARS" },
  mexico: { normal: "MXN 2.000-6.000", express: "N/A", moneda: "MXN" },
  chile: { normal: "CLP 88.000", express: "CLP 130.000", moneda: "CLP" },
  colombia: { normal: "COP 258.000", express: "COP 520.000", moneda: "COP" },
  peru: { normal: "PEN 120", express: "PEN 220", moneda: "PEN" },
  brasil: { normal: "BRL 257", express: "N/A", moneda: "BRL" },
  uruguay: { normal: "UYU 2.700", express: "UYU 5.400", moneda: "UYU" }
};
const TIEMPOS: Record<string, {normal: string, express: string}> = {
  argentina: { normal: "15-20 días", express: "48 hs" },
  mexico: { normal: "3-5 días", express: "N/A" },
  chile: { normal: "15 días", express: "5 días" },
  colombia: { normal: "8 días", express: "1-3 días" },
  peru: { normal: "mismo día", express: "mismo día" },
  brasil: { normal: "5 días", express: "N/A" },
  uruguay: { normal: "10 días", express: "3 días" }
};
export function pasaporteRenovacionCostoTiempo(i: PasaporteRenovacionCostoTiempoInputs): PasaporteRenovacionCostoTiempoOutputs {
  const p = String(i.pais || "argentina");
  const tipo = String(i.tipoTramite || "normal");
  const precios = PRECIOS[p] || PRECIOS.argentina;
  const tiempos = TIEMPOS[p] || TIEMPOS.argentina;
  return {
    costoLocal: tipo === "express" ? precios.express : precios.normal,
    tiempoEntrega: tipo === "express" ? tiempos.express : tiempos.normal,
    documentacion: "DNI + partida nacimiento + foto biométrica + comprobante + turno previo."
  };
}
