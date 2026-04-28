export interface Inputs {
  ccaa: string;
  renta_familiar: number;
  num_miembros: number;
  num_hijos_comedor: number;
  familia_numerosa: string;
  situacion_especial: string;
  dias_comedor_mes: number;
}

export interface Outputs {
  elegibilidad: string;
  porcentaje_cubierto: number;
  precio_menu_dia: number;
  ahorro_mensual_por_hijo: number;
  ahorro_mensual_total: number;
  ahorro_anual_total: number;
  umbral_renta_aplicado: number;
  tramo_beca: string;
  notas: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes de precio medio del menú escolar por CCAA (€/día, curso 2025-2026)
  // Fuente: Ministerio de Educación, FP y Deportes + Consejerías CCAA
  const PRECIO_MENU: Record<string, number> = {
    madrid: 5.50,
    cataluna: 5.20,
    andalucia: 4.50,
    valencia: 4.80,
    castilla_leon: 4.60,
    castilla_la_mancha: 4.40,
    pais_vasco: 5.80,
    galicia: 4.50,
    aragon: 4.70,
    navarra: 5.60,
    murcia: 4.50,
    extremadura: 4.20,
    canarias: 4.60,
    baleares: 4.90,
    asturias: 4.70,
    cantabria: 4.80,
    rioja: 4.60,
  };

  // --- Umbral de renta base (familia de 2 adultos + 1 hijo, sin bonificaciones)
  // Fuente: Convocatorias CCAA curso 2025-2026
  const UMBRAL_BASE: Record<string, number> = {
    madrid: 14112,
    cataluna: 11938,
    andalucia: 11548,
    valencia: 12000,
    castilla_leon: 10800,
    castilla_la_mancha: 10500,
    pais_vasco: 13500,
    galicia: 10200,
    aragon: 11200,
    navarra: 13200,
    murcia: 10800,
    extremadura: 9800,
    canarias: 10600,
    baleares: 12200,
    asturias: 11000,
    cantabria: 11200,
    rioja: 10800,
  };

  // --- Incremento de umbral por miembro adicional (a partir del 3er miembro)
  // Fuente: Convocatorias CCAA curso 2025-2026
  const INCREMENTO_POR_MIEMBRO: Record<string, number> = {
    madrid: 3228,
    cataluna: 3486,
    andalucia: 3122,
    valencia: 2800,
    castilla_leon: 2600,
    castilla_la_mancha: 2500,
    pais_vasco: 3500,
    galicia: 2400,
    aragon: 2700,
    navarra: 3300,
    murcia: 2600,
    extremadura: 2300,
    canarias: 2500,
    baleares: 2900,
    asturias: 2700,
    cantabria: 2700,
    rioja: 2600,
  };

  // --- Validación de inputs
  const ccaa = (i.ccaa || 'madrid').toLowerCase();
  const rentaFamiliar = Math.max(0, i.renta_familiar || 0);
  const numMiembros = Math.max(1, Math.min(12, Math.round(i.num_miembros || 2)));
  const numHijosComedor = Math.max(1, Math.min(8, Math.round(i.num_hijos_comedor || 1)));
  const familiaNumerosa = i.familia_numerosa || 'no';
  const situacionEspecial = i.situacion_especial || 'ninguna';
  const diasComedorMes = Math.max(1, Math.min(23, Math.round(i.dias_comedor_mes || 20)));

  // --- Precio del menú para la CCAA seleccionada
  const precioMenuDia = PRECIO_MENU[ccaa] ?? 4.60;

  // --- Umbral base de la CCAA
  const umbralBase = UMBRAL_BASE[ccaa] ?? 11000;
  const incrementoPorMiembro = INCREMENTO_POR_MIEMBRO[ccaa] ?? 2800;

  // El umbral base está calculado para 3 miembros (2 adultos + 1 hijo).
  // Por cada miembro adicional a partir del 4.º, se suma el incremento.
  // Para menos de 3 miembros, se aplica el umbral base directamente.
  const miembrosAdicionales = Math.max(0, numMiembros - 3);
  let umbralCalculado = umbralBase + miembrosAdicionales * incrementoPorMiembro;

  // --- Bonificaciones de umbral según situaciones especiales
  // Fuente: Criterios generales de convocatorias CCAA 2025-2026
  let factorBonificacion = 1.0;

  if (familiaNumerosa === 'general') {
    factorBonificacion = Math.max(factorBonificacion, 1.15);
  } else if (familiaNumerosa === 'especial') {
    factorBonificacion = Math.max(factorBonificacion, 1.30);
  }

  if (situacionEspecial === 'monoparental') {
    factorBonificacion = Math.max(factorBonificacion, 1.10);
  } else if (situacionEspecial === 'discapacidad') {
    factorBonificacion = Math.max(factorBonificacion, 1.10);
  } else if (situacionEspecial === 'victima_violencia') {
    // Acceso preferente: beca 100% independientemente de la renta
    // Se eleva el umbral de forma suficiente para cubrir cualquier renta razonable
    factorBonificacion = 99.0;
  } else if (situacionEspecial === 'acogimiento') {
    // Beca 100% garantizada
    factorBonificacion = 99.0;
  }

