/** Calculadora de Percentil */
export interface Inputs { datos: string; valor: number; __lang?: string; }
export interface Outputs { percentil: number; interpretacion: string; cuartil: string; q1q2q3: string; _insight?: any; _chart?: any; }

function getPercentile(sorted: number[], p: number): number {
  const n = sorted.length;
  const rank = (p / 100) * (n - 1);
  const lower = Math.floor(rank);
  const upper = Math.ceil(rank);
  const frac = rank - lower;
  if (upper >= n) return sorted[n - 1];
  return sorted[lower] + frac * (sorted[upper] - sorted[lower]);
}

export function percentilDato(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorMinData: 'Ingresá al menos 2 datos',
      q1Label: 'Primer cuartil (Q1, 0-25%)',
      q2Label: 'Segundo cuartil (Q2, 25-50%)',
      q3Label: 'Tercer cuartil (Q3, 50-75%)',
      q4Label: 'Cuarto cuartil (Q4, 75-100%)',
      mediana: 'mediana',
      insightTitle: 'Posición del valor',
      segLow: 'Bajo (Q1)',
      segMidLow: 'Medio-bajo (Q2)',
      segMidHigh: 'Medio-alto (Q3)',
      segHigh: 'Alto (Q4)',
      gaugeAria: 'Escala de percentil del valor dentro del conjunto de datos (0 a 100)',
    },
    en: {
      errorMinData: 'Enter at least 2 data points',
      q1Label: 'First quartile (Q1, 0-25%)',
      q2Label: 'Second quartile (Q2, 25-50%)',
      q3Label: 'Third quartile (Q3, 50-75%)',
      q4Label: 'Fourth quartile (Q4, 75-100%)',
      mediana: 'median',
      insightTitle: 'Where the value sits',
      segLow: 'Low (Q1)',
      segMidLow: 'Mid-low (Q2)',
      segMidHigh: 'Mid-high (Q3)',
      segHigh: 'High (Q4)',
      gaugeAria: 'Scale of the value percentile within the dataset (0 to 100)',
    },
  } as const)[__lang];

  const raw = String(i.datos).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  if (raw.length < 2) throw new Error(T.errorMinData);
  const valor = Number(i.valor);
  const sorted = [...raw].sort((a, b) => a - b);
  const n = sorted.length;

  // Count values <= valor
  const countBelow = sorted.filter(v => v <= valor).length;
  const percentil = (countBelow / n) * 100;

  const q1 = getPercentile(sorted, 25);
  const q2 = getPercentile(sorted, 50);
  const q3 = getPercentile(sorted, 75);

  let cuartil: string;
  if (valor <= q1) cuartil = T.q1Label;
  else if (valor <= q2) cuartil = T.q2Label;
  else if (valor <= q3) cuartil = T.q3Label;
  else cuartil = T.q4Label;

  const percentilR = Number(percentil.toFixed(2));
  const _insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `**${valor}** lands at the **${percentil.toFixed(1)}th percentile** of your ${n} data points, placing it in the **${cuartil}**.`
      : `**${valor}** se ubica en el **percentil ${percentil.toFixed(1)}** de tus ${n} datos, lo que lo coloca en el **${cuartil}**.`,
    tone: 'neutral',
    icon: '📊',
  };

  const _chart = {
    type: 'scale' as const,
    marker: percentilR,
    markerLabel: (__lang === 'en' ? 'Percentile: ' : 'Percentil: ') + percentilR,
    min: 0,
    segments: [
      { nombre: T.segLow, max: 25, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: T.segMidLow, max: 50, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.segMidHigh, max: 75, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segHigh, max: percentilR >= 100 ? 101 : 100, color: '#fed7aa', colorDark: '#9a3412' },
    ],
    ariaLabel: T.gaugeAria,
  };

  return {
    percentil: percentilR,
    interpretacion: __lang === 'en'
      ? `Value ${valor} is greater than or equal to ${percentil.toFixed(1)}% of the ${n} data points.`
      : `El valor ${valor} es mayor o igual que el ${percentil.toFixed(1)}% de los ${n} datos.`,
    cuartil,
    q1q2q3: __lang === 'en'
      ? `Q1 = ${q1.toFixed(2)}, Q2 = ${q2.toFixed(2)} (${T.mediana}), Q3 = ${q3.toFixed(2)}`
      : `Q1 = ${q1.toFixed(2)}, Q2 = ${q2.toFixed(2)} (mediana), Q3 = ${q3.toFixed(2)}`,
    _insight,
    _chart,
  };
}
