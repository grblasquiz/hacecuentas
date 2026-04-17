/**
 * Calculadora DOT USA - Compensación por retraso/overbooking
 */
export interface RetrasoVueloCompensacionUsaInputs {
  tipoProblema: string;
  horasRetrasoAlternativa: number;
  precioBoleto: number;
}
export interface RetrasoVueloCompensacionUsaOutputs {
  compensacionUsd: number;
  categoria: string;
  derechos: string;
}
export function retrasoVueloCompensacionUsa(i: RetrasoVueloCompensacionUsaInputs): RetrasoVueloCompensacionUsaOutputs {
  const tipo = String(i.tipoProblema || "overbooking");
  const hs = Number(i.horasRetrasoAlternativa);
  const precio = Number(i.precioBoleto);
  if (!precio || precio <= 0) throw new Error("Ingresá precio válido");
  if (tipo === "retraso") {
    return { compensacionUsd: 0, categoria: "Retraso - no compensable por DOT", derechos: "Hotel y comida varían por aerolínea." };
  }
  if (tipo === "cancelacion") {
    return { compensacionUsd: precio, categoria: "Reembolso automático obligatorio", derechos: "Reembolso en efectivo si rechazás rebooking." };
  }
  if (hs < 1) return { compensacionUsd: 0, categoria: "IDB <1 hs de demora", derechos: "Sin compensación." };
  let comp = 0;
  if (hs <= 2) comp = Math.min(2 * precio, 1075);
  else comp = Math.min(4 * precio, 1550);
  return { compensacionUsd: Number(comp.toFixed(2)), categoria: "IDB (Involuntary Denied Boarding)", derechos: "Reembolso + compensación + asistencia." };
}
