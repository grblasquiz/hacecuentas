/** Gasto anual en café (efecto latte / "latte factor").
 * Proyecta el gasto mensual, anual y a 10 años, y opcionalmente cuánto valdría
 * ese dinero si en vez de gastarlo lo invirtieras a una tasa dada.
 * Convenciones estándar:
 *   - 4,33 semanas por mes (52 semanas ÷ 12 meses).
 *   - Valor futuro de una anualidad ordinaria (aportes mensuales) a 10 años (120 meses):
 *     FV = P × ((1 + r)^n − 1) / r, con r = tasa anual / 12. */
export interface Inputs {
  precioCafe: number;
  cafesPorDia: number;
  diasPorSemana: number;
  tasaInversion?: number;
  __lang?: string;
}
export interface Outputs {
  gastoMensual: number;
  gastoAnual: number;
  gastoDecada: number;
  valorInvertido10Anios: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

const SEMANAS_POR_MES = 4.33; // 52 / 12
const SEMANAS_POR_ANIO = 52;
const ANIOS = 10;

export function gastoCafeAnual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Ingresá el precio del café, cuántos por día y cuántos días por semana',
      insightTitle: 'El verdadero costo de tu café',
      gastado: 'Gastado en 10 años',
      ganado: 'Extra si lo invertías',
      total: 'Si invertías 10 años',
      chartAria: 'Comparación entre lo gastado en café en 10 años y lo que valdría invertido.',
      year: 'año',
    },
    en: {
      errorRequired: 'Enter the coffee price, how many per day and days per week',
      insightTitle: 'The real cost of your coffee',
      gastado: 'Spent over 10 years',
      ganado: 'Extra if invested',
      total: 'If invested for 10 years',
      chartAria: 'Comparison between coffee spent over 10 years and its invested value.',
      year: 'year',
    },
  } as const)[__lang];

  const precioCafe = Number(i.precioCafe);
  const cafesPorDia = Number(i.cafesPorDia);
  const diasPorSemana = Number(i.diasPorSemana);
  const tasaInversion = Number(i.tasaInversion) || 0;

  if (!precioCafe || !cafesPorDia || !diasPorSemana)
    throw new Error(T.errorRequired);

  const gastoSemanal = precioCafe * cafesPorDia * diasPorSemana;
  const gastoMensual = gastoSemanal * SEMANAS_POR_MES;
  const gastoAnual = gastoSemanal * SEMANAS_POR_ANIO;
  const gastoDecada = gastoAnual * ANIOS;

  // Valor futuro de invertir el aporte mensual durante 10 años
  let valorInvertido10Anios = 0;
  if (tasaInversion > 0) {
    const r = tasaInversion / 100 / 12; // tasa mensual
    const n = ANIOS * 12; // 120 meses
    valorInvertido10Anios = gastoMensual * ((Math.pow(1 + r, n) - 1) / r);
  }

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const ganado = Math.max(0, valorInvertido10Anios - gastoDecada);

  const chart =
    tasaInversion > 0
      ? {
          type: 'doughnut' as const,
          slices: [
            { label: T.gastado, value: Math.round(gastoDecada) },
            { label: T.ganado, value: Math.round(ganado) },
          ],
          prefix: '$',
          centerValue: '$' + Math.round(valorInvertido10Anios).toLocaleString(locale),
          centerLabel: T.total,
          ariaLabel: T.chartAria,
        }
      : undefined;

  const insight = {
    title: T.insightTitle,
    text:
      tasaInversion > 0
        ? (__lang === 'en'
            ? `That coffee costs you **$${Math.round(gastoAnual).toLocaleString(locale)}** a year — **$${Math.round(gastoDecada).toLocaleString(locale)}** in a decade. Invested at **${tasaInversion}%**, the same money would grow to **$${Math.round(valorInvertido10Anios).toLocaleString(locale)}**: **$${Math.round(ganado).toLocaleString(locale)}** you're leaving on the table. That's the latte factor.`
            : `Ese café te cuesta **$${Math.round(gastoAnual).toLocaleString(locale)}** por año: **$${Math.round(gastoDecada).toLocaleString(locale)}** en una década. Invertido al **${tasaInversion}%**, esa misma plata se convertiría en **$${Math.round(valorInvertido10Anios).toLocaleString(locale)}**: **$${Math.round(ganado).toLocaleString(locale)}** que estás dejando pasar. Ese es el efecto latte.`)
        : (__lang === 'en'
            ? `That coffee adds up to **$${Math.round(gastoAnual).toLocaleString(locale)}** a year — **$${Math.round(gastoDecada).toLocaleString(locale)}** over a decade. Small daily expenses are bigger than they look.`
            : `Ese café suma **$${Math.round(gastoAnual).toLocaleString(locale)}** por año: **$${Math.round(gastoDecada).toLocaleString(locale)}** en una década. Los gastos chicos de todos los días pesan más de lo que parece.`),
    tone: 'warn' as const,
    icon: '☕',
  };

  return {
    gastoMensual: Math.round(gastoMensual),
    gastoAnual: Math.round(gastoAnual),
    gastoDecada: Math.round(gastoDecada),
    valorInvertido10Anios: Math.round(valorInvertido10Anios),
    formula: `Gasto anual = ${precioCafe} × ${cafesPorDia} × ${diasPorSemana} × ${SEMANAS_POR_ANIO} = ${Math.round(gastoAnual)}`,
    _chart: chart,
    _insight: insight,
  };
}
