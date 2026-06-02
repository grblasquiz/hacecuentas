/** Costo hora real de un empleado con cargas sociales */

export interface Inputs {
  sueldoBruto: number;
  horasMensuales: number;
  cargasSocialesPct: number;
  aguinaldoPct: number;
  vacacionesPct: number;
}

export interface Outputs {
  costoHoraReal: number;
  costoMensualTotal: number;
  sobrecostoPct: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function costoHoraEmpleadoReal(i: Inputs): Outputs {
  const bruto = Number(i.sueldoBruto);
  const horas = Number(i.horasMensuales);
  const cargas = Number(i.cargasSocialesPct);
  const aguinaldo = Number(i.aguinaldoPct);
  const vacaciones = Number(i.vacacionesPct);

  if (isNaN(bruto) || bruto <= 0) throw new Error('Ingresá el sueldo bruto mensual');
  if (isNaN(horas) || horas <= 0) throw new Error('Ingresá las horas mensuales trabajadas');
  if (isNaN(cargas) || cargas < 0) throw new Error('Ingresá el porcentaje de cargas sociales');
  if (isNaN(aguinaldo) || aguinaldo < 0) throw new Error('Ingresá el porcentaje de aguinaldo');
  if (isNaN(vacaciones) || vacaciones < 0) throw new Error('Ingresá el porcentaje de vacaciones');

  const totalPct = (cargas + aguinaldo + vacaciones) / 100;
  const costoMensualTotal = bruto * (1 + totalPct);
  const costoHoraReal = costoMensualTotal / horas;
  const costoHoraBruto = bruto / horas;
  const sobrecostoPct = totalPct * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Sueldo bruto: $${fmt.format(bruto)}. ` +
    `Cargas sociales (${cargas}%): $${fmt.format(bruto * cargas / 100)}. ` +
    `Aguinaldo (${aguinaldo}%): $${fmt.format(bruto * aguinaldo / 100)}. ` +
    `Vacaciones (${vacaciones}%): $${fmt.format(bruto * vacaciones / 100)}. ` +
    `Costo total mensual: $${fmt.format(costoMensualTotal)}. ` +
    `Costo hora bruto: $${fmt.format(costoHoraBruto)} → Costo hora real: $${fmt.format(costoHoraReal)} (+${sobrecostoPct.toFixed(1)}%).`;

  const cargasMonto = bruto * cargas / 100;
  const aguinaldoMonto = bruto * aguinaldo / 100;
  const vacacionesMonto = bruto * vacaciones / 100;

  const _insight = {
    title: 'Lo que cuesta de verdad',
    text: `Cada hora de este empleado te cuesta **$${fmt.format(Math.round(costoHoraReal))}**, no los $${fmt.format(Math.round(costoHoraBruto))} del sueldo bruto: las cargas, el aguinaldo y las vacaciones suman un **+${sobrecostoPct.toFixed(1)}%** que rara vez se tiene en cuenta al presupuestar.`,
    tone: sobrecostoPct >= 50 ? 'warn' : 'neutral',
    icon: '💼',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo bruto', value: Math.round(bruto) },
      { label: 'Cargas sociales', value: Math.round(cargasMonto) },
      { label: 'Aguinaldo', value: Math.round(aguinaldoMonto) },
      { label: 'Vacaciones', value: Math.round(vacacionesMonto) },
    ],
    prefix: '$',
    centerValue: `$${fmt.format(Math.round(costoMensualTotal))}`,
    centerLabel: 'Costo mensual total',
    ariaLabel: `Composición del costo mensual total de $${fmt.format(Math.round(costoMensualTotal))}: sueldo bruto $${fmt.format(Math.round(bruto))}, cargas sociales $${fmt.format(Math.round(cargasMonto))}, aguinaldo $${fmt.format(Math.round(aguinaldoMonto))} y vacaciones $${fmt.format(Math.round(vacacionesMonto))}.`,
  };

  return {
    costoHoraReal: Math.round(costoHoraReal),
    costoMensualTotal: Math.round(costoMensualTotal),
    sobrecostoPct: Number(sobrecostoPct.toFixed(1)),
    detalle,
    _insight,
    _chart,
  };
}
