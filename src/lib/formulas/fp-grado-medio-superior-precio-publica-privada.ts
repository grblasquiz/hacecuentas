export interface Inputs {
  grado_fp: 'medio' | 'superior';
  tipo_centro: 'publico' | 'concertado' | 'privado';
  comunidad_autonoma: string;
  familia_profesional: string;
  solicita_fp_dual: 'si' | 'no';
  renta_anual_familiar?: number;
}

export interface Outputs {
  coste_total_2anos: number;
  coste_anual_promedio: number;
  desglose_costes: string;
  becas_disponibles: string;
  porcentaje_cobertura_beca: string;
  salario_medio_inicial: number;
  fp_dual_info: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España (fuentes: AEAT, SEPE, Ministerio Educación)
  const IPREM_2026_ANUAL = 6954.84; // 579,57€/mes según AEAT 2026
  const IPREM_2026_MENSUAL = 579.57;
  const ANOS_ESTUDIO = 2;

  // Matrícula y costes por tipo de centro y CCAA (€/año)
  const costes_matricula: Record<string, Record<string, number>> = {
    publico: {
      'andalucia': 0,
      'aragon': 50,
      'asturias': 0,
      'islas_baleares': 150,
      'canarias': 0,
      'cantabria': 80,
      'castilla_la_mancha': 0,
      'castilla_leon': 100,
      'cataluna': 100,
      'comunidad_valenciana': 0,
      'extremadura': 0,
      'galicia': 50,
      'la_rioja': 80,
      'madrid': 120,
      'murcia': 0,
      'navarra': 100,
      'pais_vasco': 150,
      'ceuta': 0,
      'melilla': 0
    },
    concertado: {
      'andalucia': 120,
      'aragon': 150,
      'asturias': 130,
      'islas_baleares': 200,
      'canarias': 110,
      'cantabria': 140,
      'castilla_la_mancha': 100,
      'castilla_leon': 130,
      'cataluna': 180,
      'comunidad_valenciana': 120,
      'extremadura': 90,
      'galicia': 110,
      'la_rioja': 120,
      'madrid': 170,
      'murcia': 100,
      'navarra': 140,
      'pais_vasco': 160,
      'ceuta': 100,
      'melilla': 100
    },
    privado: {
      'andalucia': 250,
      'aragon': 280,
      'asturias': 300,
      'islas_baleares': 350,
      'canarias': 280,
      'cantabria': 320,
      'castilla_la_mancha': 220,
      'castilla_leon': 260,
      'cataluna': 350,
      'comunidad_valenciana': 280,
      'extremadura': 200,
      'galicia': 270,
      'la_rioja': 250,
      'madrid': 380,
      'murcia': 240,
      'navarra': 300,
      'pais_vasco': 330,
      'ceuta': 280,
      'melilla': 280
    }
  };

  // Cuotas mensuales (€) para concertado y privado (matrícula + servicios)
  const cuotas_mensuales: Record<string, Record<string, number>> = {
    concertado: {
      'andalucia': 100,
      'aragon': 120,
      'asturias': 110,
      'islas_baleares': 150,
      'canarias': 90,
      'cantabria': 110,
      'castilla_la_mancha': 85,
      'castilla_leon': 105,
      'cataluna': 140,
      'comunidad_valenciana': 100,
      'extremadura': 75,
      'galicia': 90,
      'la_rioja': 100,
      'madrid': 135,
      'murcia': 85,
      'navarra': 110,
      'pais_vasco': 130,
      'ceuta': 85,
      'melilla': 85
    },
    privado: {
      'andalucia': 300,
      'aragon': 330,
      'asturias': 360,
      'islas_baleares': 420,
      'canarias': 330,
      'cantabria': 380,
      'castilla_la_mancha': 270,
      'castilla_leon': 310,
      'cataluna': 420,
      'comunidad_valenciana': 340,
      'extremadura': 250,
      'galicia': 320,
      'la_rioja': 300,
      'madrid': 450,
      'murcia': 290,
      'navarra': 360,
      'pais_vasco': 400,
      'ceuta': 330,
      'melilla': 330
    }
  };

