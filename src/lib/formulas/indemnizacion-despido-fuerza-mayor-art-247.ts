/**
 * Calculadora de Indemnización por despido por fuerza mayor o
 * falta/disminución de trabajo no imputable al empleador — Art. 247 LCT
 * (Argentina, Ley 20.744).
 *
 * Marco legal:
 *   - Art. 247 LCT: cuando el despido se decide por FUERZA MAYOR o por FALTA
 *     o DISMINUCIÓN DE TRABAJO no imputable al empleador y debidamente
 *     comprobada, la indemnización del Art. 245 se REDUCE AL 50 %.
 *     El despido debe respetar el orden inverso de antigüedad dentro de
 *     cada especialidad (los menos antiguos primero, a igualdad de
 *     condiciones el peor cargado de familia, etc.).
 *   - Art. 218 LCT: la causa debe acreditarse fehacientemente. La
 *     jurisprudencia exige prueba estricta (CSJN, "Aquino" y posteriores).
 *     Cuando la causa no se prueba, se reactiva el 100 % del Art. 245.
 *   - Art. 251 LCT (quiebra/concurso): si la quiebra NO es atribuible al
 *     fallido (ej. crisis sectorial), se aplica también el 50 % del Art. 245.
 *     Si es por dolo o culpa del empleador, se paga el 100 %.
 *
 *   El resto de los rubros (preaviso, integración, SAC proporcional,
 *   vacaciones no gozadas y sus SAC) se pagan completos, igual que en
 *   un despido sin causa común.
 *
 *   El procedimiento preventivo de crisis (PPC) — Ley 24.013, Arts. 98 a
 *   105 — es OBLIGATORIO antes de invocar el Art. 247 cuando se afecten
 *   más del 15 % de los trabajadores (empresas <400) o el 10 % (400-1000)
 *   o el 5 % (>1000). Sin PPC, los despidos pueden anularse y pagarse
 *   como sin causa al 100 %.
 *
 * Fórmula:
 *   antiguedad_247 = 0.5 × base_245 × años_computables
 *   total = antiguedad_247 + preaviso + sac_preaviso +
 *           integracion + sac_integracion + sac_proporcional +
 *           vacaciones + sac_vacaciones
 */

export interface IndemnizacionDespidoFuerzaMayorInputs {
  sueldoBruto: number; // mejor remuneración mensual, normal y habitual del último año
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11
  topeConvenio: number; // 3 × promedio convencional; 0 = sin tope
  diaDespido: number; // 1-31, día del mes del despido
}

export interface IndemnizacionDespidoFuerzaMayorOutputs {
  antiguedad: number; // Art. 247 = 50 % Art. 245
  antiguedad245Completa: number; // referencia: lo que sería al 100 %
  preaviso: number;
  sacPreaviso: number;
  integracionMes: number;
  sacIntegracion: number;
  sacProporcional: number;
  vacacionesProporcionales: number;
  sacVacaciones: number;
  total: number;
  aniosComputables: string;
  baseArt245: number;
  vizzotiAplicado: boolean;
  mensaje: string;
  _chart?: any;
}

export function indemnizacionDespidoFuerzaMayorArt247(
  inputs: IndemnizacionDespidoFuerzaMayorInputs,
): IndemnizacionDespidoFuerzaMayorOutputs {
  const sueldo = Number(inputs.sueldoBruto);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const tope = Math.max(0, Number(inputs.topeConvenio) || 0);
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral');
  }

  const antiguedadTotalMeses = anios * 12 + meses;
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Art. 245 base con tope + Vizzoti (igual que despido sin causa)
  let baseArt245 = sueldo;
  let vizzotiAplicado = false;
  if (tope > 0) {
    const minConVizzoti = sueldo * 0.67;
    if (tope < minConVizzoti) {
      baseArt245 = minConVizzoti;
      vizzotiAplicado = true;
    } else {
      baseArt245 = tope;
    }
  }

  // Art. 247 = 50 % del Art. 245
  const antiguedad245Completa = baseArt245 * aniosComputables;
  const antiguedad = antiguedad245Completa * 0.5;

  // Preaviso (Art. 231): se paga completo
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 3) mesesPreaviso = 0.5;
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;
  const preaviso = sueldo * mesesPreaviso;
  const sacPreaviso = preaviso / 12;

  // Integración mes de despido (Art. 233): completa
  const diasMes = 30;
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracionMes = (sueldo / diasMes) * diasFaltantes;
  const sacIntegracion = integracionMes / 12;

  // SAC proporcional (semestre en curso, aprox. 3 meses promedio)
  const sacProporcional = (sueldo / 2) * (3 / 6);

  // Vacaciones proporcionales (Art. 156)
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25;
  const vacacionesProporcionales = valorDia * diasVacProp;
  const sacVacaciones = vacacionesProporcionales / 12;

  const total =
    antiguedad +
    preaviso +
    sacPreaviso +
    integracionMes +
    sacIntegracion +
    sacProporcional +
    vacacionesProporcionales +
    sacVacaciones;

  const mensaje =
    'El Art. 247 LCT aplica solo si la causa (fuerza mayor o falta/disminución de trabajo) es acreditada fehacientemente y se respeta el orden inverso de antigüedad. Sin prueba estricta, la jurisprudencia reactiva el 100 % del Art. 245.';

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Antigüedad (Art. 247, 50%)', value: Math.round(antiguedad) },
      { label: 'Preaviso + SAC', value: Math.round(preaviso + sacPreaviso) },
      { label: 'Integración mes + SAC', value: Math.round(integracionMes + sacIntegracion) },
      { label: 'SAC proporcional', value: Math.round(sacProporcional) },
      { label: 'Vacaciones + SAC', value: Math.round(vacacionesProporcionales + sacVacaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición de la liquidación Art. 247: antigüedad reducida al 50%, preaviso, integración, SAC y vacaciones',
  };

  return {
    antiguedad: Math.round(antiguedad),
    antiguedad245Completa: Math.round(antiguedad245Completa),
    preaviso: Math.round(preaviso),
    sacPreaviso: Math.round(sacPreaviso),
    integracionMes: Math.round(integracionMes),
    sacIntegracion: Math.round(sacIntegracion),
    sacProporcional: Math.round(sacProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    sacVacaciones: Math.round(sacVacaciones),
    total: Math.round(total),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    baseArt245: Math.round(baseArt245),
    vizzotiAplicado,
    mensaje,
    _chart: chart,
  };
}
