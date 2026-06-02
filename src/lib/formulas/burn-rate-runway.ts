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
  _insight?: any;
  _chart?: any;
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

  let _insight: any;
  let _chart: any;
  if (burnRateNeto <= 0) {
    _insight = {
      title: 'Runway infinito',
      text: `Tus ingresos ($${fmt.format(ingresos)}) ya cubren los gastos ($${fmt.format(gastos)}) y generás **$${fmt.format(Math.abs(burnRateNeto))}/mes** de superávit: no estás quemando caja, tu runway es **infinito**.`,
      tone: 'good',
      icon: '🚀',
    };
  } else if (capital <= 0) {
    _insight = {
      title: 'Sin caja',
      text: `Quemás **$${fmt.format(burnRateNeto)}/mes** y ya no te queda capital disponible. Hace falta financiamiento o recortar gastos de inmediato.`,
      tone: 'warn',
      icon: '🔥',
    };
  } else {
    const rw = runwayMeses;
    _insight = {
      title: 'Tu pista de aterrizaje',
      text: `Quemás **$${fmt.format(burnRateNeto)}/mes** netos. Con $${fmt.format(capital)} en caja te quedan **${rw.toFixed(1)} meses** de runway (${fechaAgotamiento.toLowerCase()}).`,
      tone: rw < 6 ? 'warn' : rw < 12 ? 'neutral' : 'good',
      icon: rw < 6 ? '🔥' : '🛬',
    };
    const markerVal = Math.min(rw, 24);
    _chart = {
      type: 'scale',
      marker: Number(markerVal.toFixed(1)),
      markerLabel: `${rw.toFixed(1)} meses`,
      min: 0,
      segments: [
        { nombre: 'Crítico', max: 6, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Ajustado', max: 12, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Saludable', max: 24, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Runway de ${rw.toFixed(1)} meses ubicado en la zona ${rw < 6 ? 'crítica' : rw < 12 ? 'ajustada' : 'saludable'}`,
    };
  }

  return {
    burnRateNeto: Math.round(burnRateNeto),
    runwayMeses: runwayMeses === Infinity ? 999 : Number(runwayMeses.toFixed(1)),
    fechaAgotamiento,
    detalle,
    _insight,
    _chart,
  };
}
