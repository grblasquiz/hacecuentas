/** Predicción de tiempo de carrera — fórmula de Riegel */
export interface Inputs { distanciaActualKm: number; tiempoActualMin: number; distanciaObjetivoKm: number; }
export interface Outputs {
  tiempoPredichoMin: number;
  tiempoPredichoFormato: string;
  pacePredicho: string;
  pacePredichoKmH: number;
}

export function prediccionMaraton(i: Inputs): Outputs {
  const dAct = Number(i.distanciaActualKm);
  const tAct = Number(i.tiempoActualMin);
  const dObj = Number(i.distanciaObjetivoKm);
  if (!dAct || dAct <= 0) throw new Error('Ingresá la distancia actual');
  if (!tAct || tAct <= 0) throw new Error('Ingresá el tiempo actual');
  if (!dObj || dObj <= 0) throw new Error('Ingresá la distancia objetivo');

  // Riegel: T2 = T1 × (D2 / D1)^1.06
  const tPred = tAct * Math.pow(dObj / dAct, 1.06);
  const paceMin = tPred / dObj;
  const paceKmh = dObj / (tPred / 60);

  const horas = Math.floor(tPred / 60);
  const mins = Math.floor(tPred % 60);
  const segs = Math.round((tPred - Math.floor(tPred)) * 60);
  const fmt = horas > 0
    ? `${horas}h ${String(mins).padStart(2, '0')}m ${String(segs).padStart(2, '0')}s`
    : `${mins}m ${String(segs).padStart(2, '0')}s`;

  const mm = Math.floor(paceMin);
  const ss = Math.round((paceMin - mm) * 60);

  return {
    tiempoPredichoMin: Number(tPred.toFixed(2)),
    tiempoPredichoFormato: fmt,
    pacePredicho: `${mm}:${String(ss).padStart(2, '0')} min/km`,
    pacePredichoKmH: Number(paceKmh.toFixed(2)),
  };
}
