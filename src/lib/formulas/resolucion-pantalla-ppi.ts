/** Calculadora de PPI — Píxeles por Pulgada */
export interface Inputs {
  anchoPixeles: number;
  altoPixeles: number;
  diagonal: number;
}
export interface Outputs {
  ppi: number;
  totalPixeles: number;
  distanciaIdeal: number;
  calidad: string;
  _insight?: any;
  _chart?: any;
}

export function resolucionPantallaPpi(i: Inputs): Outputs {
  const w = Number(i.anchoPixeles);
  const h = Number(i.altoPixeles);
  const d = Number(i.diagonal);
  if (!w || w <= 0) throw new Error('Ingresá la resolución horizontal');
  if (!h || h <= 0) throw new Error('Ingresá la resolución vertical');
  if (!d || d <= 0) throw new Error('Ingresá la diagonal de la pantalla');

  const diagonalPixeles = Math.sqrt(w * w + h * h);
  const ppi = diagonalPixeles / d;
  const totalPixeles = w * h;

  // Distancia ideal: donde el ojo no distingue píxeles (~1 arcmin)
  // distancia (cm) = (1 / (2 * tan(0.5 arcmin))) / ppi * 2.54
  // Simplified: ~3438 / ppi inches, * 2.54 for cm
  const distanciaIdeal = (3438 / ppi) * 2.54;

  let calidad: string;
  if (ppi >= 300) calidad = 'Excelente — calidad Retina, no se distinguen píxeles a ninguna distancia normal.';
  else if (ppi >= 200) calidad = 'Muy buena — ideal para trabajo de diseño y lectura prolongada.';
  else if (ppi >= 110) calidad = 'Buena — suficiente para uso de escritorio a 60+ cm de distancia.';
  else if (ppi >= 90) calidad = 'Aceptable — se notan píxeles en texto pequeño de cerca.';
  else calidad = 'Baja — los píxeles son visibles. Considerá mayor resolución o menor tamaño.';

  const megapixeles = (totalPixeles / 1e6).toFixed(1);
  const tone = ppi >= 200 ? 'good' : ppi >= 90 ? 'neutral' : 'warn';
  const corta = calidad.split('—')[0].trim();
  const gaugeMax = Math.max(400, Math.ceil(ppi * 1.1));
  return {
    ppi: Number(ppi.toFixed(1)),
    totalPixeles,
    distanciaIdeal: Number(distanciaIdeal.toFixed(0)),
    calidad,
    _insight: {
      title: 'Nitidez de tu pantalla',
      text: `A **${d}"** con **${w}×${h}** (${megapixeles} MP) la densidad es **${ppi.toFixed(0)} PPI** — nitidez **${corta.toLowerCase()}**. Desde unos **${distanciaIdeal.toFixed(0)} cm** el ojo ya no distingue píxeles.`,
      tone,
      icon: '🖥️',
    },
    _chart: {
      type: 'scale',
      marker: Number(ppi.toFixed(1)),
      markerLabel: `${ppi.toFixed(0)} PPI`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 90, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Aceptable', max: 110, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Buena', max: 200, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Muy buena', max: 300, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Retina', max: gaugeMax, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Densidad ${ppi.toFixed(0)} PPI, calidad ${corta}`,
    },
  };
}
