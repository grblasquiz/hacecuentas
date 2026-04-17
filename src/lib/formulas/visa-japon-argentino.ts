/**
 * Calculadora Visa Japón
 */
export interface VisaJaponArgentinoInputs {
  nacionalidad: string;
  diasEstadia: number;
  motivo: string;
}
export interface VisaJaponArgentinoOutputs {
  requiereVisa: string;
  costoUsd: number;
  documentacion: string;
}
const SIN_VISA_JAPON = ["argentino", "chileno", "brasileno", "mexicano", "uruguayo"];
export function visaJaponArgentino(i: VisaJaponArgentinoInputs): VisaJaponArgentinoOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const dias = Number(i.diasEstadia);
  if (!dias || dias <= 0) throw new Error("Días inválidos");
  if (dias > 90) {
    return { requiereVisa: "Sí - >90 días requiere visa de estadía larga", costoUsd: 50, documentacion: "Visa nacional especial. Consular." };
  }
  if (SIN_VISA_JAPON.includes(nac)) {
    return { requiereVisa: "No - acuerdo bilateral sin visa", costoUsd: 0, documentacion: "Pasaporte vigente + pasaje de vuelta + hotel + medios económicos." };
  }
  return { requiereVisa: "Sí - visa turista", costoUsd: 20, documentacion: "Pasaporte + form + foto + itinerario + hoteles + medios económicos + seguro." };
}
