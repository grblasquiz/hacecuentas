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
  _insight?: any;
  _chart?: any;
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

  // Insight narrativo según situación de cobertura
  let _insight: any;
  const gastoFmt = `$${Math.round(gasto_final).toLocaleString('es-CO')}`;
  const topeFmt = `$${TOPE_ANUAL.toLocaleString('es-CO')}`;
  if (exonerado_flag) {
    _insight = {
      title: 'Estás exonerado',
      text: `Con ingresos menores a 2 SMMLV **no pagás cuota moderadora ni copago**: tu EPS cubre el 100% sin desembolso de tu bolsillo.`,
      tone: 'good',
      icon: '🩺',
    };
  } else if (gasto_estimado_anual > TOPE_ANUAL) {
    _insight = {
      title: 'Llegás al tope anual',
      text: `Tu uso estimado supera el tope: pagás como máximo **${topeFmt}** al año y todo lo que exceda lo **cubre tu EPS**. Guardá los recibos para acreditar que ya alcanzaste el límite.`,
      tone: 'warn',
      icon: '🧾',
    };
  } else {
    const pctTope = (gasto_final / TOPE_ANUAL) * 100;
    _insight = {
      title: 'Dentro del tope',
      text: `Tu gasto anual estimado en cuotas es **${gastoFmt}**, el **${pctTope.toFixed(0)}%** del tope de ${topeFmt}. Te queda margen antes de que la EPS asuma el resto.`,
      tone: 'neutral',
      icon: '💊',
    };
  }

  // Gauge: gasto anual dentro del tope (solo cuando hay gasto que graficar)
  let _chart: any;
  if (!exonerado_flag) {
    const markerVal = Math.round(gasto_final);
    _chart = {
      type: 'scale',
      marker: markerVal,
      markerLabel: gastoFmt,
      min: 0,
      segments: [
        { nombre: 'Bajo', max: Math.round(TOPE_ANUAL * 0.4), color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Medio', max: Math.round(TOPE_ANUAL * 0.75), color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Cerca del tope', max: TOPE_ANUAL, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Tope (cubre EPS)', max: Math.max(Math.round(TOPE_ANUAL * 1.05), markerVal + 1), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Gasto anual estimado en cuotas moderadoras (${gastoFmt}) frente al tope legal de ${topeFmt}.`,
    };
  }

  return {
    tramo_ingresos,
    cuota_consulta_general: Math.round(cuota_consulta_general),
    cuota_medicamento: Math.round(cuota_medicamento),
    cuota_urgencia: Math.round(cuota_urgencia),
    cuota_hospitalizacion: Math.round(cuota_hospitalizacion),
    tope_anual_maximo: TOPE_ANUAL,
    gasto_estimado_anual: Math.round(gasto_final),
    gasto_vs_tope,
    exonerado: exonerado_texto,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
