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
  _insight?: any;
}

function formatDate(d: Date): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export function licenciaPorMaternidadPaternidadDias(
  inputs: LicenciaPorMaternidadPaternidadDiasInputs
): LicenciaPorMaternidadPaternidadDiasOutputs {
  const fechaStr = inputs.fechaProbableParto;
  const tipo = inputs.tipoLicencia || 'maternidad4545';

  if (!fechaStr) throw new Error('Ingresá la fecha probable de parto');

  const parts = String(fechaStr).split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha de parto inválida');
  const [yy, mm, dd] = parts;
  const fechaParto = new Date(yy, mm - 1, dd);
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

  const reincorporacion = formatDate(addDays(fechaFin, 1));
  let insight: any;
  if (tipo === 'paternidad') {
    insight = {
      title: 'Licencia por paternidad',
      text: `Apenas **2 días corridos** desde el nacimiento (mínimo LCT, el más bajo de la región). Te reincorporás el **${reincorporacion}**. Revisá tu **convenio**: muchos otorgan entre 5 y 15 días.`,
      tone: 'warn',
      icon: '👨‍🍼',
    };
  } else if (tipo === 'paternidadConvenio') {
    insight = {
      title: 'Licencia por paternidad extendida',
      text: `Tu convenio extiende la licencia a **10 días corridos**, cinco veces el mínimo de la LCT. Te reincorporás el **${reincorporacion}**.`,
      tone: 'good',
      icon: '👨‍🍼',
    };
  } else {
    // maternidad 45+45 o 30+60
    const distrib = tipo === 'maternidad3060' ? '30 días antes + 60 después' : '45 días antes + 45 después';
    insight = {
      title: 'Licencia por maternidad',
      text: `**90 días corridos** (${distrib} del parto), pagados por **ANSES** como asignación equivalente a tu sueldo bruto. Reintegro previsto para el **${reincorporacion}**.`,
      tone: 'good',
      icon: '🤰',
    };
  }

  return {
    diasTotales,
    fechaInicio: formatDate(fechaInicio),
    fechaFin: formatDate(fechaFin),
    detalle: detalleStr,
    _insight: insight,
  };
}
