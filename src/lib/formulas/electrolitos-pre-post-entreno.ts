/**
 * Electrolitos pre/post entreno.
 */

export interface ElectrolitosPrePostEntrenoInputs {
  peso: number;
  minutos: number;
  intensidad: string;
}

export interface ElectrolitosPrePostEntrenoOutputs {
  sodioPreMg: number;
  sodioPostMg: number;
  potasioPostMg: number;
  magnesioPostMg: number;
  resumen: string;
}

export function electrolitosPrePostEntreno(inputs: ElectrolitosPrePostEntrenoInputs): ElectrolitosPrePostEntrenoOutputs {
  const peso = Number(inputs.peso);
  const min = Number(inputs.minutos);
  const inten = inputs.intensidad || 'moderada';
  if (!peso || peso <= 0 || !min || min <= 0) throw new Error('Datos inválidos');
  const factor: Record<string, number> = { moderada: 1, alta: 1.5, extrema: 2 };
  const f = factor[inten] ?? 1;
  const sodioPre = 250 * f;
  const horas = min / 60;
  const sodioPost = 300 * horas * f;
  const kPost = 200 * horas * f;
  const mgPost = 50 * horas * f;
  return {
    sodioPreMg: Number(sodioPre.toFixed(0)),
    sodioPostMg: Number(sodioPost.toFixed(0)),
    potasioPostMg: Number(kPost.toFixed(0)),
    magnesioPostMg: Number(mgPost.toFixed(0)),
    resumen: `Pre: ${sodioPre.toFixed(0)}mg Na. Post: ${sodioPost.toFixed(0)}mg Na + ${kPost.toFixed(0)}mg K + ${mgPost.toFixed(0)}mg Mg.`,
  };
}
