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
  _insight?: any;
  _chart?: any;
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
  const tone = score <= 3 ? 'good' : score <= 7 ? 'neutral' : 'warn';
  return {
    score,
    interpretacion: interp,
    recomendacion: rec,
    resumen: `Score ${score}/13 - ${interp}.`,
    _insight: {
      title: interp,
      text: `Tu score es **${score}/13** (${interp.toLowerCase().replace(' ⚠️','').replace(' 🚨','')}). ${rec} Clave: **no elimines el gluten** antes de hacer la serología, porque falsea el diagnóstico de celiaquía.`,
      tone,
      icon: '🌾',
    },
    _chart: {
      type: 'scale',
      marker: Math.min(score, 12.9),
      markerLabel: `${score}/13`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 3, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Moderada', max: 7, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Alta', max: 10, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Muy alta', max: 13, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Score de sensibilidad al gluten ${score} de 13: ${interp}`,
    },
  };
}
