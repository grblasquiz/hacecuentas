/**
 * Calculadora de indemnización por despido tras enfermedad inculpable o
 * accidente no laboral — Arts. 208 / 211 / 212 LCT (Ley 20.744, Argentina).
 *
 * Marco legal:
 *   - Art. 208 LCT: licencia paga por enfermedad o accidente INCULPABLE
 *     (no laboral). Duración: 3 meses si <5 años de antigüedad, 6 meses
 *     si ≥5 años. Si tiene cargas de familia, se DUPLICA: 6 y 12 meses
 *     respectivamente. Durante la licencia cobra el sueldo íntegro.
 *   - Art. 211 LCT: vencido el plazo de licencia paga del Art. 208, si
 *     el trabajador NO está en condiciones de reintegrarse, se abre el
 *     PLAZO DE RESERVA DE PUESTO de hasta UN (1) AÑO. Sin remuneración.
 *     Al término, el empleador puede mantener la relación o extinguirla
 *     sin indemnización del Art. 245.
 *   - Art. 212 LCT: regula el despido tras licencia / reserva según la
 *     capacidad recuperada por el trabajador. Establece TRES supuestos:
 *
 *     (a) "PUEDE TAREAS DISTINTAS Y NO SE LAS DAN": el trabajador conserva
 *         capacidad para trabajar pero NO en su tarea habitual. Si el
 *         empleador puede dar tareas adecuadas y NO lo hace, paga
 *         INDEMNIZACIÓN COMPLETA DEL ART. 245 (100 %).
 *
 *     (b) "INCAPACIDAD ABSOLUTA": la enfermedad o accidente le produce
 *         incapacidad TOTAL Y PERMANENTE para cualquier trabajo. La LCT
 *         prevé indemnización equivalente al Art. 245 (no se reduce).
 *         Antes se debatía, pero la jurisprudencia consolidada (CNAT
 *         Acuerdo Plenario 207 "Pratti c/ ELMA" y posteriores) confirma
 *         el monto completo. Compatible con la pensión por invalidez de
 *         ANSES (Ley 24.241). NOTA: esta calc usa Art. 245 al 100 %.
 *
 *     (c) "RECUPERA CAPACIDAD Y EMPLEADOR DESPIDE": si el trabajador
 *         recupera y el empleador decide despedirlo igual, paga Art. 245
 *         completo. Es un despido sin causa común.
 *
 *   Adicional al Art. 212 se suman preaviso, integración del mes, SAC
 *   proporcional y vacaciones no gozadas, igual que en cualquier despido.
 *
 *   Esta calculadora NO calcula: licencia paga del Art. 208 (es sueldo
 *   normal), ni accidente de trabajo (Ley 24.557 ART), ni pensión por
 *   invalidez ANSES.
 *
 * Fórmula:
 *   indemnización_base = base_245 × años_computables    (los 3 supuestos)
 *   total = indemnización_base + preaviso + sac_preaviso +
 *           integración + sac_integración + sac_proporcional +
 *           vacaciones + sac_vacaciones
 */

export type SupuestoArt212 =
  | 'puede-otras-tareas-no-las-dan'
  | 'incapacidad-total'
  | 'recuperado-despido';

export interface DespidoEnfermedadInputs {
  sueldoBruto: number; // mejor remuneración mensual normal y habitual del último año
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11
  supuesto: SupuestoArt212;
  topeConvenio: number; // 3 × promedio convencional; 0 = sin tope
  diaDespido: number; // 1-31
}

export interface DespidoEnfermedadOutputs {
  total: number;
  supuestoAplicado: string;
  indemnizacionBase: number; // monto principal por el Art. 212 aplicable
  preaviso: number;
  sacPreaviso: number;
  integracionMes: number;
  sacIntegracion: number;
  sacProporcional: number;
  vacaciones: number;
  sacVacaciones: number;
  aniosComputables: string;
  baseArt245: number;
  vizzotiAplicado: boolean;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

const SUPUESTOS_VALIDOS: SupuestoArt212[] = [
  'puede-otras-tareas-no-las-dan',
  'incapacidad-total',
  'recuperado-despido',
];

export function despidoEnfermedadInculpableArt211(
  inputs: DespidoEnfermedadInputs,
): DespidoEnfermedadOutputs {
  const sueldo = Number(inputs.sueldoBruto);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const tope = Math.max(0, Number(inputs.topeConvenio) || 0);
  const diaDespido = Math.max(1, Math.min(31, Number(inputs.diaDespido) || 15));
  const supuesto: SupuestoArt212 = SUPUESTOS_VALIDOS.includes(inputs.supuesto)
    ? inputs.supuesto
    : 'puede-otras-tareas-no-las-dan';

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral');
  }

