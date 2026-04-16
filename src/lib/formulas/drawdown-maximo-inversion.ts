/** Drawdown máximo — máxima caída desde el pico de una inversión */

export interface Inputs {
  valorMaximo: number;
  valorMinimo: number;
  valorActual: number;
  inversionInicial: number;
}

export interface Outputs {
  drawdownMaxPorc: number;
  drawdownMaxMonto: number;
  recuperacionNecesaria: number;
  valorPerdido: number;
  recuperado: boolean;
  recuperacionActual: number;
  formula: string;
  explicacion: string;
}

export function drawdownMaximoInversion(i: Inputs): Outputs {
  const maximo = Number(i.valorMaximo);
  const minimo = Number(i.valorMinimo);
  const actual = Number(i.valorActual) || minimo;
  const inversion = Number(i.inversionInicial) || maximo;

  if (!maximo || maximo <= 0) throw new Error('Ingresá el valor máximo alcanzado');
  if (!minimo || minimo <= 0) throw new Error('Ingresá el valor mínimo alcanzado');
  if (minimo > maximo) throw new Error('El valor mínimo no puede ser mayor al máximo');

  // Drawdown = (Máximo - Mínimo) / Máximo
  const drawdownMaxPorc = ((maximo - minimo) / maximo) * 100;
  const drawdownMaxMonto = maximo - minimo;

  // Para recuperar un drawdown de X%, necesitás subir X/(1-X) %
  // Ej: -50% necesita +100%
  const recuperacionNecesaria = (maximo / minimo - 1) * 100;

  const valorPerdido = maximo - minimo;
  const recuperado = actual >= maximo;
  const recuperacionActual = minimo > 0 ? ((actual - minimo) / (maximo - minimo)) * 100 : 0;

  const formula = `Drawdown = ($${maximo.toLocaleString()} - $${minimo.toLocaleString()}) / $${maximo.toLocaleString()} = ${drawdownMaxPorc.toFixed(2)}%`;
  const explicacion = `Desde el máximo de $${maximo.toLocaleString()} hasta el mínimo de $${minimo.toLocaleString()}, el drawdown fue de ${drawdownMaxPorc.toFixed(2)}% ($${drawdownMaxMonto.toLocaleString()} de pérdida). Para recuperar ese drawdown se necesita una suba de ${recuperacionNecesaria.toFixed(2)}% desde el mínimo.${actual !== minimo ? ` Valor actual: $${actual.toLocaleString()} (${recuperado ? 'recuperado completo' : `recuperación ${recuperacionActual.toFixed(1)}%`}).` : ''} Regla clave: a mayor drawdown, exponencialmente más difícil recuperar (50% de caída requiere 100% de suba).`;

  return {
    drawdownMaxPorc: Number(drawdownMaxPorc.toFixed(2)),
    drawdownMaxMonto: Number(drawdownMaxMonto.toFixed(2)),
    recuperacionNecesaria: Number(recuperacionNecesaria.toFixed(2)),
    valorPerdido: Number(valorPerdido.toFixed(2)),
    recuperado,
    recuperacionActual: Number(recuperacionActual.toFixed(2)),
    formula,
    explicacion,
  };
}
