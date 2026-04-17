/**
 * Hierro RDA con ajuste vegetariano +80%.
 */

export interface HierroDiarioVegetarianoInputs {
  sexo: string;
  dieta: string;
}

export interface HierroDiarioVegetarianoOutputs {
  hierroMg: number;
  tipHem: string;
  alimentosSugeridos: string;
  resumen: string;
}

export function hierroDiarioVegetariano(inputs: HierroDiarioVegetarianoInputs): HierroDiarioVegetarianoOutputs {
  const sexo = inputs.sexo || 'mujer';
  const dieta = inputs.dieta || 'omnivoro';
  let base: number;
  if (sexo === 'mujer') base = 18;
  else if (sexo === 'post') base = 8;
  else base = 8;
  const fe = dieta === 'vegetariano' ? base * 1.8 : base;
  return {
    hierroMg: Number(fe.toFixed(0)),
    tipHem: dieta === 'vegetariano' ? 'No-hem, absorción 2-20%. +300% con vitamina C.' : 'Mix hem + no-hem.',
    alimentosSugeridos: 'Lentejas + tomate, semillas calabaza, tofu + limón, espinaca + pimiento rojo',
    resumen: `Tu RDA: ${fe.toFixed(0)} mg hierro/día (${dieta}).`,
  };
}
