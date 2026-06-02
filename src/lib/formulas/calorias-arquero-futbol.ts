/** Calorías quemadas por un arquero en un partido de fútbol (MET 4.0-5.0) */
export interface Inputs {
  peso: number;
  minutos: number;
  intensidad: string; // 'baja' | 'media' | 'alta'
}

export interface Outputs {
  caloriasTotal: number;
  caloriasPorMinuto: number;
  metUsado: number;
  intensidadNombre: string;
  detalle: string;
  _insight?: any;
}

const NIVELES: Record<string, { met: number; nombre: string }> = {
  'baja':  { met: 4.0, nombre: 'Arquero amateur / bajo trabajo (MET 4.0)' },
  'media': { met: 4.5, nombre: 'Arquero estándar (MET 4.5)' },
  'alta':  { met: 5.0, nombre: 'Arquero moderno con salidas (MET 5.0)' },
};

export function caloriasArqueroFutbol(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const min = Number(i.minutos);
  const intensidad = String(i.intensidad || 'media');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = NIVELES[intensidad] || NIVELES['media'];
  const kcalMin = (info.met * 3.5 * peso) / 200;
  const total = kcalMin * min;

  // Equivalencias: una banana ~90 kcal, 5 kcal/min caminando
  const bananas = total / 90;
  const minCaminar = Math.round(total / 5);
  const _insight = {
    title: 'Tu gasto bajo los tres palos',
    text: `En ${min} min al arco quemás **~${Math.round(total)} kcal** (${kcalMin.toFixed(2)} kcal/min). Es como ${bananas >= 1 ? `**${bananas.toFixed(1)} bananas**` : 'media banana'} o **${minCaminar} min** de caminata. El arquero gasta menos que un jugador de campo: más explosión, menos volumen.`,
    tone: 'good',
    icon: '🧤',
  };

  return {
    caloriasTotal: Math.round(total),
    caloriasPorMinuto: Number(kcalMin.toFixed(2)),
    metUsado: info.met,
    intensidadNombre: info.nombre,
    detalle: `Un arquero de ${peso} kg en ${min} min a intensidad **${intensidad}** (MET ${info.met}) quema **~${Math.round(total)} kcal** (${kcalMin.toFixed(2)} kcal/min).`,
    _insight,
  };
}
