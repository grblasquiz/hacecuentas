/** Calculadora de Lentes — 1/f = 1/do + 1/di */
export interface Inputs { distanciaFocal?: number; distanciaObjeto?: number; distanciaImagen?: number; }
export interface Outputs { resultado: string; magnificacion: number; tipoImagen: string; formula: string; }

export function lenteDistanciaFocal(i: Inputs): Outputs {
  const f = i.distanciaFocal != null && i.distanciaFocal !== 0 ? Number(i.distanciaFocal) : null;
  const doVal = i.distanciaObjeto != null && i.distanciaObjeto !== 0 ? Number(i.distanciaObjeto) : null;
  const di = i.distanciaImagen != null && i.distanciaImagen !== 0 ? Number(i.distanciaImagen) : null;
  const filled = [f, doVal, di].filter(x => x !== null).length;
  if (filled < 2) throw new Error('Ingresá al menos dos de los tres valores');

  let fOut: number, doOut: number, diOut: number;
  if (f === null) {
    doOut = doVal!; diOut = di!;
    fOut = 1 / (1 / doOut + 1 / diOut);
  } else if (doVal === null) {
    fOut = f; diOut = di!;
    const inv = 1 / fOut - 1 / diOut;
    if (inv === 0) throw new Error('El objeto estaría en el infinito');
    doOut = 1 / inv;
  } else if (di === null) {
    fOut = f; doOut = doVal;
    const inv = 1 / fOut - 1 / doOut;
    if (inv === 0) throw new Error('La imagen se forma en el infinito (objeto en el foco)');
    diOut = 1 / inv;
  } else {
    fOut = f; doOut = doVal; diOut = di;
  }

  const M = -diOut / doOut;
  let tipo = '';
  if (diOut > 0) tipo = M < 0 ? 'Real, invertida' : 'Real, derecha';
  else tipo = M > 0 ? 'Virtual, derecha' : 'Virtual, invertida';
  tipo += `, tamaño ${Math.abs(M).toFixed(2)}× el original`;

  return {
    resultado: `f = ${fOut.toFixed(2)} cm, do = ${doOut.toFixed(2)} cm, di = ${diOut.toFixed(2)} cm`,
    magnificacion: Number(M.toFixed(4)),
    tipoImagen: tipo,
    formula: `1/${fOut.toFixed(2)} = 1/${doOut.toFixed(2)} + 1/${diOut.toFixed(2)}`,
  };
}
