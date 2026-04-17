/**
 * Calculadora Puntos vs Cash: cuando conviene canjear
 */
export interface PuntosVsCashVueloCuandoConvieneInputs {
  precioCashUsd: number;
  puntosRequeridos: number;
  impuestosCanje: number;
}
export interface PuntosVsCashVueloCuandoConvieneOutputs {
  centavosPorPunto: number;
  decision: string;
  ahorroUsd: number;
}
export function puntosVsCashVueloCuandoConviene(i: PuntosVsCashVueloCuandoConvieneInputs): PuntosVsCashVueloCuandoConvieneOutputs {
  const cash = Number(i.precioCashUsd);
  const pts = Number(i.puntosRequeridos);
  const tax = Number(i.impuestosCanje) || 0;
  if (!cash || cash <= 0) throw new Error("Precio inválido");
  if (!pts || pts <= 0) throw new Error("Puntos inválidos");
  const cpp = (cash - tax) / pts * 100;
  let decision = "Neutro";
  if (cpp < 1) decision = "Pagá cash y acumulá puntos.";
  else if (cpp < 1.5) decision = "Ligeramente favor cash.";
  else if (cpp < 2) decision = "Canjeá puntos: buen valor.";
  else decision = "Excelente canje: usá puntos.";
  const ahorro = cash - tax;
  return {
    centavosPorPunto: Number(cpp.toFixed(2)),
    decision,
    ahorroUsd: Number(ahorro.toFixed(2))
  };
}
