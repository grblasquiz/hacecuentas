/**
 * Calculadora de Candy Bar por Personas.
 */
export interface CandyBarPersonasInputs { invitados:number; nivel:string; }
export interface CandyBarPersonasOutputs { kgGolosinas:number; frascos:number; gramosPorPersona:number; costoEstimado:number; }
export function candyBarPersonas(inputs: CandyBarPersonasInputs): CandyBarPersonasOutputs {
  const inv = Number(inputs.invitados);
  const nivel = inputs.nivel;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gramos = 180;
  let precioKg = 10;
  if (nivel === 'simple') { gramos = 150; precioKg = 8; }
  else if (nivel === 'premium') { gramos = 220; precioKg = 20; }
  const kgGolosinas = (inv * gramos) / 1000;
  let frascos = 8;
  if (inv >= 30) frascos = 10;
  if (inv >= 60) frascos = 12;
  if (inv >= 100) frascos = 15;
  return {
    kgGolosinas: Number(kgGolosinas.toFixed(1)),
    frascos,
    gramosPorPersona: gramos,
    costoEstimado: Number((kgGolosinas * precioKg).toFixed(0)),
  };
}
