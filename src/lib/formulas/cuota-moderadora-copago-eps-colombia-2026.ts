export interface Inputs {
  salario_mensual: number;
  servicios_anuales: 'bajo' | 'medio' | 'alto';
}

export interface Outputs {
  tramo_ingresos: string;
  cuota_consulta_general: number;
  cuota_medicamento: number;
  cuota_urgencia: number;
  cuota_hospitalizacion: number;
  tope_anual_maximo: number;
  gasto_estimado_anual: number;
  gasto_vs_tope: string;
  exonerado: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - Fuente: Decreto 2625/2025 (Min. Trabajo)
  const SMMLV_2026 = 1_408_000;
  const LIMITE_BAJO = 2 * SMMLV_2026;      // $2.816.000
  const LIMITE_MEDIO = 5 * SMMLV_2026;     // $7.040.000
  const TOPE_ANUAL = 2 * SMMLV_2026;       // $2.816.000 - Fuente: Ley 100/1993, Min. Salud

  // Cuotas moderadoras por servicio según tramo - Fuente: Min. Salud Resolución 2023
  // Tramo bajo (<2 SMMLV): exonerado
  // Tramo medio (2-5 SMMLV)
  const CUOTA_MEDIO_CONSULTA = 5_600;
  const CUOTA_MEDIO_MEDICAMENTO = 4_900;
  const CUOTA_MEDIO_URGENCIA = 8_400;
  const COPAGO_MEDIO_HOSPITALIZACION = 0.10; // 10%

  // Tramo alto (>5 SMMLV)
  const CUOTA_ALTO_CONSULTA = 20_000;
  const CUOTA_ALTO_MEDICAMENTO = 17_500;
  const CUOTA_ALTO_URGENCIA = 30_000;
  const COPAGO_ALTO_HOSPITALIZACION = 0.25; // 25%

  // Definir tramo y cuotas
  let tramo_ingresos = '';
  let cuota_consulta_general = 0;
  let cuota_medicamento = 0;
  let cuota_urgencia = 0;
  let cuota_hospitalizacion = 0;
  let exonerado_flag = false;

  if (i.salario_mensual < LIMITE_BAJO) {
    tramo_ingresos = 'Bajo (<2 SMMLV): Exonerado de cuota moderadora';
    cuota_consulta_general = 0;
    cuota_medicamento = 0;
    cuota_urgencia = 0;
    cuota_hospitalizacion = 0;
    exonerado_flag = true;
  } else if (i.salario_mensual < LIMITE_MEDIO) {
    tramo_ingresos = `Medio (2–5 SMMLV): Ingresos entre $${LIMITE_BAJO.toLocaleString('es-CO')} y $${LIMITE_MEDIO.toLocaleString('es-CO')}`;
    cuota_consulta_general = CUOTA_MEDIO_CONSULTA;
    cuota_medicamento = CUOTA_MEDIO_MEDICAMENTO;
    cuota_urgencia = CUOTA_MEDIO_URGENCIA;
    cuota_hospitalizacion = COPAGO_MEDIO_HOSPITALIZACION * 100;
  } else {
    tramo_ingresos = `Alto (>5 SMMLV): Ingresos superiores a $${LIMITE_MEDIO.toLocaleString('es-CO')}`;
    cuota_consulta_general = CUOTA_ALTO_CONSULTA;
    cuota_medicamento = CUOTA_ALTO_MEDICAMENTO;
    cuota_urgencia = CUOTA_ALTO_URGENCIA;
    cuota_hospitalizacion = COPAGO_ALTO_HOSPITALIZACION * 100;
  }

  // Estimar gasto anual según tipo de servicio
  let servicios_estimados = 0;
  let consultas_anual = 0;
  let medicinas_anual = 0;
  let urgencias_anual = 0;

  if (i.servicios_anuales === 'bajo') {
    consultas_anual = 3;
    medicinas_anual = 0;
    urgencias_anual = 0;
  } else if (i.servicios_anuales === 'medio') {
    consultas_anual = 8;
    medicinas_anual = 12;  // 1 medicina mensual
    urgencias_anual = 1;
  } else {
    consultas_anual = 15;
    medicinas_anual = 24;  // 2 medicinas mensuales
    urgencias_anual = 2;
  }

  // Calcular gasto estimado anual
  let gasto_estimado_anual = exonerado_flag ? 0 : (
    (consultas_anual * cuota_consulta_general) +
    (medicinas_anual * cuota_medicamento) +
    (urgencias_anual * cuota_urgencia)
  );

  // Aplicar tope máximo anual
  let gasto_final = Math.min(gasto_estimado_anual, TOPE_ANUAL);

  // Determinar si supera tope
  let gasto_vs_tope = '';
  if (exonerado_flag) {
    gasto_vs_tope = 'Exonerado: sin cuota moderadora';
  } else if (gasto_estimado_anual > TOPE_ANUAL) {
    gasto_vs_tope = `Supera tope: pagará máximo $${TOPE_ANUAL.toLocaleString('es-CO')} (alcanzado el tope, resto cubre EPS)`;
  } else {
    gasto_vs_tope = `Dentro del tope: pagará $${gasto_final.toLocaleString('es-CO')} de $${TOPE_ANUAL.toLocaleString('es-CO')} anuales`;
  }

  const exonerado_texto = exonerado_flag ? 'Sí, por ingresos <2 SMMLV' : 'No';

  return {
    tramo_ingresos,
    cuota_consulta_general: Math.round(cuota_consulta_general),
    cuota_medicamento: Math.round(cuota_medicamento),
    cuota_urgencia: Math.round(cuota_urgencia),
    cuota_hospitalizacion: Math.round(cuota_hospitalizacion),
    tope_anual_maximo: TOPE_ANUAL,
    gasto_estimado_anual: Math.round(gasto_final),
    gasto_vs_tope,
    exonerado: exonerado_texto
  };
}
