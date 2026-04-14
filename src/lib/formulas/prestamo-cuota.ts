/**
 * Calculadora de cuota de préstamo - Sistema Francés
 * Cuota constante con amortización creciente
 * Fórmula: C = P × (i(1+i)^n) / ((1+i)^n - 1)
 */

export interface PrestamoInputs {
  capital: number;
  tasaAnual: number; // %
  plazoMeses: number;
}

export interface PrestamoOutputs {
  cuota: number;
  totalPagar: number;
  totalIntereses: number;
  tasaMensual: string;
  cae: string;
}

export function prestamoCuota(inputs: PrestamoInputs): PrestamoOutputs {
  const capital = Number(inputs.capital);
  const tasaAnual = Number(inputs.tasaAnual);
  const plazoMeses = Number(inputs.plazoMeses);

  if (!capital || capital <= 0) throw new Error('Ingresá el monto del préstamo');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (!plazoMeses || plazoMeses <= 0) throw new Error('Ingresá el plazo en meses');

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

  return {
    cuota: Math.round(cuota),
    totalPagar: Math.round(totalPagar),
    totalIntereses: Math.round(totalIntereses),
    tasaMensual: `${(i * 100).toFixed(2)}%`,
    cae: `${cae.toFixed(2)}% (aprox, sin gastos)`,
  };
}
