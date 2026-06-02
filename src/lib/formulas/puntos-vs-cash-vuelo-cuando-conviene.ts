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
  _insight?: any;
  _chart?: any;
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

  const conviene = cpp >= 1.5;
  const insight = {
    title: conviene ? 'Conviene canjear puntos' : 'Mejor pagá en efectivo',
    text: conviene
      ? `Cada punto te rinde **${cpp.toFixed(2)}¢** al canjearlo, por encima del piso de 1,5¢ que vale la milla promedio: usar puntos te ahorra **US$${ahorro.toFixed(2)}** de tu bolsillo.`
      : `Cada punto rinde apenas **${cpp.toFixed(2)}¢** acá, debajo de 1,5¢: te conviene pagar los **US$${ahorro.toFixed(2)}** en efectivo y guardar los puntos para un canje de mayor valor.`,
    tone: conviene ? 'good' : 'warn',
    icon: '✈️',
  };

  const chart = {
    type: 'scale' as const,
    marker: Number(cpp.toFixed(2)),
    markerLabel: cpp.toFixed(2) + '¢/punto',
    min: 0,
    unit: '¢',
    segments: [
      { nombre: 'Pagá cash', max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Algo flojo', max: 1.5, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Buen canje', max: 2, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente', max: Math.max(3, Math.ceil(cpp) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de valor en centavos por punto, de conviene pagar en efectivo a excelente canje.',
  };

  return {
    centavosPorPunto: Number(cpp.toFixed(2)),
    decision,
    ahorroUsd: Number(ahorro.toFixed(2)),
    _insight: insight,
    _chart: chart
  };
}
