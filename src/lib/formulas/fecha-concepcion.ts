/** Fecha probable de concepción a partir de FUM o fecha de parto */
export interface Inputs {
  fechaReferencia: string;
  tipoFecha?: string;
}
export interface Outputs {
  fechaConcepcion: string;
  semanasGestacion: string;
  detalle: string;
}

export function fechaConcepcion(i: Inputs): Outputs {
  const fechaStr = String(i.fechaReferencia);
  const tipo = String(i.tipoFecha || 'fum');

  if (!fechaStr) throw new Error('Ingresá una fecha');

  const fecha = new Date(fechaStr + 'T00:00:00');
  if (isNaN(fecha.getTime())) throw new Error('Fecha inválida');

  let concepcion: Date;
  let fum: Date;

  if (tipo === 'fum') {
    fum = new Date(fecha + 'T00:00:00');
    // Concepción = FUM + 14 días (ovulación)
    concepcion = new Date(fecha + 'T00:00:00');
    concepcion.setDate(concepcion.getDate() + 14);
  } else {
    // Desde FPP: concepción = FPP - 266 días
    concepcion = new Date(fecha + 'T00:00:00');
    concepcion.setDate(concepcion.getDate() - 266);
    // FUM = FPP - 280 días
    fum = new Date(fecha + 'T00:00:00');
    fum.setDate(fum.getDate() - 280);
  }

  // Semanas de gestación al día de hoy (desde FUM)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffMs = hoy.getTime() - fum.getTime();
  const diasGestacion = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const semanasCompletas = Math.floor(diasGestacion / 7);
  const diasRestantes = diasGestacion % 7;

  const formatFecha = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  let semanasTexto = '';
  if (diasGestacion < 0) {
    semanasTexto = 'La FUM es futura — todavía no hay embarazo';
  } else if (semanasCompletas > 42) {
    semanasTexto = `${semanasCompletas} semanas — fecha ya pasada`;
  } else {
    semanasTexto = `${semanasCompletas} semanas y ${diasRestantes} días`;
  }

  // FPP
  const fpp = new Date(fum);
  fpp.setDate(fpp.getDate() + 280);

  return {
    fechaConcepcion: formatFecha(concepcion),
    semanasGestacion: semanasTexto,
    detalle: `Concepción estimada: ${formatFecha(concepcion)}. FUM: ${formatFecha(fum)}. Fecha probable de parto: ${formatFecha(fpp)}. Gestación al día de hoy: ${semanasTexto}.`,
  };
}
