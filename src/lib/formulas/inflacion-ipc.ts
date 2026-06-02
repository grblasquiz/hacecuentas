/** Actualización por IPC INDEC — cuánto valen hoy $X de fecha anterior */
export interface Inputs { montoOriginal: number; inflacionAcumulada: number; }
export interface Outputs { montoActualizado: number; incremento: number; factorActualizacion: number; perdidaPoderAdquisitivo: number; _insight?: any; _chart?: any; }

export function inflacionIpc(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const inflacion = Number(i.inflacionAcumulada);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (inflacion === undefined || inflacion < 0) throw new Error('Ingresá la inflación acumulada');
  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;

  const _insight = {
    title: 'Cuánto valen hoy esos pesos',
    text: `Para igualar el poder de compra de **$${Math.round(monto).toLocaleString('es')}**, hoy necesitás **$${Math.round(actualizado).toLocaleString('es')}** (×${factor.toFixed(2)}). Quien guardó la plata en el colchón perdió **${perdida.toFixed(1)}%** de poder adquisitivo.`,
    tone: perdida >= 30 ? 'warn' : perdida >= 10 ? 'neutral' : 'good',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Monto original', value: Math.round(monto) },
      { label: 'Ajuste por inflación', value: Math.round(incremento) },
    ],
    prefix: '$',
    centerValue: `$${Math.round(actualizado).toLocaleString('es')}`,
    centerLabel: 'Valor actualizado',
    ariaLabel: `El monto original más el ajuste por inflación suman $${Math.round(actualizado).toLocaleString('es')}`,
  };

  return {
    montoActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    factorActualizacion: Number(factor.toFixed(2)),
    perdidaPoderAdquisitivo: Number(perdida.toFixed(2)),
    _insight,
    _chart,
  };
}
