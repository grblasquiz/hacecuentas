/** Km recorridos por partido de fútbol según posición */
export interface Inputs {
  posicion: string;
  minutos: number;
  intensidad: string;
}

export interface Outputs {
  result: number;
  kmBase90: number;
  sprintEstimado: number;
  detalle: string;
}

const KM_POR_POSICION: Record<string, { km90: number; sprints: number; nombre: string }> = {
  'arquero': { km90: 5.5, sprints: 8, nombre: 'Arquero' },
  'defensor-central': { km90: 9.5, sprints: 20, nombre: 'Defensor central' },
  'lateral': { km90: 10.5, sprints: 32, nombre: 'Lateral / carrilero' },
  'mediocampista': { km90: 11.5, sprints: 28, nombre: 'Mediocampista central' },
  'volante-externo': { km90: 10.8, sprints: 38, nombre: 'Volante externo / extremo' },
  'delantero': { km90: 9.8, sprints: 28, nombre: 'Delantero centro' },
};

const FACTOR_NIVEL: Record<string, number> = {
  'recreativo': 0.65,
  'amateur-competitivo': 0.85,
  'profesional': 1.0,
};

export function distanciaRecorridaFutbolJugador(i: Inputs): Outputs {
  const pos = String(i.posicion || 'mediocampista');
  const min = Number(i.minutos);
  const nivel = String(i.intensidad || 'amateur-competitivo');

  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = KM_POR_POSICION[pos] || KM_POR_POSICION['mediocampista'];
  const factor = FACTOR_NIVEL[nivel] || 0.85;

  const kmBase = info.km90;
  const kmAjustado = kmBase * factor * (min / 90);
  const sprints = Math.round(info.sprints * factor * (min / 90));

  return {
    result: Number(kmAjustado.toFixed(1)),
    kmBase90: kmBase,
    sprintEstimado: sprints,
    detalle: `Como **${info.nombre}** en ${min} min recorrés **${kmAjustado.toFixed(1)} km** (base profesional: ${kmBase} km/90min, factor nivel: ${factor}). Sprints estimados: ~${sprints}.`,
  };
}
