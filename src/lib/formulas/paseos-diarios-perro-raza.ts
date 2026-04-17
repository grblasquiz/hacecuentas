/**
 * Paseos diarios del perro por raza y vivienda.
 */
export interface Inputs { raza: string; vivienda: string; edad: string; }
export interface Outputs { paseosDia: number; minutosTotales: number; duracionPromedio: number; horarios: string; }

const RAZAS: Record<string, { ejercicioMin: number; paseos: number }> = {
  'labrador-retriever': { ejercicioMin: 90, paseos: 3 },
  'golden-retriever': { ejercicioMin: 90, paseos: 3 },
  'bulldog-frances': { ejercicioMin: 30, paseos: 2 },
  'bulldog-ingles': { ejercicioMin: 30, paseos: 2 },
  'pastor-aleman': { ejercicioMin: 120, paseos: 3 },
  'beagle': { ejercicioMin: 60, paseos: 2 },
  'caniche-poodle': { ejercicioMin: 60, paseos: 2 },
  'chihuahua': { ejercicioMin: 30, paseos: 2 },
  'rottweiler': { ejercicioMin: 90, paseos: 3 },
  'yorkshire-terrier': { ejercicioMin: 30, paseos: 2 },
  'boxer': { ejercicioMin: 90, paseos: 3 },
  'dachshund-salchicha': { ejercicioMin: 45, paseos: 2 },
  'husky-siberiano': { ejercicioMin: 120, paseos: 3 },
  'shih-tzu': { ejercicioMin: 30, paseos: 2 },
  'pitbull': { ejercicioMin: 90, paseos: 3 },
};

export function paseosDiariosPerroRaza(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'beagle');
  const vivienda = String(inputs.vivienda || 'depto');
  const edad = String(inputs.edad || 'adulto');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let paseos = r.paseos;
  if (vivienda === 'depto') paseos = Math.max(paseos, 3);
  else if (vivienda === 'casa_jardin') paseos = Math.max(1, paseos - 1);

  if (edad === 'cachorro') paseos = Math.max(paseos, 4);
  else if (edad === 'senior') paseos = Math.max(2, paseos);

  let minutos = r.ejercicioMin;
  if (edad === 'senior') minutos = Math.round(minutos * 0.7);

  const duracion = Math.round(minutos / paseos);
  const horarios = paseos === 4
    ? '7 AM, 13 PM, 19 PM, 22 PM'
    : paseos === 3
      ? '7 AM, 14 PM, 20 PM'
      : '7 AM, 20 PM';

  return { paseosDia: paseos, minutosTotales: minutos, duracionPromedio: duracion, horarios };
}
