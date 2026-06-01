/**
 * Calculadora de interés compuesto (con aportes mensuales y frecuencia de capitalización)
 * Fórmula: VF = VP × (1 + i)^n  ·  con aportes: VF = VP(1+i)^n + PMT × ((1+i)^n - 1)/i
 * `i` es la tasa MENSUAL equivalente derivada de la frecuencia de capitalización elegida.
 */

export interface InteresInputs {
  capitalInicial: number;
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
  /** Frecuencia de capitalización: 'mensual' (default) | 'diaria' | 'trimestral' | 'semestral' | 'anual'. */
  frecuenciaCapitalizacion?: string;
  __lang?: string;
}

export interface InteresOutputs {
  valorFinal: number;
  totalAportado: number;
  gananciaIntereses: number;
  rendimiento: string;
  tasaMensual: string;
  _chart?: any;
  _table?: any;
}

// Períodos de capitalización por año según frecuencia.
const PERIODOS_POR_ANIO: Record<string, number> = {
  diaria: 365,
  mensual: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};

const fmtAR = (x: number): string => '$' + Math.round(x).toLocaleString('es-AR');

export function interesCompuesto(inputs: InteresInputs): InteresOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorCapitalNegativo: 'El capital inicial no puede ser negativo',
      errorCapitalOAporte: 'Ingresá un capital inicial o un aporte mensual',
      errorTasa: 'Ingresá una tasa anual positiva',
      errorPlazo: 'Ingresá un plazo en años',
      labelValorAcumulado: 'Valor acumulado',
      labelTotalAportado: 'Total aportado',
      tableTitle: 'Evolución año por año',
      headerAnio: 'Año',
      headerValorAcumulado: 'Valor acumulado',
      headerTotalAportado: 'Total aportado',
      headerInteresGanado: 'Interés ganado',
      tableFooterLabel: 'Final',
      tableNote: 'Proyección con aporte mensual constante. Valores nominales (no ajustados por inflación).',
    },
    en: {
      errorCapitalNegativo: 'Initial capital cannot be negative',
      errorCapitalOAporte: 'Enter an initial capital or a monthly contribution',
      errorTasa: 'Enter a positive annual rate',
      errorPlazo: 'Enter a term in years',
      labelValorAcumulado: 'Accumulated value',
      labelTotalAportado: 'Total contributed',
      tableTitle: 'Year-by-year evolution',
      headerAnio: 'Year',
      headerValorAcumulado: 'Accumulated value',
      headerTotalAportado: 'Total contributed',
      headerInteresGanado: 'Interest earned',
      tableFooterLabel: 'Final',
      tableNote: 'Projection with constant monthly contributions. Nominal values (not adjusted for inflation).',
    },
  } as const)[__lang];

  const capital = Number(inputs.capitalInicial) || 0;
  const aporte = Number(inputs.aporteMensual) || 0;
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);
  // Campo opcional: '' / ausente → mensual (comportamiento histórico de la calc).
  const freqRaw = inputs.frecuenciaCapitalizacion;
  const freq = freqRaw === '' || freqRaw === null || freqRaw === undefined ? 'mensual' : String(freqRaw);
  const m = PERIODOS_POR_ANIO[freq] ?? 12;

  if (capital < 0) throw new Error(T.errorCapitalNegativo);
  if (capital === 0 && aporte === 0) throw new Error(T.errorCapitalOAporte);
  if (!tasaAnual || tasaAnual <= 0) throw new Error(T.errorTasa);
  if (!anios || anios <= 0) throw new Error(T.errorPlazo);

  // Tasa MENSUAL equivalente a la frecuencia de capitalización elegida.
  // Con frecuencia mensual (m=12) ⇒ i = tasaAnual/100/12 (idéntico a la versión previa).
  const r = tasaAnual / 100;
  const ratePerPeriod = r / m;
  const i = Math.pow(1 + ratePerPeriod, m / 12) - 1;
  const n = anios * 12;
  const factor = Math.pow(1 + i, n);

  const vfCapital = capital * factor;
  const vfAportes = i === 0 ? aporte * n : aporte * ((factor - 1) / i);
  const valorFinal = vfCapital + vfAportes;

  const totalAportado = capital + aporte * n;
  const gananciaIntereses = valorFinal - totalAportado;
  // Formato amigable: para rendimientos grandes, expresar como multiplicador ×N
  // en vez de porcentaje con miles de dígitos ("x346" es más intuitivo que "34485%").
  const rendimientoPct = (gananciaIntereses / totalAportado) * 100;
  const multiplicador = valorFinal / totalAportado;
  let rendimientoLabel: string;
  if (rendimientoPct >= 1000) {
    rendimientoLabel = __lang === 'en'
      ? `×${multiplicador.toFixed(1)} your capital (${Math.round(rendimientoPct).toLocaleString('es-AR')}%)`
      : `×${multiplicador.toFixed(1)} tu capital (${Math.round(rendimientoPct).toLocaleString('es-AR')}%)`;
  } else if (rendimientoPct >= 100) {
    rendimientoLabel = `${Math.round(rendimientoPct)}% (×${multiplicador.toFixed(2)})`;
  } else {
    rendimientoLabel = `${rendimientoPct.toFixed(2)}%`;
  }

  // Serie anual: valor acumulado vs total aportado (para el gráfico y la tabla).
  const labels = Array.from({ length: anios + 1 }, (_, k) =>
    __lang === 'en' ? `Year ${k}` : `Año ${k}`
  );
  const serieValor: number[] = [];
  const serieAportado: number[] = [];
  const tableRows: string[][] = [];
  for (let k = 0; k <= anios; k++) {
    const nK = k * 12;
    const factorK = Math.pow(1 + i, nK);
    const vfK = capital * factorK + (i === 0 ? aporte * nK : aporte * ((factorK - 1) / i));
    const aportadoK = capital + aporte * nK;
    serieValor.push(Math.round(vfK));
    serieAportado.push(Math.round(aportadoK));
    if (k >= 1) {
      tableRows.push([`${k}`, fmtAR(vfK), fmtAR(aportadoK), fmtAR(Math.max(0, vfK - aportadoK))]);
    }
  }

  const chart = {
    type: 'line' as const,
    ariaLabel: __lang === 'en'
      ? `Capital evolution over ${anios} years: final value of ${Math.round(valorFinal).toLocaleString('es-AR')} vs total contributed of ${Math.round(totalAportado).toLocaleString('es-AR')}.`
      : `Evolución del capital durante ${anios} años: valor final de ${Math.round(valorFinal).toLocaleString('es-AR')} vs total aportado de ${Math.round(totalAportado).toLocaleString('es-AR')}.`,
    data: {
      labels,
      datasets: [
        {
          label: T.labelValorAcumulado,
          data: serieValor,
          fill: true,
          tension: 0.25,
        },
        {
          label: T.labelTotalAportado,
          data: serieAportado,
          fill: false,
          dashed: true,
          tension: 0.15,
        },
      ],
    },
  };

  const table = {
    title: T.tableTitle,
    headers: [T.headerAnio, T.headerValorAcumulado, T.headerTotalAportado, T.headerInteresGanado],
    align: ['left', 'right', 'right', 'right'],
    rows: tableRows,
    collapseAfter: 10,
    emphasisEvery: 5,
    footer: [T.tableFooterLabel, fmtAR(valorFinal), fmtAR(totalAportado), fmtAR(Math.max(0, gananciaIntereses))],
    note: T.tableNote,
  };

  return {
    valorFinal: Math.round(valorFinal),
    totalAportado: Math.round(totalAportado),
    gananciaIntereses: Math.round(gananciaIntereses),
    rendimiento: rendimientoLabel,
    tasaMensual: `${(i * 100).toFixed(2)}%`,
    _chart: chart,
    _table: table,
  };
}
