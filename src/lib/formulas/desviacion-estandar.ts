/** Desviación estándar y varianza */
export interface Inputs { datos: string; tipo: string; }
export interface Outputs {
  media: number;
  varianza: number;
  desviacionEstandar: number;
  rango: number;
  detalle: string;
}

export function desviacionEstandar(i: Inputs): Outputs {
  const datosStr = String(i.datos || '').trim();
  const tipo = String(i.tipo || 'muestra');
  if (!datosStr) throw new Error('Ingresá los datos separados por coma');

  const datos = datosStr.split(',').map(v => Number(v.trim()));
  if (datos.some(v => isNaN(v))) throw new Error('Todos los valores deben ser números');
  if (datos.length < 2 && tipo === 'muestra') throw new Error('Necesitás al menos 2 datos para muestra');
  if (datos.length < 1) throw new Error('Ingresá al menos un dato');

  const n = datos.length;
  const media = datos.reduce((a, b) => a + b, 0) / n;
  const sumaDesviaciones = datos.reduce((acc, val) => acc + Math.pow(val - media, 2), 0);

  const divisor = tipo === 'poblacion' ? n : n - 1;
  const varianza = sumaDesviaciones / divisor;
  const desv = Math.sqrt(varianza);

  const minVal = Math.min(...datos);
  const maxVal = Math.max(...datos);
  const rango = maxVal - minVal;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 4 });
  const tipoLabel = tipo === 'poblacion' ? 'población (σ)' : 'muestra (s)';

  return {
    media: Number(media.toFixed(4)),
    varianza: Number(varianza.toFixed(4)),
    desviacionEstandar: Number(desv.toFixed(4)),
    rango: Number(rango.toFixed(4)),
    detalle: `n=${n} datos. Media=${fmt.format(media)}. Varianza (${tipoLabel})=${fmt.format(varianza)}. Desviación estándar=${fmt.format(desv)}. Rango=${fmt.format(rango)} (mín ${fmt.format(minVal)}, máx ${fmt.format(maxVal)}).`,
  };
}
