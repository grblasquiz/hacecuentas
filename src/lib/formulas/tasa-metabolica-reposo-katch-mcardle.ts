/** Tasa Metabólica de Reposo — Katch-McArdle (usa % grasa corporal) */
export interface Inputs {
  peso: number;
  porcentajeGrasa: number;
}
export interface Outputs {
  tmr: number;
  masaMagra: number;
  detalle: string;
  _insight?: any;
}

export function tasaMetabolicaReposoKatchMcardle(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const pctGrasa = Number(i.porcentajeGrasa);

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso en kg');
  if (pctGrasa < 3 || pctGrasa > 60) throw new Error('El porcentaje de grasa debe estar entre 3% y 60%');

  // Masa libre de grasa (LBM)
  const masaMagra = peso * (1 - pctGrasa / 100);

  // Fórmula Katch-McArdle
  const tmr = 370 + 21.6 * masaMagra;

  const detalle =
    `Masa magra: ${masaMagra.toFixed(1)} kg | ` +
    `TMR Katch-McArdle: ${Math.round(tmr)} kcal/día. ` +
    `TDEE estimado: sedentario ${Math.round(tmr * 1.2)} kcal, ` +
    `moderado ${Math.round(tmr * 1.55)} kcal, ` +
    `activo ${Math.round(tmr * 1.725)} kcal.`;

  const _insight = {
    title: 'Qué significa tu TMR',
    text: `Tu cuerpo quema **${Math.round(tmr)} kcal/día** sólo para mantenerse vivo en reposo, calculado sobre tus **${masaMagra.toFixed(1)} kg de masa magra**. Para perder grasa comé por debajo de tu TDEE; para ganar músculo, por encima.`,
    tone: 'neutral',
    icon: '🔥',
  };

  return {
    tmr: Math.round(tmr),
    masaMagra: Number(masaMagra.toFixed(1)),
    detalle,
    _insight,
  };
}
