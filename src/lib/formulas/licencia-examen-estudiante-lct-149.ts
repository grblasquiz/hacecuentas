/**
 * Calculadora de Licencia por Examen del Estudiante Trabajador (Art. 149 LCT)
 *
 * Marco legal:
 *   - Ley 20.744 (LCT) Art. 149:
 *       2 días corridos pagos por examen
 *       Máximo 10 días por año calendario (= 5 exámenes)
 *   - Ley 26.390: protección del estudiante trabajador
 *   - Estudios cubiertos: secundarios, terciarios, universitarios, posgrado
 *     en instituciones oficialmente reconocidas
 *
 * Mejoras por convenio:
 *   - CCT 18/75 (Bancarios): 3 días por examen, 15 días anuales
 *   - CCT 122/75 (Sanidad): 2 días, hasta 12 días anuales para residentes
 *
 * Cálculo: días corridos (cuentan sábados, domingos y feriados).
 * Los días no acumulan al año siguiente (uso o pérdida en año calendario).
 */

const DIAS_POR_EXAMEN_LCT = 2;
const MAX_EXAMENES_LCT = 5;
const MAX_DIAS_ANUALES_LCT = DIAS_POR_EXAMEN_LCT * MAX_EXAMENES_LCT; // 10

export interface LicenciaExamenInputs {
  sueldoMensual: number;
  examenesEnAnio: number;
  examenesYaTomados: number;
}

export interface LicenciaExamenOutputs {
  diasDisponibles: string;
  diasUsadosTotalmente: string;
  montoBrutoPorDia: number;
  totalDisponibleEnPesos: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function licenciaExamenEstudianteLct149(
  inputs: LicenciaExamenInputs
): LicenciaExamenOutputs {
  const sueldo = Number(inputs.sueldoMensual);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual bruto');
  }

  const examenesAnio = Math.max(1, Number(inputs.examenesEnAnio) || 1);
  const examenesYaTomados = Math.max(
    0,
    Math.min(examenesAnio - 1, Number(inputs.examenesYaTomados) || 0)
  );

  const valorDia = sueldo / 30;

  // Días ya usados en el año
  const diasYaUsados = examenesYaTomados * DIAS_POR_EXAMEN_LCT;

  // Días remanentes del tope anual
  const diasRemanentesTope = Math.max(0, MAX_DIAS_ANUALES_LCT - diasYaUsados);

  // Días que necesitaría para los exámenes pendientes
  const examenesPendientes = examenesAnio - examenesYaTomados;
  const diasNecesarios = examenesPendientes * DIAS_POR_EXAMEN_LCT;

  // Días efectivamente disponibles = mínimo entre lo que pide y lo que LCT permite
  const diasEfectivosDisponibles = Math.min(diasNecesarios, diasRemanentesTope);

  const totalDisponibleEnPesos = valorDia * diasEfectivosDisponibles;

  const diasDisponibles = `${diasEfectivosDisponibles} días corridos disponibles para ${examenesPendientes} examen${examenesPendientes !== 1 ? 'es' : ''} pendiente${examenesPendientes !== 1 ? 's' : ''}`;

  const diasUsadosTotalmente = `${diasYaUsados} días usados de ${MAX_DIAS_ANUALES_LCT} máximo anual (${examenesYaTomados} exámenes rendidos)`;

  let mensaje: string;

  if (examenesAnio > MAX_EXAMENES_LCT) {
    const examenesExceso = examenesAnio - MAX_EXAMENES_LCT;
    mensaje =
      `Tenés ${examenesAnio} exámenes proyectados pero el tope LCT cubre solo 5 (10 días). ` +
      `Los ${examenesExceso} examen${examenesExceso > 1 ? 'es' : ''} excedentes (${examenesExceso * 2} días adicionales) no están cubiertos por Art. 149. ` +
      `Opciones: negociar con el empleador, usar vacaciones, permiso sin goce, o compensar con horas extra. ` +
      `Algunos convenios mejoran el tope: CCT 18/75 (Bancarios) llega a 15 días anuales.`;
  } else if (diasRemanentesTope === 0) {
    mensaje =
      `Ya usaste los 10 días anuales del tope LCT Art. 149 (${examenesYaTomados} exámenes con licencia). ` +
      `No te quedan días cubiertos en el año calendario actual. ` +
      `Para próximos exámenes: vacaciones, permiso sin goce o compensación con horas extra. ` +
      `Los días sobrantes no se acumulan al año siguiente (uso o pérdida).`;
  } else {
    mensaje =
      `Te quedan ${diasRemanentesTope} días disponibles del tope LCT (${examenesYaTomados} exámenes rendidos, ${diasYaUsados} días usados). ` +
      `Por cada examen: 2 días corridos pagos (día previo + día del examen). ` +
      `Avisá al empleador con anticipación (5-7 días) y presentá certificado de examen rendido emitido por la institución dentro de los 5 días posteriores. ` +
      `No importa si aprobaste o desaprobaste: la licencia es por haber rendido.`;
  }

  const totalPesosR = Math.round(totalDisponibleEnPesos);
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');

  // Insight dinámico según cuánto del tope anual queda
  let _insight: any;
  if (diasRemanentesTope === 0) {
    _insight = {
      title: 'Tope anual agotado',
      text: `Ya usaste los **10 días** que cubre el Art. 149 LCT (${examenesYaTomados} exámenes). No te quedan días pagos este año calendario: para los próximos exámenes vas a necesitar vacaciones, permiso sin goce o compensar horas. Los días no usados no se acumulan al año siguiente.`,
      tone: 'warn',
      icon: '📚',
    };
  } else if (diasEfectivosDisponibles < diasNecesarios) {
    _insight = {
      title: 'No alcanzan para todos los exámenes',
      text: `Te quedan **${diasRemanentesTope} días** del tope LCT, pero necesitás ${diasNecesarios} para tus ${examenesPendientes} exámenes pendientes. La licencia paga cubre **${fmt(totalPesosR)}** (${diasEfectivosDisponibles} días); el resto lo tendrás que cubrir con vacaciones o acuerdo con el empleador.`,
      tone: 'warn',
      icon: '📚',
    };
  } else {
    _insight = {
      title: 'Días de examen cubiertos',
      text: `Tenés **${diasEfectivosDisponibles} días corridos** pagos para tus ${examenesPendientes} exámenes pendientes, equivalentes a **${fmt(totalPesosR)}**. Son 2 días por examen (día previo + día del examen) y se pagan al rendir, apruebes o no. Avisá con 5-7 días y presentá el certificado de examen rendido.`,
      tone: 'good',
      icon: '📚',
    };
  }

  // Gauge: días usados sobre el tope anual de 10
  const topeMax = Math.max(MAX_DIAS_ANUALES_LCT, diasYaUsados) + 1;
  const _chart = {
    type: 'scale',
    marker: diasYaUsados,
    markerLabel: `${diasYaUsados} días usados`,
    min: 0,
    segments: [
      { nombre: 'Con margen', max: 6, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Cerca del tope', max: MAX_DIAS_ANUALES_LCT, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Tope superado', max: topeMax, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Usaste ${diasYaUsados} de los 10 días anuales que cubre el Art. 149 LCT`,
  };

  return {
    diasDisponibles,
    diasUsadosTotalmente,
    montoBrutoPorDia: Math.round(valorDia),
    totalDisponibleEnPesos: totalPesosR,
    mensaje,
    _insight,
    _chart,
  };
}
