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
  _insight?: any;
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
  const entLabel = ent === "multiple" ? "múltiples entradas" : ent === "dos" ? "doble entrada" : "una sola entrada";
  const _insight = {
    title: "Tu visa de turismo a China",
    text: `La tasa consular para ${nac} con ${entLabel} ronda los **USD ${costo}**, y el trámite es **presencial** (huellas digitales): contá unos **${4} días hábiles** más el turno. Es de las visas más exigentes en papeles: necesitás itinerario, hoteles y vuelo ya reservados.`,
    tone: "warn" as const,
    icon: "🇨🇳",
  };
  return {
    costoTotalUsd: costo,
    tiempoTramiteDias: 4,
    documentos: "Pasaporte + formulario V.2013 + foto + itinerario + hoteles + vuelo + extractos + carta trabajo + huellas.",
    _insight,
  };
}
