/**
 * Calculadora de ISO invariance por modelo de cámara
 */

export interface Inputs {
  modelo: number;
}

export interface Outputs {
  isoInvariancePoint: string; estrategia: string; dynamicRange: string;
}

export function isoInvarianceCamaraModelo(inputs: Inputs): Outputs {
  const m = Math.round(Number(inputs.modelo));
  const datos: Record<number, { iso: string; dr: string; note: string }> = {
    1: { iso: 'ISO 640', dr: '14.7 stops', note: 'Invariant moderno. ETTR a ISO 100-640, push en Lightroom sin penalidad.' },
    2: { iso: 'ISO 640', dr: '15.0 stops', note: 'Máximo DR de la industria. Disparar ISO 100 siempre que puedas, push 4+ stops posible.' },
    3: { iso: 'ISO 800', dr: '14.6 stops', note: 'Canon R5/R6 modernos son invariant desde 800. Antes usá ISO nativo.' },
    4: { iso: 'ISO 800', dr: '14.3 stops', note: 'Nikon Z modernos: ETTR y push sin pérdida desde ISO base hasta 800.' },
    5: { iso: 'ISO 640', dr: '13.8 stops', note: 'Fuji X-Trans: invariant desde ISO 640. Perfiles de color Fuji se benefician de ISO nativo.' },
    6: { iso: 'No invariant / ISO 3200 parcial', dr: '11.7 stops', note: 'Cámara Canon vieja: subí ISO en cámara, evitá push masivo en post.' },
    7: { iso: 'ISO 400', dr: '14.8 stops', note: 'D850: uno de los mejores sensores. Invariant temprano, push extrema posible.' },
    8: { iso: 'Depende modelo', dr: 'Ver DxOMark', note: 'Revisá el modelo en Photons to Photos o DxOMark.' },
  };
  const d = datos[m] || datos[8];
  return {
    isoInvariancePoint: d.iso,
    estrategia: d.note,
    dynamicRange: d.dr,
  };
}
