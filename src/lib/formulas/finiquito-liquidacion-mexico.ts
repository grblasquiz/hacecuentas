/**
 * Calculadora de finiquito y liquidación México (LFT)
 * - Finiquito: días pendientes + vacaciones prop + prima vacacional + aguinaldo prop
 * - Liquidación: finiquito + 3 meses sueldo + 20 días por año (indemnización por despido injustificado)
 */

export interface Inputs {
  sueldoDiario: number;
  aniosTrabajados: number;
  diasPendientesMes: number;
  diasVacacionesPendientes: number;
  primaVacacional?: number; // % default 25
  aguinaldo15Dias?: boolean;
  tipo: 'finiquito' | 'liquidacion';
}

export interface Outputs {
  total: number;
  desglose: Record<string, number>;
  tipoCalculado: string;
  mensaje: string;
}

export function finiquitoLiquidacionMexico(i: Inputs): Outputs {
  const sd = Number(i.sueldoDiario);
  const anios = Number(i.aniosTrabajados);
  const diasMes = Number(i.diasPendientesMes);
  const diasVac = Number(i.diasVacacionesPendientes);
  const primaVacPct = Number(i.primaVacacional ?? 25);
  const aguinaldoDias = i.aguinaldo15Dias ?? true ? 15 : 15;
  const tipo = i.tipo;

  if (!sd || sd <= 0) throw new Error('Ingresá el sueldo diario');
  if (anios === undefined || anios === null || isNaN(anios) || anios < 0) {
    throw new Error('Ingresá los años trabajados');
  }
  if (diasMes === undefined || diasMes === null || isNaN(diasMes) || diasMes < 0) {
    throw new Error('Ingresá los días pendientes del mes');
  }
  if (!['finiquito', 'liquidacion'].includes(tipo)) {
    throw new Error('Tipo debe ser finiquito o liquidacion');
  }

  // Componentes finiquito
  const sueldoPendiente = sd * diasMes;
  const vacacionesProp = sd * diasVac;
  const primaVacacional = vacacionesProp * (primaVacPct / 100);
  // Aguinaldo proporcional: días/365 del año
  const diasTranscurridosAnio = Math.min(365, diasMes + 30); // aprox al mes actual
  const aguinaldoProp = (sd * aguinaldoDias * diasTranscurridosAnio) / 365;

  const totalFiniquito = sueldoPendiente + vacacionesProp + primaVacacional + aguinaldoProp;

  const desglose: Record<string, number> = {
    'Sueldo pendiente': Number(sueldoPendiente.toFixed(2)),
    'Vacaciones proporcionales': Number(vacacionesProp.toFixed(2)),
    'Prima vacacional': Number(primaVacacional.toFixed(2)),
    'Aguinaldo proporcional': Number(aguinaldoProp.toFixed(2)),
  };

  let total = totalFiniquito;
  let tipoCalculado = 'Finiquito';

  if (tipo === 'liquidacion') {
    const tresMeses = sd * 90;
    const veinteDiasPorAnio = sd * 20 * anios;
    // Prima de antigüedad: 12 días por año (con tope 2 UMA ~ 240/día 2026)
    const salarioTope = Math.min(sd, 240);
    const primaAntiguedad = 12 * anios * salarioTope;

    desglose['Indemnización 3 meses'] = Number(tresMeses.toFixed(2));
    desglose['20 días por año'] = Number(veinteDiasPorAnio.toFixed(2));
    desglose['Prima de antigüedad'] = Number(primaAntiguedad.toFixed(2));

    total = totalFiniquito + tresMeses + veinteDiasPorAnio + primaAntiguedad;
    tipoCalculado = 'Liquidación (despido injustificado)';
  }

  return {
    total: Number(total.toFixed(2)),
    desglose,
    tipoCalculado,
    mensaje: `${tipoCalculado}: $${total.toFixed(2)} en total.`,
  };
}
