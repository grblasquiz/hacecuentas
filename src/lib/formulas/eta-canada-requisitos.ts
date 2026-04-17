/**
 * Calculadora ETA Canadá
 */
export interface EtaCanadaRequisitosInputs {
  nacionalidad: string;
  tieneVisaUsa: string;
  medioTransporte: string;
}
export interface EtaCanadaRequisitosOutputs {
  tramite: string;
  costoUsd: number;
  tiempoEstimado: string;
}
const CON_ETA = ["chileno", "mexicano", "uruguayo", "brasileno"];
const CON_VISA = ["argentino", "peruano", "colombiano"];
export function etaCanadaRequisitos(i: EtaCanadaRequisitosInputs): EtaCanadaRequisitosOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const visaUsa = String(i.tieneVisaUsa || "no") === "si";
  const medio = String(i.medioTransporte || "avion");
  if (medio === "auto") {
    return { tramite: "Frontera terrestre - pasaporte y visa si aplica", costoUsd: 0, tiempoEstimado: "N/A" };
  }
  if (CON_ETA.includes(nac) || visaUsa) {
    return { tramite: "ETA online", costoUsd: 5, tiempoEstimado: "Minutos a 72 hs" };
  }
  if (CON_VISA.includes(nac)) {
    return { tramite: "Visa turista canadiense", costoUsd: 74, tiempoEstimado: "2-4 semanas" };
  }
  return { tramite: "Consultar con consulado canadiense", costoUsd: 0, tiempoEstimado: "Variable" };
}
