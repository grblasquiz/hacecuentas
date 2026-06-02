export interface Inputs {
  salario_diario: number;
  dias_licencia: number;
  tipo_licencia: 'comun' | 'laboral' | 'prenatal' | 'postnatal';
  tipo_salud: 'isapre' | 'fonasa';
  dias_pre_licencia?: number;
}

export interface Outputs {
  pago_dias_empleador: number;
  pago_dias_subsidio: number;
  total_licencia: number;
  dias_empleador_efectivos: number;
  dias_subsidio_efectivos: number;
  tope_uf_diario: number;
  alcanza_tope: string;
  requisitos: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile
  const UF_2026 = 35274.09; // Valor UF promedio 2026 (Banco Central)
  const TOPE_UF_IMPONIBLE = 81.4; // UF máximo imponible por licencia
  const TOPE_UF_PESOS = TOPE_UF_IMPONIBLE * UF_2026; // ~$2.872.916
  const TOPE_DIARIO = TOPE_UF_PESOS / 30; // ~$95.764 diarios

  // Validaciones
  if (i.salario_diario < 0) return defaultOutput('Salario debe ser >= 0');
  if (i.dias_licencia < 1) return defaultOutput('Días licencia debe ser >= 1');

  let dias_empleador = 0;
  let dias_subsidio = 0;
  let pago_dias_empleador = 0;
  let pago_dias_subsidio = 0;
  let requisitos_txt = '';

  // Lógica según tipo de licencia
  if (i.tipo_licencia === 'comun') {
    // Común: primeros 3 días empleador, resto subsidio
    dias_empleador = Math.min(3, i.dias_licencia);
    dias_subsidio = Math.max(0, i.dias_licencia - 3);

    pago_dias_empleador = dias_empleador * i.salario_diario;

    // Subsidio limita a tope UF diario
    const salario_diario_efectivo = Math.min(i.salario_diario, TOPE_DIARIO);
    pago_dias_subsidio = dias_subsidio * salario_diario_efectivo;

    requisitos_txt =
      'Licencia común: certificado médico obligatorio desde día 1. ' +
      'Empleador paga días 1-3; Fonasa/Isapre paga día 4+ (con descuentos AFP 10%, salud ~7%). ' +
      'Tope: 81,4 UF imponibles.';
  } else if (i.tipo_licencia === 'laboral') {
    // Laboral (accidente trabajo): subsidio desde día 1, sin tope empleador
    dias_empleador = 0; // No aplicable
    dias_subsidio = i.dias_licencia;

    pago_dias_empleador = 0;

    const salario_diario_efectivo = Math.min(i.salario_diario, TOPE_DIARIO);
    pago_dias_subsidio = dias_subsidio * salario_diario_efectivo;

    requisitos_txt =
      'Licencia laboral: subsidio desde día 1 (accidente trabajo/enfermedad profesional). ' +
      'Certificado ACHS/Mutualidad obligatorio. Tope: 81,4 UF imponibles. ' +
      'Sin pago adicional empleador (subsidio cubre 100%).';
  } else if (i.tipo_licencia === 'prenatal') {
    // Prenatal: 6 semanas (42 días) 100% empleador, sin subsidio
    dias_empleador = Math.min(42, i.dias_licencia);
    dias_subsidio = Math.max(0, i.dias_licencia - 42);

    pago_dias_empleador = dias_empleador * i.salario_diario;

    const salario_diario_efectivo = Math.min(i.salario_diario, TOPE_DIARIO);
    pago_dias_subsidio = dias_subsidio * salario_diario_efectivo;

    requisitos_txt =
      'Licencia prenatal: 6 semanas previas a parto, 100% remunerada por empleador. ' +
      'Certificado obstétrico requerido. Si excede 6 semanas, resto con subsidio (tope UF).';
  } else if (i.tipo_licencia === 'postnatal') {
    // Postnatal: variable según días, combinación empleador + subsidio
    // Regla simplificada: primeros 12 días con subsidio (sin tope empleador), luego tope
    dias_empleador = 0; // Postnatal es responsabilidad estado principalmente
    dias_subsidio = i.dias_licencia;

    pago_dias_empleador = 0;

    const salario_diario_efectivo = Math.min(i.salario_diario, TOPE_DIARIO);
    pago_dias_subsidio = dias_subsidio * salario_diario_efectivo;

    requisitos_txt =
      'Licencia postnatal: 6-12 semanas después parto. Subsidio estatal 100% (tope UF). ' +
      'Certificado médico/obstétrico obligatorio. Duración depende edad hijos.';
  }

