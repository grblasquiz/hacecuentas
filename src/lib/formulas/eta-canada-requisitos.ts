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
  _insight?: any;
}
const CON_ETA = ["chileno", "mexicano", "uruguayo", "brasileno"];
const CON_VISA = ["argentino", "peruano", "colombiano"];
export function etaCanadaRequisitos(i: EtaCanadaRequisitosInputs): EtaCanadaRequisitosOutputs {
  const nac = String(i.nacionalidad || "argentino");
  const visaUsa = String(i.tieneVisaUsa || "no") === "si";
  const medio = String(i.medioTransporte || "avion");
  if (medio === "auto") {
    return { tramite: "Frontera terrestre - pasaporte y visa si aplica", costoUsd: 0, tiempoEstimado: "N/A",
      _insight: {
        title: 'Por tierra no se pide ETA',
        text: 'La **ETA solo es obligatoria si entrás a Canadá en avión**. Cruzando por frontera terrestre o por mar no la necesitás, pero sí el pasaporte y la visa si tu nacionalidad la requiere.',
        tone: 'neutral',
        icon: '🚗',
      } };
  }
  if (CON_ETA.includes(nac) || visaUsa) {
    return { tramite: "ETA online", costoUsd: 5, tiempoEstimado: "Minutos a 72 hs",
      _insight: {
        title: 'El trámite fácil',
        text: visaUsa && !CON_ETA.includes(nac)
          ? 'Tu **visa válida de EE.UU. te habilita la ETA online**: solo USD **5** y suele aprobarse en minutos. Hacela desde el sitio oficial de Canadá, nunca por intermediarios.'
          : 'Tu nacionalidad accede a la **ETA online**: solo USD **5** y suele aprobarse en minutos (hasta 72 hs). Tramitala únicamente en el sitio oficial del gobierno de Canadá.',
        tone: 'good',
        icon: '🇨🇦',
      } };
  }
  if (CON_VISA.includes(nac)) {
    return { tramite: "Visa turista canadiense", costoUsd: 74, tiempoEstimado: "2-4 semanas",
      _insight: {
        title: 'Necesitás visa, planificá con tiempo',
        text: 'Tu nacionalidad **requiere visa de turista** (USD **74**) y la espera es de **2-4 semanas**: arrancá el trámite con margen. Tip: una visa válida de EE.UU. te permitiría usar la ETA en su lugar.',
        tone: 'warn',
        icon: '📋',
      } };
  }
  return { tramite: "Consultar con consulado canadiense", costoUsd: 0, tiempoEstimado: "Variable",
    _insight: {
      title: 'Caso a confirmar',
      text: 'Tu combinación no entra en las reglas estándar: **confirmá los requisitos con el consulado canadiense** antes de comprar pasajes, porque el trámite y los plazos varían según el caso.',
      tone: 'neutral',
      icon: '🏛️',
    } };
}
