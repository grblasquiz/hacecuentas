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

  return {
    costoHoraReal: Math.round(costoHoraReal),
    costoMensualTotal: Math.round(costoMensualTotal),
    sobrecostoPct: Number(sobrecostoPct.toFixed(1)),
    detalle,
  };
}
