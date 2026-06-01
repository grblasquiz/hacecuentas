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
  _chart?: any;
  _insight?: any;
}

export function dietaPcrmScore(inputs: DietaPcrmScoreInputs): DietaPcrmScoreOutputs {
  const grupos = [inputs.verduras, inputs.frutas, inputs.legumbres, inputs.granos, inputs.frutosSecos, inputs.tuberculos, inputs.hierbas];
  const score = grupos.filter(v => v === 'si').length;

  let nivel = '', rec = '';
  if (score <= 2) { nivel = 'Bajo'; rec = 'Sumá al menos verduras, fruta y legumbres para empezar.'; }
  else if (score <= 4) { nivel = 'Moderado'; rec = 'Estás en buen camino. Apuntá a 5+ grupos/día.'; }
  else if (score <= 6) { nivel = 'Muy buena ✅'; rec = 'Excelente. Con 1-2 grupos más llegás al óptimo.'; }
  else { nivel = 'Óptima ✅✅'; rec = '¡Dieta PCRM óptima! Máximo beneficio cardiovascular.'; }

  const chart = {
    type: 'scale' as const,
    marker: score,
    markerLabel: 'Tu score: ' + score + '/7',
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: 2, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 4, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Muy buena', max: 6, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Óptima', max: Math.max(7, score + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala del score PCRM de 0 a 7 grupos plant-based: bajo, moderado, muy buena y óptima.',
  };

  const nivelLimpio = nivel.replace(/[✅✪\s]+$/u, '').trim();
  const insightTone: 'good' | 'warn' | 'neutral' = score >= 5 ? 'good' : score <= 2 ? 'warn' : 'neutral';
  const insight = {
    title: 'Tu nivel plant-based',
    text: `Cubrís **${score} de 7** grupos vegetales, lo que te ubica en la zona **${nivelLimpio}**. ${score >= 5 ? 'Buen perfil cardiovascular: mantené la variedad.' : `Sumar ${7 - score} grupo${7 - score === 1 ? '' : 's'} más te acerca al óptimo PCRM.`}`,
    tone: insightTone,
    icon: '🥦',
  };

  return { score, nivel, recomendacion: rec, _chart: chart, _insight: insight };
}
