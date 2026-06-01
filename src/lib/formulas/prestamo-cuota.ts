/**
 * Calculadora de cuota de préstamo - Sistema Francés
 * Cuota constante con amortización creciente
 * Fórmula: C = P × (i(1+i)^n) / ((1+i)^n - 1)
 */

export interface PrestamoInputs {
  capital: number;
  tasaAnual: number; // %
  plazoMeses: number;
  __lang?: string;
}

export interface PrestamoOutputs {
  cuota: number;
  totalPagar: number;
  totalIntereses: number;
  tasaMensual: string;
  cae: string;
  _chart?: any;
}

export function prestamoCuota(inputs: PrestamoInputs): PrestamoOutputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errCapital: 'Ingresá el monto del préstamo',
      errTasa: 'Ingresá la tasa anual',
      errPlazo: 'Ingresá el plazo en meses',
      caeLabel: 'aprox, sin gastos',
      cuotaLabel: 'Cuota',
      interesLabel: 'Interés',
    },
    en: {
      errCapital: 'Enter the loan amount',
      errTasa: 'Enter the annual rate',
      errPlazo: 'Enter the term in months',
      caeLabel: 'approx, excl. fees',
      cuotaLabel: 'Installment',
      interesLabel: 'Interest',
    },
  } as const)[__lang];

  const capital = Number(inputs.capital);
  const tasaAnual = Number(inputs.tasaAnual);
  const plazoMeses = Number(inputs.plazoMeses);

  if (!capital || capital <= 0) throw new Error(T.errCapital);
  if (!tasaAnual || tasaAnual <= 0) throw new Error(T.errTasa);
  if (!plazoMeses || plazoMeses <= 0) throw new Error(T.errPlazo);

  const i = tasaAnual / 100 / 12; // tasa mensual

  let cuota: number;
  if (i === 0) {
    cuota = capital / plazoMeses;
  } else {
    const factor = Math.pow(1 + i, plazoMeses);
    cuota = (capital * (i * factor)) / (factor - 1);
  }

  const totalPagar = cuota * plazoMeses;
  const totalIntereses = totalPagar - capital;

  // CAE aproximado (asume 0 gastos; CAE real incluye seguros y comisiones)
  const cae = (Math.pow(1 + i, 12) - 1) * 100;

  // Tabla de amortización simplificada: capital vs interés por cuota
  // Si hay muchas cuotas, agrupamos por bucket para no saturar el gráfico
  const buckets = plazoMeses <= 24 ? plazoMeses : plazoMeses <= 60 ? 12 : plazoMeses <= 120 ? 10 : 12;
  const bucketSize = Math.ceil(plazoMeses / buckets);
  const labels: string[] = [];
  const capitalPorBucket: number[] = [];
  const interesPorBucket: number[] = [];

  let saldo = capital;
  let idxBucket = 0;
  let accCapital = 0;
  let accInteres = 0;
  let cuotasEnBucket = 0;
  let primeraCuotaBucket = 1;

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interesMes = saldo * i;
    const capitalMes = cuota - interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    accCapital += capitalMes;
    accInteres += interesMes;
    cuotasEnBucket++;

    if (cuotasEnBucket === bucketSize || mes === plazoMeses) {
      const labelTxt = bucketSize === 1
        ? `${T.cuotaLabel} ${mes}`
        : primeraCuotaBucket === mes
          ? `${T.cuotaLabel} ${mes}`
          : `${primeraCuotaBucket}-${mes}`;
      labels.push(labelTxt);
      capitalPorBucket.push(Math.round(accCapital));
      interesPorBucket.push(Math.round(accInteres));
      idxBucket++;
      accCapital = 0;
      accInteres = 0;
      cuotasEnBucket = 0;
      primeraCuotaBucket = mes + 1;
    }
  }

  const chart = {
    type: 'bar' as const,
    stacked: true,
    ariaLabel: __lang === 'en'
      ? `Loan installment breakdown: total principal ${Math.round(capital).toLocaleString('es-AR')}, total interest ${Math.round(totalIntereses).toLocaleString('es-AR')}.`
      : `Distribución de cuotas del préstamo: capital total ${Math.round(capital).toLocaleString('es-AR')}, intereses totales ${Math.round(totalIntereses).toLocaleString('es-AR')}.`,
    data: {
      labels,
      datasets: [
        { label: 'Capital', data: capitalPorBucket },
        { label: T.interesLabel, data: interesPorBucket, color: 'muted' },
      ],
    },
  };

  return {
    cuota: Math.round(cuota),
    totalPagar: Math.round(totalPagar),
    totalIntereses: Math.round(totalIntereses),
    tasaMensual: `${(i * 100).toFixed(2)}%`,
    cae: `${cae.toFixed(2)}% (${T.caeLabel})`,
    _chart: chart,
  };
}
