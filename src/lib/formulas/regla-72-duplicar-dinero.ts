/** Regla del 72: años para duplicar tu dinero según tasa anual compuesta */
export interface Inputs {
  tasaAnual: number; // %
  capital?: number;
}
export interface Outputs {
  aniosDuplicar: number;
  aniosExacto: number;
  aniosTriplicar: number;
  aniosCuadruplicar: number;
  capitalFinal: number;
  resumen: string;
  _chart?: any;
}

export function regla72DuplicarDinero(i: Inputs): Outputs {
  const tasa = Number(i.tasaAnual);
  const capital = Number(i.capital) || 1000;

  if (!tasa || tasa <= 0) throw new Error('Ingresá una tasa anual positiva');
  if (tasa > 100) throw new Error('La tasa parece demasiado alta, revisá el valor');
  if (capital < 0) throw new Error('El capital no puede ser negativo');

  const aniosDuplicar = 72 / tasa;
  // Fórmula exacta: ln(2) / ln(1 + r)
  const aniosExacto = Math.log(2) / Math.log(1 + tasa / 100);
  const aniosTriplicar = Math.log(3) / Math.log(1 + tasa / 100);
  const aniosCuadruplicar = aniosExacto * 2; // duplicar dos veces
  const capitalFinal = capital * 2;

  const resumen = `A una tasa del ${tasa}% anual compuesto, tu dinero se duplica en aproximadamente ${aniosDuplicar.toFixed(1)} años (regla del 72).`;

  // Serie de crecimiento año a año (25 años, o hasta cuadruplicar + 5)
  const horizonte = Math.min(30, Math.max(25, Math.ceil(aniosCuadruplicar) + 4));
  const labels = Array.from({ length: horizonte + 1 }, (_, k) => `Año ${k}`);
  const data = labels.map((_, k) => Math.round(capital * Math.pow(1 + tasa / 100, k)));
  const chart = {
    type: 'line' as const,
    ariaLabel: `Gráfico de crecimiento del capital: desde ${capital.toLocaleString('es-AR')} en año 0 hasta ${data[horizonte].toLocaleString('es-AR')} en año ${horizonte}, a una tasa del ${tasa}% anual compuesto.`,
    data: {
      labels,
      datasets: [
        {
          label: 'Capital acumulado',
          data,
          fill: true,
          tension: 0.25,
        },
      ],
    },
  };

  return {
    aniosDuplicar: Number(aniosDuplicar.toFixed(2)),
    aniosExacto: Number(aniosExacto.toFixed(2)),
    aniosTriplicar: Number(aniosTriplicar.toFixed(2)),
    aniosCuadruplicar: Number(aniosCuadruplicar.toFixed(2)),
    capitalFinal: Math.round(capitalFinal),
    resumen,
    _chart: chart,
  };
}
