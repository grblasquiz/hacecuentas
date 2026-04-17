/**
 * Selenio RDA.
 */

export interface SelenioDiarioOxidativoInputs {
  edad: number;
  estado: string;
}

export interface SelenioDiarioOxidativoOutputs {
  selenioMcg: number;
  nuecesBrasil: number;
  resumen: string;
}

export function selenioDiarioOxidativo(inputs: SelenioDiarioOxidativoInputs): SelenioDiarioOxidativoOutputs {
  const edad = Number(inputs.edad);
  const est = inputs.estado || 'normal';
  if (!edad || edad <= 0) throw new Error('Ingresá edad válida');
  let se: number;
  if (est === 'embarazo') se = 60;
  else if (est === 'lactancia') se = 70;
  else if (edad < 4) se = 20;
  else if (edad < 9) se = 30;
  else if (edad < 14) se = 40;
  else se = 55;
  const nueces = Math.max(1, Math.round(se / 90));
  return {
    selenioMcg: se,
    nuecesBrasil: nueces,
    resumen: `Tu RDA: ${se} mcg selenio/día ≈ ${nueces} nuez Brasil.`,
  };
}
