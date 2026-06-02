/** Cuánto perdiste de poder adquisitivo por inflación */

export interface Inputs {
  montoOriginal: number;
  inflacionAnual: number;
  periodoAnios: number;
  tasaAhorro: number;
}

export interface Outputs {
  valorReal: number;
  perdidaPoder: number;
  perdidaPorcentaje: number;
  montoNecesario: number;
  valorConAhorro: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function inflacionPoderAdquisitivo(i: Inputs): Outputs {
  const monto = Number(i.montoOriginal);
  const inflacion = Number(i.inflacionAnual);
  const anios = Number(i.periodoAnios);
  const tasaAhorro = Number(i.tasaAhorro) || 0;

  if (!monto || monto <= 0) throw new Error('Ingresá el monto original');
  if (inflacion === undefined) throw new Error('Ingresá la inflación anual');
  if (!anios || anios <= 0) throw new Error('Ingresá el período en años');

  // Valor real = monto / (1 + inflación)^años
  const factorInflacion = Math.pow(1 + inflacion / 100, anios);
  const valorReal = monto / factorInflacion;
  const perdidaPoder = monto - valorReal;
  const perdidaPorcentaje = (perdidaPoder / monto) * 100;

  // Monto necesario para mantener el mismo poder adquisitivo
  const montoNecesario = monto * factorInflacion;

  // Si ahorraste a cierta tasa, cuánto tendrías
  const factorAhorro = Math.pow(1 + tasaAhorro / 100, anios);
  const valorConAhorro = monto * factorAhorro / factorInflacion;

  const formula = `Poder adquisitivo = $${monto.toLocaleString()} / (1 + ${inflacion}%)^${anios} = $${Math.round(valorReal).toLocaleString()}`;
  const explicacion = `$${monto.toLocaleString()} de hace ${anios} año(s) hoy equivalen a $${Math.round(valorReal).toLocaleString()} en poder de compra. Perdiste $${Math.round(perdidaPoder).toLocaleString()} (${perdidaPorcentaje.toFixed(1)}%) de poder adquisitivo. Para comprar lo mismo que antes, hoy necesitarías $${Math.round(montoNecesario).toLocaleString()}.${tasaAhorro > 0 ? ` Si hubieras ahorrado al ${tasaAhorro}% anual, tu poder adquisitivo real sería $${Math.round(valorConAhorro).toLocaleString()} ${valorConAhorro > monto ? '(ganaste poder de compra)' : '(aún perdiste poder de compra)'}.` : ''}`;

  const _insight = {
    title: 'Lo que la inflación se comió',
    text: `Tus **$${monto.toLocaleString('es')}** de hace ${anios} año${anios > 1 ? 's' : ''} hoy compran como **$${Math.round(valorReal).toLocaleString('es')}**: perdiste **${perdidaPorcentaje.toFixed(1)}%** de poder adquisitivo (**$${Math.round(perdidaPoder).toLocaleString('es')}**).${tasaAhorro > 0 ? ` Ahorrando al ${tasaAhorro}% anual tu valor real sería $${Math.round(valorConAhorro).toLocaleString('es')}, así que ${valorConAhorro > monto ? '**le ganaste** a la inflación' : '**aún perdiste** contra la inflación'}.` : ''}`,
    tone: tasaAhorro > 0 && valorConAhorro >= monto ? 'good' : perdidaPorcentaje >= 30 ? 'warn' : 'neutral',
    icon: '💸',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Poder de compra que conservás', value: Math.round(valorReal) },
      { label: 'Poder perdido por inflación', value: Math.round(perdidaPoder) },
    ],
    prefix: '$',
    centerValue: `$${monto.toLocaleString('es')}`,
    centerLabel: 'Monto original',
    ariaLabel: `De $${monto.toLocaleString('es')} originales conservás $${Math.round(valorReal).toLocaleString('es')} de poder de compra y perdiste $${Math.round(perdidaPoder).toLocaleString('es')}`,
  };

  return {
    valorReal: Math.round(valorReal),
    perdidaPoder: Math.round(perdidaPoder),
    perdidaPorcentaje: Number(perdidaPorcentaje.toFixed(2)),
    montoNecesario: Math.round(montoNecesario),
    valorConAhorro: Math.round(valorConAhorro),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
