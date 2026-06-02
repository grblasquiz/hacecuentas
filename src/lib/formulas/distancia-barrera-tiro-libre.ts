/** Distancia reglamentaria de la barrera en tiro libre — IFAB Laws of the Game */
export interface Inputs {
  unidad: string;
  distanciaIngresada: number;
  zonaCancha: string;
}
export interface Outputs {
  distanciaReglamento: string;
  conversion: string;
  cumpleNormativa: string;
  sancionPorAdelantamiento: string;
  zonaDetalle: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function distanciaBarreraTiroLibre(i: Inputs): Outputs {
  const unidad = String(i.unidad || 'metros');
  const d = Number(i.distanciaIngresada) || 0;
  const zona = String(i.zonaCancha || 'media-cancha');

  // IFAB Laws of the Game Law 13: 9.15 m = 10 yardas para tiros libres y también córneres.
  const reglamento = 9.15;
  const reglamentoYardas = 10;
  const reglamentoPies = 30;

  // Normalizamos a metros
  let metros = d;
  if (unidad === 'yardas') metros = d * 0.9144;
  else if (unidad === 'pies') metros = d * 0.3048;
  else if (unidad === 'centimetros') metros = d / 100;

  const diff = metros - reglamento;
  const cumple = metros >= reglamento;

  const cumpleTxt = cumple
    ? `Cumple (${metros.toFixed(2)} m ≥ 9.15 m reglamentarios).`
    : `NO cumple: la barrera está a ${metros.toFixed(2)} m, a ${Math.abs(diff).toFixed(2)} m menos de lo reglamentado.`;

  const zonaInfo: Record<string, string> = {
    'area-penal': 'Dentro del área penal propia: en tiros libres indirectos para el equipo atacante la barrera debe estar al menos sobre la línea del área. Si el tiro libre es para el equipo defensor, los atacantes deben estar fuera del área y a 9.15 m.',
    'area-tecnica': 'Cerca del área técnica: arbitro puede usar spray evanescente para marcar 9.15 m exactos.',
    'media-cancha': 'En media cancha: arbitro marca 9.15 m con spray y todos los defensores deben respetar esa distancia hasta que se ejecute.',
    'corner': 'Tiro de esquina (córner): los rivales deben estar a 9.15 m del arco del cuadrante del córner hasta la ejecución.'
  };

  const sancion = 'IFAB: si un jugador defensor adelanta su posición de barrera antes de la ejecución, el árbitro advierte y, en caso de reincidencia o conducta antideportiva, amonesta con amarilla. En tiros libres cercanos al área se usa spray evanescente para marcar los 9.15 m.';

  const titular = cumple ? 'Cumple' : 'No cumple';

  const insight = cumple
    ? {
        title: 'Distancia válida',
        text: `La barrera a **${metros.toFixed(2)} m** cumple el mínimo de **9.15 m** (10 yardas) de la Ley 13 de IFAB${diff > 0.5 ? `, con ${diff.toFixed(2)} m de margen` : ''}. El árbitro puede ejecutar el tiro libre sin sancionar la distancia.`,
        tone: 'good',
        icon: '⚽',
      }
    : {
        title: 'Barrera adelantada',
        text: `La barrera está a **${metros.toFixed(2)} m**, **${Math.abs(diff).toFixed(2)} m menos** que los **9.15 m** reglamentarios. El árbitro debe hacerla retroceder y puede amonestar si los defensores reinciden.`,
        tone: 'warn',
        icon: '🟨',
      };

  // Gauge: zona deficiente (<9.15) y zona reglamentaria (≥9.15).
  const topMax = Math.max(metros + 1, 12);
  const chart = {
    type: 'scale',
    marker: Number(metros.toFixed(2)),
    markerLabel: `${metros.toFixed(2)} m`,
    min: 0,
    segments: [
      { nombre: 'Adelantada', max: 9.15, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Reglamentaria', max: Number(topMax.toFixed(2)), color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `La distancia de ${metros.toFixed(2)} m ${cumple ? 'alcanza' : 'no alcanza'} el mínimo reglamentario de 9.15 m.`,
  };

  return {
    distanciaReglamento: `9.15 m (10 yardas / 30 pies) según IFAB Laws of the Game 2025-2026 (Law 13).`,
    conversion: `${reglamento} m = ${reglamentoYardas} yd = ${reglamentoPies} ft = ${reglamento * 100} cm.`,
    cumpleNormativa: cumpleTxt,
    sancionPorAdelantamiento: sancion,
    zonaDetalle: `${zonaInfo[zona] || zonaInfo['media-cancha']} Ingresaste ${d} ${unidad} (${metros.toFixed(2)} m). ${cumpleTxt}`,
    mensaje: titular,
    _insight: insight,
    _chart: chart
  };
}
