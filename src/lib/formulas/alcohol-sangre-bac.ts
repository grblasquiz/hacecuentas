/** Nivel de alcohol en sangre estimado (BAC) — Widmark simplificado */
export interface Inputs {
  peso: number;
  sexo: string;
  bebidas: number;
  tipoBebida: string;
  horas: number;
}
export interface Outputs {
  bac: number;
  gramosAlcohol: number;
  horasHastaCero: number;
  estado: string;
  mensaje: string;
}

export function alcoholSangreBac(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const sexo = String(i.sexo || 'm');
  const bebidas = Number(i.bebidas) || 1;
  const tipoBebida = String(i.tipoBebida || 'cerveza_330');
  const horas = Number(i.horas) || 0;

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // Gramos de alcohol por tipo de bebida
  const gramosMap: Record<string, number> = {
    cerveza_330: 13,
    cerveza_500: 20,
    vino_150: 15.4,
    fernet_50: 15.6,
    whisky_45: 14.2,
    champagne_150: 14.2,
    vodka_45: 14.2,
  };

  const gramosPorBebida = gramosMap[tipoBebida] || 14;
  const gramosAlcohol = gramosPorBebida * bebidas;

  const r = sexo === 'f' ? 0.55 : 0.68;
  let bac = gramosAlcohol / (peso * r);
  bac = Math.max(0, bac - 0.15 * horas);

  const horasHastaCero = bac > 0 ? bac / 0.15 : 0;

  let estado: string;
  if (bac === 0) estado = 'Sin alcohol detectable';
  else if (bac < 0.3) estado = 'Leve — relajación, desinhibición sutil';
  else if (bac < 0.5) estado = 'Moderado — juicio levemente afectado';
  else if (bac < 0.8) estado = 'Significativo — coordinación y reflejos comprometidos';
  else if (bac < 1.5) estado = 'Embriaguez — NO manejes';
  else estado = 'Peligroso — riesgo de intoxicación aguda';

  return {
    bac: Number(bac.toFixed(2)),
    gramosAlcohol: Number(gramosAlcohol.toFixed(1)),
    horasHastaCero: Number(horasHastaCero.toFixed(1)),
    estado,
    mensaje: `BAC estimado: ${bac.toFixed(2)} g/L. ${estado}. Tiempo hasta cero: ${horasHastaCero.toFixed(1)} horas.`,
  };
}
