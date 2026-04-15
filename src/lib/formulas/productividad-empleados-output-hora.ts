/** Productividad de empleados: output por hora y por empleado */

export interface Inputs {
  outputTotal: number;
  horasTotales: number;
  cantidadEmpleados: number;
  costoLaboralTotal: number;
}

export interface Outputs {
  outputPorHora: number;
  outputPorEmpleado: number;
  costoPorUnidad: number;
  detalle: string;
}

export function productividadEmpleadosOutputHora(i: Inputs): Outputs {
  const output = Number(i.outputTotal);
  const horas = Number(i.horasTotales);
  const empleados = Number(i.cantidadEmpleados);
  const costo = Number(i.costoLaboralTotal);

  if (isNaN(output) || output <= 0) throw new Error('Ingresá el output total del período');
  if (isNaN(horas) || horas <= 0) throw new Error('Ingresá las horas trabajadas totales');
  if (isNaN(empleados) || empleados < 1) throw new Error('Ingresá la cantidad de empleados');
  if (isNaN(costo) || costo < 0) throw new Error('El costo laboral no puede ser negativo');

  const outputPorHora = output / horas;
  const outputPorEmpleado = output / empleados;
  const costoPorUnidad = costo > 0 ? costo / output : 0;
  const horasPorEmpleado = horas / empleados;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmtDec = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const detalle =
    `Output total: ${fmt.format(output)} unidades en ${fmt.format(horas)} hs (${empleados} empleados). ` +
    `Output/hora: ${fmtDec.format(outputPorHora)}. ` +
    `Output/empleado: ${fmtDec.format(outputPorEmpleado)}. ` +
    `Horas/empleado: ${fmtDec.format(horasPorEmpleado)}. ` +
    `Costo laboral por unidad: $${fmt.format(costoPorUnidad)}.`;

  return {
    outputPorHora: Number(outputPorHora.toFixed(2)),
    outputPorEmpleado: Number(outputPorEmpleado.toFixed(2)),
    costoPorUnidad: Math.round(costoPorUnidad),
    detalle,
  };
}
