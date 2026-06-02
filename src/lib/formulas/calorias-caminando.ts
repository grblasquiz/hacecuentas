/** Calorías quemadas caminando — basado en METs */
export interface Inputs {
  peso: number; // kg
  distancia?: number; // km
  tiempo?: number; // minutos
  velocidad?: number; // km/h (opcional, si no se da se calcula)
  pendiente?: number; // % grado de pendiente
  __lang?: string;
}
export interface Outputs {
  calorias: number;
  velocidadCalc: number;
  met: number;
  intensidad: string;
  pasos: number;
  equivalentes: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function caloriasCaminando(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errPeso: 'Peso entre 20 y 300 kg',
      errDistTiempo: 'Ingresá distancia o tiempo (al menos uno)',
      errPendiente: 'Pendiente entre -30 y 30 %',
      intMuyLenta: 'Muy lenta (paseo)',
      intLenta: 'Lenta',
      intModerada: 'Moderada',
      intVigorosa: 'Vigorosa',
      intMuyVigorosa: 'Muy vigorosa',
      intMarcaAtletica: 'Marcha atlética',
      intCasiTrote: 'Casi trote',
      insTitle: 'Tu caminata en números',
      insText: (cal: number, vel: string, pas: string, inten: string) =>
        `A **${vel} km/h** (${inten}) quemás **${cal} kcal** y das **${pas} pasos**. Subir el ritmo o agregar pendiente aumenta el gasto sin alargar la caminata.`,
      chartMarker: 'Tu ritmo',
      chartAria: 'Velocidad de caminata ubicada en su zona de intensidad',
      zPaseo: 'Paseo',
      zModerada: 'Moderada',
      zVigorosa: 'Vigorosa',
      zAtletica: 'Atlética',
    },
    en: {
      errPeso: 'Weight must be between 20 and 300 kg',
      errDistTiempo: 'Enter distance or time (at least one)',
      errPendiente: 'Slope must be between -30 and 30 %',
      intMuyLenta: 'Very slow (stroll)',
      intLenta: 'Slow',
      intModerada: 'Moderate',
      intVigorosa: 'Vigorous',
      intMuyVigorosa: 'Very vigorous',
      intMarcaAtletica: 'Race walking',
      intCasiTrote: 'Near jog',
      insTitle: 'Your walk by the numbers',
      insText: (cal: number, vel: string, pas: string, inten: string) =>
        `At **${vel} km/h** (${inten}) you burn **${cal} kcal** and take **${pas} steps**. Picking up the pace or adding incline raises the burn without walking longer.`,
      chartMarker: 'Your pace',
      chartAria: 'Walking speed placed within its intensity zone',
      zPaseo: 'Stroll',
      zModerada: 'Moderate',
      zVigorosa: 'Vigorous',
      zAtletica: 'Athletic',
    },
  } as const)[__lang];

  const peso = Number(i.peso);
  const distancia = Number(i.distancia || 0);
  const tiempo = Number(i.tiempo || 0); // min
  const velocidadInput = Number(i.velocidad || 0);
  const pendiente = Number(i.pendiente || 0);

  if (!peso || peso < 20 || peso > 300) throw new Error(T.errPeso);
  if (!distancia && !tiempo) throw new Error(T.errDistTiempo);
  if (pendiente < -30 || pendiente > 30) throw new Error(T.errPendiente);

  // Calcular velocidad (km/h)
  let velocidad = velocidadInput;
  if (!velocidad) {
    if (distancia && tiempo) velocidad = distancia / (tiempo / 60);
    else velocidad = 5; // velocidad asumida 5 km/h si solo hay un dato
  }

  // METs según velocidad caminando (Compendium of Physical Activities, Ainsworth 2011)
  let met = 0;
  let intensidad = '';
  if (velocidad < 3.2) { met = 2.0; intensidad = T.intMuyLenta; }
  else if (velocidad < 4.0) { met = 2.8; intensidad = T.intLenta; }
  else if (velocidad < 4.8) { met = 3.5; intensidad = T.intModerada; }
  else if (velocidad < 5.6) { met = 4.3; intensidad = T.intVigorosa; }
  else if (velocidad < 6.4) { met = 5.0; intensidad = T.intMuyVigorosa; }
  else if (velocidad < 7.2) { met = 7.0; intensidad = T.intMarcaAtletica; }
  else { met = 8.3; intensidad = T.intCasiTrote; }

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

  const equivalentes = __lang === 'en'
    ? `≈ ${banana} bananas | ≈ ${alfajor} alfajores | ≈ ${pizza} pizza slices`
    : `≈ ${banana} bananas | ≈ ${alfajor} alfajores | ≈ ${pizza} porciones de pizza`;

  const resumen = __lang === 'en'
    ? `Walking ${distanciaFinal.toFixed(2)} km at ${velocidad.toFixed(1)} km/h${pendiente ? ` (slope ${pendiente}%)` : ''} you burn approximately ${Math.round(calorias)} kcal in ${Math.round(tiempoFinal)} min (${pasos.toLocaleString('en-US')} steps).`
    : `Caminando ${distanciaFinal.toFixed(2)} km a ${velocidad.toFixed(1)} km/h${pendiente ? ` (pendiente ${pendiente}%)` : ''} quemás aproximadamente ${Math.round(calorias)} kcal en ${Math.round(tiempoFinal)} min (${pasos.toLocaleString('es-AR')} pasos).`;

  const velMax = Math.max(8.5, Number((velocidad + 1).toFixed(1)));

  return {
    calorias: Math.round(calorias),
    velocidadCalc: Number(velocidad.toFixed(1)),
    met: Number(met.toFixed(1)),
    intensidad,
    pasos,
    equivalentes,
    resumen,
    _insight: {
      title: T.insTitle,
      text: T.insText(
        Math.round(calorias),
        velocidad.toFixed(1),
        pasos.toLocaleString(__lang === 'en' ? 'en-US' : 'es-AR'),
        intensidad,
      ),
      tone: 'good',
      icon: '🚶',
    },
    _chart: {
      type: 'scale',
      marker: Number(velocidad.toFixed(1)),
      markerLabel: `${T.chartMarker}: ${velocidad.toFixed(1)} km/h`,
      min: 0,
      segments: [
        { nombre: T.zPaseo, max: 3.2, color: '#bfdbfe', colorDark: '#1e3a8a' },
        { nombre: T.zModerada, max: 4.8, color: '#86efac', colorDark: '#166534' },
        { nombre: T.zVigorosa, max: 6.4, color: '#fde047', colorDark: '#854d0e' },
        { nombre: T.zAtletica, max: velMax, color: '#fca5a5', colorDark: '#7f1d1d' },
      ],
      ariaLabel: T.chartAria,
    },
  };
}
