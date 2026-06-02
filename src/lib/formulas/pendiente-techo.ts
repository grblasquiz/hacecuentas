/** Pendiente de un techo: grados, % y cm/m */
export interface Inputs {
  altura?: number; // cm de altura en la cumbrera respecto del alero
  base?: number; // cm de proyección horizontal (mitad de la luz si es dos aguas)
  porcentaje?: number; // si quieren ingresar el %
  grados?: number;
  calcular?: string; // por-altura | por-porcentaje | por-grados
}
export interface Outputs {
  porcentaje: number;
  grados: number;
  cmPorMetro: number;
  clasificacion: string;
  largoInclinado: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function pendienteTecho(i: Inputs): Outputs {
  const calcular = String(i.calcular || 'por-altura');
  let pct = 0, grados = 0, altura = 0, base = 0;

  if (calcular === 'por-altura') {
    altura = Number(i.altura);
    base = Number(i.base);
    if (!altura || !base) throw new Error('Ingresá altura y base en cm');
    pct = (altura / base) * 100;
    grados = Math.atan(altura / base) * (180 / Math.PI);
  } else if (calcular === 'por-porcentaje') {
    pct = Number(i.porcentaje);
    if (!pct || pct < 0) throw new Error('Ingresá un porcentaje válido');
    grados = Math.atan(pct / 100) * (180 / Math.PI);
    base = 100;
    altura = pct;
  } else if (calcular === 'por-grados') {
    grados = Number(i.grados);
    if (!grados || grados < 0 || grados >= 90) throw new Error('Ingresá un ángulo entre 0 y 89 grados');
    pct = Math.tan((grados * Math.PI) / 180) * 100;
    base = 100;
    altura = pct;
  } else {
    throw new Error('Método de cálculo no válido');
  }

  const cmPorMetro = pct; // % = cm por metro

  let clasificacion = '';
  if (pct < 5) clasificacion = 'Techo plano / losa';
  else if (pct < 15) clasificacion = 'Pendiente muy suave (shingle, membrana)';
  else if (pct < 25) clasificacion = 'Pendiente suave (tejas mecanizadas, chapa)';
  else if (pct < 40) clasificacion = 'Pendiente media (tejas tradicionales)';
  else if (pct < 60) clasificacion = 'Pendiente pronunciada (regiones con nieve)';
  else clasificacion = 'Muy empinado (estilo alpino/mansarda)';

  const largoInclinado = Math.sqrt(altura * altura + base * base);

  const _insight = {
    title: 'Tu pendiente',
    text: `Una pendiente de **${pct.toFixed(1)}%** equivale a **${grados.toFixed(1)}°** y sube **${cmPorMetro.toFixed(1)} cm por cada metro** horizontal. Cae en la categoría: ${clasificacion}.`,
    tone: pct < 5 ? 'warn' : 'neutral',
    icon: '📐',
  };

  const _chart = {
    type: 'scale',
    marker: Number(pct.toFixed(1)),
    markerLabel: `${pct.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Plana / losa', max: 5, color: '#93c5fd', colorDark: '#1e40af' },
      { nombre: 'Muy suave', max: 15, color: '#86efac', colorDark: '#166534' },
      { nombre: 'Suave', max: 25, color: '#fde68a', colorDark: '#854d0e' },
      { nombre: 'Media', max: 40, color: '#fdba74', colorDark: '#9a3412' },
      { nombre: 'Pronunciada', max: 60, color: '#fca5a5', colorDark: '#991b1b' },
      { nombre: 'Muy empinada', max: Math.max(100, Math.ceil(pct) + 10), color: '#f0abfc', colorDark: '#86198f' },
    ],
    ariaLabel: `Pendiente de ${pct.toFixed(1)}% ubicada en la zona ${clasificacion}`,
  };

  return {
    porcentaje: Number(pct.toFixed(2)),
    grados: Number(grados.toFixed(2)),
    cmPorMetro: Number(cmPorMetro.toFixed(2)),
    clasificacion,
    largoInclinado: Number(largoInclinado.toFixed(2)),
    resumen: `Pendiente: ${pct.toFixed(1)}% / ${grados.toFixed(1)}° / ${cmPorMetro.toFixed(1)} cm por metro. ${clasificacion}.`,
    _insight,
    _chart,
  };
}
