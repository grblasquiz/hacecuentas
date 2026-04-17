/**
 * Comida diaria del perro por raza.
 */
export interface Inputs { raza: string; pesoActual: number; edad: string; actividad: string; }
export interface Outputs { gramosDia: number; gramosMin: number; gramosMax: number; comidasDia: number; kgMes: number; }

const RAZAS: Record<string, { comidaMin: number; comidaMax: number }> = {
  'labrador-retriever': { comidaMin: 300, comidaMax: 450 },
  'golden-retriever': { comidaMin: 280, comidaMax: 420 },
  'bulldog-frances': { comidaMin: 130, comidaMax: 200 },
  'bulldog-ingles': { comidaMin: 220, comidaMax: 320 },
  'pastor-aleman': { comidaMin: 320, comidaMax: 480 },
  'beagle': { comidaMin: 170, comidaMax: 250 },
  'caniche-poodle': { comidaMin: 200, comidaMax: 350 },
  'chihuahua': { comidaMin: 30, comidaMax: 70 },
  'rottweiler': { comidaMin: 400, comidaMax: 600 },
  'yorkshire-terrier': { comidaMin: 40, comidaMax: 80 },
  'boxer': { comidaMin: 280, comidaMax: 420 },
  'dachshund-salchicha': { comidaMin: 100, comidaMax: 180 },
  'husky-siberiano': { comidaMin: 250, comidaMax: 400 },
  'shih-tzu': { comidaMin: 80, comidaMax: 140 },
  'pitbull': { comidaMin: 250, comidaMax: 400 },
};

export function comidaDiariaRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'labrador-retriever');
  const peso = Number(inputs.pesoActual);
  const edad = String(inputs.edad || 'adulto');
  const actividad = String(inputs.actividad || 'media');
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let min = r.comidaMin;
  let max = r.comidaMax;

  if (edad === 'cachorro') { min *= 1.4; max *= 1.6; }
  else if (edad === 'senior') { min *= 0.85; max *= 0.9; }

  if (actividad === 'alta') { min *= 1.2; max *= 1.3; }
  else if (actividad === 'baja') { min *= 0.85; max *= 0.9; }

  const promedio = (min + max) / 2;
  const comidasDia = edad === 'cachorro' ? 3 : 2;
  const kgMes = (promedio * 30) / 1000;

  return {
    gramosDia: Math.round(promedio),
    gramosMin: Math.round(min),
    gramosMax: Math.round(max),
    comidasDia,
    kgMes: Number(kgMes.toFixed(1)),
  };
}
