export interface Inputs {
  comunidad_autonoma: string;
  tipo_vivienda: 'nueva' | 'usada';
  superficie_util: number;
  tecnico_tipo: 'aparejador' | 'arquitecto' | 'ingeniero_tecnico';
  vivienda_primera_ocupacion: 'true' | 'false';
}

export interface Outputs {
  coste_honorarios_min: number;
  coste_honorarios_max: number;
  tasa_administrativa: number;
  coste_total_min: number;
  coste_total_max: number;
  plazo_dias: string;
  validez_anos: string;
  requisito_minimo: string;
  documentacion_necesaria: string;
}

// Aranceles técnicos 2026 (estimados, varían por provincia y colegio)
const honorarios_base: Record<string, { min: number; max: number }> = {
  aparejador: { min: 80, max: 120 },
  arquitecto: { min: 130, max: 200 },
  ingeniero_tecnico: { min: 90, max: 140 },
};

// Sobrecargo por superficie (€ por m² adicionales después de 60 m²)
const sobrecargo_superficie = {
  aparejador: 0.3,
  arquitecto: 0.5,
  ingeniero_tecnico: 0.35,
};

// Tasas administrativas por CCAA (2026, aproximadas)
const tasas_ccaa: Record<string, number> = {
  andalucia: 50,
  aragon: 40,
  asturias: 35,
  baleares: 45,
  canarias: 40,
  cantabria: 38,
  castilla_mancha: 42,
  castilla_leon: 45,
  cataluna: 60,
  valenciana: 40,
  extremadura: 38,
  galicia: 42,
  madrid: 35,
  murcia: 40,
  navarra: 50,
  pais_vasco: 55,
  rioja: 40,
};

export function compute(i: Inputs): Outputs {
  // Validaciones mínimas
  if (i.superficie_util < 20 || i.superficie_util > 500) {
    return {
      coste_honorarios_min: 0,
      coste_honorarios_max: 0,
      tasa_administrativa: 0,
      coste_total_min: 0,
      coste_total_max: 0,
      plazo_dias: 'Error: superficie fuera de rango',
      validez_anos: '-',
      requisito_minimo: 'Error',
      documentacion_necesaria: 'Superficie válida: 20-500 m²',
    };
  }

  // Paso 1: Calcular honorarios técnico base
  const base_honorarios = honorarios_base[i.tecnico_tipo] || { min: 80, max: 120 };

  // Sobrecargo por superficie: cada m² adicional después de 60 m²
  const metros_excedentes = Math.max(0, i.superficie_util - 60);
  const sobrecargo_unit = sobrecargo_superficie[i.tecnico_tipo] || 0.3;
  const sobrecargo_total = metros_excedentes * sobrecargo_unit;

  // Incremento si es vivienda nueva (complejidad)
  const incremento_nueva = i.tipo_vivienda === 'nueva' ? 20 : 0;
  const incremento_primera_ocupacion = i.vivienda_primera_ocupacion === 'true' ? 15 : 0;

  let coste_honorarios_min = base_honorarios.min + sobrecargo_total + incremento_nueva + incremento_primera_ocupacion;
  let coste_honorarios_max = base_honorarios.max + sobrecargo_total + incremento_nueva + incremento_primera_ocupacion;

  // Redondear al euro
  coste_honorarios_min = Math.round(coste_honorarios_min * 100) / 100;
  coste_honorarios_max = Math.round(coste_honorarios_max * 100) / 100;

  // Paso 2: Obtener tasa CCAA
  const tasa_administrativa = tasas_ccaa[i.comunidad_autonoma] || 45;

  // Paso 3: Coste total
  const coste_total_min = coste_honorarios_min + tasa_administrativa;
  const coste_total_max = coste_honorarios_max + tasa_administrativa;

  // Paso 4: Plazo por CCAA
  const plazos_ccaa: Record<string, string> = {
    andalucia: '10-20 días',
    aragon: '8-15 días',
    asturias: '7-12 días',
    baleares: '8-14 días',
    canarias: '10-18 días',
    cantabria: '7-14 días',
    castilla_mancha: '10-20 días',
    castilla_leon: '10-20 días',
    cataluna: '10-15 días',
    valenciana: '7-12 días',
    extremadura: '12-20 días',
    galicia: '10-18 días',
    madrid: '5-10 días',
    murcia: '8-15 días',
    navarra: '10-15 días',
    pais_vasco: '15-30 días',
    rioja: '8-15 días',
  };
  const plazo_dias = plazos_ccaa[i.comunidad_autonoma] || '10-15 días';

  // Paso 5: Validez
  const validez_anos = i.tipo_vivienda === 'nueva' ? '15 años' : 'Indefinida';

  // Paso 6: Requisito mínimo legal
  let requisito_minimo = '';
  if (i.superficie_util < 30 && i.superficie_util >= 20) {
    requisito_minimo = 'Estudio (20-30 m²): cumple mínimo legal';
  } else if (i.superficie_util >= 30) {
    requisito_minimo = `Vivienda ${i.tipo_vivienda} (${i.superficie_util} m²): cumple mínimo legal (30 m²)`;
  } else {
    requisito_minimo = 'Advertencia: superficie bajo mínimo legal (20 m²)';
  }

  // Paso 7: Documentación necesaria
  let documentacion_necesaria = '';
  if (i.tipo_vivienda === 'nueva') {
    documentacion_necesaria = 'Obra nueva: Licencia obra, proyecto constructivo, certificado final obra, acta recepción, control ejecución. Primera ocupación: documentación anterior obligatoria.';
  } else {
    documentacion_necesaria = 'Vivienda usada: Proyecto (si disponible), permisos originales. Si no hay documentación: inspección técnica substitutoria.';
  }

  return {
    coste_honorarios_min: Math.round(coste_honorarios_min * 100) / 100,
    coste_honorarios_max: Math.round(coste_honorarios_max * 100) / 100,
    tasa_administrativa: Math.round(tasa_administrativa * 100) / 100,
    coste_total_min: Math.round(coste_total_min * 100) / 100,
    coste_total_max: Math.round(coste_total_max * 100) / 100,
    plazo_dias,
    validez_anos,
    requisito_minimo,
    documentacion_necesaria,
  };
}
