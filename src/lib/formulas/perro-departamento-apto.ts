/**
 * ¿Raza de perro apta para depto?
 */
export interface Inputs { raza: string; tamanoDepto: string; horasSolo: number; }
export interface Outputs { score: number; apto: string; razones: string; recomendacion: string; }

const RAZAS: Record<string, { nombre: string; deptoApto: boolean; tamano: string; ejercicioMin: number }> = {
  'labrador-retriever': { nombre: "Labrador Retriever", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'golden-retriever': { nombre: "Golden Retriever", deptoApto: false, tamano: 'grande', ejercicioMin: 90 },
  'bulldog-frances': { nombre: "Bulldog Franc\u00e9s", deptoApto: true, tamano: 'pequeno', ejercicioMin: 30 },
  'bulldog-ingles': { nombre: "Bulldog Ingl\u00e9s", deptoApto: true, tamano: 'mediano', ejercicioMin: 30 },
  'pastor-aleman': { nombre: "Pastor Alem\u00e1n", deptoApto: false, tamano: 'grande', ejercicioMin: 120 },
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
  const raza = String(inputs.raza || 'beagle');
  const tamanoDepto = String(inputs.tamanoDepto || 'medio');
  const horasSolo = Number(inputs.horasSolo ?? 8);
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let score = r.deptoApto ? 8 : 4;
  const razones: string[] = [];

  // Tamaño depto vs raza
  if (tamanoDepto === 'chico') {
    if (r.tamano === 'grande') { score -= 3; razones.push('depto chico + raza grande'); }
    else if (r.tamano === 'mediano') { score -= 1; razones.push('depto chico + raza mediana'); }
  } else if (tamanoDepto === 'grande') {
    score += 1;
  }

  // Horas solo
  if (horasSolo >= 10) { score -= 2; razones.push('demasiadas horas solo'); }
  else if (horasSolo >= 8) { score -= 1; razones.push('muchas horas solo: considerá paseador'); }

  // Ejercicio alto y depto
  if (r.ejercicioMin >= 90 && tamanoDepto !== 'grande') {
    score -= 1;
    razones.push(`${r.nombre} necesita ${r.ejercicioMin} min ejercicio/día`);
  }

  score = Math.max(1, Math.min(10, score));

  let apto = '';
  let recomendacion = '';
  if (score >= 8) { apto = 'Muy apto'; recomendacion = 'Combinación ideal. Solo asegurate de cumplir los paseos diarios.'; }
  else if (score >= 6) { apto = 'Apto con condiciones'; recomendacion = 'Viable pero requiere compromiso con paseos y ejercicio. Considerá paseador.'; }
  else if (score >= 4) { apto = 'Difícil'; recomendacion = 'La raza no es ideal. Necesitás mucho tiempo disponible o paseador diario.'; }
  else { apto = 'No recomendado'; recomendacion = 'Mejor otra raza o mudarse a casa con patio.'; }

  return {
    score,
    apto,
    razones: razones.length ? razones.join('; ') : 'Buen match raza-vivienda.',
    recomendacion,
  };
}
