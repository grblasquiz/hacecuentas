/** Proporción áurea (número de oro φ): corte áureo de un segmento */
export interface Inputs {
  modo?: string;
  longitud?: number;
  __lang?: string;
}
export interface Outputs {
  segmentoLargo: number;
  segmentoCorto: number;
  total: number;
  ratio: string;
  formula: string;
  _insight?: any;
}

const PHI = (1 + Math.sqrt(5)) / 2; // 1.6180339887...

export function proporcionAureaNumeroOro(i: Inputs): Outputs {
  const modo = String(i.modo || 'total');
  const longitud = Number(i.longitud);

  if (i.longitud === undefined || i.longitud === null || Number.isNaN(longitud)) {
    throw new Error('Ingresá una longitud');
  }
  if (longitud <= 0) throw new Error('La longitud debe ser mayor que 0');

  let largo = 0,
    corto = 0,
    total = 0,
    formula = '';

  if (modo === 'corto') {
    corto = longitud;
    largo = corto * PHI;
    total = largo + corto;
    formula = `a = b × φ = ${longitud} × 1.618034 = ${largo.toFixed(4)}`;
  } else if (modo === 'largo') {
    largo = longitud;
    corto = largo / PHI;
    total = largo + corto;
    formula = `b = a / φ = ${longitud} / 1.618034 = ${corto.toFixed(4)}`;
  } else {
    // total
    total = longitud;
    largo = total / PHI;
    corto = total - largo;
    formula = `a = L / φ = ${longitud} / 1.618034 = ${largo.toFixed(4)}`;
  }

  const ratio = `${(largo / corto).toFixed(7)} (= φ) · total/largo = ${(total / largo).toFixed(7)} (= φ también)`;

  return {
    segmentoLargo: Number(largo.toFixed(4)),
    segmentoCorto: Number(corto.toFixed(4)),
    total: Number(total.toFixed(4)),
    ratio,
    formula,
    _insight: {
      title: 'Qué te dice el resultado',
      text: `El corte áureo divide el total de **${Number(total.toFixed(4)).toLocaleString('es-AR')}** en **${Number(largo.toFixed(4)).toLocaleString('es-AR')}** (segmento largo, el 61.8%) y **${Number(corto.toFixed(4)).toLocaleString('es-AR')}** (segmento corto, el 38.2%). La gracia de φ: largo/corto y total/largo dan exactamente la misma proporción, 1.6180339887.`,
      tone: 'neutral',
      icon: '🌀',
    },
  };
}
