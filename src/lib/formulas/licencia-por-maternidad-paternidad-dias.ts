/**
 * Calculadora de licencia por maternidad y paternidad
 * Maternidad: 90 días (45+45 o 30+60). Paternidad: 2 días (LCT).
 */

export interface LicenciaPorMaternidadPaternidadDiasInputs {
  fechaProbableParto: string;
  tipoLicencia: string;
}

export interface LicenciaPorMaternidadPaternidadDiasOutputs {
  diasTotales: number;
  fechaInicio: string;
  fechaFin: string;
  detalle: string;
}

function formatDate(d: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function licenciaPorMaternidadPaternidadDias(
  inputs: LicenciaPorMaternidadPaternidadDiasInputs
): LicenciaPorMaternidadPaternidadDiasOutputs {
  const fechaStr = inputs.fechaProbableParto;
  const tipo = inputs.tipoLicencia || 'maternidad4545';

  if (!fechaStr) throw new Error('Ingresá la fecha probable de parto');

  const fechaParto = new Date(fechaStr + 'T12:00:00');
  if (isNaN(fechaParto.getTime())) throw new Error('Fecha de parto inválida');

  let diasTotales = 0;
  let fechaInicio: Date;
  let fechaFin: Date;
  let detalleStr = '';

  switch (tipo) {
    case 'maternidad4545':
      diasTotales = 90;
      fechaInicio = addDays(fechaParto, -45);
      fechaFin = addDays(fechaParto, 44);
      detalleStr = `Licencia por maternidad: 45 días antes + 45 días después del parto = 90 días totales. Inicio: ${formatDate(fechaInicio)}. Parto estimado: ${formatDate(fechaParto)}. Reincorporación: ${formatDate(addDays(fechaFin, 1))}. La asignación por maternidad la paga ANSES (equivalente al sueldo bruto).`;
      break;
    case 'maternidad3060':
      diasTotales = 90;
      fechaInicio = addDays(fechaParto, -30);
      fechaFin = addDays(fechaParto, 59);
      detalleStr = `Licencia por maternidad: 30 días antes + 60 días después del parto = 90 días totales. Inicio: ${formatDate(fechaInicio)}. Parto estimado: ${formatDate(fechaParto)}. Reincorporación: ${formatDate(addDays(fechaFin, 1))}. Esta opción te da 15 días más con el bebé post-parto.`;
      break;
    case 'paternidad':
      diasTotales = 2;
      fechaInicio = fechaParto;
      fechaFin = addDays(fechaParto, 1);
      detalleStr = `Licencia por paternidad (LCT Art. 158): 2 días corridos desde el nacimiento. Inicio: ${formatDate(fechaInicio)}. Fin: ${formatDate(fechaFin)}. Consultá tu convenio colectivo — muchos otorgan entre 5 y 15 días.`;
      break;
    case 'paternidadConvenio':
      diasTotales = 10;
      fechaInicio = fechaParto;
      fechaFin = addDays(fechaParto, 9);
      detalleStr = `Licencia por paternidad extendida (convenio): 10 días corridos desde el nacimiento. Inicio: ${formatDate(fechaInicio)}. Fin: ${formatDate(fechaFin)}. Verificá los días exactos de tu convenio colectivo.`;
      break;
    default:
      throw new Error('Seleccioná un tipo de licencia válido');
  }

  return {
    diasTotales,
    fechaInicio: formatDate(fechaInicio),
    fechaFin: formatDate(fechaFin),
    detalle: detalleStr,
  };
}
