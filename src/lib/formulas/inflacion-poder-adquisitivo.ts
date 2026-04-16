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

  return {
    valorReal: Math.round(valorReal),
    perdidaPoder: Math.round(perdidaPoder),
    perdidaPorcentaje: Number(perdidaPorcentaje.toFixed(2)),
    montoNecesario: Math.round(montoNecesario),
    valorConAhorro: Math.round(valorConAhorro),
    formula,
    explicacion,
  };
}
