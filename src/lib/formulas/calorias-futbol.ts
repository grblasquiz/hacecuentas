/** Calorías quemadas jugando fútbol según formato y tiempo */
export interface Inputs {
  peso: number;
  formato: string; // 'futbol-5' | 'futbol-7' | 'futbol-11' | 'picado' | 'competitivo'
  minutos: number;
  posicion: string; // 'campo' | 'arquero'
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  formatoMostrado: string;
  kmEstimadosCorridos: number;
  resumen: string;
}

const MET: Record<string, { met: number; nombre: string; kmH: number }> = {
  'futbol-5': { met: 8.0, nombre: 'Fútbol 5 (cancha chica)', kmH: 7 },
  'futbol-7': { met: 8.5, nombre: 'Fútbol 7', kmH: 8 },
  'futbol-11': { met: 7.0, nombre: 'Fútbol 11 amateur', kmH: 9 },
  'picado': { met: 7.0, nombre: 'Picado / amistoso', kmH: 6 },
  'competitivo': { met: 10.0, nombre: 'Fútbol competitivo / torneo', kmH: 10 },
  'entrenamiento': { met: 7.5, nombre: 'Entrenamiento con pelota', kmH: 7 },
};

export function caloriasFutbol(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const formato = String(i.formato || 'futbol-5');
  const pos = String(i.posicion || 'campo');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = MET[formato] || MET['futbol-5'];
  let met = info.met;
  let kmH = info.kmH;

  if (pos === 'arquero') {
    met = met * 0.55; // arquero corre ~55% que un jugador de campo
    kmH = kmH * 0.35;
  }

  const kcalMin = (met * 3.5 * peso) / 200;
  const total = kcalMin * min;
  const km = (kmH * min) / 60;

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: Number(met.toFixed(1)),
    formatoMostrado: info.nombre + (pos === 'arquero' ? ' (arquero)' : ''),
    kmEstimadosCorridos: Number(km.toFixed(1)),
    resumen: `Jugando **${info.nombre}**${pos === 'arquero' ? ' de arquero' : ''} ${min} minutos quemás **${Math.round(total)} kcal** y corrés ~${km.toFixed(1)} km (MET ${met.toFixed(1)}).`,
  };
}
