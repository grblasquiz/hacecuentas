/**
 * Calcio RDA.
 */

export interface CalcioDiarioEdadInputs {
  edad: number;
  sexo: string;
  embarazo: string;
}

export interface CalcioDiarioEdadOutputs {
  calcioMg: number;
  alimentosSugeridos: string;
  resumen: string;
}

export function calcioDiarioEdad(inputs: CalcioDiarioEdadInputs): CalcioDiarioEdadOutputs {
  const edad = Number(inputs.edad);
  const sexo = inputs.sexo || 'mujer';
  const emb = inputs.embarazo === 'si';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let ca: number;
  if (emb) ca = edad < 19 ? 1300 : 1000;
  else if (edad < 4) ca = 700;
  else if (edad < 9) ca = 1000;
  else if (edad < 19) ca = 1300;
  else if (edad < 51) ca = 1000;
  else if (sexo === 'mujer' || edad >= 71) ca = 1200;
  else ca = 1000;
  return {
    calcioMg: ca,
    alimentosSugeridos: '3 lácteos (900mg) + brócoli + almendras + sardinas con espina',
    resumen: `Tu RDA: ${ca} mg calcio/día.`,
  };
}
