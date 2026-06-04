export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Calculadora de ahorro para educación de un hijo — plan colegio/universidad.
 *
 * Método: anualidad ordinaria de capitalización compuesta.
 *
 * Objetivo = Cuota_mensual_actual × (1 + inflacion_educativa)^anios × meses_de_duracion
 *
 * PMT_mensual = Objetivo × r / ((1 + r)^n − 1)
 *
 * Donde:
 *   r = tasa de retorno real mensual = ((1 + tasa_anual/100)^(1/12)) − 1
 *   n = meses_hasta_inicio_etapa (horizonte de ahorro)
 */
export function ahorroEducacionHijoPlanColegioUniversidad(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';

  // ── Inputs ──────────────────────────────────────────────────────────────────
  const cuotaMensual   = Math.max(0, Number(i.cuota_mensual)  || 0);   // ARS o USD por mes hoy
  const duracionMeses  = Math.max(1, Number(i.duracion_meses) || 48);  // meses que dura la etapa
  const aniosHastaInicio = Math.max(0, Number(i.anios_hasta) || 10);   // horizonte de ahorro
  const inflacionEdu   = Math.max(0, Number(i.inflacion_edu) || 40);   // % anual inflación educativa
  const tasaRetorno    = Math.max(0, Number(i.tasa_retorno)  || 40);   // % anual rendimiento inversión

  // ── Proyección del costo al momento del inicio ───────────────────────────
  // Proyectamos cuánto costará la cuota mensual cuando el hijo entre a esa etapa
  const factorInflacion = Math.pow(1 + inflacionEdu / 100, aniosHastaInicio);
  const cuotaFutura     = cuotaMensual * factorInflacion;

  // Costo total de la etapa en valor futuro (suma de cuotas a lo largo de la etapa)
  // Simplificación: tomamos el valor presente del flujo de cuotas durante la etapa
  // descontado a la tasa de retorno, para obtener el capital objetivo necesario
  // al momento de inicio (present value of education phase).
  const r_mensual = Math.pow(1 + tasaRetorno / 100, 1 / 12) - 1;

  // Valor presente (al inicio de la etapa) de todas las cuotas futuras de la etapa
  let capitalObjetivo: number;
  if (r_mensual < 0.0001) {
    // Si tasa ≈ 0, el PV de la etapa es simplemente la suma de cuotas
    capitalObjetivo = cuotaFutura * duracionMeses;
  } else {
    // PV de annuity ordinaria (cuotas pagadas al final de cada mes)
    capitalObjetivo = cuotaFutura * (1 - Math.pow(1 + r_mensual, -duracionMeses)) / r_mensual;
  }

  // ── Ahorro mensual necesario ──────────────────────────────────────────────
  // PMT = FV × r / ((1+r)^n − 1)  →  aquí FV = capitalObjetivo
  const n = aniosHastaInicio * 12; // meses de ahorro disponibles
  let ahorro_mensual: number;

  if (n <= 0) {
    // Sin tiempo de ahorro: hay que tener el capital ya acumulado
    ahorro_mensual = capitalObjetivo;
  } else if (r_mensual < 0.0001) {
    ahorro_mensual = capitalObjetivo / n;
  } else {
    ahorro_mensual = capitalObjetivo * r_mensual / (Math.pow(1 + r_mensual, n) - 1);
  }

  // ── Métricas adicionales ──────────────────────────────────────────────────
  const totalAhorrado     = ahorro_mensual * n;
  const rendimientosTotal = capitalObjetivo - totalAhorrado;
  const cuotaFuturaDisplay = cuotaFutura;

  // ── Formato ───────────────────────────────────────────────────────────────
  const fmt = (v: number): string =>
    v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (lang === 'en') {
    const insightText = ahorro_mensual > totalAhorrado * 0.5
      ? `You need to save **${fmt(ahorro_mensual)}/month** to reach your goal. Starting earlier or increasing your expected return reduces this significantly.`
      : `By saving **${fmt(ahorro_mensual)}/month**, compound interest will cover **${fmt(rendimientosTotal > 0 ? rendimientosTotal : 0)}** of the total — the rest you fund directly.`;

    return {
      ahorro_mensual: ahorro_mensual.toFixed(2),
      capital_objetivo: capitalObjetivo.toFixed(2),
      cuota_futura: cuotaFuturaDisplay.toFixed(2),
      total_ahorrado: totalAhorrado.toFixed(2),
      _insight: {
        title: 'Required monthly savings',
        text: insightText,
        tone: ahorro_mensual < cuotaMensual * 0.5 ? 'positive' : 'neutral',
        icon: '🎓'
      }
    };
  }

  // ── Español (default) ─────────────────────────────────────────────────────
  const insightText = rendimientosTotal > 0
    ? `Ahorrando **$${fmt(ahorro_mensual)}/mes**, los rendimientos aportarán **$${fmt(rendimientosTotal)}** del objetivo — el resto lo cubrís con tus depósitos.`
    : `Necesitás acumular **$${fmt(capitalObjetivo)}**. Con los rendimientos incluidos, el ahorro mensual estimado es **$${fmt(ahorro_mensual)}**.`;

  return {
    ahorro_mensual: ahorro_mensual.toFixed(2),
    capital_objetivo: capitalObjetivo.toFixed(2),
    cuota_futura: cuotaFuturaDisplay.toFixed(2),
    total_ahorrado: totalAhorrado.toFixed(2),
    _insight: {
      title: 'Tu plan de ahorro educativo',
      text: insightText,
      tone: rendimientosTotal > 0 ? 'positive' : 'neutral',
      icon: '🎓'
    }
  };
}