  umbralCalculado = umbralCalculado * factorBonificacion;

  // --- Determinación del tramo y porcentaje cubierto
  // Tramos estándar: 0-55% del umbral → 100%; 55-80% → 75%; 80-100% → 50%; >100% → 0%
  const ratioRenta = rentaFamiliar / umbralCalculado;

  let porcentajeCubierto: number;
  let tramoBeca: string;
  let elegibilidad: string;

  if (situacionEspecial === 'victima_violencia') {
    porcentajeCubierto = 100;
    tramoBeca = 'Acceso preferente (víctima de violencia de género)';
    elegibilidad = '✅ Tienes derecho a beca de comedor al 100% por ser víctima de violencia de género.';
  } else if (situacionEspecial === 'acogimiento') {
    porcentajeCubierto = 100;
    tramoBeca = 'Beca garantizada (acogimiento familiar)';
    elegibilidad = '✅ El menor en acogimiento tiene derecho a beca de comedor al 100%.';
  } else if (ratioRenta <= 0.55) {
    porcentajeCubierto = 100;
    tramoBeca = 'Tramo 1: Beca completa (100%)';
    elegibilidad = '✅ Tu renta está muy por debajo del umbral. Tienes derecho a beca de comedor al 100%.';
  } else if (ratioRenta <= 0.80) {
    porcentajeCubierto = 75;
    tramoBeca = 'Tramo 2: Beca parcial (75%)';
    elegibilidad = '✅ Tu renta está por debajo del umbral. Tienes derecho a beca de comedor al 75%.';
  } else if (ratioRenta <= 1.0) {
    porcentajeCubierto = 50;
    tramoBeca = 'Tramo 3: Beca reducida (50%)';
    elegibilidad = '⚠️ Tu renta está cerca del umbral límite. Podrías tener derecho a beca de comedor al 50%.';
  } else if (ratioRenta <= 1.10) {
    // Margen de tolerancia: justo por encima del umbral, se informa de que no hay derecho pero puede variar
    porcentajeCubierto = 0;
    tramoBeca = 'Sin derecho (renta superior al umbral)';
    elegibilidad = '❌ Tu renta supera ligeramente el umbral de referencia. En principio, no tendrías derecho a beca, aunque los criterios exactos los fija tu CCAA en la convocatoria anual.';
  } else {
    porcentajeCubierto = 0;
    tramoBeca = 'Sin derecho (renta superior al umbral)';
    elegibilidad = '❌ Tu renta supera el umbral de referencia para tu CCAA y número de miembros. No tendrías derecho a beca de comedor según los criterios orientativos 2025-2026.';
  }

  // --- Cálculo de cuantías
  const ahorroMensualPorHijo = porcentajeCubierto > 0
    ? parseFloat((precioMenuDia * diasComedorMes * (porcentajeCubierto / 100)).toFixed(2))
    : 0;

  const ahorroMensualTotal = parseFloat((ahorroMensualPorHijo * numHijosComedor).toFixed(2));

  // Curso escolar = 9 meses (septiembre a junio)
  const ahorroAnualTotal = parseFloat((ahorroMensualTotal * 9).toFixed(2));

  // --- Notas adicionales
  const notasParts: string[] = [];

  notasParts.push(
    'Esta calculadora ofrece resultados orientativos basados en los criterios generales de las convocatorias 2025-2026. Los umbrales y porcentajes exactos los publica cada comunidad autónoma en su convocatoria anual.'
  );

  if (porcentajeCubierto > 0) {
    notasParts.push(
      'Para formalizar la solicitud, dirígete a la consejería de educación de tu comunidad autónoma o al propio centro escolar durante el plazo de solicitud (habitualmente junio-septiembre).'
    );
  }

  if (familiaNumerosa !== 'no') {
    notasParts.push(
      'El título de familia numerosa está siendo tenido en cuenta para ampliar el umbral de renta aplicable. Asegúrate de aportar el título vigente al presentar la solicitud.'
    );
  }

  if (ccaa === 'pais_vasco' || ccaa === 'navarra') {
    notasParts.push(
      'En el País Vasco y Navarra, la gestión es completamente foral. Consulta las diputaciones forales o el Gobierno de Navarra para obtener los criterios exactos aplicables en tu caso.'
    );
  }

  if (ratioRenta > 0.90 && ratioRenta <= 1.10 && porcentajeCubierto === 0) {
    notasParts.push(
      'Tu renta está muy cerca del umbral. Te recomendamos consultar la convocatoria oficial de tu CCAA, ya que los criterios exactos pueden diferir ligeramente de los usados en esta estimación.'
    );
  }

  const notas = notasParts.join(' | ');

  return {
    elegibilidad,
    porcentaje_cubierto: porcentajeCubierto,
    precio_menu_dia: precioMenuDia,
    ahorro_mensual_por_hijo: ahorroMensualPorHijo,
    ahorro_mensual_total: ahorroMensualTotal,
    ahorro_anual_total: ahorroAnualTotal,
    umbral_renta_aplicado: parseFloat(umbralCalculado.toFixed(2)),
    tramo_beca: tramoBeca,
    notas,
  };
}
