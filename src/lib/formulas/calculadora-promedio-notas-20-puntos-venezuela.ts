/**
 * Promedio de notas en escala 0-20 (Venezuela) + índice académico ponderado.
 *
 * Escala venezolana: las calificaciones van de 0 a 20 puntos y se aprueba con
 * 10 (mínima aprobatoria configurable; algunas universidades exigen 9,5 o 10).
 *
 *   - Sin créditos/unidades: promedio simple = Σ notas / n.
 *   - Con créditos (unidades crédito): índice académico ponderado =
 *     Σ(nota × créditos) / Σ créditos. Es el índice que usan las universidades.
 *
 * Fórmula pura (pedagógica), sin datos fiscales.
 */
export interface Inputs {
  notas?: string;             // "18, 15, 20, 12"
  creditos?: string;          // opcional: "4, 3, 5, 2"
  notaAprobatoria?: number;   // default 10
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

function parseLista(raw: string): number[] {
  return String(raw || '')
    .split(/[,;\s]+/)
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s.replace(',', '.')));
}

export function compute(i: Inputs): Outputs {
  const notas = parseLista(i.notas ?? '');
  if (notas.length === 0 || notas.some(isNaN)) throw new Error('Ingresá al menos una nota (0 a 20)');
  for (const n of notas) {
    if (n < 0 || n > 20) throw new Error(`La nota ${n} está fuera de la escala 0-20`);
  }

  const aprobatoria = Math.min(20, Math.max(0, Number(i.notaAprobatoria ?? 10) || 10));

  const creditos = parseLista(i.creditos ?? '');
  const usaCreditos = creditos.length > 0 && !creditos.some(isNaN) && creditos.length === notas.length;
  if (creditos.length > 0 && creditos.length !== notas.length && !creditos.some(isNaN)) {
    throw new Error(`La cantidad de notas (${notas.length}) y de créditos (${creditos.length}) debe coincidir`);
  }
  for (const c of creditos) {
    if (c <= 0) throw new Error('Los créditos deben ser positivos');
  }

  let promedio: number;
  let totalCreditos = 0;
  if (usaCreditos) {
    totalCreditos = creditos.reduce((a, b) => a + b, 0);
    const sumaPond = notas.reduce((acc, n, idx) => acc + n * creditos[idx], 0);
    promedio = sumaPond / totalCreditos;
  } else {
    promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
  }

  const prom = Math.round(promedio * 100) / 100;
  const aprobadas = notas.filter((n) => n >= aprobatoria).length;
  const reprobadas = notas.length - aprobadas;

  let categoria: string, tone: 'good' | 'warn' | 'neutral';
  if (prom >= 19) { categoria = 'excelente'; tone = 'good'; }
  else if (prom >= 16) { categoria = 'distinguido'; tone = 'good'; }
  else if (prom >= 14) { categoria = 'bueno'; tone = 'good'; }
  else if (prom >= aprobatoria) { categoria = 'aprobado (regular)'; tone = 'neutral'; }
  else { categoria = 'reprobado'; tone = 'warn'; }

  const insText = usaCreditos
    ? `Tu índice académico ponderado es **${prom.toFixed(2)}/20** en ${notas.length} materia(s) (${totalCreditos} unidades crédito) — nivel **${categoria}**. ` +
      `Aprobaste ${aprobadas} de ${notas.length} materia(s) con la mínima de ${aprobatoria}.`
    : `Tu promedio es **${prom.toFixed(2)}/20** en ${notas.length} materia(s) — nivel **${categoria}**. ` +
      `Aprobaste ${aprobadas} de ${notas.length} con la mínima de ${aprobatoria}.` +
      (reprobadas > 0 ? ` Te quedan ${reprobadas} por debajo de ${aprobatoria}.` : '');

  const _insight = {
    title: usaCreditos ? 'Tu índice académico' : 'Tu promedio',
    text: insText,
    tone,
    icon: '🎓',
  };

  const _chart = {
    type: 'scale' as const,
    marker: prom,
    markerLabel: prom.toFixed(2),
    min: 0,
    segments: [
      { nombre: 'Reprobado', max: aprobatoria, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Aprobado', max: 14, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Bueno', max: 16, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Distinguido', max: 19, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Excelente', max: 20, color: '#16a34a', colorDark: '#15803d' },
    ],
    ariaLabel: `Promedio ${prom.toFixed(2)} en escala 0 a 20; se aprueba con ${aprobatoria}.`,
  };

  return {
    promedio: prom.toFixed(2),
    materiasAprobadas: aprobadas,
    materiasReprobadas: reprobadas,
    categoria,
    detalle: usaCreditos
      ? `Índice ponderado = Σ(nota × créditos) ÷ ${totalCreditos} = ${prom.toFixed(2)}/20`
      : `Promedio = Σ notas ÷ ${notas.length} = ${prom.toFixed(2)}/20`,
    _insight,
    _chart,
  };
}
