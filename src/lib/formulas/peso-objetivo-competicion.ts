/** Calculadora de peso ideal por deporte y competición */
export interface Inputs {
  altura: number;
  sexo: string;
  deporte: string;
}
export interface Outputs {
  pesoIdeal: string;
  bmiRango: string;
  pesoMin: number;
  pesoMax: number;
  mensaje: string;
}

export function pesoObjetivoCompeticion(i: Inputs): Outputs {
  const altura = Number(i.altura);
  const sexo = String(i.sexo || 'masculino');
  const deporte = String(i.deporte || 'running');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  const alturaM = altura / 100;

  // BMI ranges by sport [male_min, male_max, female_min, female_max]
  const rangos: Record<string, number[]> = {
    running:      [18.5, 21.0, 17.5, 20.0],
    ciclismo:     [19.0, 22.0, 18.0, 21.0],
    natacion:     [21.0, 24.0, 20.0, 23.0],
    futbol:       [22.0, 25.0, 20.0, 23.0],
    basquet:      [22.0, 26.0, 20.0, 24.0],
    boxeo:        [21.0, 26.0, 19.0, 24.0],
    powerlifting: [25.0, 35.0, 23.0, 30.0],
    crossfit:     [24.0, 28.0, 22.0, 26.0],
    tenis:        [21.0, 25.0, 19.5, 23.0],
  };

  const r = rangos[deporte] || [21, 25, 19, 23];
  const bmiMin = sexo === 'masculino' ? r[0] : r[2];
  const bmiMax = sexo === 'masculino' ? r[1] : r[3];

  const pesoMin = Number((bmiMin * alturaM * alturaM).toFixed(1));
  const pesoMax = Number((bmiMax * alturaM * alturaM).toFixed(1));

  return {
    pesoIdeal: `${pesoMin}-\${pesoMax} kg`,
    bmiRango: `BMI \${bmiMin}-\${bmiMax}`,
    pesoMin,
    pesoMax,
    mensaje: `Para \${deporte} a \${altura} cm (\${sexo}): peso competitivo entre \${pesoMin} y \${pesoMax} kg (BMI \${bmiMin}-\${bmiMax}).`
  };
}