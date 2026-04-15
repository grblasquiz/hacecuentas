/** Corrección de calcio sérico por albúmina (Payne, 1973) */
export interface Inputs {
  calcioMedido: number;
  albumina: number;
}
export interface Outputs {
  calcioCorregido: number;
  interpretacion: string;
  detalle: string;
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

  return {
    calcioCorregido: Number(calcioCorregido.toFixed(1)),
    interpretacion: interpretacion + nota,
    detalle,
  };
}
