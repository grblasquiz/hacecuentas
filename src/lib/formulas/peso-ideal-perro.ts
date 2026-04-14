/** Peso ideal del perro y consumo diario de alimento */
export interface Inputs {
  pesoActual: number;
  edad: number;
  actividad?: string;
  castrado?: boolean;
}
export interface Outputs {
  calorias: number;
  gramosAlimento: number;
  racionesDia: number;
  aguaMl: number;
  estadoPeso: string;
}

export function pesoIdealPerro(i: Inputs): Outputs {
  const peso = Number(i.pesoActual);
  const edad = Number(i.edad);
  const actividad = String(i.actividad || 'normal');
  const castrado = Boolean(i.castrado);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  // RER (Resting Energy Requirement) en kcal/día
  // Fórmula National Research Council (NRC) 2006: RER = 70 × (peso_kg)^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // Factor según actividad y edad
  let factor = 1.6; // adulto normal
  if (edad < 0.5) factor = 3; // cachorro 0-4 meses
  else if (edad < 1) factor = 2; // cachorro 4-12 meses
  else if (edad > 10) factor = 1.4; // senior
  else if (actividad === 'bajo') factor = 1.4;
  else if (actividad === 'alto') factor = 2;
  else if (actividad === 'trabajo') factor = 3; // perros de trabajo
  if (castrado) factor *= 0.9; // -10 % si castrado

  const calorias = rer * factor;

  // Gramos de alimento seco (asumiendo 350 kcal/100 g típico premium)
  const gramos = (calorias / 350) * 100;

  // Raciones por día según edad
  let raciones = 2;
  if (edad < 0.5) raciones = 4;
  else if (edad < 1) raciones = 3;
  else if (edad > 10) raciones = 2;

  // Agua: 50-80 ml/kg/día (alimentación seca)
  const aguaMl = peso * 60;

  // Estimación simple del estado corporal
  let estado = 'Sin referencia — consultá vet para BCS';
  if (peso < 2) estado = 'Perro muy pequeño / cachorro';

  return {
    calorias: Math.round(calorias),
    gramosAlimento: Math.round(gramos),
    racionesDia: raciones,
    aguaMl: Math.round(aguaMl),
    estadoPeso: estado,
  };
}
