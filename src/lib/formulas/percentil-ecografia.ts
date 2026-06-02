/** Percentil fetal por ecografía — Hadlock */
export interface Inputs { semanaEco: number; dbp?: number; cc?: number; ca?: number; lf?: number; }
export interface Outputs { pesoEstimado: string; percentilPeso: string; clasificacion: string; nota: string; _chart?: any; _insight?: any; }

export function percentilEcografia(i: Inputs): Outputs {
  const sem = Math.round(Number(i.semanaEco));
  const ca = Number(i.ca) || 0;
  const lf = Number(i.lf) || 0;
  if (sem < 14 || sem > 42) throw new Error('Ingresá una semana entre 14 y 42');
  if (!ca && !lf) throw new Error('Ingresá al menos CA o LF para estimar el peso');

  // Hadlock formula (CA + LF, ambos en cm)
  const caCm = ca / 10;
  const lfCm = lf / 10;
  let pesoG = 0;

  if (ca > 0 && lf > 0) {
    const logPeso = 1.304 + 0.05281 * caCm + 0.1938 * lfCm - 0.004 * caCm * lfCm;
    pesoG = Math.pow(10, logPeso);
  } else if (ca > 0) {
    // Hadlock CA-only: log10(PFE) = 1.6961 + 0.02253×CA - 0.0001628×CA²
    const logPeso = 1.6961 + 0.02253 * caCm - 0.0001628 * caCm * caCm;
    pesoG = Math.pow(10, logPeso);
  } else {
    throw new Error('Ingresá la CA para una estimación más precisa');
  }

  // Percentiles aproximados por semana (P10, P50, P90 en gramos)
  const percentilesData: Record<number, [number, number, number]> = {
    14: [80, 100, 130], 16: [120, 150, 190], 18: [170, 220, 280],
    20: [220, 300, 390], 22: [330, 430, 550], 24: [470, 600, 750],
    26: [640, 800, 1000], 28: [800, 1000, 1250], 30: [1050, 1350, 1700],
    32: [1300, 1700, 2150], 34: [1700, 2100, 2600], 36: [2150, 2600, 3100],
    38: [2500, 3000, 3550], 40: [2850, 3400, 3950], 42: [3000, 3550, 4100],
  };

  // Find closest week in data
  const weeks = Object.keys(percentilesData).map(Number).sort((a, b) => a - b);
  let closestWeek = weeks[0];
  for (const w of weeks) { if (w <= sem) closestWeek = w; }
  const [p10, p50, p90] = percentilesData[closestWeek] || [0, 0, 0];

  let percentil = '';
  let clasificacion = '';
  if (pesoG < p10) {
    percentil = `< percentil 10 (bajo para la edad gestacional)`;
    clasificacion = 'Pequeño para la edad gestacional (PEG). Consultá con tu obstetra.';
  } else if (pesoG > p90) {
    percentil = `> percentil 90 (grande para la edad gestacional)`;
    clasificacion = 'Grande para la edad gestacional (GEG). Evaluar diabetes gestacional.';
  } else {
    // Estimar percentil aproximado
    const ratio = (pesoG - p10) / (p90 - p10);
    const percApprox = Math.round(10 + ratio * 80);
    percentil = `~percentil ${percApprox}`;
    clasificacion = 'Adecuado para la edad gestacional (AEG). Crecimiento normal.';
  }

  const pesoStr = pesoG >= 1000 ? `${(pesoG / 1000).toFixed(2)} kg` : `${Math.round(pesoG)} g`;

  const chart = {
    type: 'scale' as const,
    marker: Math.round(pesoG),
    markerLabel: 'Peso fetal estimado: ' + pesoStr,
    min: 0,
    unit: ' g',
    segments: [
      { nombre: 'PEG (<P10)', max: Math.round(p10), color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Adecuado (P10–P90)', max: Math.round(p90), color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'GEG (>P90)', max: Math.max(Math.round(p90 + (p90 - p10)), Math.ceil(pesoG) + 100), color: '#fed7aa', colorDark: '#9a3412' },
    ],
    ariaLabel: 'Escala de peso fetal estimado para la edad gestacional: pequeño (PEG), adecuado (AEG), grande (GEG).',
  };

  const fueraRango = pesoG < p10 || pesoG > p90;
  const etiqueta = pesoG < p10 ? 'pequeño para la edad gestacional (PEG)' : pesoG > p90 ? 'grande para la edad gestacional (GEG)' : 'adecuado para la edad gestacional (AEG)';
  const _insight = {
    title: 'Peso fetal estimado',
    text: `El peso estimado por Hadlock es **${pesoStr}** en la semana **${sem}**, lo que ubica al bebé en **${percentil}**: ${etiqueta}. Recordá que la estimación tiene un margen de **±15%**.`,
    tone: fueraRango ? 'warn' : 'good',
    icon: '🤰',
  };

  return {
    pesoEstimado: pesoStr,
    percentilPeso: percentil,
    clasificacion,
    nota: 'El peso fetal estimado por ecografía tiene un margen de error de ±15%. Consultá siempre con tu obstetra.',
    _chart: chart,
    _insight,
  };
}
