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
  _insight?: any;
  _chart?: any;
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
  const recuperacionActual = maximo === minimo
    ? (actual >= maximo ? 100 : 0)
    : (minimo > 0 ? ((actual - minimo) / (maximo - minimo)) * 100 : 0);

  const formula = `Drawdown = ($${maximo.toLocaleString()} - $${minimo.toLocaleString()}) / $${maximo.toLocaleString()} = ${drawdownMaxPorc.toFixed(2)}%`;
  const explicacion = `Desde el máximo de $${maximo.toLocaleString()} hasta el mínimo de $${minimo.toLocaleString()}, el drawdown fue de ${drawdownMaxPorc.toFixed(2)}% ($${drawdownMaxMonto.toLocaleString()} de pérdida). Para recuperar ese drawdown se necesita una suba de ${recuperacionNecesaria.toFixed(2)}% desde el mínimo.${actual !== minimo ? ` Valor actual: $${actual.toLocaleString()} (${recuperado ? 'recuperado completo' : `recuperación ${recuperacionActual.toFixed(1)}%`}).` : ''} Regla clave: a mayor drawdown, exponencialmente más difícil recuperar (50% de caída requiere 100% de suba).`;

  const huboActual = actual !== minimo;
  const _insight = {
    title: recuperado ? 'Drawdown recuperado' : 'Drawdown máximo',
    text: recuperado
      ? `La caída máxima fue de **${drawdownMaxPorc.toFixed(2)}%** ($${drawdownMaxMonto.toLocaleString()}), pero ya **recuperaste el pico** de $${maximo.toLocaleString()}. El peor momento quedó atrás.`
      : `Desde el pico de $${maximo.toLocaleString()} la inversión cayó **${drawdownMaxPorc.toFixed(2)}%** ($${drawdownMaxMonto.toLocaleString()}). Para volver al máximo hace falta una suba de **+${recuperacionNecesaria.toFixed(2)}%**${huboActual ? ` desde el mínimo (vas ${recuperacionActual.toFixed(1)}% del camino)` : ''}. ${drawdownMaxPorc >= 30 ? 'Es un drawdown severo: la recuperación cuesta mucho más que la caída.' : drawdownMaxPorc >= 15 ? 'Drawdown moderado, pero el recovery ya pesa más que la caída.' : 'Drawdown contenido, dentro de lo esperable.'}`,
    tone: recuperado ? 'good' : drawdownMaxPorc >= 15 ? 'warn' : 'neutral',
    icon: recuperado ? '📈' : '📉',
  };
  const _chart = {
    type: 'scale',
    marker: Number(drawdownMaxPorc.toFixed(2)),
    markerLabel: `-${drawdownMaxPorc.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Leve', max: 10, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Moderado', max: 20, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Severo', max: 35, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Extremo', max: Math.max(100, Math.ceil(drawdownMaxPorc) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Drawdown máximo de ${drawdownMaxPorc.toFixed(1)}% sobre una escala de severidad de 0 a 100%.`,
  };
  return {
    drawdownMaxPorc: Number(drawdownMaxPorc.toFixed(2)),
    drawdownMaxMonto: Number(drawdownMaxMonto.toFixed(2)),
    recuperacionNecesaria: Number(recuperacionNecesaria.toFixed(2)),
    valorPerdido: Number(valorPerdido.toFixed(2)),
    recuperado,
    recuperacionActual: Number(recuperacionActual.toFixed(2)),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
