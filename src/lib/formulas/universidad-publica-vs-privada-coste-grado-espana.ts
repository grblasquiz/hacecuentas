// Calculadora: coste universidad pública vs privada España 2026
// Fuentes: Ministerio de Universidades (precios crédito ECTS 2025-2026),
//          Ministerio de Educación (becas MEC 2025-2026), INE EPA 2024

export interface Inputs {
  tipo_universidad: 'publica' | 'privada_low' | 'privada_mid' | 'privada_top';
  comunidad_autonoma: 'madrid' | 'cataluna' | 'andalucia' | 'valencia' | 'pais_vasco' | 'galicia' | 'castilla_leon' | 'aragon' | 'canarias' | 'otras';
  rama_estudios: 'ciencias_salud' | 'ingenieria' | 'ciencias' | 'ciencias_sociales' | 'artes_humanidades';
  creditos_grado: number;
  beca_mec: 'no' | 'basica' | 'variable' | 'excelencia';
  residencia: 'no' | 'si_piso' | 'si_residencia';
  anos_carrera: number;
}

export interface Outputs {
  coste_matricula_anual: number;
  coste_matricula_total: number;
  ahorro_beca: number;
  coste_residencia_total: number;
  coste_total_grado: number;
  coste_por_credito: number;
  salario_esperado_inicio: number;
  anos_recuperacion: number;
  roi_10_anos: number;
  financiacion_recomendada: string;
  diferencia_publica_privada: number;
}

