/**
 * Calculadora ESTA USA
 */
export interface EstaUsaRequisitosInputs {
  nacionalidad: string;
  motivo: string;
  estadoViajesPrevios: string;
}
export interface EstaUsaRequisitosOutputs {
  tramite: string;
  costoUsd: number;
  observaciones: string;
}
const VWP = ["espanol", "frances", "aleman", "italiano", "britanico", "japones", "coreano", "australiano", "chileno"];
export function estaUsaRequisitos(i: EstaUsaRequisitosInputs): EstaUsaRequisitosOutputs {
  const nac = String(i.nacionalidad || "espanol");
  const viajes = String(i.estadoViajesPrevios || "no") === "si";
  if (!VWP.includes(nac)) {
    return { tramite: "Visa B1/B2 regular", costoUsd: 185, observaciones: "Tu nacionalidad no está en VWP. Visa con entrevista consular." };
  }
  if (viajes) {
    return { tramite: "Visa B1/B2 regular", costoUsd: 185, observaciones: "Viajes a Cuba/Irán/Siria 2011+ descalifican ESTA. Necesitás visa regular." };
  }
  return { tramite: "ESTA online", costoUsd: 21, observaciones: "Vigencia 2 años. Ingreso hasta 90 días múltiples entradas." };
}
