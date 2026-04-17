/**
 * Calculadora Visa USA
 */
export interface VisaUsaCostoTiempoPasaporteInputs {
  paisTramite: string;
  tipoVisa: string;
  mesesPasaporte: number;
}
export interface VisaUsaCostoTiempoPasaporteOutputs {
  costoTotalUsd: number;
  tiempoEstimadoSemanas: number;
  pasaporteOk: string;
}
const MRV: Record<string, number> = { b1b2: 185, f1: 185, h1b: 205 };
const TIEMPO: Record<string, number> = {
  argentina: 10, mexico: 3, colombia: 8, peru: 10, chile: 5, brasil: 12, otro: 8
};
export function visaUsaCostoTiempoPasaporte(i: VisaUsaCostoTiempoPasaporteInputs): VisaUsaCostoTiempoPasaporteOutputs {
  const pais = String(i.paisTramite || "argentina");
  const tipo = String(i.tipoVisa || "b1b2");
  const meses = Number(i.mesesPasaporte);
  if (isNaN(meses) || meses < 0) throw new Error("Meses de pasaporte inválidos");
  const costo = MRV[tipo] || 185;
  const tiempo = TIEMPO[pais] || 8;
  const ok = meses >= 6 ? "Sí - vigencia suficiente" : "No - renová pasaporte primero (mínimo 6 meses)";
  return { costoTotalUsd: costo, tiempoEstimadoSemanas: tiempo, pasaporteOk: ok };
}
