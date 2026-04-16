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

  return {
    sharpeRatio: Number(sharpeRatio.toFixed(4)),
    rendimientoExceso: Number(rendimientoExceso.toFixed(2)),
    clasificacion,
    formula,
    explicacion,
  };
}
