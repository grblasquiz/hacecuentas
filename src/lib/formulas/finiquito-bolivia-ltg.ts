/**
 * Calculadora de Finiquito / Desvinculación Bolivia — Ley General del Trabajo (LGT)
 *
 * Componentes según LGT (1939) + DS 28699 + DS 110 (2009):
 *   - Indemnización por tiempo de servicio: 1 sueldo promedio por año trabajado.
 *     Sin tope (desde DS 110/2009, que eliminó el tope anterior de 8 años).
 *   - Desahucio (pre-aviso): 3 sueldos si el despido es sin causa (Art. 12 LGT).
 *     NO aplica en renuncia voluntaria ni despido con causa justificada.
 *   - Aguinaldo proporcional: 1/12 por cada mes completo trabajado en el año.
 *   - Vacaciones proporcionales o devengadas.
 *   - Primas anuales (si la empresa tuvo utilidades).
 *
 * Salario mínimo nacional 2026 Bolivia (aproximado): 2.750 BOB/mes
 * (pendiente actualización oficial del Ministerio de Trabajo).
 */

export interface FiniquitoBoliviaInputs {
  sueldoPromedio: number; // promedio últimos 3 meses en BOB
  anosServicio: number;
  mesesExtra: number; // 0-11
  tipoTermino: 'despido-injustificado' | 'renuncia' | 'despido-justificado' | 'mutuo-acuerdo';
  mesesTrabajadosDelAno: number; // 0-12 para aguinaldo proporcional
  diasVacacionesPendientes: number;
}

export interface FiniquitoBoliviaOutputs {
  indemnizacionTiempoServicio: string;
  desahucio: string;
  aguinaldoProporcional: string;
  vacacionesPendientes: string;
  totalFiniquito: string;
  anosComputables: string;
  observaciones: string;
}

const fmtBOB = (n: number) =>
  'Bs ' +
  Math.round(n * 100) / 100 +
  ''.padStart(0, ' ');

const fmt = (n: number) =>
  'Bs ' +
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function finiquitoBoliviaLtg(i: FiniquitoBoliviaInputs): FiniquitoBoliviaOutputs {
  const sueldo = Number(i.sueldoPromedio);
  const anos = Math.max(0, Number(i.anosServicio) || 0);
  const meses = Math.max(0, Math.min(11, Number(i.mesesExtra) || 0));
  const mesesDelAno = Math.max(0, Math.min(12, Number(i.mesesTrabajadosDelAno) || 0));
  const diasVac = Math.max(0, Number(i.diasVacacionesPendientes) || 0);
  const tipo = i.tipoTermino || 'renuncia';

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo promedio de los últimos 3 meses');
  }
  if (anos === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad en la empresa');
  }

  // Indemnización: 1 sueldo por año. DS 110/2009 elimina tope de 8 años.
  // Antes de 1 año no hay indemnización, salvo DS 110: a partir de 90 días se paga proporcional.
  let indemnizacion = 0;
  const antiguedadTotalMeses = anos * 12 + meses;

  if (antiguedadTotalMeses >= 3) {
    // A partir de 90 días se paga indemnización proporcional (DS 110/2009)
    const anosFraccionales = anos + meses / 12;
    indemnizacion = sueldo * anosFraccionales;
  }

  // Desahucio: 3 sueldos. Solo aplica en despido injustificado o mutuo acuerdo (si así se pacta).
  let desahucio = 0;
  let observaciones = '';
  if (tipo === 'despido-injustificado') {
    desahucio = sueldo * 3;
    observaciones =
      'Despido injustificado: corresponden indemnización por tiempo de servicio + desahucio (3 sueldos).';
  } else if (tipo === 'renuncia') {
    observaciones =
      'Renuncia voluntaria: SOLO corresponde indemnización por tiempo de servicio (DS 110/2009) + aguinaldo y vacaciones proporcionales. No hay desahucio.';
  } else if (tipo === 'despido-justificado') {
    // En despido con causa justificada (Art. 16 LGT), se pierde el derecho a indemnización
    indemnizacion = 0;
    observaciones =
      'Despido con causa justificada (Art. 16 LGT): se pierde el derecho a indemnización y desahucio. Solo aguinaldo y vacaciones proporcionales.';
  } else if (tipo === 'mutuo-acuerdo') {
    observaciones =
      'Mutuo acuerdo: indemnización por tiempo de servicio se paga, desahucio es negociable.';
  }

  // Aguinaldo proporcional (Ley del 18/12/1944): 1/12 del sueldo × meses trabajados
  const aguinaldoProporcional = (sueldo / 12) * mesesDelAno;

  // Vacaciones: DS 17288 establece 15 días hábiles entre 1-5 años, 20 entre 5-10, 30 más de 10.
  // Valor día = sueldo / 30
  const valorDia = sueldo / 30;
  const vacacionesPendientes = valorDia * diasVac;

  const anosComputablesStr = `${anos} años ${meses} meses`;

  const totalFiniquito =
    indemnizacion + desahucio + aguinaldoProporcional + vacacionesPendientes;

  return {
    indemnizacionTiempoServicio: fmt(indemnizacion),
    desahucio: fmt(desahucio),
    aguinaldoProporcional: fmt(aguinaldoProporcional),
    vacacionesPendientes: fmt(vacacionesPendientes),
    totalFiniquito: fmt(totalFiniquito),
    anosComputables: anosComputablesStr,
    observaciones,
  };
}
