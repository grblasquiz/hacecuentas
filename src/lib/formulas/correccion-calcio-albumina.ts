/** Corrección de calcio sérico por albúmina (Payne, 1973) */
export interface Inputs {
  calcioMedido: number;
  albumina: number;
}
export interface Outputs {
  calcioCorregido: number;
  interpretacion: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function correccionCalcioAlbumina(i: Inputs): Outputs {
  const ca = Number(i.calcioMedido);
  const alb = Number(i.albumina);

  if (!ca || ca <= 0) throw new Error('Ingresá el calcio total medido en mg/dL');
  if (!alb || alb <= 0) throw new Error('Ingresá la albúmina sérica en g/dL');

  // Fórmula: Ca corregido = Ca medido + 0.8 × (4.0 - albúmina)
  const correccion = 0.8 * (4.0 - alb);
  const calcioCorregido = ca + correccion;

  let interpretacion: string;
  if (calcioCorregido < 8.5) {
    interpretacion = 'Hipocalcemia (calcio corregido <8,5 mg/dL)';
  } else if (calcioCorregido <= 10.5) {
    interpretacion = 'Calcio corregido normal (8,5-10,5 mg/dL)';
  } else {
    interpretacion = 'Hipercalcemia (calcio corregido >10,5 mg/dL)';
  }

  // Nota sobre si la corrección cambió la interpretación
  let nota = '';
  if (ca < 8.5 && calcioCorregido >= 8.5) {
    nota = ' La hipocalcemia aparente era por hipoalbuminemia — calcio real probablemente normal.';
  } else if (ca >= 8.5 && ca <= 10.5 && calcioCorregido > 10.5) {
    nota = ' El calcio total parecía normal pero corregido hay hipercalcemia.';
  }

  const detalle =
    `Ca medido: ${ca} mg/dL | Albúmina: ${alb} g/dL | ` +
    `Corrección: ${correccion >= 0 ? '+' : ''}${correccion.toFixed(1)} mg/dL | ` +
    `Ca corregido: ${calcioCorregido.toFixed(1)} mg/dL | ` +
    `${interpretacion}.${nota}`;

  const caR = Number(calcioCorregido.toFixed(1));
  const esNormal = calcioCorregido >= 8.5 && calcioCorregido <= 10.5;
  const _insight = {
    title: esNormal ? 'Calcio corregido normal' : (calcioCorregido < 8.5 ? 'Hipocalcemia corregida' : 'Hipercalcemia corregida'),
    text: nota
      ? `El calcio total (**${ca} mg/dL**) cambia de categoría al corregir por albúmina: corregido da **${caR} mg/dL**.${nota}`
      : `Con albúmina de **${alb} g/dL**, el calcio corregido es **${caR} mg/dL** (corrección de **${correccion >= 0 ? '+' : ''}${correccion.toFixed(1)} mg/dL** sobre el medido de **${ca} mg/dL**). ${interpretacion}.`,
    tone: esNormal ? 'good' : 'warn',
    icon: '🦴',
  };

  const topMax = Math.max(13, Math.ceil(caR) + 1);
  const _chart = {
    type: 'scale',
    marker: caR,
    markerLabel: caR.toFixed(1) + ' mg/dL',
    min: 6,
    segments: [
      { nombre: 'Hipocalcemia', max: 8.5, color: '#3b82f6', colorDark: '#2563eb' },
      { nombre: 'Normal', max: 10.5, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Hipercalcemia', max: topMax, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Calcio corregido ${caR.toFixed(1)} mg/dL; el rango normal es 8,5 a 10,5 mg/dL.`,
  };

  return {
    calcioCorregido: caR,
    interpretacion: interpretacion + nota,
    detalle,
    _insight,
    _chart,
  };
}
