/**
 * Calculadora de interés compuesto (con aportes mensuales y frecuencia de capitalización)
 * Fórmula: VF = VP × (1 + i)^n  ·  con aportes: VF = VP(1+i)^n + PMT × ((1+i)^n - 1)/i
 * `i` es la tasa MENSUAL equivalente derivada de la frecuencia de capitalización elegida.
 *
 * Devuelve:
 *  - outputs numéricos (valorFinal, totalAportado, gananciaIntereses, rendimiento, tasaMensual)
 *  - _charts: dos vistas en tabs → "Evolución" (line) y "Desglose" (donut capital/aportes/interés)
 *  - _insight: narrativa dinámica (proporción interés, año de cruce, y poder de compra real si hay inflación)
 *  - _table: evolución año por año
 */

export interface InteresInputs {
  capitalInicial: number;
  aporteMensual: number;
  tasaAnual: number; // %
  plazoAnios: number;
  /** Frecuencia de capitalización: 'mensual' (default) | 'diaria' | 'trimestral' | 'semestral' | 'anual'. */
  frecuenciaCapitalizacion?: string;
  /** Inflación anual esperada (%). Opcional: si se ingresa, calcula poder de compra real. */
  inflacionAnual?: number;
  aporteExtraordinarioAnual?: number;
  comisionAnual?: number;
  impuestoGanancia?: number;
  __lang?: string;
}

export interface InteresOutputs {
  valorFinal: number;
  totalAportado: number;
  gananciaIntereses: number;
  rendimiento: string;
  tasaMensual: string;
  _charts?: any[];
  _insight?: any;
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
      tabEvolucion: 'Evolución',
      tabDesglose: 'De dónde sale',
      sliceCapital: 'Capital inicial',
      sliceAportes: 'Aportes',
      sliceInteres: 'Interés compuesto',
      centerLabel: 'Valor final',
      insightTitleGood: 'El interés hace el trabajo pesado',
      insightTitlePlain: 'Tu capital crece',
      insightTitleWarn: 'Ojo: la inflación se come la ganancia',
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
      tabEvolucion: 'Growth',
      tabDesglose: 'Breakdown',
      sliceCapital: 'Initial capital',
      sliceAportes: 'Contributions',
      sliceInteres: 'Compound interest',
      centerLabel: 'Final value',
      insightTitleGood: 'Interest does the heavy lifting',
      insightTitlePlain: 'Your capital grows',
      insightTitleWarn: 'Watch out: inflation eats the gains',
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
  // Inflación opcional: '' / null / undefined / 0 → sin capa de poder de compra.
  const inflRaw = inputs.inflacionAnual;
  const inflacion = inflRaw === '' || inflRaw === null || inflRaw === undefined ? 0 : Number(inflRaw) || 0;
  const aporteExtra = Math.max(0, Number(inputs.aporteExtraordinarioAnual) || 0);
  const comision = Math.max(0, Number(inputs.comisionAnual) || 0);
  const impuesto = Math.max(0, Math.min(100, Number(inputs.impuestoGanancia) || 0));

  if (capital < 0) throw new Error(T.errorCapitalNegativo);
  if (capital === 0 && aporte === 0) throw new Error(T.errorCapitalOAporte);
  if (!tasaAnual || tasaAnual <= 0) throw new Error(T.errorTasa);
  if (!anios || anios <= 0) throw new Error(T.errorPlazo);

  // Tasa MENSUAL equivalente a la frecuencia de capitalización elegida.
  // Con frecuencia mensual (m=12) ⇒ i = tasaAnual/100/12 (idéntico a la versión previa).
  const r = Math.max(-0.99, tasaAnual / 100 - comision / 100);
  const ratePerPeriod = r / m;
  const i = Math.pow(1 + ratePerPeriod, m / 12) - 1;
  const n = anios * 12;
  const factor = Math.pow(1 + i, n);

