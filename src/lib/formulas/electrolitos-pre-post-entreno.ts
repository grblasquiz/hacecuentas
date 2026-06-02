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
  _insight?: any;
  _chart?: any;
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
  const naP = Number(sodioPost.toFixed(0));
  const kP = Number(kPost.toFixed(0));
  const mgP = Number(mgPost.toFixed(0));
  const totalPost = naP + kP + mgP;
  return {
    sodioPreMg: Number(sodioPre.toFixed(0)),
    sodioPostMg: naP,
    potasioPostMg: kP,
    magnesioPostMg: mgP,
    resumen: `Pre: ${sodioPre.toFixed(0)}mg Na. Post: ${naP}mg Na + ${kP}mg K + ${mgP}mg Mg.`,
    _insight: {
      title: 'Antes y después de entrenar',
      text: `Para ${min} min de entreno ${inten}, cargá **${sodioPre.toFixed(0)} mg de sodio antes** para arrancar hidratado. Al terminar, reponé **${totalPost} mg de electrolitos** en total (${naP} mg Na + ${kP} mg K + ${mgP} mg Mg) para recuperarte y evitar calambres.`,
      tone: (inten === 'extrema' || horas >= 1.5) ? 'warn' : 'neutral',
      icon: '🧂',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Sodio (Na)', value: naP },
        { label: 'Potasio (K)', value: kP },
        { label: 'Magnesio (Mg)', value: mgP },
      ],
      prefix: '',
      centerValue: `${totalPost} mg`,
      centerLabel: 'Post-entreno',
      ariaLabel: `Electrolitos post-entreno: ${naP} mg sodio, ${kP} mg potasio, ${mgP} mg magnesio`,
    },
  };
}
