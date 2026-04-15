/** Período de recupero de una inversión (payback) */

export interface Inputs {
  inversionInicial: number;
  flujoMensual: number;
}

export interface Outputs {
  paybackMeses: number;
  paybackAnios: number;
  retornoAnual: number;
  detalle: string;
}

export function paybackInversion(i: Inputs): Outputs {
  const inversion = Number(i.inversionInicial);
  const flujo = Number(i.flujoMensual);

  if (isNaN(inversion) || inversion <= 0) throw new Error('Ingresá la inversión inicial');
  if (isNaN(flujo) || flujo <= 0) throw new Error('Ingresá el flujo de caja mensual neto (debe ser positivo)');

  const paybackMeses = inversion / flujo;
  const paybackAnios = paybackMeses / 12;
  const retornoAnual = ((flujo * 12) / inversion) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let evaluacion: string;
  if (paybackMeses <= 6) evaluacion = 'Excelente — recupero muy rápido.';
  else if (paybackMeses <= 12) evaluacion = 'Muy bueno — se paga en menos de un año.';
  else if (paybackMeses <= 24) evaluacion = 'Bueno — recupero en 1-2 años.';
  else if (paybackMeses <= 36) evaluacion = 'Aceptable — evaluá alternativas.';
  else evaluacion = 'Largo — considerá el riesgo y el costo de oportunidad.';

  const detalle =
    `Inversión de $${fmt.format(inversion)} con flujo neto de $${fmt.format(flujo)}/mes: ` +
    `se recupera en ${paybackMeses.toFixed(1)} meses (${paybackAnios.toFixed(1)} años). ` +
    `Retorno anualizado: ${retornoAnual.toFixed(1)}%. ${evaluacion}`;

  return {
    paybackMeses: Number(paybackMeses.toFixed(1)),
    paybackAnios: Number(paybackAnios.toFixed(1)),
    retornoAnual: Number(retornoAnual.toFixed(1)),
    detalle,
  };
}
