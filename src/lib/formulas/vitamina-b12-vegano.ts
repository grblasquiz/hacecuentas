/**
 * B12 vegano.
 */

export interface VitaminaB12VeganoInputs {
  frecuencia: string;
  estado: string;
}

export interface VitaminaB12VeganoOutputs {
  b12Mcg: number;
  forma: string;
  resumen: string;
}

export function vitaminaB12Vegano(inputs: VitaminaB12VeganoInputs): VitaminaB12VeganoOutputs {
  const fr = inputs.frecuencia || 'diaria';
  const e = inputs.estado || 'adulto';
  let d: number;
  if (fr === 'semanal') d = 2000;
  else d = e === 'mayor' ? 500 : 250;
  return {
    b12Mcg: d,
    forma: 'Cianocobalamina sublingual o masticable con comida',
    resumen: `Tomá ${d} mcg ${fr === 'semanal' ? 'una vez/semana' : 'al día'}.`,
  };
}
