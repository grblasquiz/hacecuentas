/** Salario real ajustado por inflación */
export interface Inputs { sueldoAnterior: number; sueldoActual: number; inflacionPeriodo: number; }
export interface Outputs { salarioRealEquivalente: number; diferenciaReal: string; aumentoNominal: string; sueldoNecesario: number; _insight?: any; }

export function salarioRealInflacion(i: Inputs): Outputs {
  const anterior = Number(i.sueldoAnterior);
  const actual = Number(i.sueldoActual);
  const inflacion = Number(i.inflacionPeriodo);
  if (!anterior || anterior <= 0) throw new Error('Ingresá tu sueldo anterior');
  if (!actual || actual <= 0) throw new Error('Ingresá tu sueldo actual');
  if (inflacion < 0) throw new Error('La inflación no puede ser negativa');

  const sueldoNecesario = anterior * (1 + inflacion / 100);
  const dif = actual - sueldoNecesario;
  const difPct = ((actual / sueldoNecesario - 1) * 100).toFixed(1);
  const aumentoNom = (((actual - anterior) / anterior) * 100).toFixed(1);
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const _insight = dif >= 0
    ? {
        title: 'Le ganaste a la inflación',
        text: `Tu aumento nominal de **${aumentoNom}%** superó la inflación de **${inflacion}%**: ganaste **${difPct}% de poder adquisitivo** (+$${fmt.format(dif)}/mes en plata de hoy).`,
        tone: 'good',
        icon: '📈',
      }
    : {
        title: 'Perdiste contra la inflación',
        text: `Tu aumento de **${aumentoNom}%** quedó por debajo de la inflación de **${inflacion}%**: perdiste **${Math.abs(Number(difPct))}% de poder adquisitivo**. Para empatar necesitabas cobrar $${fmt.format(Math.round(sueldoNecesario))}.`,
        tone: 'warn',
        icon: '📉',
      };

  return {
    salarioRealEquivalente: Math.round(sueldoNecesario),
    diferenciaReal: dif >= 0
      ? `Ganaste ${difPct}% de poder adquisitivo (+$${fmt.format(dif)}/mes)`
      : `Perdiste ${Math.abs(Number(difPct))}% de poder adquisitivo (-$${fmt.format(Math.abs(dif))}/mes)`,
    aumentoNominal: `${aumentoNom}% (de $${fmt.format(anterior)} a $${fmt.format(actual)})`,
    sueldoNecesario: Math.round(sueldoNecesario),
    _insight,
  };
}
