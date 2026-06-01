/**
 * DII simplificado - Score antiinflamatorio.
 */

export interface AntiinflamatorioScoreComidaInputs {
  omega3: number;
  fibra: number;
  frutasVerduras: number;
  especias: string;
  transFat: number;
  azucarAnadido: number;
  carneProcesada: number;
}

export interface AntiinflamatorioScoreComidaOutputs {
  score: number;
  clasificacion: string;
  recomendacion: string;
  _chart?: any;
}

export function antiinflamatorioScoreComida(inputs: AntiinflamatorioScoreComidaInputs): AntiinflamatorioScoreComidaOutputs {
  let score = 0;
  if (Number(inputs.omega3) >= 3) score -= 2;
  else if (Number(inputs.omega3) >= 1) score -= 1;
  if (Number(inputs.fibra) >= 25) score -= 1;
  if (Number(inputs.frutasVerduras) >= 5) score -= 2;
  else if (Number(inputs.frutasVerduras) >= 3) score -= 1;
  if (inputs.especias === 'si') score -= 1;
  if (Number(inputs.transFat) >= 2) score += 2;
  if (Number(inputs.azucarAnadido) > 25) score += 1;
  if (Number(inputs.carneProcesada) >= 3) score += 2;
  else if (Number(inputs.carneProcesada) >= 1) score += 1;

  let clasif = '', rec = '';
  if (score <= -3) { clasif = 'Antiinflamatoria óptima ✅'; rec = 'Dieta ideal. Mantenela.'; }
  else if (score <= 0) { clasif = 'Ligeramente antiinflamatoria'; rec = 'Bien. Podés sumar más omega-3 y especias.'; }
  else if (score <= 2) { clasif = 'Neutra'; rec = 'Hay margen de mejora: más verduras, menos azúcar.'; }
  else { clasif = 'Proinflamatoria ⚠️'; rec = 'Reducir carnes procesadas, azúcar y aumentar omega-3.'; }

  const chart = {
    type: 'scale' as const,
    marker: score,
    markerLabel: 'Tu score: ' + score,
    min: -6,
    unit: '',
    segments: [
      { nombre: 'Antiinflamatoria óptima', max: -3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Ligeramente antiinflamatoria', max: 0, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Neutra', max: 2, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Proinflamatoria', max: Math.max(5, Math.ceil(score) + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala DII: de antiinflamatoria óptima (score bajo) a proinflamatoria (score alto)',
  };

  return { score, clasificacion: clasif, recomendacion: rec, _chart: chart };
}