  // Costes adicionales (libros, material, uniforme) por tipo centro
  const costes_adicionales = {
    publico: {
      libros_material_anual: 120,
      uniforme_onetime: 100
    },
    concertado: {
      libros_material_anual: 180,
      uniforme_onetime: 140
    },
    privado: {
      libros_material_anual: 250,
      uniforme_onetime: 200
    }
  };

  // Salarios medios (€/año bruto) por familia y grado
  const salarios_medios: Record<string, Record<string, number>> = {
    informatica: { medio: 16500, superior: 22000 },
    administracion: { medio: 14000, superior: 18500 },
    sanidad: { medio: 15500, superior: 20000 },
    electricidad: { medio: 17000, superior: 21500 },
    mecanica: { medio: 16000, superior: 20000 },
    construccion: { medio: 15500, superior: 19500 },
    comercio: { medio: 13500, superior: 17000 },
    turismo_hosteleria: { medio: 12500, superior: 16000 },
    agricultura: { medio: 13000, superior: 16500 },
    otra: { medio: 14500, superior: 18000 }
  };

  // Remuneración FP Dual (€/mes) por CCAA
  const remuneracion_fp_dual: Record<string, number> = {
    'andalucia': 550,
    'aragon': 580,
    'asturias': 600,
    'islas_baleares': 620,
    'canarias': 550,
    'cantabria': 600,
    'castilla_la_mancha': 520,
    'castilla_leon': 560,
    'cataluna': 620,
    'comunidad_valenciana': 580,
    'extremadura': 500,
    'galicia': 550,
    'la_rioja': 570,
    'madrid': 640,
    'murcia': 540,
    'navarra': 600,
    'pais_vasco': 650,
    'ceuta': 550,
    'melilla': 550
  };

  // Cálculo de coste total 2 años
  let coste_total = 0;
  let desglose_items = [];

  const matricula_anual = costes_matricula[i.tipo_centro][i.comunidad_autonoma] || 0;
  const libros_anual = costes_adicionales[i.tipo_centro].libros_material_anual;
  const uniforme = costes_adicionales[i.tipo_centro].uniforme_onetime;
  const grado_key = i.grado_fp === 'medio' ? 'medio' : 'superior';

  if (i.tipo_centro === 'publico') {
    // Coste público: matrícula + libros*2 + uniforme
    coste_total = (matricula_anual * ANOS_ESTUDIO) + (libros_anual * ANOS_ESTUDIO) + uniforme;
    desglose_items.push(
      `Matrícula: ${(matricula_anual * ANOS_ESTUDIO).toFixed(2)}€`,
      `Libros y material: ${(libros_anual * ANOS_ESTUDIO).toFixed(2)}€`,
      `Uniforme: ${uniforme.toFixed(2)}€`
    );
  } else if (i.tipo_centro === 'concertado') {
    // Coste concertado: cuota mensual (10 meses/año * 2) + libros + uniforme
    const cuota_mensual = cuotas_mensuales['concertado'][i.comunidad_autonoma] || 100;
    const coste_cuotas = cuota_mensual * 10 * ANOS_ESTUDIO;
    coste_total = coste_cuotas + (libros_anual * ANOS_ESTUDIO) + uniforme;
    desglose_items.push(
      `Cuota mensual (${cuota_mensual}€ × 10 meses × ${ANOS_ESTUDIO} años): ${coste_cuotas.toFixed(2)}€`,
      `Libros y material: ${(libros_anual * ANOS_ESTUDIO).toFixed(2)}€`,
      `Uniforme: ${uniforme.toFixed(2)}€`
    );
  } else {
    // Coste privado: cuota mensual (10 meses/año * 2) + libros + uniforme + TIC
    const cuota_mensual = cuotas_mensuales['privado'][i.comunidad_autonoma] || 300;
    const coste_cuotas = cuota_mensual * 10 * ANOS_ESTUDIO;
    const tic_anual = 150; // Actividades TIC/informática
    const tic_total = tic_anual * ANOS_ESTUDIO;
    coste_total = coste_cuotas + (libros_anual * ANOS_ESTUDIO) + uniforme + tic_total;
    desglose_items.push(
      `Cuota mensual (${cuota_mensual}€ × 10 meses × ${ANOS_ESTUDIO} años): ${coste_cuotas.toFixed(2)}€`,
      `Libros y material: ${(libros_anual * ANOS_ESTUDIO).toFixed(2)}€`,
      `Uniforme: ${uniforme.toFixed(2)}€`,
      `Actividades TIC: ${tic_total.toFixed(2)}€`
    );
  }

