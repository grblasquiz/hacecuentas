/**
 * Calculadora de préstamo México — Sistema francés + CAT aproximado
 * Cuota = P × [i(1+i)^n] / [(1+i)^n − 1]
 * CAT ≈ (1 + i_mensual)^12 − 1
 */

export interface PrestamoCuotaMexicoInputs {
  monto: number;
  tasaAnual: number;
  plazoMeses: number;
  tipoTasa: string;
}

export interface PrestamoCuotaMexicoOutputs {
  cuotaMensual: number;
  totalPagado: number;
  totalIntereses: number;
  cat: string;
  formula: string;
  explicacion: string;
  tablaResumen: string;
}

export function prestamoCuotaMexico(inputs: PrestamoCuotaMexicoInputs): PrestamoCuotaMexicoOutputs {
  const monto = Number(inputs.monto);
  const tasaAnual = Number(inputs.tasaAnual);
  const plazoMeses = Number(inputs.plazoMeses);
  const tipoTasa = String(inputs.tipoTasa || 'fija');

  if (isNaN(monto) || monto <= 0) throw new Error('Ingresá un monto de préstamo válido');
  if (isNaN(tasaAnual) || tasaAnual <= 0) throw new Error('Ingresá una tasa de interés anual válida');
  if (isNaN(plazoMeses) || plazoMeses < 1) throw new Error('Ingresá un plazo de al menos 1 mes');
  if (plazoMeses > 360) throw new Error('El plazo máximo es de 360 meses (30 años)');

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

  const fmtPct = (n: number) => `${n.toFixed(2)}%`;

  const i = tasaAnual / 100 / 12; // tasa mensual

  // Cuota sistema francés
  let cuota: number;
  if (i === 0) {
    cuota = monto / plazoMeses;
  } else {
    const factor = Math.pow(1 + i, plazoMeses);
    cuota = (monto * (i * factor)) / (factor - 1);
  }

  const totalPagado = cuota * plazoMeses;
  const totalIntereses = totalPagado - monto;

  // CAT aproximado (sin comisiones — el CAT real incluye seguros y comisiones)
  const catAprox = (Math.pow(1 + i, 12) - 1) * 100;

  const formula = `Cuota = ${fmt(monto)} × [${fmtPct(i * 100)} × (1 + ${fmtPct(i * 100)})^${plazoMeses}] / [(1 + ${fmtPct(i * 100)})^${plazoMeses} − 1] = ${fmt(cuota)}`;

  // Tabla resumen por año (o semestre si plazo < 24 meses)
  const periodoSize = plazoMeses <= 12 ? 1 : plazoMeses <= 24 ? 3 : plazoMeses <= 60 ? 6 : 12;
  const tablaRows: string[] = [];
  let saldo = monto;
  let acumCapital = 0;
  let acumInteres = 0;
  let cuotasEnPeriodo = 0;
  let periodoInicio = 1;

  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interesMes = saldo * i;
    const capitalMes = cuota - interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    acumCapital += capitalMes;
    acumInteres += interesMes;
    cuotasEnPeriodo++;

    if (cuotasEnPeriodo === periodoSize || mes === plazoMeses) {
      const label = periodoSize === 1
        ? `Mes ${mes}`
        : periodoInicio === mes
          ? `Mes ${mes}`
          : `Meses ${periodoInicio}-${mes}`;
      tablaRows.push(`${label}: Capital ${fmt(acumCapital)}, Interés ${fmt(acumInteres)}, Saldo ${fmt(Math.max(0, saldo))}`);
      acumCapital = 0;
      acumInteres = 0;
      cuotasEnPeriodo = 0;
      periodoInicio = mes + 1;
    }
  }

  const tablaResumen = tablaRows.join('\n');

  const tipoTasaTxt = tipoTasa === 'variable'
    ? 'Nota: con tasa variable, la cuota puede cambiar en cada periodo de ajuste según la TIIE. Este cálculo muestra la cuota inicial como referencia.'
    : 'Con tasa fija, la cuota se mantiene constante durante todo el plazo.';

  const explicacion = `Préstamo de ${fmt(monto)} a ${fmtPct(tasaAnual)} anual (${fmtPct(i * 100)} mensual) en ${plazoMeses} meses. Tu cuota mensual es de ${fmt(cuota)}. En total pagás ${fmt(totalPagado)}, de los cuales ${fmt(totalIntereses)} son intereses (${fmtPct(totalIntereses / monto * 100)} del capital). CAT aproximado: ${fmtPct(catAprox)} (sin comisiones). ${tipoTasaTxt}`;

  return {
    cuotaMensual: Math.round(cuota),
    totalPagado: Math.round(totalPagado),
    totalIntereses: Math.round(totalIntereses),
    cat: `${catAprox.toFixed(2)}% (aproximado, sin comisiones ni seguros)`,
    formula,
    explicacion,
    tablaResumen,
  };
}
