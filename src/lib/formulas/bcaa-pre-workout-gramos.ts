/**
 * BCAA pre-entreno.
 */

export interface BcaaPreWorkoutGramosInputs {
  peso: number;
  proteinaDiariaGkg: number;
  contextoEntreno: string;
}

export interface BcaaPreWorkoutGramosOutputs {
  bcaaGramos: number;
  leucina: string;
  utilidad: string;
  resumen: string;
}

export function bcaaPreWorkoutGramos(inputs: BcaaPreWorkoutGramosInputs): BcaaPreWorkoutGramosOutputs {
  const peso = Number(inputs.peso);
  const pGkg = Number(inputs.proteinaDiariaGkg);
  const ctx = inputs.contextoEntreno || 'normal';
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  let dosis = 7;
  if (ctx === 'largo') dosis = 10;
  if (ctx === 'ayunas') dosis = 8;
  const leu = dosis / 2;
  let util: string;
  if (pGkg >= 1.6 && ctx === 'normal') util = 'Baja - tu proteína ya cubre MPS';
  else if (ctx === 'ayunas') util = 'Moderada - útil en entreno en ayunas';
  else if (pGkg < 1.2) util = 'Moderada - tu proteína es baja';
  else util = 'Baja-moderada';
  return {
    bcaaGramos: dosis,
    leucina: `${leu}g leucina (umbral mTOR 2.5-3g)`,
    utilidad: util,
    resumen: `${dosis}g BCAA pre-entreno (ratio 2:1:1). Utilidad: ${util}.`,
  };
}
