/** Burn rate mensual y runway para startups */

export interface Inputs {
  gastoMensual: number;
  ingresoMensual: number;
  capitalDisponible: number;
}

export interface Outputs {
  burnRateNeto: number;
  runwayMeses: number;
  fechaAgotamiento: string;
  detalle: string;
}

export function burnRateRunway(i: Inputs): Outputs {
  const gastos = Number(i.gastoMensual);
  const ingresos = Number(i.ingresoMensual);
  const capital = Number(i.capitalDisponible);

  if (isNaN(gastos) || gastos < 0) throw new Error('Ingresá los gastos mensuales');
  if (isNaN(ingresos) || ingresos < 0) throw new Error('Los ingresos no pueden ser negativos');
  if (isNaN(capital) || capital < 0) throw new Error('El capital no puede ser negativo');

  const burnRateNeto = gastos - ingresos;

  let runwayMeses: number;
  let fechaAgotamiento: string;

  if (burnRateNeto <= 0) {
    runwayMeses = Infinity;
    fechaAgotamiento = 'No se agota — tus ingresos cubren los gastos';
  } else if (capital <= 0) {
    runwayMeses = 0;
    fechaAgotamiento = 'Ya no tenés capital';
  } else {
    runwayMeses = capital / burnRateNeto;
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + Math.floor(runwayMeses));
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    fechaAgotamiento = `Aproximadamente ${meses[fechaFin.getMonth()]} ${fechaFin.getFullYear()}`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  let detalle: string;
  if (burnRateNeto <= 0) {
    detalle = `Tus ingresos ($${fmt.format(ingresos)}) cubren tus gastos ($${fmt.format(gastos)}). ` +
      `Generás $${fmt.format(Math.abs(burnRateNeto))}/mes de superávit. ¡Tu runway es infinito!`;
  } else {
    detalle = `Quemás $${fmt.format(burnRateNeto)}/mes netos. Con $${fmt.format(capital)} en caja, ` +
      `tenés ${runwayMeses.toFixed(1)} meses de runway. ${fechaAgotamiento}.`;
  }

  return {
    burnRateNeto: Math.round(burnRateNeto),
    runwayMeses: runwayMeses === Infinity ? 999 : Number(runwayMeses.toFixed(1)),
    fechaAgotamiento,
    detalle,
  };
}
