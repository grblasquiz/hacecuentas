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
  _insight?: any;
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
  const vasos = (ca / 300).toFixed(1);
  const _insight = {
    title: 'Tu calcio diario',
    text: `Tu requerimiento es de **${ca} mg/día**, equivalente a unos **${vasos} vasos de leche** (300 mg cada uno). ${ca >= 1300 ? 'Es de los tramos con mayor demanda: combiná lácteos con verde, almendras y sardinas para llegar.' : 'Con lácteos y algo de verde, almendras o sardinas se cubre sin problema.'}`,
    tone: ca >= 1300 ? 'warn' : 'neutral',
    icon: '🦴',
  };
  return {
    calcioMg: ca,
    alimentosSugeridos: '3 lácteos (900mg) + brócoli + almendras + sardinas con espina',
    resumen: `Tu RDA: ${ca} mg calcio/día.`,
    _insight,
  };
}
