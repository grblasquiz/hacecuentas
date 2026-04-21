/**
 * Cuenta regresiva a fecha: días, semanas, meses, laborables, fines de semana
 */

export interface CuentaRegresivaFechaInputs {
  fechaObjetivo: string;
  nombre?: string;
}

export interface CuentaRegresivaFechaOutputs {
  diasFaltan: number;
  semanasRestan: number;
  mesesRestan: number;
  diasLaborables: number;
  finesDeSemana: number;
  formula: string;
  explicacion: string;
}

export function cuentaRegresivaFecha(inputs: CuentaRegresivaFechaInputs): CuentaRegresivaFechaOutputs {
  const fechaStr = inputs.fechaObjetivo;
  if (!fechaStr) throw new Error('Ingresá una fecha objetivo');

  const parts = String(fechaStr || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('La fecha ingresada no es válida');
  const [yy, mm, dd] = parts;
  const destino = new Date(yy, mm - 1, dd);
  if (isNaN(destino.getTime())) throw new Error('La fecha ingresada no es válida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = destino.getTime() - hoy.getTime();
  const diasTotales = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const esPasado = diasTotales < 0;
  const diasAbs = Math.abs(diasTotales);

  const semanas = Math.floor(diasAbs / 7);
  const meses = Math.floor(diasAbs / 30.44);

  // Contar días laborables (lun-vie) y fines de semana (sáb-dom)
  let laborables = 0;
  let finDeSemana = 0;
  const inicio = esPasado ? new Date(destino.getTime()) : new Date(hoy);
  const fin = esPasado ? new Date(hoy) : new Date(destino.getTime());
  // Empezamos desde el día siguiente al inicio hasta el día de la fecha fin
  const cursor = new Date(inicio);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= fin) {
    const dow = cursor.getDay();
    if (dow === 0 || dow === 6) {
      finDeSemana++;
    } else {
      laborables++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const nombre = inputs.nombre ? ` (${inputs.nombre})` : '';
  const fechaFmt = destino.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  let explicacion: string;
  if (diasTotales === 0) {
    explicacion = `¡${nombre ? inputs.nombre + ' es' : 'Es'} hoy!`;
  } else if (esPasado) {
    explicacion = `Pasaron ${diasAbs} días desde el ${fechaFmt}${nombre}. Fueron ${semanas} semanas, con ${laborables} días laborables y ${finDeSemana} días de fin de semana.`;
  } else {
    explicacion = `Faltan ${diasAbs} días para el ${fechaFmt}${nombre}. Son ${semanas} semanas completas, con ${laborables} días laborables y ${finDeSemana} días de fin de semana.`;
  }

  const formula = esPasado
    ? `${fechaFmt} → hoy = ${diasAbs} días transcurridos`
    : `hoy → ${fechaFmt} = ${diasAbs} días restantes`;

  return {
    diasFaltan: diasTotales,
    semanasRestan: esPasado ? -semanas : semanas,
    mesesRestan: esPasado ? -meses : meses,
    diasLaborables: esPasado ? -laborables : laborables,
    finesDeSemana: esPasado ? -finDeSemana : finDeSemana,
    formula,
    explicacion,
  };
}
