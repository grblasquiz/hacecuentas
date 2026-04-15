/** ROI (Return On Investment): (ganancia − inversión) / inversión × 100 */
export interface Inputs {
  inversionInicial: number;
  valorFinal: number;
  tiempoAnios?: number;
}
export interface Outputs {
  gananciaNeta: number;
  roi: number;
  roiAnualizado: number;
  multiplo: number;
  veredicto: string;
  resumen: string;
}

export function roiInversion(i: Inputs): Outputs {
  const inv = Number(i.inversionInicial);
  const final = Number(i.valorFinal);
  const anios = Number(i.tiempoAnios) || 1;

  if (!inv || inv <= 0) throw new Error('Ingresá la inversión inicial');
  if (final === undefined || final === null || isNaN(final)) throw new Error('Ingresá el valor final de la inversión');
  if (anios <= 0) throw new Error('El tiempo debe ser mayor a 0');

  const gananciaNeta = final - inv;
  const roi = (gananciaNeta / inv) * 100;
  // ROI anualizado: (1 + ROI)^(1/n) − 1
  const roiAnualizado = (Math.pow(final / inv, 1 / anios) - 1) * 100;
  const multiplo = final / inv;

  let veredicto = '';
  if (roi > 100) veredicto = 'Excelente: duplicaste (o más) tu inversión.';
  else if (roi >= 20) veredicto = 'Muy bueno: rendimiento fuerte, por encima del mercado.';
  else if (roi >= 7) veredicto = 'Aceptable: rinde similar al promedio histórico del S&P 500.';
  else if (roi > 0) veredicto = 'Positivo pero bajo: quizás haya mejores alternativas.';
  else if (roi === 0) veredicto = 'Neutro: ni ganaste ni perdiste.';
  else veredicto = 'Negativo: perdiste dinero con esta inversión.';

  const resumen = `El ROI fue de ${roi.toFixed(2)}% (${roiAnualizado.toFixed(2)}% anualizado en ${anios} año${anios === 1 ? '' : 's'}).`;

  return {
    gananciaNeta: Math.round(gananciaNeta),
    roi: Number(roi.toFixed(2)),
    roiAnualizado: Number(roiAnualizado.toFixed(2)),
    multiplo: Number(multiplo.toFixed(2)),
    veredicto,
    resumen,
  };
}
