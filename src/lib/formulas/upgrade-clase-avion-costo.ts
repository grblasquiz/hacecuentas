/**
 * Calculadora de upgrade de clase en avión.
 * Evalúa si el upgrade vale la pena segun costo/hora y extras.
 */

export interface UpgradeClaseAvionCostoInputs {
  costoUpgradeUSD: number;
  duracionHoras: number;
  claseDestino: string;
  camaPlana: string;
  salonVip: string;
  motivo: string;
}

export interface UpgradeClaseAvionCostoOutputs {
  costoPorHora: number;
  puntaje: string;
  recomendacion: string;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

// benchmarks USD/hora promedio
const BENCHMARKS: Record<string, { barato: number; promedio: number; caro: number }> = {
  premiumeconomy: { barato: 15, promedio: 30, caro: 60 },
  business: { barato: 70, promedio: 120, caro: 250 },
  first: { barato: 150, promedio: 250, caro: 500 },
};

export function upgradeClaseAvionCosto(inputs: UpgradeClaseAvionCostoInputs): UpgradeClaseAvionCostoOutputs {
  const costo = Math.max(0, Number(inputs.costoUpgradeUSD) || 0);
  const horas = Math.max(0.5, Number(inputs.duracionHoras) || 1);
  const costoPorHora = Math.round((costo / horas) * 100) / 100;

  const b = BENCHMARKS[inputs.claseDestino] ?? BENCHMARKS.business;

  // Score base 0-100
  let score = 50;
  if (costoPorHora <= b.barato) score = 95;
  else if (costoPorHora <= b.promedio) score = 75;
  else if (costoPorHora <= b.caro) score = 50;
  else score = 25;

  // Ajustes por duración
  if (horas >= 8) score += 10;
  else if (horas >= 5) score += 5;
  else if (horas < 3) score -= 15;

  // Cama plana
  if (inputs.camaPlana === 'si' && horas >= 6) score += 10;
  if (inputs.camaPlana === 'no' && inputs.claseDestino === 'business') score -= 10;

  // Salón VIP
  if (inputs.salonVip === 'si') score += 5;

  // Motivo
  if (inputs.motivo === 'trabajo') score += 10;
  if (inputs.motivo === 'trabajo-yo') score -= 5;

  score = Math.max(0, Math.min(100, score));

  let puntaje: string;
  let recomendacion: string;

  if (score >= 80) {
    puntaje = `${score}/100 — Excelente deal`;
    recomendacion = 'Acepta el upgrade. Estás pagando por debajo del promedio de mercado y los extras lo justifican.';
  } else if (score >= 60) {
    puntaje = `${score}/100 — Buen deal`;
    recomendacion = 'Conviene aceptar, especialmente si el vuelo es largo. Precio razonable.';
  } else if (score >= 40) {
    puntaje = `${score}/100 — Deal discutible`;
    recomendacion = 'Depende de tu presupuesto y ganas. No es una ganga, pero tampoco un robo.';
  } else {
    puntaje = `${score}/100 — Mal deal`;
    recomendacion = 'Pasa. El precio está por encima del mercado o el vuelo es muy corto para justificar el gasto.';
  }

  const benchmark = `Mercado ${inputs.claseDestino}: USD ${b.barato} (barato) / USD ${b.promedio} (promedio) / USD ${b.caro} (caro) por hora`;

  const tone = score >= 60 ? 'good' : score >= 40 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Conviene el upgrade?',
    text: `Estás pagando **USD ${costoPorHora}/hora** por el upgrade, con un puntaje de **${score}/100**. ${
      score >= 80 ? 'Es una ganga: por debajo del promedio de mercado, aceptalo.'
      : score >= 60 ? 'Buen precio, sobre todo si el vuelo es largo: conviene aceptar.'
      : score >= 40 ? 'Está en la media: depende de tu presupuesto y tus ganas.'
      : 'Está por encima del mercado o el vuelo es corto: te conviene pasar.'
    }`,
    tone,
    icon: score >= 60 ? '✈️' : '🤔',
  };
  const _chart = {
    type: 'scale',
    marker: score,
    markerLabel: `${score}/100`,
    min: 0,
    segments: [
      { nombre: 'Mal deal', max: 40, color: '#ef4444', colorDark: '#f87171' },
      { nombre: 'Discutible', max: 60, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Buen deal', max: 80, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Excelente', max: 100, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Puntaje del upgrade: ${score} de 100`,
  };

  return {
    costoPorHora,
    puntaje,
    recomendacion,
    benchmark,
    _insight,
    _chart,
  };
}
