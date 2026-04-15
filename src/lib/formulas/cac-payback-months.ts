/** CAC Payback Months: meses para recuperar el CAC con el margen del cliente */
export interface Inputs {
  cac: number;
  ingresoMensualPorCliente: number;
  margenBrutoPorcentaje?: number;
}
export interface Outputs {
  paybackMeses: number;
  paybackAnios: number;
  margenMensualPorCliente: number;
  cacMensualRecuperado: number;
  benchmark: string;
  resumen: string;
}

export function cacPaybackMonths(i: Inputs): Outputs {
  const cac = Number(i.cac);
  const arpu = Number(i.ingresoMensualPorCliente);
  const margen = Number(i.margenBrutoPorcentaje) || 80;

  if (!cac || cac <= 0) throw new Error('Ingresá el CAC');
  if (!arpu || arpu <= 0) throw new Error('Ingresá el ingreso mensual por cliente (ARPU)');
  if (margen <= 0 || margen > 100) throw new Error('El margen bruto debe estar entre 1% y 100%');

  const margenMensual = arpu * (margen / 100);
  const meses = cac / margenMensual;

  let benchmark = '';
  if (meses <= 6) benchmark = 'Excelente — payback de primer nivel, típico de SaaS PLG.';
  else if (meses <= 12) benchmark = 'Bueno — benchmark saludable en SaaS B2B.';
  else if (meses <= 18) benchmark = 'Aceptable — límite superior para SaaS con funding.';
  else if (meses <= 24) benchmark = 'Lento — requiere buen LTV y retención alta para justificarlo.';
  else benchmark = 'Crítico — tu unit economics no cierra con este payback.';

  const resumen = `Tardás ${meses.toFixed(1)} meses en recuperar el CAC. Cada cliente aporta ${margenMensual.toFixed(2)} de margen por mes.`;

  return {
    paybackMeses: Number(meses.toFixed(1)),
    paybackAnios: Number((meses / 12).toFixed(2)),
    margenMensualPorCliente: Number(margenMensual.toFixed(2)),
    cacMensualRecuperado: Number((cac / meses).toFixed(2)),
    benchmark,
    resumen,
  };
}
