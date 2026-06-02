/** Promedio, mediana, moda, desvío */
export interface Inputs { numeros: string; __lang?: string; }
export interface Outputs {
  promedio: number;
  mediana: number;
  moda: string;
  rango: number;
  desvio: number;
  varianza: number;
  minimo: number;
  maximo: number;
  suma: number;
  cantidad: number;
  _insight?: any;
  _chart?: any;
}

export function promedioMediana(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorEmpty: 'Ingresá números separados por coma',
      errorNoValid: 'No se encontraron números válidos',
      sinModa: 'Sin moda (todos únicos)',
      insTitle: 'Qué dicen estos números',
      skewSym: (me: string, md: string) => `el **promedio (${me})** y la **mediana (${md})** coinciden, así que los datos están repartidos de forma simétrica`,
      skewRight: (me: string, md: string) => `el **promedio (${me})** queda por encima de la **mediana (${md})**: hay valores altos que lo estiran hacia arriba`,
      skewLeft: (me: string, md: string) => `el **promedio (${me})** queda por debajo de la **mediana (${md})**: hay valores bajos que lo tiran hacia abajo`,
      dispHigh: (s: string) => ` La dispersión es alta (desvío de **${s}**): los datos están bastante esparcidos.`,
      dispLow: (s: string) => ` La dispersión es baja (desvío de **${s}**): los datos están muy concentrados cerca del promedio.`,
      dispMid: (s: string) => ` El desvío estándar es de **${s}** alrededor del promedio.`,
      insText: (nn: number, skew: string, disp: string) => `Sobre ${nn} datos, ${skew}.${disp}`,
      chartMarker: (me: string) => `Promedio ${me}`,
      segLow: 'Tercio bajo',
      segMid: 'Tercio medio',
      segHigh: 'Tercio alto',
      chartAria: (me: string, lo: string, hi: string) => `El promedio ${me} dentro del rango ${lo} a ${hi}.`,
    },
    en: {
      errorEmpty: 'Enter numbers separated by commas',
      errorNoValid: 'No valid numbers found',
      sinModa: 'No mode (all unique)',
      insTitle: 'What these numbers tell you',
      skewSym: (me: string, md: string) => `the **mean (${me})** and the **median (${md})** match, so the data is spread out symmetrically`,
      skewRight: (me: string, md: string) => `the **mean (${me})** sits above the **median (${md})**: a few high values are pulling it up`,
      skewLeft: (me: string, md: string) => `the **mean (${me})** sits below the **median (${md})**: a few low values are pulling it down`,
      dispHigh: (s: string) => ` Spread is high (std dev of **${s}**): the data is fairly scattered.`,
      dispLow: (s: string) => ` Spread is low (std dev of **${s}**): the data is tightly clustered near the mean.`,
      dispMid: (s: string) => ` The standard deviation is **${s}** around the mean.`,
      insText: (nn: number, skew: string, disp: string) => `Across ${nn} values, ${skew}.${disp}`,
      chartMarker: (me: string) => `Mean ${me}`,
      segLow: 'Bottom third',
      segMid: 'Middle third',
      segHigh: 'Top third',
      chartAria: (me: string, lo: string, hi: string) => `The mean ${me} within the range ${lo} to ${hi}.`,
    },
  } as const)[__lang];

  const str = String(i.numeros || '').trim();
  if (!str) throw new Error(T.errorEmpty);

  const nums = str.split(/[,\s;]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) throw new Error(T.errorNoValid);

  const n = nums.length;
  const suma = nums.reduce((a, b) => a + b, 0);
  const promedio = suma / n;

  const ord = [...nums].sort((a, b) => a - b);
  const mediana = n % 2 === 0 ? (ord[n / 2 - 1] + ord[n / 2]) / 2 : ord[Math.floor(n / 2)];

  // Moda
  const freq: Record<number, number> = {};
  nums.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modas = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => v);
  const modaStr = maxFreq === 1 ? T.sinModa : modas.join(', ');

  const minimo = ord[0];
  const maximo = ord[n - 1];
  const rango = maximo - minimo;

  const varianza = nums.reduce((acc, x) => acc + (x - promedio) ** 2, 0) / n;
  const desvio = Math.sqrt(varianza);

  // --- Insight: sesgo (media vs mediana) + dispersión ---
  const loc = __lang === 'en' ? 'en-US' : 'es-AR';
  const fmt = (v: number) => Number(v.toFixed(2)).toLocaleString(loc);
  const diff = promedio - mediana;
  const skew = Math.abs(diff) < 1e-9
    ? T.skewSym(fmt(promedio), fmt(mediana))
    : diff > 0
      ? T.skewRight(fmt(promedio), fmt(mediana))
      : T.skewLeft(fmt(promedio), fmt(mediana));
  let insTone = 'neutral';
  let disp = '';
  if (n > 1 && promedio !== 0) {
    const cv = (desvio / Math.abs(promedio)) * 100;
    if (cv > 30) { insTone = 'warn'; disp = T.dispHigh(fmt(desvio)); }
    else if (cv < 10) { insTone = 'good'; disp = T.dispLow(fmt(desvio)); }
    else { disp = T.dispMid(fmt(desvio)); }
  }
  const _insight = {
    title: T.insTitle,
    text: T.insText(n, skew, disp),
    tone: insTone,
    icon: '📊',
  };

  const out: Outputs = {
    promedio: Number(promedio.toFixed(4)),
    mediana: Number(mediana.toFixed(4)),
    moda: modaStr,
    rango: Number(rango.toFixed(4)),
    desvio: Number(desvio.toFixed(4)),
    varianza: Number(varianza.toFixed(4)),
    minimo: Number(minimo.toFixed(4)),
    maximo: Number(maximo.toFixed(4)),
    suma: Number(suma.toFixed(4)),
    cantidad: n,
    _insight,
  };

  // --- Gauge: dónde cae el promedio dentro del rango [mín, máx] ---
  if (rango > 0) {
    const t1 = minimo + rango / 3;
    const t2 = minimo + (2 * rango) / 3;
    out._chart = {
      type: 'scale',
      marker: Number(promedio.toFixed(4)),
      markerLabel: T.chartMarker(fmt(promedio)),
      min: Number(minimo.toFixed(4)),
      segments: [
        { nombre: T.segLow, max: Number(t1.toFixed(4)), color: '#3b82f6', colorDark: '#60a5fa' },
        { nombre: T.segMid, max: Number(t2.toFixed(4)), color: '#22c55e', colorDark: '#4ade80' },
        { nombre: T.segHigh, max: Number(maximo.toFixed(4)), color: '#f97316', colorDark: '#fb923c' },
      ],
      ariaLabel: T.chartAria(fmt(promedio), fmt(minimo), fmt(maximo)),
    };
  }

  return out;
}
