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
  _insight?: any;
}
const SIN_VISA = ["argentino", "chileno", "mexicano", "brasileno", "uruguayo", "paraguayo"];
export function visaSchengenEuropaRequisitos(i: VisaSchengenEuropaRequisitosInputs): VisaSchengenEuropaRequisitosOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const dias = Number(i.diasEstadia);
  if (!dias || dias <= 0) throw new Error("Días inválidos");
  if (dias > 90) {
    return {
      requiereVisa: "Sí - estadía >90 días requiere visa larga duración",
      costoEstimadoEur: 180,
      documentacion: "Visa nacional del país destino. Consular.",
      _insight: {
        title: "Estadía larga en Schengen",
        text: `Tus **${dias} días** pasan el límite de **90 días cada 180** del espacio Schengen. Necesitás una **visa nacional de larga duración** del país destino (~EUR 180), con trámite consular y más requisitos.`,
        tone: "warn" as const,
        icon: "🇪🇺",
      },
    };
  }
  if (SIN_VISA.includes(nac)) {
    return {
      requiereVisa: "No - solo ETIAS desde 2026",
      costoEstimadoEur: 7,
      documentacion: "Pasaporte + ETIAS online + seguro recomendado.",
      _insight: {
        title: "Schengen sin visa para vos",
        text: `Con tu nacionalidad (${nac}) viajás a Europa **sin visa** por tus **${dias} días** (límite 90 cada 180). Desde 2026 solo necesitás la **ETIAS**, una autorización online de **EUR 7** que se aprueba en minutos.`,
        tone: "good" as const,
        icon: "🇪🇺",
      },
    };
  }
  return {
    requiereVisa: "Sí - visa Schengen turística",
    costoEstimadoEur: 90,
    documentacion: "Pasaporte + formulario + foto + reservas + seguro €30.000 + extractos bancarios.",
    _insight: {
      title: "Visa Schengen turística",
      text: `Con tu nacionalidad (${nac}) sí necesitás **visa Schengen** (~EUR 90) para tus **${dias} días**. Es un trámite consular exigente: reservas, extractos bancarios y seguro médico por **EUR 30.000**.`,
      tone: "warn" as const,
      icon: "🇪🇺",
    },
  };
}
