/**
 * Promedio de calificaciones SEP México — escala 5 a 10, mínima aprobatoria 6.
 * (Acuerdo SEP 10/09/23: primaria y secundaria se califican de 5 a 10 y se
 * acredita con promedio final mínimo de 6 por asignatura; en media superior la
 * aprobatoria también es 6.) Calcula promedio ponderado y qué necesitas en la
 * siguiente evaluación o examen final para pasar. Fórmula pura.
 */

export interface Inputs { [key: string]: number | string | undefined; }
export interface Outputs { [key: string]: string | number | boolean | object; }

function parseList(value: unknown, label: string): number[] {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error(`Ingresa al menos una ${label}.`);
  const values = raw.split(/[;,]/).map((item) => Number(item.trim().replace(',', '.')));
  if (values.some((item) => !Number.isFinite(item))) throw new Error(`Separa las ${label}s con punto y coma (ejemplo: 7.5; 8; 6.4).`);
  return values;
}

export function compute(i: Inputs): Outputs {
  const grades = parseList(i.calificaciones, 'calificación');
  if (grades.some((grade) => grade < 0 || grade > 10)) throw new Error('Cada calificación debe estar entre 0 y 10 (la boleta SEP usa de 5 a 10).');
  const weightsRaw = String(i.pesos ?? '').trim();
  const weights = weightsRaw ? parseList(weightsRaw, 'peso') : grades.map(() => 1);
  if (weights.length !== grades.length || weights.some((weight) => weight <= 0)) throw new Error('Ingresa un peso positivo por cada calificación, o deja los pesos vacíos para ponderar todas igual.');
  const passingGrade = Number(i.notaMinima ?? 6);
  if (!Number.isFinite(passingGrade) || passingGrade < 0 || passingGrade > 10) throw new Error('La calificación mínima debe estar entre 0 y 10 (SEP: 6).');
  const nextWeight = Number(i.pesoProximaEvaluacion ?? 1);
  if (!Number.isFinite(nextWeight) || nextWeight <= 0) throw new Error('El peso de la próxima evaluación debe ser mayor a 0.');

  const weightedSum = grades.reduce((sum, grade, index) => sum + grade * weights[index], 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const average = weightedSum / totalWeight;
  const requiredNext = (passingGrade * (totalWeight + nextWeight) - weightedSum) / nextWeight;
  const averageOut = Number(average.toFixed(2));
  const passed = average >= passingGrade;

  const nextMessage = requiredNext <= 0
    ? `Ya aseguraste el promedio de ${passingGrade.toFixed(1)}: incluso con la calificación mínima en la siguiente evaluación pasas.`
    : requiredNext > 10
      ? `Con una sola evaluación más (peso ${nextWeight}) ya no alcanzas el ${passingGrade.toFixed(1)}: necesitarías más de 10. Te toca regularización o examen extraordinario.`
      : `Para cerrar con promedio ${passingGrade.toFixed(1)}, necesitas mínimo ${requiredNext.toFixed(2)} en la siguiente evaluación (peso ${nextWeight}).`;

  return {
    promedioPonderado: averageOut,
    estado: passed ? 'Vas aprobando (SEP: mínima 6)' : 'Aún no llegas a la mínima aprobatoria',
    necesitasEnElFinal: requiredNext <= 0 ? '0.00 — ya pasaste' : requiredNext > 10 ? 'Imposible con una sola evaluación' : requiredNext.toFixed(2),
    detalle: `Calificaciones: ${grades.join(', ')} · Pesos: ${weights.join(', ')} · Mínima aprobatoria: ${passingGrade.toFixed(1)} (escala SEP 5-10)`,
    _insight: {
      title: passed ? 'Tu promedio va aprobado' : 'Tu promedio va abajo del 6',
      text: `Tu promedio ponderado es **${averageOut.toFixed(2)} / 10** (la boleta SEP va de 5 a 10 y se acredita con **6**). ${nextMessage}`,
      tone: passed ? 'good' : 'warn',
      icon: passed ? '📚' : '🎯',
    },
    _chart: {
      type: 'scale',
      marker: averageOut,
      markerLabel: `Promedio ${averageOut.toFixed(2)}`,
      min: 5,
      segments: [
        { nombre: 'Reprobado', max: passingGrade, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Aprobado', max: 10, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Promedio ponderado ${averageOut.toFixed(2)} en escala SEP de 5 a 10; la mínima aprobatoria configurada es ${passingGrade.toFixed(1)}.`,
    },
  };
}
