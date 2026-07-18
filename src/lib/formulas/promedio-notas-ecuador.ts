/** Promedio de notas — Ecuador: escala 0–10, con pesos opcionales y nota mínima configurable.
 *  En Ecuador la escala oficial de calificación (colegios y muchas universidades) es sobre 10.
 *  La nota mínima para aprobar en el bachillerato es 7/10. Calcula el promedio ponderado, si vas
 *  aprobando y qué nota necesitás en la próxima evaluación para llegar a la meta. */

export interface Inputs { [key: string]: number | string | undefined; }
export interface Outputs { [key: string]: string | number | boolean | object; }

function parseList(value: unknown, label: string): number[] {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error(`Ingresá al menos una ${label}.`);
  const values = raw.split(/[;,]/).map((item) => Number(item.trim().replace(',', '.')));
  if (values.some((item) => !Number.isFinite(item))) throw new Error(`Separá las ${label}s con punto y coma (ejemplo: 8.5; 7.2; 9).`);
  return values;
}

export function compute(i: Inputs): Outputs {
  const grades = parseList(i.notas, 'nota');
  if (grades.some((grade) => grade < 0 || grade > 10)) throw new Error('Cada nota debe estar entre 0 y 10.');

  const weightsRaw = String(i.pesos ?? '').trim();
  const weights = weightsRaw ? parseList(weightsRaw, 'peso') : grades.map(() => 1);
  if (weights.length !== grades.length || weights.some((weight) => weight <= 0)) {
    throw new Error('Ingresá un peso positivo por cada nota, o dejá los pesos vacíos para ponderar todas igual.');
  }

  const passingGrade = Number(i.notaMinima ?? 7);
  if (!Number.isFinite(passingGrade) || passingGrade < 0 || passingGrade > 10) throw new Error('La nota mínima debe estar entre 0 y 10.');

  const nextWeight = Number(i.pesoProximaNota ?? 1);
  if (!Number.isFinite(nextWeight) || nextWeight <= 0) throw new Error('El peso de la próxima nota debe ser mayor a 0.');

  const weightedSum = grades.reduce((sum, grade, index) => sum + grade * weights[index], 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const average = weightedSum / totalWeight;
  const requiredNext = (passingGrade * (totalWeight + nextWeight) - weightedSum) / nextWeight;

  const averageOut = Number(average.toFixed(2));
  const passed = average >= passingGrade;

  const nextMessage = requiredNext <= 0
    ? `Ya asegurás un promedio de ${passingGrade.toFixed(1)} aun sacando la nota más baja en la próxima evaluación.`
    : requiredNext > 10
      ? `Con una próxima evaluación de peso ${nextWeight}, no alcanza para llegar a ${passingGrade.toFixed(1)}: necesitás recuperar una nota o sumar otra evaluación.`
      : `Para terminar con promedio ${passingGrade.toFixed(1)}, necesitás al menos ${requiredNext.toFixed(2)} en la próxima evaluación (peso ${nextWeight}).`;

  return {
    promedioPonderado: averageOut,
    estado: passed ? 'Vas aprobando' : 'Aún no alcanzás la nota mínima',
    notaNecesariaProxima: requiredNext <= 0 ? '0.00' : requiredNext > 10 ? 'No es posible con una sola nota' : requiredNext.toFixed(2),
    detalle: `Notas: ${grades.join(', ')} · Pesos: ${weights.join(', ')} · Nota mínima: ${passingGrade.toFixed(1)}/10`,
    _insight: {
      title: passed ? 'Tu promedio está aprobado' : 'Tu promedio está por debajo de la meta',
      text: `Tu promedio ponderado es **${averageOut.toFixed(2)} / 10.00**. ${nextMessage}`,
      tone: passed ? 'good' : 'warn',
      icon: passed ? '📚' : '🎯',
    },
    _chart: {
      type: 'scale',
      marker: averageOut,
      markerLabel: `Promedio ${averageOut.toFixed(2)}`,
      min: 0,
      segments: [
        { nombre: 'Por debajo de la meta', max: passingGrade, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Aprobado', max: 10, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Promedio ponderado ${averageOut.toFixed(2)} en escala de 0 a 10; la meta configurada es ${passingGrade.toFixed(1)}`,
    },
  };
}
