/** Score Wilks para powerlifting */
export interface Inputs {
  pesoCorporal: number;
  total: number;
  sexo: string;
}

export interface Outputs {
  result: number;
  coeficiente: number;
  nivel: string;
  detalle: string;
}

// Coeficientes Wilks oficiales
const COEF_HOMBRE = {
  a: -216.0475144,
  b: 16.2606339,
  c: -0.002388645,
  d: -0.00113732,
  e: 7.01863e-6,
  f: -1.291e-8,
};

const COEF_MUJER = {
  a: 594.31747775582,
  b: -27.23842536447,
  c: 0.82112226871,
  d: -0.00930733913,
  e: 4.731582e-5,
  f: -9.054e-8,
};

function calcWilksCoef(peso: number, coef: typeof COEF_HOMBRE): number {
  const x = peso;
  const denom =
    coef.a +
    coef.b * x +
    coef.c * x ** 2 +
    coef.d * x ** 3 +
    coef.e * x ** 4 +
    coef.f * x ** 5;
  return 500 / denom;
}

function getNivel(score: number): string {
  if (score >= 500) return 'All-time great';
  if (score >= 450) return 'Nivel mundial';
  if (score >= 400) return 'Élite';
  if (score >= 300) return 'Avanzado';
  if (score >= 200) return 'Intermedio';
  return 'Principiante';
}

export function tablaWilksPowerliftingScore(i: Inputs): Outputs {
  const peso = Number(i.pesoCorporal);
  const total = Number(i.total);
  const sexo = String(i.sexo || 'masculino');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal');
  if (!total || total <= 0) throw new Error('Ingresá tu total (squat + bench + deadlift)');
  if (peso < 40 || peso > 250) throw new Error('Peso corporal fuera de rango (40-250 kg)');

  const coef = sexo === 'femenino' ? COEF_MUJER : COEF_HOMBRE;
  const wilksCoef = calcWilksCoef(peso, coef);
  const score = total * wilksCoef;
  const nivel = getNivel(score);

  return {
    result: Number(score.toFixed(1)),
    coeficiente: Number(wilksCoef.toFixed(4)),
    nivel,
    detalle: `Con **${total} kg** de total a **${peso} kg** de peso corporal (${sexo}), tu score Wilks es **${score.toFixed(1)}** (coeficiente: ${wilksCoef.toFixed(4)}). Nivel: **${nivel}**.`,
  };
}
