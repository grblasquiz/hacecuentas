/** Calculadora F = m·a — Segunda Ley de Newton */
export interface Inputs {
  fuerza?: number;
  masa?: number;
  aceleracion?: number;
}
export interface Outputs {
  resultado: string;
  fuerzaN: number;
  masaKg: number;
  aceleracionMs2: number;
}

export function aceleracionFuerzaMasa(i: Inputs): Outputs {
  const f = i.fuerza != null && i.fuerza !== 0 ? Number(i.fuerza) : null;
  const m = i.masa != null && i.masa !== 0 ? Number(i.masa) : null;
  const a = i.aceleracion != null && i.aceleracion !== 0 ? Number(i.aceleracion) : null;

  const filled = [f, m, a].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let fuerza: number, masa: number, aceleracion: number;

  if (f === null && m !== null && a !== null) {
    fuerza = m * a;
    masa = m;
    aceleracion = a;
  } else if (m === null && f !== null && a !== null) {
    if (a === 0) throw new Error('La aceleración no puede ser 0 para calcular masa');
    fuerza = f;
    masa = f / a;
    aceleracion = a;
  } else if (a === null && f !== null && m !== null) {
    if (m === 0) throw new Error('La masa no puede ser 0');
    fuerza = f;
    masa = m;
    aceleracion = f / m;
  } else {
    fuerza = f!;
    masa = m!;
    aceleracion = a!;
  }

  return {
    resultado: `F = ${fuerza.toFixed(2)} N, m = ${masa.toFixed(2)} kg, a = ${aceleracion.toFixed(2)} m/s²`,
    fuerzaN: Number(fuerza.toFixed(4)),
    masaKg: Number(masa.toFixed(4)),
    aceleracionMs2: Number(aceleracion.toFixed(4)),
  };
}
