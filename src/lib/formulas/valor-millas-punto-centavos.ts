/**
 * Calculadora de Valor por Milla (CPM)
 */
export interface ValorMillasPuntoCentavosInputs {
  precioCash: number;
  millasCanje: number;
  tasasUsd: number;
}
export interface ValorMillasPuntoCentavosOutputs {
  cpm: number;
  evaluacion: string;
  ahorroEquivalente: number;
  _insight?: any;
  _chart?: any;
}
export function valorMillasPuntoCentavos(i: ValorMillasPuntoCentavosInputs): ValorMillasPuntoCentavosOutputs {
  const cash = Number(i.precioCash);
  const millas = Number(i.millasCanje);
  const tasas = Number(i.tasasUsd) || 0;
  if (!cash || cash <= 0) throw new Error("Cash inválido");
  if (!millas || millas <= 0) throw new Error("Millas inválidas");
  const cpm = (cash - tasas) / millas * 100;
  let eval_ = "Promedio";
  if (cpm < 1) eval_ = "Bajo - no canjear";
  else if (cpm < 1.5) eval_ = "Bajo-medio";
  else if (cpm < 2) eval_ = "Bueno";
  else if (cpm < 3) eval_ = "Excelente";
  else eval_ = "Top - canje premium";
  const cpmVal = Number(cpm.toFixed(2));
  const favorable = cpm >= 1.5;
  const insight = {
    title: 'Cuánto vale cada milla en este canje',
    text: `Cada milla rinde **${cpmVal.toFixed(2)}¢** de dólar (${eval_.toLowerCase()}). ${favorable ? `Estás usando bien tus millas: superan el umbral de ~1,5¢ donde el canje suele convenir frente a pagar cash.` : `Por debajo de ~1,5¢ casi siempre conviene pagar en efectivo y guardar las millas para un canje más jugoso.`}`,
    tone: cpm < 1.5 ? 'warn' : (cpm >= 2 ? 'good' : 'neutral'),
    icon: '✈️',
  };
  const chart = {
    type: 'scale' as const,
    marker: cpmVal,
    markerLabel: cpmVal.toFixed(2) + '¢/milla',
    min: 0,
    unit: '¢',
    segments: [
      { nombre: 'No canjear', max: 1, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Bajo-medio', max: 1.5, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Bueno', max: 2, color: '#fde68a', colorDark: '#92400e' },
      { nombre: 'Excelente', max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Premium', max: Math.max(4, Math.ceil(cpmVal) + 1), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala del valor por milla en centavos de dólar, desde no conviene canjear hasta canje premium',
  };
  return {
    cpm: cpmVal,
    evaluacion: eval_,
    ahorroEquivalente: Number((cash - tasas).toFixed(2)),
    _insight: insight,
    _chart: chart
  };
}