  const antiguedadTotalMeses = anios * 12 + meses;
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Base Art. 245 con tope y Vizzoti
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

  // Indemnización principal: los 3 supuestos del Art. 212 LCT pagan
  // el equivalente al Art. 245 (100 %). La jurisprudencia confirma la
  // indemnización completa también para incapacidad total y permanente.
  const art245 = baseArt245 * aniosComputables;
  const indemnizacionBase = art245;

  // Preaviso
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 3) mesesPreaviso = 0.5;
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;
  const preaviso = sueldo * mesesPreaviso;
  const sacPreaviso = preaviso / 12;

  // Integración mes
  const diasMes = 30;
  const diasFaltantes = Math.max(0, diasMes - diaDespido);
  const integracionMes = (sueldo / diasMes) * diasFaltantes;
  const sacIntegracion = integracionMes / 12;

  // SAC proporcional (semestre en curso)
  const sacProporcional = (sueldo / 2) * (3 / 6);

  // Vacaciones proporcionales (Art. 156)
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;
  const diasVacProp = (diasVacAnual * 6) / 12;
  const valorDia = sueldo / 25;
  const vacaciones = valorDia * diasVacProp;
  const sacVacaciones = vacaciones / 12;

  const total =
    indemnizacionBase +
    preaviso +
    sacPreaviso +
    integracionMes +
    sacIntegracion +
    sacProporcional +
    vacaciones +
    sacVacaciones;

  let supuestoAplicado = '';
  let mensaje = '';
  switch (supuesto) {
    case 'puede-otras-tareas-no-las-dan':
      supuestoAplicado =
        'Art. 212 párrafo 2°: conserva capacidad para tareas distintas y el empleador no las otorga';
      mensaje =
        'Cuando el trabajador conserva capacidad para tareas diferentes y el empleador no se las asigna pudiendo hacerlo, debe pagar la indemnización del Art. 245 LCT al 100 %. Se suman preaviso, integración, SAC y vacaciones no gozadas.';
      break;
    case 'incapacidad-total':
      supuestoAplicado =
        'Art. 212 párrafo 4°: incapacidad absoluta y permanente (total)';
      mensaje =
        'La incapacidad absoluta y permanente genera indemnización equivalente al Art. 245 LCT (Plenario CNAT 207 "Pratti c/ ELMA" y jurisprudencia posterior). Es compatible con la pensión por invalidez de ANSES (Ley 24.241).';
      break;
    case 'recuperado-despido':
      supuestoAplicado =
        'Art. 212 párrafo 1° (recupera + despido sin causa): el empleador desiste y despide';
      mensaje =
        'Si el trabajador recupera capacidad y el empleador opta por despedirlo, se aplica la indemnización del Art. 245 LCT (despido sin causa) más preaviso, integración, SAC y vacaciones.';
      break;
  }

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Indemnización Art. 245', value: Math.round(indemnizacionBase) },
      { label: 'Preaviso (+ SAC)', value: Math.round(preaviso + sacPreaviso) },
      { label: 'Integración mes (+ SAC)', value: Math.round(integracionMes + sacIntegracion) },
      { label: 'SAC proporcional', value: Math.round(sacProporcional) },
      { label: 'Vacaciones (+ SAC)', value: Math.round(vacaciones + sacVacaciones) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel:
      'Composición de la liquidación por despido tras enfermedad inculpable: indemnización del Art. 245, preaviso, integración del mes, SAC proporcional y vacaciones no gozadas.',
  };

  const pctBase = total > 0 ? Math.round((indemnizacionBase / total) * 100) : 0;
  const insight = {
    title: 'Composición de la liquidación',
    text: `La indemnización del **Art. 245** (**$${Math.round(indemnizacionBase).toLocaleString('es-AR')}**) es el grueso del cobro: **${pctBase}%** del total de **$${Math.round(total).toLocaleString('es-AR')}**. El resto son preaviso, integración del mes, SAC y vacaciones no gozadas.${vizzotiAplicado ? ' Se aplicó el piso Vizzoti (67% del sueldo) porque el tope convencional era más bajo.' : ''}`,
    tone: 'neutral' as const,
    icon: '⚖️',
  };

  return {
    total: Math.round(total),
    supuestoAplicado,
    indemnizacionBase: Math.round(indemnizacionBase),
    preaviso: Math.round(preaviso),
    sacPreaviso: Math.round(sacPreaviso),
    integracionMes: Math.round(integracionMes),
    sacIntegracion: Math.round(sacIntegracion),
    sacProporcional: Math.round(sacProporcional),
    vacaciones: Math.round(vacaciones),
    sacVacaciones: Math.round(sacVacaciones),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    baseArt245: Math.round(baseArt245),
    vizzotiAplicado,
    mensaje,
    _chart: chart,
    _insight: insight,
  };
}
