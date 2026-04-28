export interface Inputs {
  situacion: 'viudez' | 'divorcio';
  institucion: 'imss' | 'issste' | 'ninguna';
  haber_base: number;
  ingresos_mensuales: number;
  num_hijos: number;
  edad_conyuge: number;
  tiene_discapacidad: 'si' | 'no';
  estado: string;
}

export interface Outputs {
  pension_viudez_mensual: number;
  porcentaje_viudez: number;
  pension_alimenticia_minima: number;
  pension_alimenticia_maxima: number;
  compatibilidad: string;
  diferencia_mensual: number;
  tramites_requeridos: string;
  notas_especiales: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México — Fuente: IMSS, ISSSTE, SAT, SCJN
  const UMA_2026_DIARIA = 310.71; // Unidad de Medida y Actualización 2026
  const UMA_2026_MENSUAL = UMA_2026_DIARIA * 30;
  const SMM_2026 = 248.93; // Salario Mínimo Mensual 2026
  const IPC_2025_2026 = 1.04; // Inflación estimada
  const PORCENTAJE_VUDEZ_CONYUGE = 0.60; // 60% del haber base
  const PORCENTAJE_VIUDEZ_POR_HIJO = 0.20; // 20% adicional por hijo
  const LIMITE_VIUDEZ = 1.00; // Máximo 100% del haber
  const PORCENTAJE_ALIMENTICIA_MIN = 0.10; // 10% ingresos mínimo
  const PORCENTAJE_ALIMENTICIA_MAX = 0.30; // 30% ingresos máximo
  const PORCENTAJE_ALIMENTICIA_TIPICO = 0.20; // 20% estimado típico

  // 1. CÁLCULO PENSIÓN VIUDEZ (IMSS/ISSSTE)
  let pension_viudez_mensual = 0;
  let porcentaje_viudez = 0;

  if (i.situacion === 'viudez' && (i.institucion === 'imss' || i.institucion === 'issste')) {
    // Base: 60% cónyuge + 20% por cada hijo (máx 100%)
    porcentaje_viudez = PORCENTAJE_VUDEZ_CONYUGE + (PORCENTAJE_VIUDEZ_POR_HIJO * Math.min(i.num_hijos, 2));
    porcentaje_viudez = Math.min(porcentaje_viudez, LIMITE_VIUDEZ);
    
    // Aplicar haber base
    pension_viudez_mensual = i.haber_base * porcentaje_viudez;
    
    // Validación: no menor a UMA * 30 días (piso mínimo vigente)
    if (pension_viudez_mensual < UMA_2026_MENSUAL) {
      pension_viudez_mensual = UMA_2026_MENSUAL;
      porcentaje_viudez = pension_viudez_mensual / i.haber_base;
    }
  } else if (i.situacion === 'divorcio' || i.institucion === 'ninguna') {
    // Sin viudez: se aplica solo alimenticia
    pension_viudez_mensual = 0;
    porcentaje_viudez = 0;
  }

  // 2. CÁLCULO PENSIÓN ALIMENTICIA (derecho civil)
  let pension_alimenticia_minima = 0;
  let pension_alimenticia_maxima = 0;

  if (i.situacion === 'divorcio' || i.institucion === 'ninguna') {
    // Base: 10% a 30% ingresos × número de hijos
    // Jurisprudencia SCJN: 10% mínimo, 30% máximo razonable
    pension_alimenticia_minima = i.ingresos_mensuales * PORCENTAJE_ALIMENTICIA_MIN * i.num_hijos;
    pension_alimenticia_maxima = i.ingresos_mensuales * PORCENTAJE_ALIMENTICIA_MAX * i.num_hijos;
    
    // Piso mínimo: UMA por hijo
    const piso_minimo = UMA_2026_MENSUAL * i.num_hijos;
    if (pension_alimenticia_minima < piso_minimo) {
      pension_alimenticia_minima = piso_minimo;
    }
  }

  // 3. COMPATIBILIDAD LEGAL
  let compatibilidad = '';
  if (i.situacion === 'viudez' && (i.institucion === 'imss' || i.institucion === 'issste')) {
    compatibilidad = 'NO. La pensión por viudez (IMSS/ISSSTE) absorbe la obligación alimentaria. '
      + 'El cónyuge supérstite y los hijos reciben pensión viudez del sistema de seguridad social. '
      + 'No procede demanda de alimenticia simultáneamente. Limitación: al contraer nuevo matrimonio se pierde la pensión.';
  } else if (i.situacion === 'divorcio') {
    compatibilidad = 'SÍ, pero en forma limitada. La alimenticia es obligación civil del demandado. '
      + 'Si el demandado también es pensionado (jubilación, retiro), la alimenticia se calcula sobre ingresos totales. '
      + 'Ambas pueden coexistir siempre que haya sentencia firme del juzgado familiar y se cumpla el pago.';
  } else if (i.institucion === 'ninguna') {
    compatibilidad = 'SÍ, solo alimenticia aplica. Sin afiliación a IMSS/ISSSTE no hay derecho a pensión por viudez. '
      + 'La demanda de alimenticia es la única opción ante divorcio o separación.';
  }

