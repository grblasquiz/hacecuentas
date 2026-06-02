/**
 * Calculadora de Indemnización Agravada — Empleada de Casas Particulares
 * Ley 26.844 — Régimen Especial de Personal de Casas Particulares.
 *
 * Supuestos contemplados:
 *   - sin-causa (Art. 48 + 49): 1 mes por año o fracción > 3 meses.
 *   - embarazo (Art. 41): protección durante el embarazo y hasta 7
 *     meses y medio antes o después del parto. Indemnización agravada
 *     = indemnización por antigüedad + 6 meses de remuneración.
 *   - matrimonio (Art. 44): protección 3 meses antes y 6 meses después
 *     del matrimonio. Indemnización agravada = 6 meses de remuneración
 *     (sumado a indemnización ordinaria).
 *   - jubilacion-empleador (Art. 52): si la trabajadora reúne los
 *     requisitos para acceder a la jubilación, el empleador puede
 *     intimarla. Si igual la despide antes, debe pagar indemnización
 *     ordinaria del Art. 48.
 *   - incapacidad-empleada (Art. 53): si la trabajadora se incapacita
 *     total o parcialmente y no puede continuar, el empleador debe
 *     pagar indemnización equivalente a la del Art. 48.
 *
 * NOTA: la indemnización agravada del Art. 41 (embarazo) y del Art. 44
 * (matrimonio) se suma a la indemnización ordinaria del Art. 48 — no
 * la reemplaza.
 */

export interface IndemAgravadaInputs {
  sueldoMensual: number;
  antiguedadAnios: number;
  antiguedadMeses: number; // 0-11
  supuesto:
    | 'sin-causa'
    | 'embarazo'
    | 'matrimonio'
    | 'jubilacion-empleador'
    | 'incapacidad-empleada';
}

