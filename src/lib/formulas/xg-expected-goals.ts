/** xG simplificado: distancia, ángulo, tipo de remate (modelo inspirado en Opta público) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

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

  return {
    xg: xgClamped.toFixed(3),
    probabilidadGol: `${(xgClamped * 100).toFixed(1)}%`,
    interpretacion: `Un remate ${tipo} a ${distancia}m con ángulo ${angulo}° tiene xG = ${xgClamped.toFixed(2)}.`,
    categoria: cat,
  };
}
