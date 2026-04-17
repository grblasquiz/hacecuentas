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

  return {
    costoPorHora,
    puntaje,
    recomendacion,
    benchmark,
  };
}
