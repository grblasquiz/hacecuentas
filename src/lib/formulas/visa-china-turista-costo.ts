/**
 * Calculadora Visa China
 */
export interface VisaChinaTuristaCostoInputs {
  nacionalidad: string;
  tipoVisa: string;
  entradas: string;
}
export interface VisaChinaTuristaCostoOutputs {
  costoTotalUsd: number;
  tiempoTramiteDias: number;
  documentos: string;
}
export function visaChinaTuristaCosto(i: VisaChinaTuristaCostoInputs): VisaChinaTuristaCostoOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const ent = String(i.entradas || "una");
  let base = 140;
  if (nac === "estadounidense") base = 185;
  if (nac === "canadiense") base = 100;
  let multiplicador = 1;
  if (ent === "dos") multiplicador = 1.5;
  if (ent === "multiple") multiplicador = 2;
  const costo = Math.round(base * multiplicador);
  return {
    costoTotalUsd: costo,
    tiempoTramiteDias: 4,
    documentos: "Pasaporte + formulario V.2013 + foto + itinerario + hoteles + vuelo + extractos + carta trabajo + huellas."
  };
}
