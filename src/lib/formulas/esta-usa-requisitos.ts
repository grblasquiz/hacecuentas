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
  _insight?: any;
}
const VWP = ["espanol", "frances", "aleman", "italiano", "britanico", "japones", "coreano", "australiano", "chileno"];
export function estaUsaRequisitos(i: EstaUsaRequisitosInputs): EstaUsaRequisitosOutputs {
  const nac = String(i.nacionalidad || "espanol");
  const viajes = String(i.estadoViajesPrevios || "no") === "si";

  let base: Omit<EstaUsaRequisitosOutputs, "_insight">;
  let _insight: any;
  if (!VWP.includes(nac)) {
    base = { tramite: "Visa B1/B2 regular", costoUsd: 185, observaciones: "Tu nacionalidad no está en VWP. Visa con entrevista consular." };
    _insight = {
      title: "Necesitás visa, no ESTA",
      text: `Tu nacionalidad no integra el Programa de Exención de Visa (VWP), así que tramitás una **Visa B1/B2** con entrevista consular (**USD 185**, no reembolsable). Pedí turno con anticipación: las demoras pueden ser de meses.`,
      tone: "warn",
      icon: "🛂",
    };
  } else if (viajes) {
    base = { tramite: "Visa B1/B2 regular", costoUsd: 185, observaciones: "Viajes a Cuba/Irán/Siria 2011+ descalifican ESTA. Necesitás visa regular." };
    _insight = {
      title: "ESTA bloqueado por viajes previos",
      text: `Aunque tu país está en el VWP, haber viajado a Cuba/Irán/Siria desde 2011 te descalifica del ESTA: te corresponde la **Visa B1/B2** regular (**USD 185**) con entrevista consular.`,
      tone: "warn",
      icon: "🛂",
    };
  } else {
    base = { tramite: "ESTA online", costoUsd: 21, observaciones: "Vigencia 2 años. Ingreso hasta 90 días múltiples entradas." };
    _insight = {
      title: "Calificás para ESTA online",
      text: `Podés viajar con **ESTA** (solo **USD 21**, online, sin entrevista): vigencia **2 años** y estadías de hasta **90 días** con múltiples entradas. Tramitalo en la web oficial del CBP al menos 72 hs antes de volar.`,
      tone: "good",
      icon: "🛂",
    };
  }
  return { ...base, _insight };
}
