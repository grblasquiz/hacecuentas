/** Calorías quemadas por tipo de ejercicio (MET) */
export interface Inputs {
  peso: number;
  ejercicio: string;
  minutos: number;
}
export interface Outputs {
  caloriasQuemadas: number;
  caloriasHora: number;
  equivalenteCaminar: number;
  mensaje: string;
}

export function caloriasQuemadasEjercicio(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const ejercicio = String(i.ejercicio || 'correr_moderado');
  const minutos = Number(i.minutos);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!minutos || minutos <= 0) throw new Error('Ingresá los minutos');

  // MET (Metabolic Equivalent of Task) por ejercicio
  const mets: Record<string, number> = {
    caminar_lento: 2.5,
    caminar_rapido: 4.3,
    correr_lento: 7.0,
    correr_moderado: 9.8,
    correr_rapido: 12.8,
    bicicleta_paseo: 4.0,
    bicicleta_moderada: 6.8,
    bicicleta_intensa: 10.0,
    natacion_moderada: 5.8,
    natacion_intensa: 9.8,
    musculacion: 5.0,
    crossfit: 8.0,
    yoga: 3.0,
    pilates: 3.5,
    futbol: 7.0,
    basquet: 6.5,
    tenis: 7.3,
    boxeo: 7.8,
    saltar_soga: 11.0,
    eliptico: 5.0,
    remo: 7.0,
    spinning: 8.5,
    escaladora: 9.0,
    baile: 5.5,
    paddle: 6.0,
  };

  const met = mets[ejercicio] || 5.0;

  // Calorías = MET × peso (kg) × tiempo (horas)
  const horas = minutos / 60;
  const caloriasQuemadas = met * peso * horas;
  const caloriasHora = met * peso;

  // Equivalente en minutos caminando
  const metCaminar = 2.5;
  const equivalenteCaminar = (caloriasQuemadas / (metCaminar * peso)) * 60;

  return {
    caloriasQuemadas: Math.round(caloriasQuemadas),
    caloriasHora: Math.round(caloriasHora),
    equivalenteCaminar: Math.round(equivalenteCaminar),
    mensaje: `Quemás ~${Math.round(caloriasQuemadas)} kcal en ${minutos} minutos (${Math.round(caloriasHora)} kcal/hora). Equivale a ${Math.round(equivalenteCaminar)} min caminando.`,
  };
}
