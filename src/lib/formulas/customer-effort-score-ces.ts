/** Customer Effort Score (CES) — escala 1-7 */

export interface Inputs {
  respuestas1: number;
  respuestas2: number;
  respuestas3: number;
  respuestas4: number;
  respuestas5: number;
  respuestas6: number;
  respuestas7: number;
}

export interface Outputs {
  ces: number;
  totalRespuestas: number;
  pctBajoEsfuerzo: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function customerEffortScoreCes(i: Inputs): Outputs {
  const r1 = Number(i.respuestas1) || 0;
  const r2 = Number(i.respuestas2) || 0;
  const r3 = Number(i.respuestas3) || 0;
  const r4 = Number(i.respuestas4) || 0;
  const r5 = Number(i.respuestas5) || 0;
  const r6 = Number(i.respuestas6) || 0;
  const r7 = Number(i.respuestas7) || 0;

  if (r1 < 0 || r2 < 0 || r3 < 0 || r4 < 0 || r5 < 0 || r6 < 0 || r7 < 0) {
    throw new Error('Las cantidades de respuestas no pueden ser negativas');
  }

  const totalRespuestas = r1 + r2 + r3 + r4 + r5 + r6 + r7;
  if (totalRespuestas === 0) throw new Error('Ingresá al menos una respuesta');

  const sumaPonderada = (r1 * 1) + (r2 * 2) + (r3 * 3) + (r4 * 4) + (r5 * 5) + (r6 * 6) + (r7 * 7);
  const ces = sumaPonderada / totalRespuestas;

  const bajoEsfuerzo = r5 + r6 + r7;
  const altoEsfuerzo = r1 + r2 + r3;
  const pctBajoEsfuerzo = (bajoEsfuerzo / totalRespuestas) * 100;
  const pctAltoEsfuerzo = (altoEsfuerzo / totalRespuestas) * 100;

  let diagnostico: string;
  if (ces >= 6) {
    diagnostico = 'Excelente: experiencia muy fluida. Tus clientes resuelven con mínimo esfuerzo.';
  } else if (ces >= 5) {
    diagnostico = 'Bueno: la experiencia funciona bien. Hay oportunidades de mejora menores.';
  } else if (ces >= 4) {
    diagnostico = 'Aceptable: hay fricciones que podés reducir para mejorar la retención.';
  } else if (ces >= 3) {
    diagnostico = 'Malo: tus clientes experimentan demasiado esfuerzo. Riesgo alto de churn.';
  } else {
    diagnostico = 'Crítico: la experiencia genera frustración significativa. Acción urgente necesaria.';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `CES: ${ces.toFixed(2)} sobre 7 (${fmt.format(totalRespuestas)} respuestas). ` +
    `Bajo esfuerzo (5-7): ${pctBajoEsfuerzo.toFixed(1)}% (${fmt.format(bajoEsfuerzo)} resp.). ` +
    `Alto esfuerzo (1-3): ${pctAltoEsfuerzo.toFixed(1)}% (${fmt.format(altoEsfuerzo)} resp.). ` +
    diagnostico;

  const tone = ces >= 5 ? 'good' : ces < 4 ? 'warn' : 'neutral';
  const _insight = {
    title: `CES ${ces.toFixed(2)} / 7`,
    text: `Con **${fmt.format(totalRespuestas)} respuestas**, el **${pctBajoEsfuerzo.toFixed(1)}%** reporta bajo esfuerzo (5-7) y el **${pctAltoEsfuerzo.toFixed(1)}%** alto esfuerzo (1-3). ${diagnostico}`,
    tone,
    icon: ces >= 5 ? '🟢' : ces < 4 ? '🔴' : '🟡',
  };

  const _chart = {
    type: 'scale',
    marker: Number(ces.toFixed(2)),
    markerLabel: `CES ${ces.toFixed(2)}`,
    min: 1,
    segments: [
      { nombre: 'Crítico', max: 3, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Malo', max: 4, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Aceptable', max: 5, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Bueno', max: 6, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Excelente', max: 7, color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Customer Effort Score de ${ces.toFixed(2)} sobre 7 en una escala de 1 (crítico) a 7 (excelente)`,
  };

  return {
    ces: Number(ces.toFixed(2)),
    totalRespuestas,
    pctBajoEsfuerzo: Number(pctBajoEsfuerzo.toFixed(1)),
    detalle,
    _insight,
    _chart,
  };
}
