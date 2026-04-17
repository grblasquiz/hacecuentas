/**
 * Score SGNC.
 */

export interface GlutenSensibilidadScoreInputs {
  digestivos: number;
  extradigestivos: number;
  mejoraSinGluten: string;
}

export interface GlutenSensibilidadScoreOutputs {
  score: number;
  interpretacion: string;
  recomendacion: string;
  resumen: string;
}

export function glutenSensibilidadScore(inputs: GlutenSensibilidadScoreInputs): GlutenSensibilidadScoreOutputs {
  const d = Number(inputs.digestivos);
  const e = Number(inputs.extradigestivos);
  const m = inputs.mejoraSinGluten || 'no';
  const mPts = m === 'si' ? 3 : m === 'parcial' ? 1 : 0;
  const score = d + e + mPts;
  let interp: string, rec: string;
  if (score <= 3) { interp = 'Baja probabilidad'; rec = 'Probablemente no relacionado al gluten.'; }
  else if (score <= 7) { interp = 'Moderada'; rec = 'Evaluá con gastro. NO quites gluten aún.'; }
  else if (score <= 10) { interp = 'Alta ⚠️'; rec = 'Consultá gastroenterólogo para descartar celiaquía.'; }
  else { interp = 'Muy alta 🚨'; rec = 'Urgente: serología IgA tTG + biopsia antes de quitar gluten.'; }
  return {
    score,
    interpretacion: interp,
    recomendacion: rec,
    resumen: `Score ${score}/13 - ${interp}.`,
  };
}