export interface IndemAgravadaOutputs {
  total: number;
  antiguedad: number;
  agravada: number; // los 6 sueldos si aplica
  preaviso: number;
  sac: number;
  vacaciones: number;
  aniosComputables: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function indemnizacionEmpleadaCasaParticularLey26844(
  inputs: IndemAgravadaInputs
): IndemAgravadaOutputs {
  const sueldo = Number(inputs.sueldoMensual);
  const anios = Math.max(0, Number(inputs.antiguedadAnios) || 0);
  const meses = Math.max(0, Math.min(11, Number(inputs.antiguedadMeses) || 0));
  const supuesto = inputs.supuesto || 'sin-causa';

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual.');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad laboral.');
  }

  const antiguedadTotalMeses = anios * 12 + meses;
  const aniosComputables = meses > 3 ? anios + 1 : anios;

  // Indemnización por antigüedad (Art. 48) — base para todos los supuestos
  const antiguedad = sueldo * aniosComputables;

  // Preaviso (Art. 42)
  let mesesPreaviso = 0;
  if (antiguedadTotalMeses < 12) mesesPreaviso = 10 / 30;
  else if (antiguedadTotalMeses <= 12 * 5) mesesPreaviso = 1;
  else mesesPreaviso = 2;
  const preaviso = sueldo * mesesPreaviso;

  // SAC proporcional (Art. 39): aproximación 3 meses promedio
  const sac = (sueldo / 2) * (3 / 6);

  // Vacaciones proporcionales (Art. 30)
  let diasVacAnual: number;
  if (anios < 5) diasVacAnual = 14;
  else if (anios < 10) diasVacAnual = 21;
  else if (anios < 20) diasVacAnual = 28;
  else diasVacAnual = 35;
  const diasVacProp = (diasVacAnual * 6) / 12;
  const vacaciones = (sueldo / 25) * diasVacProp;

  // Agravada: 6 meses de remuneración (Arts. 41 y 44)
  let agravada = 0;
  let mensaje = '';

  switch (supuesto) {
    case 'sin-causa':
      agravada = 0;
      mensaje =
        'Despido sin causa (Art. 48 + 49 Ley 26.844). Liquidación ordinaria: antigüedad + preaviso + integración + SAC + vacaciones proporcionales. Sin agravante.';
      break;
    case 'embarazo':
      agravada = sueldo * 6;
      mensaje =
        'Despido por causa de embarazo (Art. 41 Ley 26.844). Se presume durante el embarazo y hasta 7 meses y medio antes o después del parto, salvo prueba en contrario del empleador. Indemnización agravada = 6 meses de remuneración SUMADA a la indemnización por antigüedad.';
      break;
    case 'matrimonio':
      agravada = sueldo * 6;
      mensaje =
        'Despido por causa de matrimonio (Art. 44 Ley 26.844). Se presume si el despido se produce dentro de los 3 meses anteriores o 6 meses posteriores al matrimonio, comunicado fehacientemente al empleador. Indemnización agravada = 6 meses de remuneración SUMADA a la indemnización por antigüedad.';
      break;
    case 'jubilacion-empleador':
      agravada = 0;
      mensaje =
        'Extinción por jubilación (Art. 52 Ley 26.844). Si el empleador intimó correctamente y se cumplieron los plazos, el contrato se extingue sin indemnización por antigüedad — sólo proceden SAC y vacaciones proporcionales. Si el empleador no cumplió la intimación previa, corresponde indemnización del Art. 48.';
      break;
    case 'incapacidad-empleada':
      agravada = 0;
      mensaje =
        'Extinción por incapacidad de la trabajadora (Art. 53 Ley 26.844). Si la incapacidad es absoluta y permanente, el empleador debe pagar indemnización equivalente a la del Art. 48 (1 mes por año), sin preaviso. La ART y la obra social pueden cubrir prestaciones adicionales.';
      break;
  }

  const total = antiguedad + agravada + preaviso + sac + vacaciones;

  const totalFmt = '$' + Math.round(total).toLocaleString('es-AR');
  const sueldosTotal = total / sueldo;
  let insight: any;
  if (agravada > 0) {
    const etiqueta = supuesto === 'embarazo' ? 'embarazo' : 'matrimonio';
    insight = {
      title: 'Indemnización agravada',
      text: `Por ${etiqueta} se suman **6 sueldos** (**$${Math.round(agravada).toLocaleString('es-AR')}**) a la liquidación ordinaria: el total trepa a **${totalFmt}**, equivalente a **${sueldosTotal.toFixed(1)} sueldos**. Conservá la comunicación fehaciente que activa la presunción del Art. ${supuesto === 'embarazo' ? '41' : '44'}.`,
      tone: 'warn',
      icon: supuesto === 'embarazo' ? '🤰' : '💍',
    };
  } else if (supuesto === 'sin-causa') {
    insight = {
      title: 'Liquidación final',
      text: `El despido sin causa suma **${totalFmt}** (**${sueldosTotal.toFixed(1)} sueldos**), donde la antigüedad (**$${Math.round(antiguedad).toLocaleString('es-AR')}**) es el componente más pesado. Se computan **${aniosComputables}** ${aniosComputables === 1 ? 'año' : 'años'} (la fracción mayor a 3 meses suma un año).`,
      tone: 'neutral',
      icon: '🧹',
    };
  } else {
    insight = {
      title: 'Extinción sin agravante',
      text: `En este supuesto la liquidación da **${totalFmt}**. ${supuesto === 'jubilacion-empleador' ? 'Si la intimación previa fue correcta, **no corresponde indemnización por antigüedad**: solo SAC y vacaciones proporcionales.' : 'La incapacidad absoluta y permanente habilita indemnización del Art. 48 (**1 mes por año**), sin preaviso.'}`,
      tone: 'neutral',
      icon: supuesto === 'jubilacion-empleador' ? '👵' : '🩺',
    };
  }

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Antigüedad (Art. 48)', value: Math.round(antiguedad) },
      { label: 'Indemnización agravada (6 sueldos)', value: Math.round(agravada) },
      { label: 'Preaviso', value: Math.round(preaviso) },
      { label: 'SAC proporcional', value: Math.round(sac) },
      { label: 'Vacaciones proporcionales', value: Math.round(vacaciones) },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total',
    ariaLabel: 'Composición de la liquidación: antigüedad, indemnización agravada, preaviso, SAC y vacaciones',
  };

  return {
    total: Math.round(total),
    antiguedad: Math.round(antiguedad),
    agravada: Math.round(agravada),
    preaviso: Math.round(preaviso),
    sac: Math.round(sac),
    vacaciones: Math.round(vacaciones),
    aniosComputables: `${aniosComputables} ${aniosComputables === 1 ? 'año' : 'años'} computables`,
    mensaje,
    _chart: chart,
    _insight: insight,
  };
}
