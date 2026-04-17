/**
 * Potasio IOM AI.
 */

export interface PotasioDiarioNecesarioInputs {
  edad: number;
  embarazo: string;
}

export interface PotasioDiarioNecesarioOutputs {
  potasioMg: number;
  alimentosSugeridos: string;
  resumen: string;
}

export function potasioDiarioNecesario(inputs: PotasioDiarioNecesarioInputs): PotasioDiarioNecesarioOutputs {
  const edad = Number(inputs.edad);
  const emb = inputs.embarazo || 'no';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let k: number;
  if (emb === 'embarazo') k = 2900;
  else if (emb === 'lactancia') k = 2800;
  else if (edad < 4) k = 2000;
  else if (edad < 9) k = 2300;
  else if (edad < 14) k = 2500;
  else if (edad < 19) k = 3000;
  else k = 2600;
  return {
    potasioMg: k,
    alimentosSugeridos: '1 papa (900mg) + 1 banana (358mg) + 1 taza espinaca (840mg)',
    resumen: `Tu objetivo: ${k} mg potasio/día.`,
  };
}
