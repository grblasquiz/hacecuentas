/**
 * PCRM Dietary Score — 7 grupos plant-based.
 */

export interface DietaPcrmScoreInputs {
  verduras: string;
  frutas: string;
  legumbres: string;
  granos: string;
  frutosSecos: string;
  tuberculos: string;
  hierbas: string;
}

export interface DietaPcrmScoreOutputs {
  score: number;
  nivel: string;
  recomendacion: string;
}

export function dietaPcrmScore(inputs: DietaPcrmScoreInputs): DietaPcrmScoreOutputs {
  const grupos = [inputs.verduras, inputs.frutas, inputs.legumbres, inputs.granos, inputs.frutosSecos, inputs.tuberculos, inputs.hierbas];
  const score = grupos.filter(v => v === 'si').length;

  let nivel = '', rec = '';
  if (score <= 2) { nivel = 'Bajo'; rec = 'Sumá al menos verduras, fruta y legumbres para empezar.'; }
  else if (score <= 4) { nivel = 'Moderado'; rec = 'Estás en buen camino. Apuntá a 5+ grupos/día.'; }
  else if (score <= 6) { nivel = 'Muy buena ✅'; rec = 'Excelente. Con 1-2 grupos más llegás al óptimo.'; }
  else { nivel = 'Óptima ✅✅'; rec = '¡Dieta PCRM óptima! Máximo beneficio cardiovascular.'; }

  return { score, nivel, recomendacion: rec };
}
