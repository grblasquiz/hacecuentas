export interface Inputs {
  gasto_vivienda: number;
  gasto_suministros: number;
  gasto_alimentacion: number;
  gasto_comunidad: number;
  gasto_seguros: number;
  gasto_transporte: number;
  gasto_deudas: number;
  tipo_trabajo: 'indefinido' | 'temporal' | 'autonomo' | 'desempleado';
  dependientes: '0' | '1' | '2' | '3';
  ahorro_mensual: number;
  ahorro_actual: number;
}

export interface Outputs {
  gasto_esencial_mensual: number;
  meses_recomendados_min: number;
  meses_recomendados_max: number;
  objetivo_minimo: number;
  objetivo_maximo: number;
  objetivo_recomendado: number;
  porcentaje_cubierto: number;
  meses_para_objetivo_min: number;
  meses_para_objetivo_rec: number;
  estado_fondo: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes de rangos recomendados (Banco de España / Finanzas para Todos 2026)
  // Estructura: [meses_mín_base, meses_máx_base] sin dependientes
  const RANGOS_BASE: Record<string, [number, number]> = {
    indefinido:  [3, 6],
    temporal:    [4, 8],
    autonomo:    [6, 9],
    desempleado: [6, 12],
  };

  // Incremento por persona dependiente (máximo 12 meses en cualquier caso)
  const INCREMENTO_POR_DEPENDIENTE = 1; // +1 mes por dependiente, tanto en mín como en máx
  const MAX_MESES = 12;

  // --- Paso 1: Gastos esenciales mensuales
  const gasto_vivienda    = Math.max(0, Number(i.gasto_vivienda)    || 0);
  const gasto_suministros = Math.max(0, Number(i.gasto_suministros) || 0);
  const gasto_alimentacion= Math.max(0, Number(i.gasto_alimentacion)|| 0);
  const gasto_comunidad   = Math.max(0, Number(i.gasto_comunidad)   || 0);
  const gasto_seguros     = Math.max(0, Number(i.gasto_seguros)     || 0);
  const gasto_transporte  = Math.max(0, Number(i.gasto_transporte)  || 0);
  const gasto_deudas      = Math.max(0, Number(i.gasto_deudas)      || 0);

  const gasto_esencial_mensual =
    gasto_vivienda +
    gasto_suministros +
    gasto_alimentacion +
    gasto_comunidad +
    gasto_seguros +
    gasto_transporte +
    gasto_deudas;

  // --- Paso 2: Meses recomendados según situación laboral y dependientes
  const tipoTrabajo = i.tipo_trabajo || 'indefinido';
  const [baseMin, baseMax] = RANGOS_BASE[tipoTrabajo] ?? [3, 6];

  const numDependientes = parseInt(i.dependientes ?? '0', 10) || 0;
  // Normalizar: '3' = 3 o más, tratamos como 3
  const dependientesNorm = Math.min(numDependientes, 3);
  const incremento = dependientesNorm * INCREMENTO_POR_DEPENDIENTE;

  const meses_recomendados_min = Math.min(baseMin + incremento, MAX_MESES);
  const meses_recomendados_max = Math.min(baseMax + incremento, MAX_MESES);

  // --- Paso 3: Objetivos en euros
  const objetivo_minimo      = Math.round(gasto_esencial_mensual * meses_recomendados_min * 100) / 100;
  const objetivo_maximo      = Math.round(gasto_esencial_mensual * meses_recomendados_max * 100) / 100;
  const meses_medio          = (meses_recomendados_min + meses_recomendados_max) / 2;
  const objetivo_recomendado = Math.round(gasto_esencial_mensual * meses_medio * 100) / 100;

  // --- Paso 4: Porcentaje cubierto y plazos
  const ahorro_actual   = Math.max(0, Number(i.ahorro_actual)  || 0);
  const ahorro_mensual  = Math.max(0, Number(i.ahorro_mensual) || 0);

  // Porcentaje del objetivo mínimo ya cubierto
  let porcentaje_cubierto = 0;
  if (objetivo_minimo > 0) {
    porcentaje_cubierto = Math.min(Math.round((ahorro_actual / objetivo_minimo) * 10000) / 100, 100);
  } else {
    // Si gastos son 0, el objetivo es 0 y está cubierto al 100%
    porcentaje_cubierto = 100;
  }

  // Meses para alcanzar objetivo mínimo
  let meses_para_objetivo_min = 0;
  if (objetivo_minimo <= ahorro_actual) {
    meses_para_objetivo_min = 0; // ya cubierto
  } else if (ahorro_mensual > 0) {
    const pendiente_min = objetivo_minimo - ahorro_actual;
    meses_para_objetivo_min = Math.ceil(pendiente_min / ahorro_mensual);
  } else {
    meses_para_objetivo_min = -1; // indica que no se puede calcular (ahorro 0)
  }

  // Meses para alcanzar objetivo recomendado
  let meses_para_objetivo_rec = 0;
  if (objetivo_recomendado <= ahorro_actual) {
    meses_para_objetivo_rec = 0; // ya cubierto
  } else if (ahorro_mensual > 0) {
    const pendiente_rec = objetivo_recomendado - ahorro_actual;
    meses_para_objetivo_rec = Math.ceil(pendiente_rec / ahorro_mensual);
  } else {
    meses_para_objetivo_rec = -1;
  }

  // --- Paso 5: Estado descriptivo del fondo
  let estado_fondo: string;

  if (gasto_esencial_mensual === 0) {
    estado_fondo = 'Introduce tus gastos esenciales para calcular el estado del fondo.';
  } else if (ahorro_actual >= objetivo_maximo) {
    estado_fondo = `✅ Fondo completo. Tienes cubiertos los ${meses_recomendados_max} meses máximos recomendados para tu situación.`;
  } else if (ahorro_actual >= objetivo_recomendado) {
    estado_fondo = `✅ Fondo recomendado alcanzado. Cubre el objetivo del punto medio (${meses_medio} meses). Puedes seguir ahorrando hasta el máximo.`;
  } else if (ahorro_actual >= objetivo_minimo) {
    estado_fondo = `🟡 Fondo mínimo cubierto (${meses_recomendados_min} meses). Sigue aportando hasta alcanzar el objetivo recomendado de ${objetivo_recomendado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`;
  } else if (ahorro_actual > 0) {
    const mesesCubiertos = gasto_esencial_mensual > 0
      ? Math.floor((ahorro_actual / gasto_esencial_mensual) * 10) / 10
      : 0;
    estado_fondo = `🔴 Fondo insuficiente. Tienes cubiertos aproximadamente ${mesesCubiertos.toLocaleString('es-ES')} meses. El objetivo mínimo es ${objetivo_minimo.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`;
  } else {
    estado_fondo = `🔴 Sin fondo de emergencia. El objetivo mínimo recomendado para tu situación es ${objetivo_minimo.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}.`;
  }

  return {
    gasto_esencial_mensual,
    meses_recomendados_min,
    meses_recomendados_max,
    objetivo_minimo,
    objetivo_maximo,
    objetivo_recomendado,
    porcentaje_cubierto,
    meses_para_objetivo_min,
    meses_para_objetivo_rec,
    estado_fondo,
  };
}
