/** Distancia recorrida por un futbolista según posición y minutos jugados (FIFA technical reports) */
export interface Inputs {
  posicion: string;
  minutos: number;
  nivel: string; // 'elite' | 'amateur'
}

export interface Outputs {
  distanciaKm: number;
  rangoMin: number;
  rangoMax: number;
  highIntensityKm: number;
  posicionNombre: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Rango km / 90 min por posición (FIFA + estudios Premier League / La Liga)
const POSICIONES: Record<string, { min: number; max: number; nombre: string; hiPct: number }> = {
  'arquero':         { min: 3.0,  max: 5.0,  nombre: 'Arquero / portero',        hiPct: 0.03 },
  'defensor-central':{ min: 9.0,  max: 10.0, nombre: 'Defensor central',          hiPct: 0.08 },
  'lateral':         { min: 10.0, max: 11.5, nombre: 'Lateral / carrilero',       hiPct: 0.12 },
  'mediocampista':   { min: 11.0, max: 13.0, nombre: 'Mediocampista central',     hiPct: 0.11 },
  'volante-externo': { min: 10.5, max: 12.0, nombre: 'Volante externo / extremo', hiPct: 0.14 },
  'delantero':       { min: 9.0,  max: 10.5, nombre: 'Delantero centro',          hiPct: 0.13 },
};

export function distanciaFutbolistaPosicion(i: Inputs): Outputs {
  const pos = String(i.posicion || 'mediocampista');
  const min = Number(i.minutos);
  const nivel = String(i.nivel || 'elite');

  if (!min || min <= 0) throw new Error('Ingresá los minutos jugados');

  const info = POSICIONES[pos] || POSICIONES['mediocampista'];
  // Amateur recorre ~80% del elite
  const factor = nivel === 'amateur' ? 0.8 : 1.0;
  const ratio = min / 90;

  const kmMin = info.min * factor * ratio;
  const kmMax = info.max * factor * ratio;
  const kmProm = (kmMin + kmMax) / 2;
  const kmHI = kmProm * info.hiPct;

  const promR = Number(kmProm.toFixed(2));
  const hiR = Number(kmHI.toFixed(2));
  const restR = Number((kmProm - kmHI).toFixed(2));
  const hiPctTxt = Math.round(info.hiPct * 100);
  const _insight = {
    title: 'Cuánto corre en cancha',
    text: `Un **${info.nombre.toLowerCase()}** (${nivel}) en ${min} min recorre unos **${promR} km** (rango ${kmMin.toFixed(1)}-${kmMax.toFixed(1)} km). De eso, **~${hiR} km** (${hiPctTxt}%) son a alta intensidad: sprints y carreras por encima de 19,8 km/h, la parte que más cansa.`,
    tone: 'neutral',
    icon: '⚽',
  };
  const donutTotal = Number((hiR + restR).toFixed(2));
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: `Alta intensidad (${hiPctTxt}%)`, value: hiR },
      { label: 'Trote y caminata', value: restR },
    ],
    prefix: '',
    centerValue: `${donutTotal} km`,
    centerLabel: 'recorridos',
    ariaLabel: `Distancia total de ${donutTotal} km dividida en alta intensidad y trote/caminata`,
  };

  return {
    distanciaKm: promR,
    rangoMin: Number(kmMin.toFixed(2)),
    rangoMax: Number(kmMax.toFixed(2)),
    highIntensityKm: hiR,
    posicionNombre: info.nombre,
    detalle: `**${info.nombre}** (${nivel}) en ${min} min recorre aprox **${kmProm.toFixed(2)} km** (rango ${kmMin.toFixed(1)}-${kmMax.toFixed(1)} km), de los cuales **~${kmHI.toFixed(2)} km** son a alta intensidad (>19.8 km/h).`,
    _insight,
    _chart,
  };
}