  // 4. DIFERENCIA MENSUAL
  const estimado_alimenticia_tipica = i.ingresos_mensuales * PORCENTAJE_ALIMENTICIA_TIPICO * i.num_hijos;
  let diferencia_mensual = 0;
  if (i.situacion === 'viudez') {
    diferencia_mensual = pension_viudez_mensual - estimado_alimenticia_tipica;
  } else {
    diferencia_mensual = pension_alimenticia_minima - pension_viudez_mensual;
  }

  // 5. TRÁMITES DIFERENCIADOS
  let tramites_requeridos = '';
  if (i.situacion === 'viudez' && (i.institucion === 'imss' || i.institucion === 'issste')) {
    if (i.institucion === 'imss') {
      tramites_requeridos = '1. Acta de defunción (juzgado civil)\n'
        + '2. Últimos recibos de nómina o constancia de haber\n'
        + '3. CURP cónyuge y menores\n'
        + '4. Solicitud de pensión ante delegación IMSS (30–60 días)\n'
        + '5. Depósito en cuenta bancaria (desde mes siguiente a fallecimiento)\n'
        + 'Vigencia: Mientras cónyuge no contraiga nuevo matrimonio y hijos menores de 18 años (25 si estudian).';
    } else {
      tramites_requeridos = '1. Acta de defunción\n'
        + '2. Últimos haberes y estado de cuenta del fallecido\n'
        + '3. CURP y RFC cónyuge e hijos\n'
        + '4. Solicitud de pensión ante ISSSTE (sede delegacional estatal)\n'
        + '5. Investigación por ISSSTE (hasta 6 meses en algunos casos)\n'
        + '6. Depósito en transferencia bancaria\n'
        + 'Vigencia: Igual a IMSS; no contraer nuevo matrimonio.';
    }
  } else if (i.situacion === 'divorcio') {
    tramites_requeridos = '1. Demanda ante juzgado familiar de la jurisdicción\n'
        + '2. Comprobantes de ingresos del demandado (últimos 3 meses)\n'
        + '3. Sentencia de divorcio (si aplica)\n'
        + '4. Audiencia de conciliación (mes 1–2)\n'
        + '5. Sentencia firme (mes 3–12 típicamente)\n'
        + '6. Depósito vía transferencia bancaria o tercero depositor (si hay incumplimiento)\n'
        + 'Vigencia: Hasta que hijo cumpla 18 años (25 si estudia tiempo completo). Revisable si cambian ingresos del obligado.';
  } else {
    tramites_requeridos = 'Sin filiación a IMSS/ISSSTE: solo opción de alimenticia mediante demanda ante juzgado familiar. '
      + 'Procedimiento civil estándar (3–12 meses hasta sentencia).';
  }

  // 6. NOTAS ESPECIALES por estado y edad
  let notas_especiales = '';
  const lista_notas = [];

  if (i.edad_conyuge >= 60) {
    lista_notas.push('Edad ≥ 60 años: derecho automático a pensión viudez sin carencia (IMSS/ISSSTE).');
  }
  if (i.tiene_discapacidad === 'si') {
    lista_notas.push('Discapacidad acreditada: pensión viudez permanente sin límite de edad; exención de ISR vigente.');
  }
  if (i.num_hijos > 2 && i.situacion === 'viudez') {
    lista_notas.push('Más de 2 hijos: pensión viudez capped en 100%; verifique pensión de orfandad individual por hijo en IMSS/ISSSTE.');
  }
  if (i.estado === 'cdmx') {
    lista_notas.push('Ciudad de México: juzgados familiares con especialización en alimenticia; tramites acelerados en algunos casos.');
  }
  if (i.estado === 'jal' || i.estado === 'nl' || i.estado === 'edom') {
    lista_notas.push('Estados ' + (i.estado === 'jal' ? 'Jalisco' : i.estado === 'nl' ? 'Nuevo León' : 'Estado de México') + ': jurisprudencia local tiende a 20–25% alimenticia por hijo en divorcios litigiosos.');
  }
  if (i.ingresos_mensuales < SMM_2026 * 2) {
    lista_notas.push('Ingresos bajos: alimenticia mínima puede ser inferior a UMA; juzgado podrá apreciar incapacidad de pago.');
  }
  if (i.haber_base < UMA_2026_MENSUAL * 3 && i.situacion === 'viudez') {
    lista_notas.push('Haber base bajo: pensión viudez se ajusta a piso mínimo de UMA; verifique si fallecido cumplió 150 cotizaciones (IMSS).');
  }

  notas_especiales = lista_notas.length > 0 ? lista_notas.join('\n') : 'Sin consideraciones especiales.';

  return {
    pension_viudez_mensual: Math.round(pension_viudez_mensual * 100) / 100,
    porcentaje_viudez: Math.round(porcentaje_viudez * 10000) / 100,
    pension_alimenticia_minima: Math.round(pension_alimenticia_minima * 100) / 100,
    pension_alimenticia_maxima: Math.round(pension_alimenticia_maxima * 100) / 100,
    compatibilidad,
    diferencia_mensual: Math.round(diferencia_mensual * 100) / 100,
    tramites_requeridos,
    notas_especiales
  };
}
