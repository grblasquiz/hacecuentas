/** Desviación estándar y varianza */
export interface Inputs { datos: string; tipo: string; }
export interface Outputs {
  media: number;
  varianza: number;
  desviacionEstandar: number;
  rango: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
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

  const cv = Math.abs(media) > 1e-12 ? (desv / Math.abs(media)) * 100 : 0;
  let _insight: any;
  let _chart: any;
  if (cv > 0) {
    const dispersion = cv < 15 ? 'baja (datos homogéneos)' : cv < 30 ? 'moderada' : 'alta (datos muy dispersos)';
    const tone = cv < 15 ? 'good' : cv < 30 ? 'neutral' : 'warn';
    _insight = {
      title: 'Qué tan dispersos están tus datos',
      text: `Con una media de **${fmt.format(media)}** y desviación estándar de **${fmt.format(desv)}** (${tipoLabel}), el coeficiente de variación es **${fmt.format(Number(cv.toFixed(2)))}%**: dispersión **${dispersion}**.`,
      tone,
      icon: '📊',
    };
    const topGauge = Math.max(45, cv * 1.15);
    _chart = {
      type: 'scale',
      marker: Number(cv.toFixed(2)),
      markerLabel: `CV ${fmt.format(Number(cv.toFixed(2)))}%`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 15, color: '#22c55e', colorDark: '#15803d' },
        { nombre: 'Moderada', max: 30, color: '#f59e0b', colorDark: '#b45309' },
        { nombre: 'Alta', max: Number(topGauge.toFixed(2)), color: '#ef4444', colorDark: '#b91c1c' },
      ],
      ariaLabel: `Coeficiente de variación de ${cv.toFixed(1)}%, dispersión ${dispersion}.`,
    };
  } else {
    _insight = {
      title: 'Qué tan dispersos están tus datos',
      text: `Sobre ${n} dato(s), la desviación estándar ${tipoLabel} es **${fmt.format(desv)}** y la varianza **${fmt.format(varianza)}** (media **${fmt.format(media)}**).`,
      tone: 'neutral',
      icon: '📊',
    };
  }

  return {
    media: Number(media.toFixed(4)),
    varianza: Number(varianza.toFixed(4)),
    desviacionEstandar: Number(desv.toFixed(4)),
    rango: Number(rango.toFixed(4)),
    detalle: `n=${n} datos. Media=${fmt.format(media)}. Varianza (${tipoLabel})=${fmt.format(varianza)}. Desviación estándar=${fmt.format(desv)}. Rango=${fmt.format(rango)} (mín ${fmt.format(minVal)}, máx ${fmt.format(maxVal)}).`,
    _insight,
    _chart,
  };
}
