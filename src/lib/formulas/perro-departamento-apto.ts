/**
 * ¿Raza de perro apta para depto?
 */
export interface Inputs { raza: string; tamanoDepto: string; horasSolo: number; __lang?: string; }
export interface Outputs { score: number; apto: string; razones: string; recomendacion: string; }

const RAZAS: Record<string, { nombre: string; deptoApto: boolean; tamano: string; ejercicioMin: number }> = {
  'labrador-retriever': { nombre: "Labrador Retriever", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'golden-retriever': { nombre: "Golden Retriever", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'bulldog-frances': { nombre: "Bulldog Francés", deptoApto: true, tamano: 'pequeno', ejercicioMin: 30 },
  'bulldog-ingles': { nombre: "Bulldog Inglés", deptoApto: true, tamano: 'mediano', ejercicioMin: 30 },
  'pastor-aleman': { nombre: "Pastor Alemán", deptoApto: false, tamano: 'grande', ejercicioMin: 120 },
  'beagle': { nombre: "Beagle", deptoApto: true, tamano: 'mediano', ejercicioMin: 60 },
  'caniche-poodle': { nombre: "Caniche / Poodle", deptoApto: true, tamano: 'mediano', ejercicioMin: 60 },
  'chihuahua': { nombre: "Chihuahua", deptoApto: true, tamano: 'toy', ejercicioMin: 30 },
  'rottweiler': { nombre: "Rottweiler", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'yorkshire-terrier': { nombre: "Yorkshire Terrier", deptoApto: true, tamano: 'toy', ejercicioMin: 30 },
  'boxer': { nombre: "Boxer", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'dachshund-salchicha': { nombre: "Dachshund (Salchicha)", deptoApto: true, tamano: 'pequeno', ejercicioMin: 45 },
  'husky-siberiano': { nombre: "Husky Siberiano", deptoApto: false, tamano: 'grande', ejercicioMin: 120 },
  'shih-tzu': { nombre: "Shih Tzu", deptoApto: true, tamano: 'pequeno', ejercicioMin: 30 },
  'pitbull': { nombre: "Pitbull (American Pit Bull Terrier)", deptoApto: false, tamano: 'mediano', ejercicioMin: 90 },
};

export function perroDepartamentoApto(inputs: Inputs): Outputs {
  const __lang = inputs.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      razaNoReconocida: 'Raza no reconocida',
      deptoChicoGrande: 'depto chico + raza grande',
      deptoChicoMediana: 'depto chico + raza mediana',
      demasiadasHoras: 'demasiadas horas solo',
      muchasHoras: 'muchas horas solo: considerá paseador',
      aptoMuy: 'Muy apto',
      recomMuy: 'Combinación ideal. Solo asegurate de cumplir los paseos diarios.',
      aptoConCondiciones: 'Apto con condiciones',
      recomConCondiciones: 'Viable pero requiere compromiso con paseos y ejercicio. Considerá paseador.',
      aptoDificil: 'Difícil',
      recomDificil: 'La raza no es ideal. Necesitás mucho tiempo disponible o paseador diario.',
      aptoNo: 'No recomendado',
      recomNo: 'Mejor otra raza o mudarse a casa con patio.',
      buenMatch: 'Buen match raza-vivienda.',
    },
    en: {
      razaNoReconocida: 'Breed not recognized',
      deptoChicoGrande: 'small apartment + large breed',
      deptoChicoMediana: 'small apartment + medium breed',
      demasiadasHoras: 'too many hours alone',
      muchasHoras: 'many hours alone: consider a dog walker',
      aptoMuy: 'Very suitable',
      recomMuy: 'Ideal combination. Just make sure to keep up with daily walks.',
      aptoConCondiciones: 'Suitable with conditions',
      recomConCondiciones: 'Viable but requires commitment to walks and exercise. Consider a dog walker.',
      aptoDificil: 'Challenging',
      recomDificil: 'This breed is not ideal. You need a lot of available time or a daily dog walker.',
      aptoNo: 'Not recommended',
      recomNo: 'Better to choose another breed or move to a house with a yard.',
      buenMatch: 'Good breed-housing match.',
    },
  } as const)[__lang];

  const raza = String(inputs.raza || 'beagle');
  const tamanoDepto = String(inputs.tamanoDepto || 'medio');
  const horasSolo = Number(inputs.horasSolo ?? 8);
  const r = RAZAS[raza];
  if (!r) throw new Error(T.razaNoReconocida);

  let score = r.deptoApto ? 8 : 4;
  const razones: string[] = [];

  // Tamaño depto vs raza
  if (tamanoDepto === 'chico') {
    if (r.tamano === 'grande') { score -= 3; razones.push(T.deptoChicoGrande); }
    else if (r.tamano === 'mediano') { score -= 1; razones.push(T.deptoChicoMediana); }
  } else if (tamanoDepto === 'grande') {
    score += 1;
  }

  // Horas solo
  if (horasSolo >= 10) { score -= 2; razones.push(T.demasiadasHoras); }
  else if (horasSolo >= 8) { score -= 1; razones.push(T.muchasHoras); }

  // Ejercicio alto y depto
  if (r.ejercicioMin >= 90 && tamanoDepto !== 'grande') {
    score -= 1;
    razones.push(
      __lang === 'en'
        ? `${r.nombre} needs ${r.ejercicioMin} min of exercise/day`
        : `${r.nombre} necesita ${r.ejercicioMin} min ejercicio/día`
    );
  }

  score = Math.max(1, Math.min(10, score));

  let apto = '';
  let recomendacion = '';
  if (score >= 8) { apto = T.aptoMuy; recomendacion = T.recomMuy; }
  else if (score >= 6) { apto = T.aptoConCondiciones; recomendacion = T.recomConCondiciones; }
  else if (score >= 4) { apto = T.aptoDificil; recomendacion = T.recomDificil; }
  else { apto = T.aptoNo; recomendacion = T.recomNo; }

  return {
    score,
    apto,
    razones: razones.length ? razones.join('; ') : T.buenMatch,
    recomendacion,
  };
}
