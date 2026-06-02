/** xG simplificado: distancia, ángulo, tipo de remate (modelo inspirado en Opta público) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const xgSegments = [
  { nombre: 'Improbable', max: 0.04, color: '#94a3b8', colorDark: '#64748b' },
  { nombre: 'Remate probable', max: 0.1, color: '#fbbf24', colorDark: '#d97706' },
  { nombre: 'Ocasión media', max: 0.25, color: '#a3e635', colorDark: '#65a30d' },
  { nombre: 'Ocasión clara', max: 0.5, color: '#34d399', colorDark: '#059669' },
  { nombre: 'Big chance', max: 0.95, color: '#10b981', colorDark: '#047857' },
];

export function xgExpectedGoals(i: Inputs): Outputs {
  const tipo = String(i.tipo || 'pie');
  const distancia = Number(i.distancia) || 0;
  const angulo = Number(i.angulo) || 30; // grados abiertos vs arco

  if (tipo === 'penal') {
    return {
      xg: '0.76',
      probabilidadGol: '76%',
      interpretacion: 'Los penales tienen xG fijo ~0.76 (tasa histórica de conversión).',
      categoria: 'Máxima probabilidad',
      _insight: {
        title: 'Penal: xG 0,76',
        text: 'Un penal tiene un **xG fijo de ~0,76**, o sea **76%** de probabilidad de gol según la tasa histórica de conversión. Es la ocasión de mayor valor del fútbol: de cada 4 penales, se esperan unos 3 goles.',
        tone: 'good' as const,
        icon: '⚽',
      },
      _chart: {
        type: 'scale',
        marker: 0.76,
        markerLabel: 'xG 0,76',
        min: 0,
        segments: xgSegments,
        ariaLabel: 'Escala de xG de 0 a 0,95. El penal marca 0,76, categoría máxima probabilidad.',
      },
    };
  }

  if (distancia <= 0) throw new Error('Ingresá la distancia al arco');

  // Modelo logístico simple inspirado en Opta/Understat
  // Variables: distancia (m), angulo (grados), tipo
  // Base: pie derecho dentro del area
  // xG = 1 / (1 + exp(-z))
  // z = 1.6 - 0.12*dist + 0.018*angulo + tipoAdj
  const tipoAdj: Record<string, number> = {
    pie: 0,
    cabeza: -0.7,
    'primer-toque': 0.3, // finalización de primer toque en área pequeña
    'fuera-area': -0.5,
    'tiro-libre': -1.2,
  };
  const adj = tipoAdj[tipo] ?? 0;
  const z = 1.6 - 0.12 * distancia + 0.018 * angulo + adj;
  const xg = 1 / (1 + Math.exp(-z));

  const xgClamped = Math.min(0.95, Math.max(0.01, xg));

  const cat = xgClamped >= 0.5 ? 'Ocasión clarísima (big chance)'
    : xgClamped >= 0.25 ? 'Ocasión clara'
    : xgClamped >= 0.1 ? 'Ocasión media'
    : xgClamped >= 0.04 ? 'Remate probable'
    : 'Remate improbable';

  const tone = xgClamped >= 0.25 ? 'good' : xgClamped >= 0.1 ? 'neutral' : 'warn';

  const _insight = {
    title: `xG ${xgClamped.toFixed(2)}: ${cat.replace(' (big chance)', '').toLowerCase()}`,
    text: `Un remate **${tipo}** a **${distancia} m** con ángulo de **${angulo}°** tiene **xG ${xgClamped.toFixed(3)}** (~**${(xgClamped * 100).toFixed(1)}%** de gol). ${xgClamped >= 0.5 ? 'Es una ocasión que un delantero debería convertir más de la mitad de las veces: errarla pesa.' : xgClamped >= 0.1 ? 'Ocasión razonable; la distancia y el ángulo todavía juegan en contra del rematador.' : 'El xG es bajo: desde acá se mete poco, conviene buscar un pase a mejor posición antes que rematar.'}`,
    tone: tone as 'good' | 'neutral' | 'warn',
    icon: '⚽',
  };

  const _chart = {
    type: 'scale',
    marker: Number(xgClamped.toFixed(3)),
    markerLabel: `xG ${xgClamped.toFixed(2)}`,
    min: 0,
    segments: xgSegments,
    ariaLabel: `Escala de xG de 0 a 0,95. El remate ${tipo} a ${distancia} m marca ${xgClamped.toFixed(3)}, categoría ${cat}.`,
  };

  return {
    xg: xgClamped.toFixed(3),
    probabilidadGol: `${(xgClamped * 100).toFixed(1)}%`,
    interpretacion: `Un remate ${tipo} a ${distancia}m con ángulo ${angulo}° tiene xG = ${xgClamped.toFixed(2)}.`,
    categoria: cat,
    _insight,
    _chart,
  };
}
