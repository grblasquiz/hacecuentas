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
  _chart?: any;
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
  // Guard: Math.pow(negative, fractional) returns NaN — use simple average annual loss instead
  const roiAnualizado = final / inv < 0
    ? ((final - inv) / inv) * 100 / anios
    : (Math.pow(final / inv, 1 / anios) - 1) * 100;
  const multiplo = final / inv;

  let veredicto = '';
  if (roi > 100) veredicto = 'Excelente: duplicaste (o más) tu inversión.';
  else if (roi >= 20) veredicto = 'Muy bueno: rendimiento fuerte, por encima del mercado.';
  else if (roi >= 7) veredicto = 'Aceptable: rinde similar al promedio histórico del S&P 500.';
  else if (roi > 0) veredicto = 'Positivo pero bajo: quizás haya mejores alternativas.';
  else if (roi === 0) veredicto = 'Neutro: ni ganaste ni perdiste.';
  else veredicto = 'Negativo: perdiste dinero con esta inversión.';

  const resumen = `El ROI fue de ${roi.toFixed(2)}% (${roiAnualizado.toFixed(2)}% anualizado en ${anios} año${anios === 1 ? '' : 's'}).`;

  // Chart: ROI acumulado por año asumiendo crecimiento constante = roiAnualizado
  // (proyección teórica — representa cómo sería el retorno si se repartiera parejo)
  const rAnual = roiAnualizado / 100;
  const yearsToShow = Math.max(1, Math.min(Math.ceil(anios), 20));
  const labels: string[] = [];
  const roiAcum: number[] = [];
  for (let y = 1; y <= yearsToShow; y++) {
    labels.push(`Año ${y}`);
    const roiY = (Math.pow(1 + rAnual, y) - 1) * 100;
    roiAcum.push(Number(roiY.toFixed(2)));
  }
  const chart = {
    type: 'bar' as const,
    ariaLabel: `ROI acumulado proyectado al ${roiAnualizado.toFixed(2)}% anualizado durante ${yearsToShow} año${yearsToShow === 1 ? '' : 's'}.`,
    data: {
      labels,
      datasets: [
        {
          label: 'ROI acumulado',
          data: roiAcum,
          suffix: '%',
        },
      ],
    },
  };

  return {
    gananciaNeta: Math.round(gananciaNeta),
    roi: Number(roi.toFixed(2)),
    roiAnualizado: Number(roiAnualizado.toFixed(2)),
    multiplo: Number(multiplo.toFixed(2)),
    veredicto,
    resumen,
    _chart: chart,
  };
}
