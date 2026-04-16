/** Calculadora Ley de Ohm — V = I × R */
export interface Inputs { voltaje?: number; corriente?: number; resistencia?: number; }
export interface Outputs { resultado: string; potencia: number; voltajeV: number; corrienteA: number; resistenciaOhm: number; }

export function leyOhmVoltajeResistencia(i: Inputs): Outputs {
  const v = i.voltaje != null && i.voltaje !== 0 ? Number(i.voltaje) : null;
  const iA = i.corriente != null && i.corriente !== 0 ? Number(i.corriente) : null;
  const r = i.resistencia != null && i.resistencia !== 0 ? Number(i.resistencia) : null;
  const filled = [v, iA, r].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let voltaje: number, corriente: number, resistencia: number;
  if (v === null) { corriente = iA!; resistencia = r!; voltaje = corriente * resistencia; }
  else if (iA === null) { voltaje = v; resistencia = r!; if (resistencia === 0) throw new Error('La resistencia no puede ser 0'); corriente = voltaje / resistencia; }
  else if (r === null) { voltaje = v; corriente = iA; if (corriente === 0) throw new Error('La corriente no puede ser 0'); resistencia = voltaje / corriente; }
  else { voltaje = v; corriente = iA; resistencia = r; }

  const potencia = voltaje * corriente;

  return {
    resultado: `V = ${voltaje.toFixed(2)} V, I = ${corriente.toFixed(4)} A, R = ${resistencia.toFixed(2)} Ω, P = ${potencia.toFixed(2)} W`,
    potencia: Number(potencia.toFixed(4)),
    voltajeV: Number(voltaje.toFixed(4)),
    corrienteA: Number(corriente.toFixed(6)),
    resistenciaOhm: Number(resistencia.toFixed(4)),
  };
}
