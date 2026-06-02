export interface Inputs {
  sisben_clasificacion: 'A' | 'B';
  miembros_nucleo: number;
  menores_educacion: number;
  embarazada_lactancia: 'si' | 'no';
  personas_discapacidad: number;
}

export interface Outputs {
  monto_mensual: number;
  monto_anual: number;
  elegibilidad: string;
  periodicidad: string;
  requisitos_cumplimiento: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 DPS - Renta Ciudadana
  // Fuente: DPS, Resolución 1403/2024
  const CUANTIA_BASE_SISBEN_A = 220000; // COP - Pobreza Extrema
  const CUANTIA_BASE_SISBEN_B = 110000; // COP - Pobreza Moderada
  const BONIFICACION_EDUCACION = 96000; // COP por menor en educación
  const BONIFICACION_EMBARAZO_LACTANCIA = 100000; // COP una sola vez
  const BONIFICACION_DISCAPACIDAD = 50000; // COP por persona
  const TECHO_MAXIMO_MENSUAL = 384360; // COP techo máximo por núcleo

  // Validaciones previas
  let elegibilidad = 'Elegible';
  let requisitos = [];

  // Solo SISBEN A y B son elegibles
  if (i.sisben_clasificacion !== 'A' && i.sisben_clasificacion !== 'B') {
    elegibilidad = 'No elegible - Fuera de SISBEN A/B';
    return {
      monto_mensual: 0,
      monto_anual: 0,
      elegibilidad: elegibilidad,
      periodicidad: 'N/A',
      requisitos_cumplimiento: 'Solo hogares SISBEN A (pobreza extrema) o B (pobreza moderada)',
      _insight: {
        title: 'No clasificás a Renta Ciudadana',
        text: 'El programa solo cubre hogares en **SISBÉN A** (pobreza extrema) o **B** (pobreza moderada). Con tu clasificación actual no hay cuantía a liquidar.',
        tone: 'warn',
        icon: '🍚'
      }
    };
  }

  // Cálculo de cuantía base
  const cuantiaBase = i.sisben_clasificacion === 'A' ? CUANTIA_BASE_SISBEN_A : CUANTIA_BASE_SISBEN_B;

  // Cálculo de bonificaciones
  let bonificacionEducacion = 0;
  if (i.menores_educacion > 0) {
    bonificacionEducacion = i.menores_educacion * BONIFICACION_EDUCACION;
    requisitos.push(`Asistencia escolar mínimo 75% de ${i.menores_educacion} menor(es)`);
  }

  let bonificacionEmbarazo = 0;
  if (i.embarazada_lactancia === 'si') {
    bonificacionEmbarazo = BONIFICACION_EMBARAZO_LACTANCIA;
    requisitos.push('Controles prenatales/postnatales documentados');
  }

  let bonificacionDiscapacidad = 0;
  if (i.personas_discapacidad > 0) {
    bonificacionDiscapacidad = i.personas_discapacidad * BONIFICACION_DISCAPACIDAD;
    requisitos.push(`Certificado de discapacidad MÍAS para ${i.personas_discapacidad} persona(s)`);
  }

  // Suma de componentes
  const montoCalculado = cuantiaBase + bonificacionEducacion + bonificacionEmbarazo + bonificacionDiscapacidad;

  // Aplicar techo máximo
  const montoMensual = Math.min(montoCalculado, TECHO_MAXIMO_MENSUAL);
  const montoAnual = montoMensual * 12;

  // Requisitos por defecto
  if (requisitos.length === 0) {
    requisitos.push('Registro en BDU (Base de Datos Única de Beneficiarios)');
  }

  // Mensaje de elegibilidad ajustado
  if (i.sisben_clasificacion === 'A') {
    elegibilidad = 'Elegible - SISBEN A (Pobreza Extrema)';
  } else if (i.sisben_clasificacion === 'B') {
    elegibilidad = 'Elegible - SISBEN B (Pobreza Moderada)';
  }

  // Si no hay menores en educación y no hay gestación, hacer mención
  if (i.menores_educacion === 0 && i.embarazada_lactancia === 'no') {
    requisitos.push('Considere incorporar menores a educación para aumentar cuantía');
  }

  const requisitosTexto = requisitos.join(' | ');

  // --- Insight narrativo ---
  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const totalBonificaciones = bonificacionEducacion + bonificacionEmbarazo + bonificacionDiscapacidad;
  const topeAplicado = montoCalculado > TECHO_MAXIMO_MENSUAL;
  const tipoTxt = i.sisben_clasificacion === 'A' ? 'pobreza extrema (SISBÉN A)' : 'pobreza moderada (SISBÉN B)';
  const detalleBoni = totalBonificaciones > 0
    ? ` A la cuantía base de **${fmtCOP(cuantiaBase)}** se le suman **${fmtCOP(totalBonificaciones)}** en bonificaciones.`
    : ` Por ahora solo recibís la cuantía base; sumando menores en educación podrías aumentarla.`;
  const detalleTope = topeAplicado
    ? ` El cálculo llegó al techo máximo por núcleo (${fmtCOP(TECHO_MAXIMO_MENSUAL)}).`
    : '';
  const _insight = {
    title: 'Tu transferencia mensual',
    text: `Como hogar en ${tipoTxt} te corresponden **${fmtCOP(montoMensual)} al mes**, unos **${fmtCOP(montoAnual)}** en el año.${detalleBoni}${detalleTope}`,
    tone: 'good',
    icon: '🍚'
  };

  // --- Gráfico: composición de la transferencia mensual ---
  let _chart: any = undefined;
  if (totalBonificaciones > 0) {
    // La base se ajusta para que las porciones sumen exactamente el monto liquidado (respeta el techo)
    const baseMostrada = Math.max(0, montoMensual - totalBonificaciones);
    const slices = [{ label: 'Cuantía base', value: Math.round(baseMostrada) }];
    if (bonificacionEducacion > 0) slices.push({ label: 'Bono educación', value: Math.round(bonificacionEducacion) });
    if (bonificacionEmbarazo > 0) slices.push({ label: 'Bono gestación/lactancia', value: Math.round(bonificacionEmbarazo) });
    if (bonificacionDiscapacidad > 0) slices.push({ label: 'Bono discapacidad', value: Math.round(bonificacionDiscapacidad) });
    _chart = {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: fmtCOP(montoMensual),
      centerLabel: 'Mensual',
      ariaLabel: `Composición de la transferencia mensual de ${fmtCOP(montoMensual)}: cuantía base más bonificaciones por educación, gestación y discapacidad.`
    };
  }

  return {
    monto_mensual: Math.round(montoMensual),
    monto_anual: Math.round(montoAnual),
    elegibilidad: elegibilidad,
    periodicidad: 'Mensual (entre 5º y 10º día hábil)',
    requisitos_cumplimiento: requisitosTexto,
    _insight,
    _chart
  };
}
