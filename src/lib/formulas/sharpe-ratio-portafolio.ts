/** Sharpe Ratio — rendimiento ajustado por riesgo de un portafolio */

export interface Inputs {
  rendimientoPortafolio: number;
  tasaLibreRiesgo: number;
  desvioEstandarPortafolio: number;
}

export interface Outputs {
  sharpeRatio: number;
  rendimientoExceso: number;
  clasificacion: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function sharpeRatioPortafolio(i: Inputs): Outputs {
  const rendimiento = Number(i.rendimientoPortafolio);
  const rf = Number(i.tasaLibreRiesgo);
  const desvio = Number(i.desvioEstandarPortafolio);

  if (rendimiento === undefined) throw new Error('Ingresá el rendimiento del portafolio');
  if (rf === undefined) throw new Error('Ingresá la tasa libre de riesgo');
  if (!desvio || desvio <= 0) throw new Error('Ingresá el desvío estándar del portafolio');

  const rendimientoExceso = rendimiento - rf;
  const sharpeRatio = rendimientoExceso / desvio;

  let clasificacion: string;
  if (sharpeRatio < 0) clasificacion = 'Negativo — rendimiento menor a la tasa libre de riesgo';
  else if (sharpeRatio < 0.5) clasificacion = 'Bajo — pobre rendimiento ajustado por riesgo';
  else if (sharpeRatio < 1) clasificacion = 'Aceptable — rendimiento razonable por el riesgo tomado';
  else if (sharpeRatio < 2) clasificacion = 'Bueno — buen rendimiento ajustado por riesgo';
  else if (sharpeRatio < 3) clasificacion = 'Muy bueno — excelente relación riesgo/retorno';
  else clasificacion = 'Excepcional — verificar que no haya errores en los datos';

  const formula = `Sharpe = (${rendimiento}% - ${rf}%) / ${desvio}% = ${sharpeRatio.toFixed(4)}`;
  const explicacion = `Rendimiento del portafolio: ${rendimiento}%. Tasa libre de riesgo: ${rf}%. Rendimiento en exceso: ${rendimientoExceso.toFixed(2)}%. Volatilidad (σ): ${desvio}%. Sharpe Ratio: ${sharpeRatio.toFixed(4)}. ${clasificacion}. Por cada 1% de riesgo asumido, el portafolio genera ${sharpeRatio.toFixed(2)}% de exceso de retorno.`;

  const tone: 'good' | 'warn' | 'neutral' = sharpeRatio < 0.5 ? 'warn' : sharpeRatio >= 1 ? 'good' : 'neutral';
  const _insight = {
    title: 'Tu retorno ajustado por riesgo',
    text: `Con un Sharpe de **${sharpeRatio.toFixed(2)}**, el portafolio paga **${sharpeRatio.toFixed(2)}%** de exceso de retorno por cada 1% de volatilidad asumida. Veredicto: ${clasificacion.toLowerCase()}.`,
    tone,
    icon: '📊',
  };

  const minScale = -1;
  const markerClamped = Math.max(minScale, sharpeRatio);
  const lastMax = Math.max(3, Math.ceil(sharpeRatio) + 0.5);
  const _chart = {
    type: 'scale',
    marker: Number(markerClamped.toFixed(2)),
    markerLabel: sharpeRatio.toFixed(2),
    min: minScale,
    segments: [
      { nombre: 'Negativo', max: 0, color: '#fca5a5', colorDark: '#7f1d1d' },
      { nombre: 'Bajo', max: 0.5, color: '#fdba74', colorDark: '#7c2d12' },
      { nombre: 'Aceptable', max: 1, color: '#fde047', colorDark: '#713f12' },
      { nombre: 'Bueno', max: 2, color: '#86efac', colorDark: '#14532d' },
      { nombre: 'Excepcional', max: lastMax, color: '#4ade80', colorDark: '#166534' },
    ],
    ariaLabel: `Sharpe Ratio de ${sharpeRatio.toFixed(2)}, clasificado como ${clasificacion}`,
  };

  return {
    sharpeRatio: Number(sharpeRatio.toFixed(4)),
    rendimientoExceso: Number(rendimientoExceso.toFixed(2)),
    clasificacion,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
