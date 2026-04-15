/** Gastos anuales de mantenimiento del hogar */
export interface Inputs {
  expensasMensual?: number;
  serviciosMensual: number;
  impuestosAnual?: number;
  seguroAnual?: number;
  reparacionesAnual: number;
  limpiezaMensual?: number;
  jardineriaMensual?: number;
  otrosAnual?: number;
}
export interface Outputs {
  gastoAnualTotal: number;
  gastoMensualPromedio: number;
  gastoDiario: number;
  detalle: string;
}

export function costoMantenimientoHogarAnual(i: Inputs): Outputs {
  const expensas = (Number(i.expensasMensual) || 0) * 12;
  const servicios = Number(i.serviciosMensual) * 12;
  const impuestos = Number(i.impuestosAnual) || 0;
  const seguro = Number(i.seguroAnual) || 0;
  const reparaciones = Number(i.reparacionesAnual) || 0;
  const limpieza = (Number(i.limpiezaMensual) || 0) * 12;
  const jardineria = (Number(i.jardineriaMensual) || 0) * 12;
  const otros = Number(i.otrosAnual) || 0;

  if (!Number(i.serviciosMensual) || Number(i.serviciosMensual) <= 0) {
    throw new Error('Ingresá el gasto mensual en servicios');
  }

  const total = expensas + servicios + impuestos + seguro + reparaciones + limpieza + jardineria + otros;
  const mensual = total / 12;
  const diario = total / 365;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const rubros = [];
  if (expensas > 0) rubros.push(`Expensas $${fmt.format(expensas)}`);
  if (servicios > 0) rubros.push(`Servicios $${fmt.format(servicios)}`);
  if (impuestos > 0) rubros.push(`Impuestos $${fmt.format(impuestos)}`);
  if (seguro > 0) rubros.push(`Seguro $${fmt.format(seguro)}`);
  if (reparaciones > 0) rubros.push(`Reparaciones $${fmt.format(reparaciones)}`);
  if (limpieza > 0) rubros.push(`Limpieza $${fmt.format(limpieza)}`);
  if (jardineria > 0) rubros.push(`Jardinería $${fmt.format(jardineria)}`);
  if (otros > 0) rubros.push(`Otros $${fmt.format(otros)}`);

  return {
    gastoAnualTotal: Math.round(total),
    gastoMensualPromedio: Math.round(mensual),
    gastoDiario: Math.round(diario),
    detalle: `${rubros.join(' + ')} = $${fmt.format(total)}/año ($${fmt.format(mensual)}/mes, $${fmt.format(diario)}/día).`,
  };
}
