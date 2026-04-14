/** Actualización por IPC INDEC — cuánto valen hoy $X de fecha anterior */
export interface Inputs { montoOriginal: number; inflacionAcumulada: number; }
export interface Outputs { montoActualizado: number; incremento: number; factorActualizacion: number; perdidaPoderAdquisitivo: number; }

export function inflacionIpc(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const inflacion = Number(i.inflacionAcumulada);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (inflacion === undefined || inflacion < 0) throw new Error('Ingresá la inflación acumulada');
  const factor = 1 + inflacion / 100;
  const actualizado = monto * factor;
  const incremento = actualizado - monto;
  const perdida = (1 - 1 / factor) * 100;
  return {
    montoActualizado: Math.round(actualizado),
    incremento: Math.round(incremento),
    factorActualizacion: Number(factor.toFixed(2)),
    perdidaPoderAdquisitivo: Number(perdida.toFixed(2)),
  };
}