  const vfCapital = capital * factor;
  const vfAportes = i === 0 ? aporte * n : aporte * ((factor - 1) / i);
  let vfExtras = 0;
  for (let mesExtra = 12; mesExtra <= n; mesExtra += 12) {
    vfExtras += aporteExtra * Math.pow(1 + i, n - mesExtra);
  }
  const cantidadExtras = Math.floor(n / 12);
  const totalAportado = capital + aporte * n + aporteExtra * cantidadExtras;
  const valorBruto = vfCapital + vfAportes + vfExtras;
  const impuestoEstimado = Math.max(0, valorBruto - totalAportado) * impuesto / 100;
  const valorFinal = valorBruto - impuestoEstimado;
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
  // De paso detectamos el "año de cruce": el primer año en que el interés generado
  // EN ESE AÑO supera el aporte anual (tu plata empieza a trabajar más que vos).
  const labels = Array.from({ length: anios + 1 }, (_, k) =>
    __lang === 'en' ? `Year ${k}` : `Año ${k}`
  );
  const serieValor: number[] = [];
  const serieAportado: number[] = [];
  const tableRows: string[][] = [];
  const aporteAnual = aporte * 12;
  let crossYear = 0;
  let prevVf = capital;
  for (let k = 0; k <= anios; k++) {
    const nK = k * 12;
    const factorK = Math.pow(1 + i, nK);
    let extrasK = 0;
    for (let mesExtra = 12; mesExtra <= nK; mesExtra += 12) extrasK += aporteExtra * Math.pow(1 + i, nK - mesExtra);
    const aportadoK = capital + aporte * nK + aporteExtra * Math.floor(nK / 12);
    const brutoK = capital * factorK + (i === 0 ? aporte * nK : aporte * ((factorK - 1) / i)) + extrasK;
    const vfK = brutoK - Math.max(0, brutoK - aportadoK) * impuesto / 100;
    serieValor.push(Math.round(vfK));
    serieAportado.push(Math.round(aportadoK));
    if (k >= 1) {
      const interesAnioK = vfK - prevVf - aporteAnual - aporteExtra;
      if (crossYear === 0 && aporteAnual > 0 && interesAnioK > aporteAnual) crossYear = k;
      tableRows.push([`${k}`, fmtAR(vfK), fmtAR(aportadoK), fmtAR(Math.max(0, vfK - aportadoK))]);
    }
    prevVf = vfK;
  }

  // ── Vista 1: evolución (line) ────────────────────────────────
  const chartEvolucion = {
    type: 'line' as const,
    tabLabel: T.tabEvolucion,
    ariaLabel: __lang === 'en'
      ? `Capital evolution over ${anios} years: final value of ${Math.round(valorFinal).toLocaleString('es-AR')} vs total contributed of ${Math.round(totalAportado).toLocaleString('es-AR')}.`
      : `Evolución del capital durante ${anios} años: valor final de ${Math.round(valorFinal).toLocaleString('es-AR')} vs total aportado de ${Math.round(totalAportado).toLocaleString('es-AR')}.`,
    data: {
      labels,
      datasets: [
        { label: T.labelValorAcumulado, data: serieValor, fill: true, tension: 0.25 },
        { label: T.labelTotalAportado, data: serieAportado, fill: false, dashed: true, tension: 0.15 },
      ],
    },
  };

