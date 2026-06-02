/**
 * Calculadora Visa USA
 */
export interface VisaUsaCostoTiempoPasaporteInputs {
  paisTramite: string;
  tipoVisa: string;
  mesesPasaporte: number;
}
export interface VisaUsaCostoTiempoPasaporteOutputs {
  costoTotalUsd: number;
  tiempoEstimadoSemanas: number;
  pasaporteOk: string;
  _insight?: any;
}
const MRV: Record<string, number> = { b1b2: 185, f1: 185, h1b: 205 };
const TIEMPO: Record<string, number> = {
  argentina: 10, mexico: 3, colombia: 8, peru: 10, chile: 5, brasil: 12, otro: 8
};
export function visaUsaCostoTiempoPasaporte(i: VisaUsaCostoTiempoPasaporteInputs): VisaUsaCostoTiempoPasaporteOutputs {
  const pais = String(i.paisTramite || "argentina");
  const tipo = String(i.tipoVisa || "b1b2");
  const meses = Number(i.mesesPasaporte);
  if (isNaN(meses) || meses < 0) throw new Error("Meses de pasaporte inválidos");
  const costo = MRV[tipo] || 185;
  const tiempo = TIEMPO[pais] || 8;
  const ok = meses >= 6 ? "Sí - vigencia suficiente" : "No - renová pasaporte primero (mínimo 6 meses)";
  const pasaporteValido = meses >= 6;
  const _insight = {
    title: pasaporteValido ? 'Estás en condiciones de tramitar' : 'Frená: el pasaporte no alcanza',
    text: pasaporteValido
      ? `Con **${meses} meses** de vigencia tu pasaporte cumple el mínimo de 6 meses. La tasa es de **USD ${costo}** y la espera de cita ronda las **${tiempo} semanas**; arrancá ya porque ese tiempo varía mucho por consulado.`
      : `Tu pasaporte vence en **${meses} meses** y el mínimo exigido son **6**. Renovalo primero: pagar la tasa de **USD ${costo}** y esperar ~**${tiempo} semanas** de cita sin pasaporte válido es plata y tiempo tirados.`,
    tone: pasaporteValido ? 'good' as const : 'warn' as const,
    icon: pasaporteValido ? '🛂' : '⚠️',
  };
  return { costoTotalUsd: costo, tiempoEstimadoSemanas: tiempo, pasaporteOk: ok, _insight };
}
