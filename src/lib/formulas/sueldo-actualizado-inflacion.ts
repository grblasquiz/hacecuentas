/** Sueldo actualizado por IPC — cuánto debería ser tu sueldo hoy */

export interface Inputs {
  sueldoOriginal: number;
  inflacionAcumulada: number;
  aumentoRecibido: number;
}

export interface Outputs {
  sueldoActualizado: number;
  perdidaReal: number;
  perdidaPorcentaje: number;
  sueldoConAumento: number;
  diferenciaReal: number;
  formula: string;
  explicacion: string;
}

export function sueldoActualizadoInflacion(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoOriginal);
  const inflacion = Number(i.inflacionAcumulada);
  const aumento = Number(i.aumentoRecibido) || 0;

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá tu sueldo original');
  if (inflacion === undefined) throw new Error('Ingresá la inflación acumulada del período');

  const sueldoActualizado = sueldo * (1 + inflacion / 100);
  const sueldoConAumento = sueldo * (1 + aumento / 100);
  const perdidaReal = sueldoActualizado - sueldoConAumento;
  const perdidaPorcentaje = (perdidaReal / sueldoActualizado) * 100;
  const diferenciaReal = aumento - inflacion;

  const formula = `Sueldo actualizado = $${sueldo.toLocaleString()} × (1 + ${inflacion}%) = $${Math.round(sueldoActualizado).toLocaleString()}`;
  const explicacion = `Tu sueldo de $${sueldo.toLocaleString()} debería ser $${Math.round(sueldoActualizado).toLocaleString()} para mantener el poder adquisitivo (inflación ${inflacion}%).${aumento > 0 ? ` Con el aumento del ${aumento}%, tu sueldo es $${Math.round(sueldoConAumento).toLocaleString()}.` : ''} ${perdidaReal > 0 ? `Perdiste $${Math.round(perdidaReal).toLocaleString()} de poder adquisitivo (${perdidaPorcentaje.toFixed(1)}%). Tu sueldo real bajó ${Math.abs(diferenciaReal).toFixed(1)} puntos por debajo de la inflación.` : perdidaReal < 0 ? `Ganaste $${Math.round(Math.abs(perdidaReal)).toLocaleString()} de poder adquisitivo real. Tu aumento superó la inflación por ${Math.abs(diferenciaReal).toFixed(1)} puntos.` : 'Tu aumento empató exactamente con la inflación.'}`;

  return {
    sueldoActualizado: Math.round(sueldoActualizado),
    perdidaReal: Math.round(perdidaReal),
    perdidaPorcentaje: Number(perdidaPorcentaje.toFixed(2)),
    sueldoConAumento: Math.round(sueldoConAumento),
    diferenciaReal: Number(diferenciaReal.toFixed(2)),
    formula,
    explicacion,
  };
}
