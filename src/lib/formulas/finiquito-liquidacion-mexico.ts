/**
 * Calculadora de finiquito y liquidación México (LFT)
 * - Finiquito: días pendientes + vacaciones prop + prima vacacional + aguinaldo prop
 * - Liquidación: finiquito + 3 meses sueldo + 20 días por año (indemnización por despido injustificado)
 */

export interface Inputs {
  salarioDiario: number;
  aniosAntiguedad: number;
  tipoTerminacion?: 'renuncia' | 'despido-justificado' | 'despido-injustificado' | 'acuerdo';
  diasAguinaldo?: number;
  diasPendientesMes?: number;
  diasVacacionesPendientes?: number;
  primaVacacional?: number; // %
}

export interface Outputs {
  total: number;
  finiquitoPartes: number;
  tresMeses: number;
  veinteDias: number;
  primaAntiguedad: number;
  desglose: Record<string, number>;
  tipoCalculado: string;
  mensaje: string;
}

// LFT 2023: dias vacaciones por antiguedad
function diasVacacionesLFT(anios: number): number {
  if (anios < 1) return 0;
  if (anios < 2) return 12;
  if (anios < 3) return 14;
  if (anios < 4) return 16;
  if (anios < 5) return 18;
  if (anios < 10) return 20;
  if (anios < 15) return 22;
  if (anios < 20) return 24;
  return 26;
}

export function finiquitoLiquidacionMexico(i: Inputs): Outputs {
  const sd = Number(i.salarioDiario);
  const anios = Number(i.aniosAntiguedad);
  const tipoTerm = i.tipoTerminacion ?? 'despido-injustificado';
  const aguinaldoDias = Number(i.diasAguinaldo ?? 15);
  const diasMes = Number(i.diasPendientesMes ?? 10);
  const diasVacInput = i.diasVacacionesPendientes;
  const diasVac = diasVacInput !== undefined && diasVacInput !== null && !isNaN(Number(diasVacInput))
    ? Number(diasVacInput)
    : diasVacacionesLFT(anios);
  const primaVacPct = Number(i.primaVacacional ?? 25);

  if (!sd || sd <= 0) throw new Error('Ingresá el salario diario');
  if (anios === undefined || anios === null || isNaN(anios) || anios < 0) {
    throw new Error('Ingresá los años de antigüedad');
  }

  const sueldoPendiente = sd * diasMes;
  const vacacionesProp = sd * diasVac;
  const primaVacacional = vacacionesProp * (primaVacPct / 100);
  const diasTranscurridosAnio = Math.min(365, diasMes + 30);
  const aguinaldoProp = (sd * aguinaldoDias * diasTranscurridosAnio) / 365;

  const finiquitoPartes = sueldoPendiente + vacacionesProp + primaVacacional + aguinaldoProp;

  const desglose: Record<string, number> = {
    'Sueldo pendiente': Number(sueldoPendiente.toFixed(2)),
    'Vacaciones proporcionales': Number(vacacionesProp.toFixed(2)),
    'Prima vacacional': Number(primaVacacional.toFixed(2)),
    'Aguinaldo proporcional': Number(aguinaldoProp.toFixed(2)),
  };

  let tresMeses = 0;
  let veinteDias = 0;
  let primaAntiguedad = 0;
  let tipoCalculado = 'Finiquito';

  if (tipoTerm === 'despido-injustificado') {
    tresMeses = sd * 90;
    veinteDias = sd * 20 * anios;
    // Tope LFT Art. 162: 2 salarios mínimos generales (SMG 2026 = $278.80)
    const salarioTope = Math.min(sd, 278.80 * 2);
    primaAntiguedad = 12 * anios * salarioTope;

    desglose['Indemnización 3 meses'] = Number(tresMeses.toFixed(2));
    desglose['20 días por año'] = Number(veinteDias.toFixed(2));
    desglose['Prima de antigüedad'] = Number(primaAntiguedad.toFixed(2));

    tipoCalculado = 'Liquidación (despido injustificado)';
  } else if (tipoTerm === 'renuncia' && anios >= 15) {
    // Renuncia con 15+ años: prima antigüedad (Art. 162 LFT)
    // Tope LFT Art. 162: 2 salarios mínimos generales (SMG 2026 = $278.80)
    const salarioTope = Math.min(sd, 278.80 * 2);
    primaAntiguedad = 12 * anios * salarioTope;
    desglose['Prima de antigüedad'] = Number(primaAntiguedad.toFixed(2));
  }

  const total = finiquitoPartes + tresMeses + veinteDias + primaAntiguedad;

  return {
    total: Number(total.toFixed(2)),
    finiquitoPartes: Number(finiquitoPartes.toFixed(2)),
    tresMeses: Number(tresMeses.toFixed(2)),
    veinteDias: Number(veinteDias.toFixed(2)),
    primaAntiguedad: Number(primaAntiguedad.toFixed(2)),
    desglose,
    tipoCalculado,
    mensaje: `${tipoCalculado}: $${total.toFixed(2)} en total.`,
  };
}