  const coste_anual_promedio = coste_total / ANOS_ESTUDIO;

  // Cálculo de becas disponibles
  let becas_disponibles = [];
  let porcentaje_cobertura = '0%';

  if (i.renta_anual_familiar !== undefined) {
    const renta = i.renta_anual_familiar;
    const umbral_bajo = IPREM_2026_ANUAL * 1.5; // 10.432,26€
    const umbral_medio = IPREM_2026_ANUAL * 2.0; // 13.909,68€

    if (renta < umbral_bajo) {
      becas_disponibles.push(
        'Beca matrícula (100%): Administración autonómica',
        'Beca comedor (100%): CCAA + Ayuntamiento',
        'Beca transporte (100%): CCAA',
        'Fundación Carolina (FP Superior): hasta 6.000€',
        'Becas empresa (FP Dual): hasta 3.000€'
      );
      porcentaje_cobertura = 'Hasta 100%';
    } else if (renta < umbral_medio) {
      becas_disponibles.push(
        'Beca matrícula (50-70%): Administración autonómica',
        'Beca comedor (50%): CCAA + Ayuntamiento',
        'Beca transporte (parcial): CCAA',
        'Fundación Carolina (FP Superior): hasta 3.000€'
      );
      porcentaje_cobertura = 'Hasta 70%';
    } else {
      becas_disponibles.push(
        'INEM/SEPE (demandante empleo): hasta 2.000€',
        'Becas empresa (FP Dual): hasta 2.000€',
        'Fundación Carolina (FP Superior): información en sede'
      );
      porcentaje_cobertura = 'Hasta 30-50% (condicionado)';
    }
  } else {
    becas_disponibles.push(
      'Beca matrícula: CCAA (depende renta)',
      'Beca comedor: CCAA + Ayuntamiento',
      'Beca transporte: CCAA',
      'Fundación Carolina (FP Superior): depende mérito y renta',
      'INEM/SEPE: si eres demandante de empleo',
      'Becas empresa: si participas en FP Dual'
    );
    porcentaje_cobertura = 'Depende de renta (0-100%)';
  }

  // Salario medio inicial
  const familia_key = i.familia_profesional;
  const salarios = salarios_medios[familia_key] || salarios_medios['otra'];
  const salario_inicial = salarios[grado_key];

  // Información FP Dual
  let fp_dual_info = '';
  if (i.solicita_fp_dual === 'si') {
    const remuneracion_mensual = remuneracion_fp_dual[i.comunidad_autonoma] || 550;
    const remuneracion_total = remuneracion_mensual * 20 * ANOS_ESTUDIO; // aprox. 20 meses/año en empresas
    fp_dual_info = `FP Dual disponible en tu comunidad. Remuneración estimada: ${remuneracion_mensual}€/mes (${(remuneracion_mensual * 12).toFixed(0)}€/año). Total 2 años: ${remuneracion_total.toFixed(0)}€. Coste para estudiante: similar a pública (0-500€). Inserción laboral: ~95% en primeros 3 meses. Principales sectores: Informática, Electricidad, Mecánica, Administración, Sanidad.`;
  } else {
    fp_dual_info = 'No has seleccionado FP Dual. Considera esta opción para combinar formación + experiencia laboral remunerada + inserción rápida. Disponible en la mayoría de ciclos y CCAA.';
  }

  return {
    coste_total_2anos: Math.round(coste_total * 100) / 100,
    coste_anual_promedio: Math.round(coste_anual_promedio * 100) / 100,
    desglose_costes: desglose_items.join(' | '),
    becas_disponibles: becas_disponibles.join(' | '),
    porcentaje_cobertura_beca: porcentaje_cobertura,
    salario_medio_inicial: salario_inicial,
    fp_dual_info: fp_dual_info
  };
}
