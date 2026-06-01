/** Regla del 72: años para duplicar tu dinero según tasa anual compuesta */
export interface Inputs {
  tasaAnual: number; // %
  capital?: number;
  __lang?: string;
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
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tasa = Number(i.tasaAnual);
  const capital = Number(i.capital) || 1000;

  if (!tasa || tasa <= 0) throw new Error(__lang === 'en' ? 'Enter a positive annual rate' : 'Ingresá una tasa anual positiva');
  if (tasa > 100) throw new Error(__lang === 'en' ? 'The rate seems too high, please check the value' : 'La tasa parece demasiado alta, revisá el valor');
  if (capital < 0) throw new Error(__lang === 'en' ? 'Capital cannot be negative' : 'El capital no puede ser negativo');

  const aniosDuplicar = 72 / tasa;
  // Fórmula exacta: ln(2) / ln(1 + r)
  const aniosExacto = Math.log(2) / Math.log(1 + tasa / 100);
  const aniosTriplicar = Math.log(3) / Math.log(1 + tasa / 100);
  const aniosCuadruplicar = aniosExacto * 2; // duplicar dos veces
  const capitalFinal = capital * 2;

  const resumen = __lang === 'en'
    ? `At a rate of ${tasa}% annual compound, your money doubles in approximately ${aniosDuplicar.toFixed(1)} years (rule of 72).`
    : `A una tasa del ${tasa}% anual compuesto, tu dinero se duplica en aproximadamente ${aniosDuplicar.toFixed(1)} años (regla del 72).`;

  // Serie de crecimiento año a año (25 años, o hasta cuadruplicar + 5)
  const horizonte = Math.min(30, Math.max(25, Math.ceil(aniosCuadruplicar) + 4));
  const labels = Array.from({ length: horizonte + 1 }, (_, k) => __lang === 'en' ? `Year ${k}` : `Año ${k}`);
  const data = labels.map((_, k) => Math.round(capital * Math.pow(1 + tasa / 100, k)));
  const chart = {
    type: 'line' as const,
    ariaLabel: __lang === 'en'
      ? `Capital growth chart: from ${capital.toLocaleString('en-US')} in year 0 to ${data[horizonte].toLocaleString('en-US')} in year ${horizonte}, at a rate of ${tasa}% annual compound.`
      : `Gráfico de crecimiento del capital: desde ${capital.toLocaleString('es-AR')} en año 0 hasta ${data[horizonte].toLocaleString('es-AR')} en año ${horizonte}, a una tasa del ${tasa}% anual compuesto.`,
    data: {
      labels,
      datasets: [
        {
          label: __lang === 'en' ? 'Accumulated capital' : 'Capital acumulado',
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
