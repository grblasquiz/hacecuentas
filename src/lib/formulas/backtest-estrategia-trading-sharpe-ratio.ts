export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function backtestEstrategiaTradingSharpeRatio(i: Inputs): Outputs {
  const r=Number(i.retornoAnual)||0; const v=Number(i.volatilidad)||1; const rf=Number(i.tasaLibreRiesgo)||0;
  const sharpe=(r-rf)/v;
  let interp='';
  if(sharpe>2) interp='Excelente (>2)';
  else if(sharpe>1) interp='Bueno (1-2)';
  else if(sharpe>0) interp='Aceptable (0-1)';
  else interp='Pobre (negativo)';

  const tone = sharpe > 1 ? 'good' : sharpe > 0 ? 'neutral' : 'warn';
  const insightText = sharpe > 2
    ? `Un Sharpe de **${sharpe.toFixed(2)}** es excelente: la estrategia rinde muy por encima de la tasa libre de riesgo por cada unidad de volatilidad. Validá que el backtest no tenga sobreajuste.`
    : sharpe > 1
      ? `Sharpe de **${sharpe.toFixed(2)}**: buena relación retorno/riesgo, la estrategia compensa la volatilidad asumida.`
      : sharpe > 0
        ? `Sharpe de **${sharpe.toFixed(2)}**: aceptable pero modesto. Apenas superás el activo libre de riesgo ajustado por volatilidad.`
        : `Sharpe **negativo (${sharpe.toFixed(2)})**: la estrategia rinde por debajo de la tasa libre de riesgo. No compensa el riesgo asumido.`;

  return {
    sharpeRatio:sharpe.toFixed(2),
    interpretacion:`Sharpe ${sharpe.toFixed(2)}: ${interp}`,
    _insight: {
      title: 'Tu Sharpe Ratio',
      text: insightText,
      tone,
      icon: '📈',
    },
    _chart: {
      type: 'scale',
      marker: Math.round(sharpe * 100) / 100,
      markerLabel: `Sharpe ${sharpe.toFixed(2)}`,
      min: Math.min(-1, Math.floor(sharpe)),
      segments: [
        { nombre: 'Pobre', max: 0, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Aceptable', max: 1, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Bueno', max: 2, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Excelente', max: Math.max(3, Math.ceil(sharpe) + 1), color: '#0891b2', colorDark: '#22d3ee' },
      ],
      ariaLabel: `Sharpe Ratio de ${sharpe.toFixed(2)} sobre una escala de calidad de pobre a excelente`,
    },
  };
}
