// Calculadora Modelo 130 — Pago fraccionado IRPF autónomos España 2026
// Base legal: Art. 110 Reglamento IRPF (RD 439/2007) y Ley 35/2006 IRPF
// Tipo de pago fraccionado: 20% sobre rendimiento neto acumulado positivo

export interface Inputs {
  /** Trimestre: '1' | '2' | '3' | '4' */
  trimestre: string;
  /** Ingresos brutos acumulados desde 1 de enero (sin IVA repercutido), en € */
  ingresos_acumulados: number;
  /** Gastos deducibles acumulados desde 1 de enero (sin IVA soportado deducible), en € */
  gastos_acumulados: number;
  /** Suma de pagos fraccionados Modelo 130 ya ingresados en trimestres anteriores del año, en € */
  pagos_anteriores: number;
  /** Retenciones IRPF soportadas acumuladas en el año (15% o 7% nuevos autónomos), en € */
  retenciones_acumuladas: number;
  /** Cuota de autónomos (SS) acumulada — informativa; debe estar incluida ya en gastos_acumulados */
  cuota_autonomos_acumulada: number;
}

export interface Outputs {
  /** Ingresos − Gastos deducibles acumulados */
  rendimiento_neto: number;
  /** max(rendimiento_neto, 0): base sobre la que se aplica el 20% */
  base_20_pct: number;
  /** 20% × base_20_pct — Art. 110.3 RIRPF */
  cuota_integra: number;
  /** Pagos anteriores + retenciones acumuladas */
  a_deducir: number;
  /** Importe a ingresar en Hacienda: max(cuota_integra − a_deducir, 0) */
  resultado_modelo_130: number;
  /** Exceso no deducido (cuando a_deducir > cuota_integra): trasladable al siguiente trimestre */
  resultado_negativo: number;
  /** Porcentaje que el pago representa sobre ingresos brutos acumulados */
  efectivo_porcentaje_ingresos: number;
  /** Extrapolación orientativa del pago total anual al ritmo actual */
  acumulado_anual_estimado: number;
  _insight?: any;
}

// Constante oficial 2026 — Art. 110.3 RIRPF (RD 439/2007)
const TIPO_PAGO_FRACCIONADO = 0.20; // 20%

/**
 * Redondea a 2 decimales (centavos de euro).
 */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function compute(i: Inputs): Outputs {
  // --- Saneamiento de inputs ---
  const trimestre = parseInt(i.trimestre, 10) || 1;
  const trimestreVal = Math.min(Math.max(trimestre, 1), 4);

  const ingresos = Math.max(isFinite(i.ingresos_acumulados) ? i.ingresos_acumulados : 0, 0);
  const gastos = Math.max(isFinite(i.gastos_acumulados) ? i.gastos_acumulados : 0, 0);
  const pagosAnteriores = Math.max(isFinite(i.pagos_anteriores) ? i.pagos_anteriores : 0, 0);
  const retenciones = Math.max(isFinite(i.retenciones_acumuladas) ? i.retenciones_acumuladas : 0, 0);

  // --- Rendimiento neto acumulado ---
  // Art. 110.1 RIRPF: diferencia entre ingresos y gastos deducibles desde 1-enero
  const rendimientoNeto = r2(ingresos - gastos);

  // --- Base de cálculo ---
  // Solo aplica el 20% si el rendimiento es positivo; si es ≤ 0 la cuota es 0
  const base20pct = rendimientoNeto > 0 ? rendimientoNeto : 0;

  // --- Cuota íntegra ---
  // Art. 110.3 RIRPF: 20% sobre la base acumulada
  const cuotaIntegra = r2(base20pct * TIPO_PAGO_FRACCIONADO);

  // --- Deducciones ---
  // Art. 110.3 RIRPF: se restan los pagos fraccionados previos y las retenciones soportadas
  const aDeducir = r2(pagosAnteriores + retenciones);

  // --- Resultado neto antes de limitar a 0 ---
  const resultadoBruto = r2(cuotaIntegra - aDeducir);

  // --- Resultado final: nunca negativo (el Modelo 130 no genera devolución) ---
  const resultadoModelo130 = resultadoBruto > 0 ? resultadoBruto : 0;

  // --- Exceso no deducido: trasladable al siguiente trimestre del mismo ejercicio ---
  // Si a_deducir > cuota_integra, el exceso NO se pierde en el trimestre pero
  // sí al cierre del ejercicio (4T). Se informa como dato orientativo.
  const resultadoNegativo = resultadoBruto < 0 ? r2(Math.abs(resultadoBruto)) : 0;

  // --- Tipo efectivo sobre ingresos brutos ---
  const efectivoPorcentajeIngresos = ingresos > 0
    ? r2((resultadoModelo130 / ingresos) * 100)
    : 0;

  // --- Extrapolación anual orientativa ---
  // Se calcula cuántos trimestres acumula el trimestre actual (factor = 4/trimestre)
  // Nota: es puramente orientativo; asume ritmo constante de ingresos/gastos
  const factorAnualizacion = trimestreVal > 0 ? 4 / trimestreVal : 4;
  // El pago total anual estimado es la cuota íntegra anualizada menos retenciones
  const cuotaIntegraAnualizada = r2(cuotaIntegra * factorAnualizacion);
  const retencionesAnualizadas = r2(retenciones * factorAnualizacion);
  const acumuladoAnualEstimado = Math.max(r2(cuotaIntegraAnualizada - retencionesAnualizadas), 0);

  // --- Insight narrativo dinámico ---
  const fmtEur = (n: number) => Math.round(n).toLocaleString('es-ES') + '€';
  let _insight: any;
  if (resultadoModelo130 > 0) {
    _insight = {
      title: `A ingresar en el ${trimestreVal}T`,
      text: `Tenés que pagar **${fmtEur(resultadoModelo130)}** en este Modelo 130 (20% sobre un rendimiento neto de **${fmtEur(rendimientoNeto)}**, ya descontados pagos y retenciones). Equivale al **${efectivoPorcentajeIngresos.toFixed(1)}%** de tus ingresos acumulados.`,
      tone: 'warn',
      icon: '🧾',
    };
  } else if (resultadoNegativo > 0) {
    _insight = {
      title: 'Sin pago este trimestre',
      text: `No ingresás nada: tus pagos previos y retenciones (**${fmtEur(aDeducir)}**) ya superan el 20% del rendimiento. El exceso de **${fmtEur(resultadoNegativo)}** se traslada al trimestre siguiente del mismo año.`,
      tone: 'good',
      icon: '✅',
    };
  } else if (rendimientoNeto <= 0) {
    _insight = {
      title: 'Rendimiento no positivo',
      text: `Tus gastos igualan o superan los ingresos acumulados, así que la cuota del 20% es **0€** y no hay nada que ingresar este trimestre. Igual tenés que presentar el modelo.`,
      tone: 'neutral',
      icon: '➖',
    };
  } else {
    _insight = {
      title: 'Resultado a cero',
      text: `La cuota íntegra y lo ya deducido se compensan: el Modelo 130 sale a **0€** este trimestre, pero igual hay que presentarlo.`,
      tone: 'neutral',
      icon: '⚖️',
    };
  }

  return {
    rendimiento_neto: rendimientoNeto,
    base_20_pct: base20pct,
    cuota_integra: cuotaIntegra,
    a_deducir: aDeducir,
    resultado_modelo_130: resultadoModelo130,
    resultado_negativo: resultadoNegativo,
    efectivo_porcentaje_ingresos: efectivoPorcentajeIngresos,
    acumulado_anual_estimado: acumuladoAnualEstimado,
    _insight,
  };
}
