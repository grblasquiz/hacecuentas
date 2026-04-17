/**
 * Calculadora Visa Schengen
 */
export interface VisaSchengenEuropaRequisitosInputs {
  nacionalidad: string;
  diasEstadia: number;
  motivo: string;
}
export interface VisaSchengenEuropaRequisitosOutputs {
  requiereVisa: string;
  costoEstimadoEur: number;
  documentacion: string;
}
const SIN_VISA = ["argentino", "chileno", "mexicano", "brasileno", "uruguayo", "paraguayo"];
export function visaSchengenEuropaRequisitos(i: VisaSchengenEuropaRequisitosInputs): VisaSchengenEuropaRequisitosOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const dias = Number(i.diasEstadia);
  if (!dias || dias <= 0) throw new Error("Días inválidos");
  if (dias > 90) {
    return { requiereVisa: "Sí - estadía >90 días requiere visa larga duración", costoEstimadoEur: 180, documentacion: "Visa nacional del país destino. Consular." };
  }
  if (SIN_VISA.includes(nac)) {
    return { requiereVisa: "No - solo ETIAS desde 2026", costoEstimadoEur: 7, documentacion: "Pasaporte + ETIAS online + seguro recomendado." };
  }
  return { requiereVisa: "Sí - visa Schengen turística", costoEstimadoEur: 90, documentacion: "Pasaporte + formulario + foto + reservas + seguro €30.000 + extractos bancarios." };
}