  // ── Vista 2: desglose (donut) — las slices SUMAN el valor final ──
  const sliceData = [
    { label: T.sliceCapital, value: Math.round(capital) },
    { label: T.sliceAportes, value: Math.round(aporte * n + aporteExtra * cantidadExtras) },
    { label: T.sliceInteres, value: Math.round(Math.max(0, gananciaIntereses)) },
  ];
  const chartDesglose = {
    type: 'doughnut' as const,
    tabLabel: T.tabDesglose,
    prefix: '$',
    slices: sliceData,
    centerValue: fmtAR(valorFinal),
    centerLabel: T.centerLabel,
    ariaLabel: __lang === 'en'
      ? `Final value breakdown: ${sliceData.map((s) => `${s.label} ${s.value.toLocaleString('es-AR')}`).join(', ')}.`
      : `Desglose del valor final: ${sliceData.map((s) => `${s.label} ${s.value.toLocaleString('es-AR')}`).join(', ')}.`,
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

  // ── Insight narrativo dinámico ───────────────────────────────
  const pctInteres = valorFinal > 0 ? Math.round((gananciaIntereses / valorFinal) * 100) : 0;
  const partes: string[] = [];
  if (pctInteres >= 50) {
    partes.push(__lang === 'en'
      ? `Of every $100 you end up with, **$${pctInteres}** is interest and only **$${100 - pctInteres}** came out of your pocket.`
      : `De cada $100 que terminás teniendo, **$${pctInteres}** son interés y solo **$${100 - pctInteres}** salieron de tu bolsillo.`);
  } else {
    partes.push(__lang === 'en'
      ? `Interest makes up **${pctInteres}%** of the final value — the rest is what you put in.`
      : `El interés representa el **${pctInteres}%** del valor final — el resto es lo que vos pusiste.`);
  }
  if (crossYear > 0) {
    partes.push(__lang === 'en'
      ? `From **year ${crossYear}** on, what you earn in interest each year is more than what you contribute.`
      : `A partir del **año ${crossYear}**, lo que ganás en intereses cada año supera lo que aportás.`);
  }
  if (aporteExtra > 0) partes.push(`Incluimos **${fmtAR(aporteExtra)} por año** de aportes extraordinarios.`);
  if (comision > 0) partes.push(`La proyección descuenta una comisión anual de **${comision}%** de la tasa ingresada.`);
  if (impuesto > 0) partes.push(`Al final se descuentan **${fmtAR(impuestoEstimado)}** de impuestos estimados sobre la ganancia.`);

  let tone: 'good' | 'warn' | 'neutral' = pctInteres >= 50 ? 'good' : 'neutral';
  let icon = pctInteres >= 50 ? '🚀' : '📈';
  let insightTitle = pctInteres >= 50 ? T.insightTitleGood : T.insightTitlePlain;

  // Capa de poder de compra real (si hay inflación)
  if (inflacion > 0) {
    const factorInfl = Math.pow(1 + inflacion / 100, anios);
    const valorReal = valorFinal / factorInfl;
    const tasaReal = ((1 + r) / (1 + inflacion / 100) - 1) * 100;
    if (tasaReal < 0) {
      tone = 'warn';
      icon = '⚠️';
      insightTitle = T.insightTitleWarn;
      partes.push(__lang === 'en'
        ? `With **${inflacion}%** annual inflation your real rate is **${tasaReal.toFixed(1)}%** (negative): the nominal balance grows, but you lose purchasing power. In today's money those ${fmtAR(valorFinal)} are worth about **${fmtAR(valorReal)}** — less than the ${fmtAR(totalAportado)} you put in.`
        : `Con inflación del **${inflacion}%** anual tu tasa real es **${tasaReal.toFixed(1)}%** (negativa): el saldo nominal crece, pero perdés poder de compra. En pesos de hoy esos ${fmtAR(valorFinal)} equivalen a unos **${fmtAR(valorReal)}** — menos que los ${fmtAR(totalAportado)} que aportaste.`);
    } else {
      partes.push(__lang === 'en'
        ? `In today's money (after **${inflacion}%** inflation, real rate **+${tasaReal.toFixed(1)}%**), your result is worth about **${fmtAR(valorReal)}** of real purchasing power.`
        : `En pesos de hoy (descontando inflación del **${inflacion}%**, tasa real **+${tasaReal.toFixed(1)}%**), tu resultado equivale a unos **${fmtAR(valorReal)}** de poder de compra real.`);
    }
  }

  const insight = { title: insightTitle, text: partes.join(' '), tone, icon };

  return {
    valorFinal: Math.round(valorFinal),
    totalAportado: Math.round(totalAportado),
    gananciaIntereses: Math.round(gananciaIntereses),
    rendimiento: rendimientoLabel,
    tasaMensual: `${(i * 100).toFixed(2)}%`,
    _charts: [chartEvolucion, chartDesglose],
    _insight: insight,
    _table: table,
  };
}

/**
 * Cronograma año a año: aportes del año, interés generado en el año y saldo
 * al cierre. Complementa el _table (que muestra acumulados) con los deltas
 * período a período + descarga CSV. Contrato A4 (Calculator.astro).
 * Números formateados es-AR. Devuelve null si los inputs no son válidos.
 */
export function schedule(
  inputs: InteresInputs
): { headers: string[]; rows: (string | number)[][] } | null {
  const capital = Number(inputs.capitalInicial) || 0;
  const aporte = Number(inputs.aporteMensual) || 0;
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);
  if (capital < 0 || (capital === 0 && aporte === 0) || !tasaAnual || tasaAnual <= 0 || !anios || anios <= 0)
    return null;

  const freqRaw = inputs.frecuenciaCapitalizacion;
  const freq = freqRaw === '' || freqRaw === null || freqRaw === undefined ? 'mensual' : String(freqRaw);
  const m = PERIODOS_POR_ANIO[freq] ?? 12;
  const r = tasaAnual / 100;
  const iMes = Math.pow(1 + r / m, m / 12) - 1;

  const lang = inputs.__lang === 'en' ? 'en' : inputs.__lang === 'pt' ? 'pt' : 'es';
  const headers =
    lang === 'en' ? ['Year', 'Yearly contributions', 'Yearly interest', 'Balance'] :
    lang === 'pt' ? ['Ano', 'Aportes do ano', 'Juros do ano', 'Saldo'] :
    ['Año', 'Aportes del año', 'Interés del año', 'Saldo'];

  const f = (x: number) => Math.round(x).toLocaleString('es-AR');
  const rows: (string | number)[][] = [];
  const years = Math.min(Math.round(anios), 60);
  const aporteAnual = aporte * 12;
  let prevVf = capital;
  for (let k = 1; k <= years; k++) {
    const nK = k * 12;
    const factorK = Math.pow(1 + iMes, nK);
    const vfK = capital * factorK + (iMes === 0 ? aporte * nK : aporte * ((factorK - 1) / iMes));
    const interesAnio = vfK - prevVf - aporteAnual;
    rows.push([k, f(aporteAnual), f(Math.max(0, interesAnio)), f(vfK)]);
    prevVf = vfK;
  }
  return { headers, rows };
}
