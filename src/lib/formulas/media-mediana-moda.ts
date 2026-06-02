/** Calculadora Media, Mediana y Moda */
export interface Inputs { datos: string; }
export interface Outputs { media: number; mediana: number; moda: string; rango: number; n: number; _insight?: any; }

export function mediaMedianaModa(i: Inputs): Outputs {
  const raw = String(i.datos).split(/[,;\s]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
  if (raw.length === 0) throw new Error('Ingresá al menos un número');

  const n = raw.length;
  const sorted = [...raw].sort((a, b) => a - b);

  // Media
  const sum = raw.reduce((a, b) => a + b, 0);
  const media = sum / n;

  // Mediana
  let mediana: number;
  if (n % 2 === 1) mediana = sorted[Math.floor(n / 2)];
  else mediana = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

  // Moda
  const freq: Record<number, number> = {};
  raw.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const modas = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v));
  let modaStr: string;
  if (maxFreq === 1) modaStr = 'Sin moda (todos los valores son únicos)';
  else modaStr = modas.join(', ') + ` (frecuencia: ${maxFreq})`;

  const rango = sorted[n - 1] - sorted[0];

  // Sesgo: media vs mediana indica la forma de la distribución
  const dif = media - mediana;
  const mFmt = Number(media.toFixed(4));
  const medFmt = Number(mediana.toFixed(4));
  const sesgoTxt = Math.abs(dif) < 1e-9
    ? `La **media (${mFmt})** coincide con la **mediana (${medFmt})**: tus ${n} datos se reparten de forma simétrica.`
    : dif > 0
    ? `La **media (${mFmt})** está por encima de la **mediana (${medFmt})**: algunos valores altos la estiran hacia arriba (sesgo a la derecha).`
    : `La **media (${mFmt})** queda por debajo de la **mediana (${medFmt})**: valores bajos la arrastran (sesgo a la izquierda).`;
  const _insight = {
    title: "Qué te dicen estos números",
    text: `${sesgoTxt} El **rango es ${Number(rango.toFixed(4))}** (de ${sorted[0]} a ${sorted[n - 1]}). Si hay sesgo, la mediana describe mejor el "valor típico" que la media.`,
    tone: "neutral",
    icon: "📊",
  };

  return {
    media: mFmt,
    mediana: medFmt,
    moda: modaStr,
    rango: Number(rango.toFixed(4)),
    n,
    _insight,
  };
}
