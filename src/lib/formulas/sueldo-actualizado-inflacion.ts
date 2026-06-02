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
  _insight?: any;
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

  const f = (n: number) => '$' + Math.round(n).toLocaleString();
  const insight = {
    title:
      perdidaReal > 0
        ? 'Tu sueldo le perdió a la inflación'
        : perdidaReal < 0
        ? 'Tu aumento le ganó a la inflación'
        : 'Empataste con la inflación',
    text:
      perdidaReal > 0
        ? `Para no perder poder adquisitivo, tu sueldo debería ser **${f(sueldoActualizado)}**, pero con el aumento del ${aumento}% quedó en **${f(sueldoConAumento)}**. Perdiste **${f(perdidaReal)}** por mes (**${perdidaPorcentaje.toFixed(1)}%**), **${Math.abs(diferenciaReal).toFixed(1)} puntos** por debajo de la inflación del ${inflacion}%.`
        : perdidaReal < 0
        ? `Tu aumento del ${aumento}% superó a la inflación del ${inflacion}%: tu sueldo de **${f(sueldoConAumento)}** está **${f(Math.abs(perdidaReal))}** por encima de lo que necesitabas para mantenerte (**${f(sueldoActualizado)}**). Ganaste **${Math.abs(diferenciaReal).toFixed(1)} puntos** de poder adquisitivo real.`
        : `Tu aumento del ${aumento}% empató exactamente con la inflación del ${inflacion}%: mantenés el poder adquisitivo, con un sueldo de **${f(sueldoConAumento)}**.`,
    tone: perdidaReal > 0 ? 'warn' : perdidaReal < 0 ? 'good' : 'neutral',
    icon: perdidaReal > 0 ? '📉' : perdidaReal < 0 ? '📈' : '⚖️',
  };

  return {
    sueldoActualizado: Math.round(sueldoActualizado),
    perdidaReal: Math.round(perdidaReal),
    perdidaPorcentaje: Number(perdidaPorcentaje.toFixed(2)),
    sueldoConAumento: Math.round(sueldoConAumento),
    diferenciaReal: Number(diferenciaReal.toFixed(2)),
    formula,
    explicacion,
    _insight: insight,
  };
}
