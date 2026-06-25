/**
 * Calculadora de horas
 * Suma/resta de tiempos (horas y minutos) y horas entre dos horarios.
 * Trabaja en minutos internamente sobre base sexagesimal (1 h = 60 min).
 */

export interface HorasInputs {
  modo: string;
  tiempoA: string;
  tiempoB: string;
  descanso?: string | number;
  __lang?: string;
}

export interface HorasOutputs {
  resultado: string;
  decimal: number;
  minutos: number;
  resumen: string;
  _insight?: any;
}

/**
 * Convierte un string de tiempo a minutos.
 * - Con ":" → HH:MM o HH:MM:SS → h*60 + m + s/60.
 * - Sin ":" → se interpreta como horas decimales (ej "8.5") → n*60.
 */
function parseTiempo(str: string): number {
  const raw = String(str == null ? '' : str).trim().replace(',', '.');
  if (raw === '') throw new Error('Revisá el formato de los tiempos (usá HH:MM)');

  if (raw.includes(':')) {
    const parts = raw.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = parts.length > 2 ? Number(parts[2]) : 0;
    if (isNaN(h) || isNaN(m) || isNaN(s)) {
      throw new Error('Revisá el formato de los tiempos (usá HH:MM)');
    }
    return h * 60 + m + s / 60;
  }

  const n = Number(raw);
  if (isNaN(n)) throw new Error('Revisá el formato de los tiempos (usá HH:MM)');
  return n * 60;
}

/** Formatea minutos a "HH:MM" admitiendo más de 24 h y valores negativos. */
function formatHHMM(totalMin: number): string {
  const sign = totalMin < 0 ? '−' : '';
  const abs = Math.abs(totalMin);
  const h = Math.floor(abs / 60);
  const m = Math.round(abs - h * 60);
  // Math.round del residuo puede empujar los minutos a 60.
  const hh = m === 60 ? h + 1 : h;
  const mm = m === 60 ? 0 : m;
  return sign + String(hh) + ':' + String(mm).padStart(2, '0');
}

export function calculadoraDeHoras(inputs: HorasInputs): HorasOutputs {
  const modo = inputs.modo || 'sumar';
  const descanso = Number(inputs.descanso) || 0;

  const minA = parseTiempo(inputs.tiempoA);
  const minB = parseTiempo(inputs.tiempoB);

  let totalMin: number;
  let resumen: string;

  if (modo === 'restar') {
    totalMin = minA - minB - descanso;
    const signo = totalMin < 0 ? ' (resultado negativo: B es mayor que A)' : '';
    resumen =
      'Resta de tiempos: ' +
      formatHHMM(minA) +
      ' − ' +
      formatHHMM(minB) +
      (descanso ? ' − ' + descanso + ' min de descanso' : '') +
      ' = ' +
      formatHHMM(totalMin) +
      signo +
      '.';
  } else if (modo === 'entre') {
    let diff = minB - minA;
    let cruza = false;
    if (diff < 0) {
      diff += 1440; // cruza la medianoche
      cruza = true;
    }
    totalMin = diff - descanso;
    resumen =
      'Tiempo entre las ' +
      formatHHMM(minA) +
      ' y las ' +
      formatHHMM(minB) +
      (cruza ? ' (cruza la medianoche, +24 h)' : '') +
      (descanso ? ' descontando ' + descanso + ' min de descanso' : '') +
      ' = ' +
      formatHHMM(totalMin) +
      '.';
  } else {
    // sumar
    totalMin = minA + minB - descanso;
    resumen =
      'Suma de tiempos: ' +
      formatHHMM(minA) +
      ' + ' +
      formatHHMM(minB) +
      (descanso ? ' − ' + descanso + ' min de descanso' : '') +
      ' = ' +
      formatHHMM(totalMin) +
      '.';
  }

  const decimal = Number((totalMin / 60).toFixed(2));
  const minutos = Math.round(totalMin);
  const resultado = formatHHMM(totalMin);

  const horasEnt = Math.floor(Math.abs(totalMin) / 60);
  const minEnt = Math.round(Math.abs(totalMin) - horasEnt * 60);

  return {
    resultado,
    decimal,
    minutos,
    resumen,
    _insight: {
      title: 'Por qué no se suman como decimales',
      text:
        'El tiempo usa base **sexagesimal** (60 minutos = 1 hora), no base 10. Por eso ' +
        '`2:45 + 1:30` **no** es `3:75`: los 75 minutos se convierten en **1 h y 15 min**, ' +
        'y el resultado real es **4:15**. Tu cálculo dio **' +
        resultado +
        '**, equivalente a **' +
        horasEnt +
        ' h ' +
        minEnt +
        ' min** o **' +
        decimal +
        ' horas decimales** (' +
        minutos +
        ' minutos en total). Para liquidar horas en una planilla, usá el valor **decimal**: ' +
        'multiplicás horas × valor-hora directamente sin convertir minutos a mano.',
      tone: 'neutral',
      icon: '⏱️',
    },
  };
}
