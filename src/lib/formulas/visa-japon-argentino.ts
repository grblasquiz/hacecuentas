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
  _insight?: any;
}
const SIN_VISA_JAPON = ["argentino", "chileno", "brasileno", "mexicano", "uruguayo"];
export function visaJaponArgentino(i: VisaJaponArgentinoInputs): VisaJaponArgentinoOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const dias = Number(i.diasEstadia);
  if (!dias || dias <= 0) throw new Error("Días inválidos");
  if (dias > 90) {
    return {
      requiereVisa: "Sí - >90 días requiere visa de estadía larga",
      costoUsd: 50,
      documentacion: "Visa nacional especial. Consular.",
      _insight: {
        title: "Estadía larga en Japón",
        text: `Tus **${dias} días** superan el límite turístico de **90 días**, así que sí necesitás visa: una **nacional de estadía larga** (~USD 50), tramitada en el consulado. Más papeles y plazos que el ingreso turístico común.`,
        tone: "warn" as const,
        icon: "🗾",
      },
    };
  }
  if (SIN_VISA_JAPON.includes(nac)) {
    return {
      requiereVisa: "No - acuerdo bilateral sin visa",
      costoUsd: 0,
      documentacion: "Pasaporte vigente + pasaje de vuelta + hotel + medios económicos.",
      _insight: {
        title: "Japón sin visa para vos",
        text: `Con tu nacionalidad (${nac}) entrás a Japón **sin visa y gratis** para tu estadía de **${dias} días** (acuerdo bilateral, hasta 90 días). Solo llevá pasaporte vigente, pasaje de vuelta y reserva de alojamiento.`,
        tone: "good" as const,
        icon: "🗾",
      },
    };
  }
  return {
    requiereVisa: "Sí - visa turista",
    costoUsd: 20,
    documentacion: "Pasaporte + form + foto + itinerario + hoteles + medios económicos + seguro.",
    _insight: {
      title: "Visa de turista para Japón",
      text: `Con tu nacionalidad (${nac}) sí necesitás **visa de turista** (~USD 20) para los **${dias} días**. Es un trámite consular: pasaporte, formulario, foto, itinerario y prueba de medios económicos.`,
      tone: "warn" as const,
      icon: "🗾",
    },
  };
}
