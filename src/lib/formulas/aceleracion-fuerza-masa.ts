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
  _insight?: any;
}

export function aceleracionFuerzaMasa(i: Inputs): Outputs {
  const f = i.fuerza != null && i.fuerza !== 0 ? Number(i.fuerza) : null;
  const m = i.masa != null && i.masa !== 0 ? Number(i.masa) : null;
  const a = i.aceleracion != null && i.aceleracion !== 0 ? Number(i.aceleracion) : null;

  const filled = [f, m, a].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let fuerza: number, masa: number, aceleracion: number;
  let solved: 'fuerza' | 'masa' | 'aceleracion' | null = null;

  if (f === null && m !== null && a !== null) {
    fuerza = m * a;
    masa = m;
    aceleracion = a;
    solved = 'fuerza';
  } else if (m === null && f !== null && a !== null) {
    if (a === 0) throw new Error('La aceleración no puede ser 0 para calcular masa');
    fuerza = f;
    masa = f / a;
    aceleracion = a;
    solved = 'masa';
  } else if (a === null && f !== null && m !== null) {
    if (m === 0) throw new Error('La masa no puede ser 0');
    fuerza = f;
    masa = m;
    aceleracion = f / m;
    solved = 'aceleracion';
  } else {
    fuerza = f!;
    masa = m!;
    aceleracion = a!;
  }

  // g ≈ 9.81 m/s²: referencia tangible para contextualizar la aceleración.
  const enG = aceleracion / 9.81;
  let _insight;
  if (solved === 'fuerza') {
    _insight = {
      title: 'Fuerza necesaria',
      text: `Para acelerar **${masa.toFixed(2)} kg** a **${aceleracion.toFixed(2)} m/s²** hacen falta **${fuerza.toFixed(2)} N**. Eso equivale a empujar con ${enG.toFixed(2)} veces la gravedad terrestre.`,
      tone: 'neutral',
      icon: '🚀',
    };
  } else if (solved === 'masa') {
    _insight = {
      title: 'Masa del cuerpo',
      text: `Una fuerza de **${fuerza.toFixed(2)} N** que produce **${aceleracion.toFixed(2)} m/s²** implica una masa de **${masa.toFixed(2)} kg**. A mayor masa, menos acelera con la misma fuerza.`,
      tone: 'neutral',
      icon: '⚖️',
    };
  } else {
    _insight = {
      title: 'Aceleración resultante',
      text: `**${fuerza.toFixed(2)} N** sobre **${masa.toFixed(2)} kg** generan **${aceleracion.toFixed(2)} m/s²** (${enG.toFixed(2)}× la gravedad terrestre). Si la masa fuera el doble, la aceleración sería la mitad.`,
      tone: 'neutral',
      icon: '🏎️',
    };
  }

  return {
    resultado: `F = ${fuerza.toFixed(2)} N, m = ${masa.toFixed(2)} kg, a = ${aceleracion.toFixed(2)} m/s²`,
    fuerzaN: Number(fuerza.toFixed(4)),
    masaKg: Number(masa.toFixed(4)),
    aceleracionMs2: Number(aceleracion.toFixed(4)),
    _insight,
  };
}
