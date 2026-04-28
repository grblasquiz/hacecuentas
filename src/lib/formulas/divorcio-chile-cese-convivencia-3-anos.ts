export interface Inputs {
  tipo_divorcio: 'mutuo_acuerdo' | 'unilateral' | 'culpa';
  cantidad_hijos: number;
  tiene_bienes_compartidos: 'no' | 'si_simple' | 'si_complejo';
  valor_aproximado_bienes: number;
  tiene_deudas_compartidas: 'no' | 'si';
  acuerdo_custodia_pension: 'si' | 'no';
}

export interface Outputs {
  costo_abogado_minimo: number;
  costo_abogado_maximo: number;
  costo_aranceles_tribunal: number;
  tiempo_proceso_meses_minimo: number;
  tiempo_proceso_meses_maximo: number;
  costo_total_minimo: number;
  costo_total_maximo: number;
  tipo_divorcio_label: string;
  tramites_requeridos: string;
  recomendaciones: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes base 2026 Chile - Ley 19.947
  // Fuente: Colegio de Abogados, Poder Judicial, Tribunal Familia
  const HONORARIOS_BASE = {
    mutuo_acuerdo: { min: 500000, max: 1000000 },
    unilateral: { min: 1000000, max: 2000000 },
    culpa: { min: 2000000, max: 3000000 }
  };

  const TIEMPO_MESES = {
    mutuo_acuerdo: { min: 3, max: 4 },
    unilateral: { min: 6, max: 9 },
    culpa: { min: 9, max: 12 }
  };

  const ARANCELES_TRIBUNAL = {
    mutuo_acuerdo: 80000,
    unilateral: 100000,
    culpa: 120000
  };

  // Incrementos por complejidad
  const INCREMENTO_POR_HIJO = 150000;
  const INCREMENTO_BIENES_SIMPLE = 250000;
  const INCREMENTO_BIENES_COMPLEJO = 750000;
  const INCREMENTO_DEUDAS = 200000;
  const INCREMENTO_SIN_ACUERDO_CUSTODIA = 500000;

  // Base honorarios
  let honorarios_min = HONORARIOS_BASE[i.tipo_divorcio].min;
  let honorarios_max = HONORARIOS_BASE[i.tipo_divorcio].max;
  let tiempo_min = TIEMPO_MESES[i.tipo_divorcio].min;
  let tiempo_max = TIEMPO_MESES[i.tipo_divorcio].max;
  let aranceles = ARANCELES_TRIBUNAL[i.tipo_divorcio];

  // Ajustar por hijos
  const incremento_hijos = i.cantidad_hijos * INCREMENTO_POR_HIJO;
  honorarios_min += incremento_hijos;
  honorarios_max += incremento_hijos;
  tiempo_max += i.cantidad_hijos > 0 ? 1 : 0; // +1 mes si hay trámite custodia

  // Ajustar por bienes
  if (i.tiene_bienes_compartidos === 'si_simple') {
    honorarios_min += INCREMENTO_BIENES_SIMPLE;
    honorarios_max += INCREMENTO_BIENES_SIMPLE;
    tiempo_max += 1;
  } else if (i.tiene_bienes_compartidos === 'si_complejo') {
    honorarios_min += INCREMENTO_BIENES_COMPLEJO;
    honorarios_max += INCREMENTO_BIENES_COMPLEJO;
    tiempo_max += 2;
  }

  // Ajustar por deudas
  if (i.tiene_deudas_compartidas === 'si') {
    honorarios_min += INCREMENTO_DEUDAS;
    honorarios_max += INCREMENTO_DEUDAS;
    tiempo_max += 1;
  }

  // Ajustar por acuerdo custodia
  if (i.acuerdo_custodia_pension === 'no' && i.cantidad_hijos > 0) {
    honorarios_min += INCREMENTO_SIN_ACUERDO_CUSTODIA;
    honorarios_max += INCREMENTO_SIN_ACUERDO_CUSTODIA;
    tiempo_max += 2;
  }

  // Totales
  const costo_total_minimo = honorarios_min + aranceles;
  const costo_total_maximo = honorarios_max + aranceles;

  // Etiquetas y recomendaciones
  const tipo_labels = {
    mutuo_acuerdo: 'Divorcio por mutuo acuerdo (1 año cese de convivencia)',
    unilateral: 'Divorcio unilateral (3 años cese de convivencia)',
    culpa: 'Divorcio por causal de culpa (con litigio)'
  };

  let tramites = '';
  if (i.tipo_divorcio === 'mutuo_acuerdo') {
    tramites = 'Acuerdo sobre bienes, custodia, pensión · Demanda ante tribunal familia · Audiencia única · Sentencia (2-4 semanas) · Inscripción Registro Civil';
  } else if (i.tipo_divorcio === 'unilateral') {
    tramites = 'Acreditación 3 años cese · Demanda ante tribunal familia · Notificación demandado · Audiencias si hay objeciones · Sentencia · Inscripción Registro Civil';
  } else {
    tramites = 'Recopilación pruebas (adulterio, mal trato, etc.) · Demanda con causales · Etapa probatoria · Audiencias · Sentencia · Posible apelación · Inscripción Registro Civil';
  }

  let recomendaciones = '';
  if (i.tipo_divorcio === 'mutuo_acuerdo' && i.cantidad_hijos === 0 && i.tiene_bienes_compartidos === 'no') {
    recomendaciones = 'Tu caso es de baja complejidad. Puedes usar abogado para redactar acuerdo o gestionar trámite por ti. Costo probable: ~$700K. Considera asistencia judicial gratuita si ingresos < 1.5 UF (CAJ).';
  } else if (i.tipo_divorcio === 'unilateral') {
    recomendaciones = 'Debes haber cumplido 3 años de cese de convivencia. Si demandado se opone a custodia o bienes, costo y tiempo aumentan. Negocia acuerdo antes para reducir costos hasta 30%.';
  } else if (i.tipo_divorcio === 'culpa') {
    recomendaciones = 'Requiere pruebas sólidas. Considera perícia psicológica, testimonios, documentos. Es el más caro y lento. Solo úsalo si mutuo acuerdo o unilateral no son viables. Consulta con abogado especialista.';
  }

  if (i.tiene_bienes_compartidos === 'si_complejo') {
    recomendaciones += ' | Bienes complejos requieren tasación y acuerdo división. Considera mediador (20-30% menos costo que litigio).';
  }

  if (i.cantidad_hijos > 0 && i.acuerdo_custodia_pension === 'no') {
    recomendaciones += ' | Sin acuerdo en custodia, tribunal familia decide. Incluye perícia de ingresos para pensión alimenticia.';
  }

  return {
    costo_abogado_minimo: honorarios_min,
    costo_abogado_maximo: honorarios_max,
    costo_aranceles_tribunal: aranceles,
    tiempo_proceso_meses_minimo: tiempo_min,
    tiempo_proceso_meses_maximo: tiempo_max,
    costo_total_minimo: costo_total_minimo,
    costo_total_maximo: costo_total_maximo,
    tipo_divorcio_label: tipo_labels[i.tipo_divorcio],
    tramites_requeridos: tramites,
    recomendaciones: recomendaciones
  };
}
