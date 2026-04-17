/**
 * Expectativa de vida del perro por raza.
 */
export interface Inputs { raza: string; castrado: string; cuidados: string; }
export interface Outputs { expectativaAnios: number; expectativaMin: number; expectativaMax: number; resumen: string; }

const RAZAS: Record<string, { nombre: string; esperanza: number }> = {
  'labrador-retriever': { nombre: "Labrador Retriever", esperanza: 12 },
  'golden-retriever': { nombre: "Golden Retriever", esperanza: 12 },
  'bulldog-frances': { nombre: "Bulldog Franc\u00e9s", esperanza: 11 },
  'bulldog-ingles': { nombre: "Bulldog Ingl\u00e9s", esperanza: 9 },
  'pastor-aleman': { nombre: "Pastor Alem\u00e1n", esperanza: 11 },
  'beagle': { nombre: "Beagle", esperanza: 13 },
  'caniche-poodle': { nombre: "Caniche / Poodle", esperanza: 14 },
  'chihuahua': { nombre: "Chihuahua", esperanza: 15 },
  'rottweiler': { nombre: "Rottweiler", esperanza: 10 },
  'yorkshire-terrier': { nombre: "Yorkshire Terrier", esperanza: 14 },
  'boxer': { nombre: "Boxer", esperanza: 11 },
  'dachshund-salchicha': { nombre: "Dachshund (Salchicha)", esperanza: 13 },
  'husky-siberiano': { nombre: "Husky Siberiano", esperanza: 13 },
  'shih-tzu': { nombre: "Shih Tzu", esperanza: 13 },
  'pitbull': { nombre: "Pitbull (American Pit Bull Terrier)", esperanza: 12 },
};

export function expectativaVidaRazaPerro(inputs: Inputs): Outputs {
  const raza = String(inputs.raza || 'labrador-retriever');
  const castrado = String(inputs.castrado || 'si') === 'si';
  const cuidados = String(inputs.cuidados || 'medios');
  const r = RAZAS[raza];
  if (!r) throw new Error('Raza no reconocida');

  let base = r.esperanza;
  let ajuste = 0;
  if (castrado) ajuste += 1.5;
  if (cuidados === 'altos') ajuste += 1.5;
  else if (cuidados === 'bajos') ajuste -= 2;

  const estimada = Math.max(5, base + ajuste);
  const min = Math.max(4, estimada - 2);
  const max = estimada + 2;

  return {
    expectativaAnios: Number(estimada.toFixed(1)),
    expectativaMin: Number(min.toFixed(1)),
    expectativaMax: Number(max.toFixed(1)),
    resumen: `${r.nombre}: expectativa ${estimada.toFixed(1)} años (rango ${min.toFixed(1)}-${max.toFixed(1)}).`,
  };
}
