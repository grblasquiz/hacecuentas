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
  _insight?: any;
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
  const grupo = emb === 'embarazo' ? 'embarazo'
    : emb === 'lactancia' ? 'lactancia'
    : edad < 4 ? 'niños de 1 a 3 años'
    : edad < 9 ? 'niños de 4 a 8 años'
    : edad < 14 ? 'niños de 9 a 13 años'
    : edad < 19 ? 'adolescentes de 14 a 18 años'
    : 'adultos';
  return {
    potasioMg: k,
    alimentosSugeridos: '1 papa (900mg) + 1 banana (358mg) + 1 taza espinaca (840mg)',
    resumen: `Tu objetivo: ${k} mg potasio/día.`,
    _insight: {
      title: 'Tu meta diaria de potasio',
      text: `Para **${grupo}** la ingesta adecuada (AI) es de **${k.toLocaleString('es-AR')} mg/día**. Lo cubrís con una combinación de papa, banana, espinaca, legumbres y lácteos repartida en el día.`,
      tone: 'neutral',
      icon: '🍌',
    },
  };
}
