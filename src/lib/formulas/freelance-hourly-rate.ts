/** Tarifa por hora freelance considerando gastos, vacaciones e impuestos */
export interface Inputs {
  ingresoDeseadoMensual: number;
  horasFacturablesSemana: number;
  semanasVacaciones?: number;
  gastosFijosMensuales?: number;
  impuestosPorcentaje?: number;
}
export interface Outputs {
  tarifaHora: number;
  tarifaDia: number;
  horasFacturablesAnuales: number;
  ingresoBrutoAnual: number;
  ingresoNetoAnual: number;
  impuestosAnuales: number;
  resumen: string;
}

export function freelanceHourlyRate(i: Inputs): Outputs {
  const ingresoDeseado = Number(i.ingresoDeseadoMensual);
  const horasSem = Number(i.horasFacturablesSemana);
  const vac = Number(i.semanasVacaciones) || 4;
  const gastos = Number(i.gastosFijosMensuales) || 0;
  const imp = Number(i.impuestosPorcentaje) || 25;

  if (!ingresoDeseado || ingresoDeseado <= 0) throw new Error('Ingresá el ingreso neto mensual que querés');
  if (!horasSem || horasSem <= 0 || horasSem > 60) throw new Error('Las horas facturables por semana deben estar entre 1 y 60');
  if (vac < 0 || vac > 52) throw new Error('Las semanas de vacaciones deben estar entre 0 y 52');
  if (imp < 0 || imp >= 100) throw new Error('Los impuestos deben ser entre 0% y 99%');

  const semanasFacturables = 52 - vac;
  const horasAnuales = horasSem * semanasFacturables;
  const ingresoNetoAnual = (ingresoDeseado + gastos) * 12;
  // Brutear por impuestos: neto = bruto × (1 - imp%), bruto = neto / (1 - imp%)
  const ingresoBrutoAnual = ingresoNetoAnual / (1 - imp / 100);
  const tarifaHora = ingresoBrutoAnual / horasAnuales;
  const tarifaDia = tarifaHora * 8;
  const impuestosAnuales = ingresoBrutoAnual - ingresoNetoAnual;

  const resumen = `Tu tarifa debería ser ${tarifaHora.toFixed(2)}/hora para cobrar ${ingresoDeseado.toLocaleString()} netos al mes (${horasAnuales} horas facturables al año).`;

  return {
    tarifaHora: Number(tarifaHora.toFixed(2)),
    tarifaDia: Number(tarifaDia.toFixed(2)),
    horasFacturablesAnuales: Math.round(horasAnuales),
    ingresoBrutoAnual: Math.round(ingresoBrutoAnual),
    ingresoNetoAnual: Math.round(ingresoNetoAnual),
    impuestosAnuales: Math.round(impuestosAnuales),
    resumen,
  };
}
