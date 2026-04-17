/** Espresso TDS yield */
export interface Inputs { dosisIn: number; yieldOut: number; tiempoExtraccion: number; tdsMedido?: number; }
export interface Outputs { ratio: string; tipoEspresso: string; extractionYield: number; evaluacion: string; recomendacion: string; }

export function espressoTdsYield(i: Inputs): Outputs {
  const d = Number(i.dosisIn);
  const y = Number(i.yieldOut);
  const t = Number(i.tiempoExtraccion);
  const tds = Number(i.tdsMedido) || 0;
  if (!d || d <= 0) throw new Error('Ingresá dosis');
  if (!y || y <= 0) throw new Error('Ingresá yield');
  if (!t) throw new Error('Ingresá tiempo');

  const ratio = y / d;
  const ratioStr = `1:${ratio.toFixed(2)}`;

  let tipo = '';
  if (ratio < 1.2) tipo = 'Ristretto intenso';
  else if (ratio < 1.6) tipo = 'Ristretto';
  else if (ratio < 2.3) tipo = 'Normale / Espresso estándar';
  else if (ratio < 3.2) tipo = 'Lungo';
  else tipo = 'Americano-like';

  const ey = tds > 0 ? (tds * y / d) : 0;

  let eval_ = '';
  if (t < 20) eval_ = 'Sub-extracción por tiempo';
  else if (t > 35) eval_ = 'Sobre-extracción por tiempo';
  else eval_ = 'Tiempo en rango ideal';

  let rec = '';
  if (ey > 0) {
    if (ey < 18) rec = 'EY bajo — moler más fino o aumentar dosis.';
    else if (ey > 22) rec = 'EY alto — moler más grueso o bajar temperatura.';
    else rec = 'EY en rango ideal SCA (18-22%).';
  } else if (t < 22) {
    rec = 'Tiempo rápido — moler más fino.';
  } else if (t > 32) {
    rec = 'Tiempo lento — moler más grueso.';
  } else {
    rec = 'Parámetros balanceados. Probá distintos ratios para ajustar al gusto.';
  }

  return {
    ratio: ratioStr,
    tipoEspresso: tipo,
    extractionYield: Number(ey.toFixed(1)),
    evaluacion: eval_,
    recomendacion: rec,
  };
}
