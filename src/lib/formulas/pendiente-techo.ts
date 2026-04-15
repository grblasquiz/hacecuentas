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

  return {
    porcentaje: Number(pct.toFixed(2)),
    grados: Number(grados.toFixed(2)),
    cmPorMetro: Number(cmPorMetro.toFixed(2)),
    clasificacion,
    largoInclinado: Number(largoInclinado.toFixed(2)),
    resumen: `Pendiente: ${pct.toFixed(1)}% / ${grados.toFixed(1)}° / ${cmPorMetro.toFixed(1)} cm por metro. ${clasificacion}.`,
  };
}
