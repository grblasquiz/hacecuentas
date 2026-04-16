/** Dollar Cost Averaging (DCA) vs Lump Sum para cripto */

export interface Inputs {
  montoTotal: number;
  periodoMeses: number;
  precioInicial: number;
  precioFinal: number;
  variacionMensual: number;
}

export interface Outputs {
  resultadoDca: number;
  resultadoLumpSum: number;
  tokensDca: number;
  tokensLumpSum: number;
  precioPromedioDca: number;
  diferencia: number;
  mejorEstrategia: string;
  formula: string;
  explicacion: string;
}

export function dollarCostAveragingCripto(i: Inputs): Outputs {
  const montoTotal = Number(i.montoTotal);
  const meses = Math.max(1, Math.round(Number(i.periodoMeses)));
  const precioInicial = Number(i.precioInicial);
  const precioFinal = Number(i.precioFinal);
  const variacion = Number(i.variacionMensual) || 0;

  if (!montoTotal || montoTotal <= 0) throw new Error('Ingresá el monto total a invertir');
  if (!precioInicial || precioInicial <= 0) throw new Error('Ingresá el precio inicial del token');
  if (!precioFinal || precioFinal <= 0) throw new Error('Ingresá el precio final del token');

  // Lump Sum: comprar todo de una al precio inicial
  const tokensLumpSum = montoTotal / precioInicial;
  const resultadoLumpSum = tokensLumpSum * precioFinal;

  // DCA: inversión mensual uniforme
  const montoMensual = montoTotal / meses;
  let tokensDca = 0;

  // Simulamos la progresión de precios linealmente de precioInicial a precioFinal
  // con variación mensual adicional
  for (let m = 0; m < meses; m++) {
    const progreso = meses > 1 ? m / (meses - 1) : 0;
    const precioBase = precioInicial + (precioFinal - precioInicial) * progreso;
    // Aplicar variación mensual como perturbación sinusoidal
    const perturbacion = 1 + (variacion / 100) * Math.sin(m * Math.PI / 3);
    const precioMes = Math.max(0.01, precioBase * perturbacion);
    tokensDca += montoMensual / precioMes;
  }

  const resultadoDca = tokensDca * precioFinal;
  const precioPromedioDca = montoTotal / tokensDca;
  const diferencia = resultadoDca - resultadoLumpSum;
  const mejorEstrategia = diferencia > 0 ? 'DCA' : diferencia < 0 ? 'Lump Sum' : 'Igual';

  const formula = `DCA: $${montoTotal.toLocaleString()} / ${meses} meses = $${montoMensual.toFixed(2)}/mes → ${tokensDca.toFixed(4)} tokens`;
  const explicacion = `Con **Lump Sum** (todo de una a $${precioInicial}), comprás ${tokensLumpSum.toFixed(4)} tokens que al precio final valen $${Math.round(resultadoLumpSum).toLocaleString()}. Con **DCA** ($${montoMensual.toFixed(0)}/mes durante ${meses} meses), acumulás ${tokensDca.toFixed(4)} tokens (precio promedio $${precioPromedioDca.toFixed(2)}) que valen $${Math.round(resultadoDca).toLocaleString()}. ${mejorEstrategia === 'DCA' ? `DCA gana por $${Math.round(Math.abs(diferencia)).toLocaleString()}.` : mejorEstrategia === 'Lump Sum' ? `Lump Sum gana por $${Math.round(Math.abs(diferencia)).toLocaleString()}.` : 'Ambas estrategias dan igual.'}`;

  return {
    resultadoDca: Math.round(resultadoDca * 100) / 100,
    resultadoLumpSum: Math.round(resultadoLumpSum * 100) / 100,
    tokensDca: Number(tokensDca.toFixed(6)),
    tokensLumpSum: Number(tokensLumpSum.toFixed(6)),
    precioPromedioDca: Number(precioPromedioDca.toFixed(2)),
    diferencia: Math.round(diferencia * 100) / 100,
    mejorEstrategia,
    formula,
    explicacion,
  };
}
