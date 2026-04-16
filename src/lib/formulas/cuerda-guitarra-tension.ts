/** Calculadora de Tensión de Cuerda de Guitarra */
export interface Inputs {
  calibre: number;
  frecuencia: number;
  escala: number;
}
export interface Outputs {
  tensionLbs: number;
  tensionKg: number;
  tensionN: number;
  evaluacion: string;
}

export function cuerdaGuitarraTension(i: Inputs): Outputs {
  const gauge = Number(i.calibre);
  const freq = Number(i.frecuencia);
  const scale = Number(i.escala);

  if (!gauge || gauge <= 0) throw new Error('Ingresá el calibre de la cuerda');
  if (!freq || freq <= 0) throw new Error('Ingresá la frecuencia de afinación');
  if (!scale || scale <= 0) throw new Error('Ingresá la longitud de escala');

  // Unit weight approximation for plain steel strings: UW = gauge^2 * 2241.2 (lbs/inch)
  // For wound strings (gauge > 0.018), different formula
  const isWound = gauge > 0.018;
  const unitWeight = isWound
    ? Math.pow(gauge, 2) * 1607.2  // wound string approximation
    : Math.pow(gauge, 2) * 2241.2; // plain steel

  // Tension formula: T = UW * (2 * L * F)^2
  // where L = scale length in inches, F = frequency in Hz
  // UW in lbs/inch, result in lbs
  const tensionLbs = unitWeight * Math.pow(2 * scale * freq, 2) / 386.4;

  const tensionKg = tensionLbs * 0.4536;
  const tensionN = tensionLbs * 4.4482;

  let evaluacion: string;
  if (tensionLbs < 10) evaluacion = 'Tensión muy baja — la cuerda va a estar floja y zumbar. Subí el calibre o la afinación.';
  else if (tensionLbs < 14) evaluacion = 'Tensión baja — cómoda para bends pero puede sonar débil. Buena para solos.';
  else if (tensionLbs < 18) evaluacion = 'Tensión ideal — buen balance entre comodidad y tono. Rango óptimo.';
  else if (tensionLbs < 22) evaluacion = 'Tensión media-alta — buen sustain y tono completo. Los bends requieren más fuerza.';
  else evaluacion = 'Tensión alta — muy firme, difícil para bends. Buena para ritmo pesado y drop tunings.';

  return {
    tensionLbs: Number(tensionLbs.toFixed(1)),
    tensionKg: Number(tensionKg.toFixed(1)),
    tensionN: Number(tensionN.toFixed(1)),
    evaluacion,
  };
}