  const total_licencia = pago_dias_empleador + pago_dias_subsidio;
  const supera_tope = i.salario_diario > TOPE_DIARIO;
  const alcanza_tope = supera_tope
    ? `Sí, salario supera tope. Limitado a $${Math.round(TOPE_DIARIO).toLocaleString('es-CL')}/día`
    : `No, salario bajo tope ($${Math.round(TOPE_DIARIO).toLocaleString('es-CL')}/día)`;

  // Insight: dinámico según si el tope UF recorta el subsidio
  const totalFmt = '$' + Math.round(total_licencia).toLocaleString('es-CL');
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (supera_tope && dias_subsidio > 0) {
    // Cuánto pierde por el tope sobre los días de subsidio
    const perdida = Math.round((i.salario_diario - TOPE_DIARIO) * dias_subsidio);
    insightText = `Cobrarás **${totalFmt}** por los ${i.dias_licencia} días. Como tu sueldo diario supera el tope de **81,4 UF** ($${Math.round(TOPE_DIARIO).toLocaleString('es-CL')}/día), el subsidio se recorta y dejás de percibir unos **$${perdida.toLocaleString('es-CL')}**.`;
    insightTone = 'warn';
  } else {
    insightText = `Por los ${i.dias_licencia} días de licencia cobrarás **${totalFmt}** en total. Tu sueldo diario está **por debajo del tope** de 81,4 UF, así que recibís el 100% sin recorte.`;
    insightTone = 'good';
  }

  // Donut: sólo si el total se reparte entre empleador y subsidio (ambas partes > 0)
  let chart: any = undefined;
  const slices: { label: string; value: number }[] = [];
  if (pago_dias_empleador > 0) slices.push({ label: `Empleador (${dias_empleador} días)`, value: Math.round(pago_dias_empleador) });
  if (pago_dias_subsidio > 0) slices.push({ label: `Subsidio (${dias_subsidio} días)`, value: Math.round(pago_dias_subsidio) });
  if (slices.length >= 2) {
    chart = {
      type: 'doughnut' as const,
      slices,
      prefix: '$',
      centerValue: totalFmt,
      centerLabel: 'Total licencia',
      ariaLabel: 'Reparto del pago de la licencia médica entre el empleador y el subsidio estatal',
    };
  }

  return {
    pago_dias_empleador: Math.round(pago_dias_empleador),
    pago_dias_subsidio: Math.round(pago_dias_subsidio),
    total_licencia: Math.round(total_licencia),
    dias_empleador_efectivos: dias_empleador,
    dias_subsidio_efectivos: dias_subsidio,
    tope_uf_diario: Math.round(TOPE_DIARIO),
    alcanza_tope: alcanza_tope,
    requisitos: requisitos_txt,
    _insight: {
      title: 'Cuánto cobrás por tu licencia',
      text: insightText,
      tone: insightTone,
      icon: '🏥',
    },
    ...(chart ? { _chart: chart } : {}),
  };
}

function defaultOutput(error: string): Outputs {
  return {
    pago_dias_empleador: 0,
    pago_dias_subsidio: 0,
    total_licencia: 0,
    dias_empleador_efectivos: 0,
    dias_subsidio_efectivos: 0,
    tope_uf_diario: 0,
    alcanza_tope: 'Error',
    requisitos: error,
  };
}