export function compute(i: Inputs): Outputs {
  // ─── Constantes de precio de crédito ECTS por CCAA (euros, curso 2025-2026)
  // Fuente: Resoluciones autonómicas de precios públicos universitarios
  // [experimental, no_experimental]
  const precioCredito: Record<string, [number, number]> = {
    madrid:        [31.11, 18.46],
    cataluna:      [30.58, 21.01],
    andalucia:     [18.46, 13.19],
    valencia:      [22.14, 15.84],
    pais_vasco:    [14.94, 12.28],
    galicia:       [17.80, 13.06],
    castilla_leon: [20.50, 14.60],
    aragon:        [21.80, 15.20],
    canarias:      [12.98,  9.98],
    otras:         [21.00, 15.00],  // media nacional orientativa
  };

  // Ramas experimentales (precio superior)
  const esExperimental: Record<string, boolean> = {
    ciencias_salud:     true,
    ingenieria:         true,
    ciencias:           true,
    ciencias_sociales:  false,
    artes_humanidades:  false,
  };

  // ─── Coste anual privadas (euros/año) — rango medio de la horquilla
  const costeAnualPrivada: Record<string, number> = {
    privada_low: 8000,
    privada_mid: 12000,
    privada_top: 16000,
  };

  // ─── Salario bruto de inicio estimado por rama (€/año, INE EPA 2024)
  const salarioPorRama: Record<string, number> = {
    ciencias_salud:    30000,
    ingenieria:        28000,
    ciencias:          24000,
    ciencias_sociales: 23000,
    artes_humanidades: 19500,
  };

  // Salario de referencia sin titulación universitaria (INE EPA 2024)
  const SALARIO_SIN_TITULO = 20000; // €/año brutos

  // ─── Validaciones básicas
  const creditos = Math.max(180, Math.min(360, i.creditos_grado || 240));
  const anos = Math.max(4, Math.min(8, i.anos_carrera || 4));
  const anosNominal = creditos / 60; // duración nominal a 60 ECTS/año

  // ─── Cálculo matrícula anual
  let costMatriculaAnual = 0;
  let costPorCredito = 0;

  if (i.tipo_universidad === 'publica') {
    const ccaa = i.comunidad_autonoma || 'otras';
    const [precioExp, precioNoExp] = precioCredito[ccaa] ?? precioCredito['otras'];
    const precio = esExperimental[i.rama_estudios] ? precioExp : precioNoExp;
    const creditosPorCurso = creditos / anosNominal; // ECTS por año nominal
    costMatriculaAnual = creditosPorCurso * precio;
    costPorCredito = precio;
  } else {
    costMatriculaAnual = costeAnualPrivada[i.tipo_universidad] ?? 12000;
    costPorCredito = (costMatriculaAnual * anosNominal) / creditos;
  }

  // ─── Coste total de matrícula (con duración real declarada)
  const costMatriculaTotal = costMatriculaAnual * anos;

  // ─── Ahorro por becas MEC (solo aplicable en pública)
  // Fuente: Convocatoria beca general MEC 2025-2026
  const becaMEC: Record<string, number> = {
    no:         0,
    basica:     1700,   // cubre matrícula + mínimo fijo
    variable:   3500,   // media real beca variable + fija + matrícula
    excelencia: 5000,   // beca con componente de excelencia académica
  };
  const ahorroBecaAnual = i.tipo_universidad === 'publica'
    ? (becaMEC[i.beca_mec] ?? 0)
    : 0;
  const ahorroBecaTotal = ahorroBecaAnual * anos;

  // ─── Coste de residencia/alojamiento
  const mesesPorAnio = 9; // curso académico
  const costeMensualResidencia: Record<string, number> = {
    no:              0,
    si_piso:       500,
    si_residencia: 700,
  };
  const costeMensual = costeMensualResidencia[i.residencia] ?? 0;
  const costeResidenciaTotal = costeMensual * mesesPorAnio * anos;

  // ─── Coste total grado
  const costeTotalGrado = Math.max(0, costMatriculaTotal - ahorroBecaTotal) + costeResidenciaTotal;

  // ─── Coste equivalente en pública (Madrid, misma rama) para diferencia
  // Se calcula siempre con ccaa=madrid como referencia de comparación
  let costeTotalPublicaRef = 0;
  if (i.tipo_universidad !== 'publica') {
    const [precioExpMad, precioNoExpMad] = precioCredito['madrid'];
    const precioRef = esExperimental[i.rama_estudios] ? precioExpMad : precioNoExpMad;
    const creditosPorCursoRef = creditos / anosNominal;
    const anualRef = creditosPorCursoRef * precioRef;
    costeTotalPublicaRef = anualRef * anos + costeResidenciaTotal;
  }
  const diferencia = i.tipo_universidad === 'publica'
    ? 0
    : Math.max(0, costeTotalGrado - costeTotalPublicaRef);

  // ─── ROI estimado a 10 años
  // ROI = ((salario_titulado - salario_sin_titulo) * 10 - coste_total) / coste_total * 100
  const salarioInicio = salarioPorRama[i.rama_estudios] ?? 23000;
  const diferencialSalarial = Math.max(0, salarioInicio - SALARIO_SIN_TITULO);
  const beneficio10Anos = diferencialSalarial * 10;
  const roi10Anos = costeTotalGrado > 0
    ? ((beneficio10Anos - costeTotalGrado) / costeTotalGrado) * 100
    : 0;

  // ─── Años para recuperar la inversión
  let anosRecuperacion = 0;
  if (diferencialSalarial > 0 && costeTotalGrado > 0) {
    anosRecuperacion = Math.ceil(costeTotalGrado / diferencialSalarial);
  }

  // ─── Recomendación de financiación
  let financiacion = '';
  if (i.tipo_universidad === 'publica') {
    if (i.beca_mec === 'no') {
      financiacion = 'Comprueba si cumples los requisitos de renta para la beca MEC en sede.educacion.gob.es. Si el coste de alojamiento es elevado, considera el préstamo renta del ICO (ico.es/ico-renta-universidad), que se devuelve solo al superar cierto nivel de ingresos.';
    } else {
      financiacion = 'Con beca MEC cubierta, el mayor gasto es el alojamiento. Explora residencias universitarias públicas y ayudas autonómicas de alojamiento, que pueden reducir el coste hasta un 30%.';
    }
  } else {
    if (costeTotalGrado > 40000) {
      financiacion = 'Para un grado privado de este coste, las opciones habituales son: (1) Préstamo ICO Renta Universidad, (2) financiación propia del centro (cuotas mensuales sin intereses), (3) préstamo bancario con carencia durante los estudios. Compara TAE antes de contratar. El sobrecoste respecto a la pública es muy significativo; evalúa si la empleabilidad del centro justifica la diferencia.';
    } else {
      financiacion = 'Consulta las becas propias del centro privado y el fraccionamiento en cuotas mensuales. El préstamo ICO Renta Universidad también está disponible para universidades privadas homologadas.';
    }
  }

  return {
    coste_matricula_anual:    Math.round(costMatriculaAnual * 100) / 100,
    coste_matricula_total:    Math.round(costMatriculaTotal * 100) / 100,
    ahorro_beca:              Math.round(ahorroBecaTotal * 100) / 100,
    coste_residencia_total:   Math.round(costeResidenciaTotal * 100) / 100,
    coste_total_grado:        Math.round(costeTotalGrado * 100) / 100,
    coste_por_credito:        Math.round(costPorCredito * 100) / 100,
    salario_esperado_inicio:  salarioInicio,
    anos_recuperacion:        anosRecuperacion,
    roi_10_anos:              Math.round(roi10Anos * 10) / 10,
    financiacion_recomendada: financiacion,
    diferencia_publica_privada: Math.round(diferencia * 100) / 100,
  };
}
