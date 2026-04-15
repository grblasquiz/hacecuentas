/** Calorías quemadas caminando — basado en METs */
export interface Inputs {
  peso: number; // kg
  distancia?: number; // km
  tiempo?: number; // minutos
  velocidad?: number; // km/h (opcional, si no se da se calcula)
  pendiente?: number; // % grado de pendiente
}
export interface Outputs {
  calorias: number;
  velocidadCalc: number;
  met: number;
  intensidad: string;
  pasos: number;
  equivalentes: string;
  resumen: string;
}

export function caloriasCaminando(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const distancia = Number(i.distancia || 0);
  const tiempo = Number(i.tiempo || 0); // min
  const velocidadInput = Number(i.velocidad || 0);
  const pendiente = Number(i.pendiente || 0);

  if (!peso || peso < 20 || peso > 300) throw new Error('Peso entre 20 y 300 kg');
  if (!distancia && !tiempo) throw new Error('Ingresá distancia o tiempo (al menos uno)');
  if (pendiente < -30 || pendiente > 30) throw new Error('Pendiente entre -30 y 30 %');

  // Calcular velocidad (km/h)
  let velocidad = velocidadInput;
  if (!velocidad) {
    if (distancia && tiempo) velocidad = distancia / (tiempo / 60);
    else velocidad = 5; // velocidad asumida 5 km/h si solo hay un dato
  }

  // METs según velocidad caminando (Compendium of Physical Activities, Ainsworth 2011)
  let met = 0;
  let intensidad = '';
  if (velocidad < 3.2) { met = 2.0; intensidad = 'Muy lenta (paseo)'; }
  else if (velocidad < 4.0) { met = 2.8; intensidad = 'Lenta'; }
  else if (velocidad < 4.8) { met = 3.5; intensidad = 'Moderada'; }
  else if (velocidad < 5.6) { met = 4.3; intensidad = 'Vigorosa'; }
  else if (velocidad < 6.4) { met = 5.0; intensidad = 'Muy vigorosa'; }
  else if (velocidad < 7.2) { met = 7.0; intensidad = 'Marcha atlética'; }
  else { met = 8.3; intensidad = 'Casi trote'; }

  // Ajuste por pendiente: ~0.6 METs por cada 1 % de subida
  if (pendiente > 0) met += pendiente * 0.6;
  if (pendiente < 0 && pendiente >= -10) met += pendiente * 0.1; // bajada leve reduce
  if (pendiente < -10) met *= 0.85; // bajadas pronunciadas

  // Tiempo final (minutos) — si no se dio, calcularlo
  let tiempoFinal = tiempo;
  if (!tiempoFinal && distancia) tiempoFinal = (distancia / velocidad) * 60;

  // Calorías = METs × peso × horas
  const calorias = met * peso * (tiempoFinal / 60);

  // Pasos estimados (longitud de zancada ≈ 0.7 m promedio)
  const distanciaFinal = distancia || (velocidad * tiempoFinal / 60);
  const pasos = Math.round((distanciaFinal * 1000) / 0.7);

  // Equivalentes calóricos
  const banana = (calorias / 105).toFixed(1); // 1 banana ≈ 105 kcal
  const alfajor = (calorias / 200).toFixed(1); // alfajor común ≈ 200 kcal
  const pizza = (calorias / 285).toFixed(2); // 1 porción ≈ 285 kcal

  return {
    calorias: Math.round(calorias),
    velocidadCalc: Number(velocidad.toFixed(1)),
    met: Number(met.toFixed(1)),
    intensidad,
    pasos,
    equivalentes: `≈ ${banana} bananas | ≈ ${alfajor} alfajores | ≈ ${pizza} porciones de pizza`,
    resumen: `Caminando ${distanciaFinal.toFixed(2)} km a ${velocidad.toFixed(1)} km/h${pendiente ? ` (pendiente ${pendiente}%)` : ''} quemás aproximadamente ${Math.round(calorias)} kcal en ${Math.round(tiempoFinal)} min (${pasos.toLocaleString('es-AR')} pasos).`,
  };
}
