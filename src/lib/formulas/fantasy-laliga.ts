/** Fantasy LaLiga — puntos por jornada estilo Biwenger/Comunio */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

export function fantasyLaliga(i: Inputs): Outputs {
  const posicion = String(i.posicion || 'mediocampista');
  const goles = Number(i.goles) || 0;
  const asistencias = Number(i.asistencias) || 0;
  const minutos = Number(i.minutos) || 0;
  const cleanSheet = String(i.cleanSheet || 'no') === 'si' ? 1 : 0;
  const golesEnContra = Number(i.golesEnContra) || 0;
  const nota = Number(i.notaAs) || 0; // nota del diario AS 0-10
  const tarjetaAmarilla = String(i.amarilla || 'no') === 'si' ? 1 : 0;
  const tarjetaRoja = String(i.roja || 'no') === 'si' ? 1 : 0;

  // Puntos por goles segun posicion (sistema Biwenger/Comunio)
  const puntosGol: Record<string, number> = {
    portero: 10,
    defensor: 6,
    mediocampista: 5,
    delantero: 4,
  };
  const puntosAsist = 3;

  let pts = 0;
  // Minutos jugados
  if (minutos >= 60) pts += 2;
  else if (minutos >= 1) pts += 1;

  pts += goles * (puntosGol[posicion] ?? 5);
  pts += asistencias * puntosAsist;

  // Clean sheet
  if (cleanSheet && minutos >= 60) {
    if (posicion === 'portero' || posicion === 'defensor') pts += 4;
    else if (posicion === 'mediocampista') pts += 1;
  }

  // Goles encajados (portero / defensor) cada 2 goles -1
  if ((posicion === 'portero' || posicion === 'defensor') && minutos >= 60) {
    pts -= Math.floor(golesEnContra / 2);
  }

  // Bonus por nota AS (muy estándar en Comunio): nota >= 7 suma
  if (nota >= 8.5) pts += 3;
  else if (nota >= 7.5) pts += 2;
  else if (nota >= 7) pts += 1;
  else if (nota > 0 && nota < 5) pts -= 1;

  // Tarjetas
  pts -= tarjetaAmarilla * 1;
  pts -= tarjetaRoja * 3;

  const nivel = pts >= 12 ? 'Jornada top' : pts >= 8 ? 'Muy buena jornada' : pts >= 5 ? 'Jornada decente' : pts >= 2 ? 'Discreta' : 'Jornada pobre';

  const ptsGoles = goles * (puntosGol[posicion] ?? 5);
  const insightTone: 'good' | 'warn' | 'neutral' = pts >= 8 ? 'good' : pts >= 5 ? 'neutral' : 'warn';
  const insightIcon = pts >= 8 ? '🔥' : pts >= 5 ? '⚽' : '😬';
  const detalle = goles > 0
    ? `Tus **${goles}** gol(es) como ${posicion} aportaron **${ptsGoles} pts**.`
    : (asistencias > 0 ? `Sumaste **${asistencias * puntosAsist} pts** por asistencias.` : `El grueso vino de minutos y nota.`);
  const insight = {
    title: nivel,
    text: `Tu jugador firmó **${pts} pts** esta jornada (**${nivel.toLowerCase()}**). ${detalle}`,
    tone: insightTone,
    icon: insightIcon
  };

  const gaugeTop = Math.max(14, pts + 1);
  const gaugeMin = Math.min(-4, pts);
  const chart = {
    type: 'scale',
    marker: pts,
    markerLabel: `${pts} pts`,
    min: gaugeMin,
    segments: [
      { nombre: 'Pobre', max: 2, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Discreta', max: 5, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Decente', max: 8, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Muy buena', max: 12, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Top', max: gaugeTop, color: '#0d9488', colorDark: '#2dd4bf' }
    ],
    ariaLabel: `Tu jugador sumó ${pts} puntos: jornada calificada como ${nivel}`
  };

  return {
    puntosTotales: `${pts} pts`,
    puntosPorGoles: `${ptsGoles} pts`,
    puntosPorAsistencias: `${asistencias * puntosAsist} pts`,
    nivelJornada: nivel,
    _insight: insight,
    _chart: chart,
  };
}
