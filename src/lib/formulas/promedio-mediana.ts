/** Promedio, mediana, moda, desvío */
export interface Inputs { numeros: string; }
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
}

export function promedioMediana(i: Inputs): Outputs {
  const str = String(i.numeros || '').trim();
  if (!str) throw new Error('Ingresá números separados por coma');

  const nums = str.split(/[,\s;]+/).map(Number).filter(n => !isNaN(n));
  if (nums.length === 0) throw new Error('No se encontraron números válidos');

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
  const modaStr = maxFreq === 1 ? 'Sin moda (todos únicos)' : modas.join(', ');

  const minimo = ord[0];
  const maximo = ord[n - 1];
  const rango = maximo - minimo;

  const varianza = nums.reduce((acc, x) => acc + (x - promedio) ** 2, 0) / n;
  const desvio = Math.sqrt(varianza);

  return {
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
  };
}
