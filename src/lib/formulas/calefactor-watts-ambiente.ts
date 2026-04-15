/** Potencia (W o kcal/h) necesaria para calefaccionar un ambiente */
export interface Inputs {
  largo: number;
  ancho: number;
  altoTecho?: number; // m
  aislacion?: string; // buena | media | mala
  zona?: string; // sur | centro | norte
  tipoAmbiente?: string; // dormitorio | living | cocina | bano
}
export interface Outputs {
  kcalHora: number;
  watts: number;
  btuH: number;
  calefactorTiroBalanceado: number; // cantidad de calef. de 2500 kcal
  m3: number;
  factorAplicado: number;
  recomendacion: string;
  resumen: string;
}

// Factores kcal/h por m³ según aislación y zona
const FACTORES: Record<string, Record<string, number>> = {
  buena: { sur: 45, centro: 40, norte: 35 },
  media: { sur: 55, centro: 50, norte: 45 },
  mala: { sur: 70, centro: 60, norte: 55 },
};

export function calefactorWattsAmbiente(i: Inputs): Outputs {
  const l = Number(i.largo);
  const a = Number(i.ancho);
  const h = Number(i.altoTecho) || 2.6;
  const ais = String(i.aislacion || 'media');
  const z = String(i.zona || 'centro');
  const tipo = String(i.tipoAmbiente || 'living');

  if (!l || l <= 0 || !a || a <= 0) throw new Error('Ingresá largo y ancho del ambiente en metros');
  if (!FACTORES[ais] || !FACTORES[ais][z]) throw new Error('Aislación o zona no válida');

  const m3 = l * a * h;
  let factor = FACTORES[ais][z];

  // Ajuste por tipo de ambiente
  if (tipo === 'bano') factor *= 1.15; // baños pierden más calor por humedad
  if (tipo === 'cocina') factor *= 0.85; // cocina gana calor del horno/hornallas

  const kcalHora = m3 * factor;
  const watts = kcalHora * 1.163; // 1 kcal/h = 1.163 W
  const btuH = kcalHora * 3.968;

  // Calefactores tiro balanceado típicos: 2000, 2500, 3000, 5000 kcal/h
  const tiroBalanceado = Math.ceil(kcalHora / 2500);

  let recomendacion = '';
  if (kcalHora < 1500) recomendacion = 'Calefactor chico (1 tiro balanceado 2000 kcal o panel eléctrico 1500 W)';
  else if (kcalHora < 3000) recomendacion = 'Calefactor mediano (2500-3000 kcal) o split frío/calor 3500 frig';
  else if (kcalHora < 5000) recomendacion = 'Calefactor grande 5000 kcal o split 4500-6000 frig';
  else recomendacion = 'Requiere 2 calefactores o caldera con radiadores';

  return {
    kcalHora: Math.round(kcalHora),
    watts: Math.round(watts),
    btuH: Math.round(btuH),
    calefactorTiroBalanceado: tiroBalanceado,
    m3: Number(m3.toFixed(2)),
    factorAplicado: Number(factor.toFixed(2)),
    recomendacion,
    resumen: `Necesitás ~${Math.round(kcalHora)} kcal/h (${Math.round(watts)} W) para un ambiente de ${m3.toFixed(0)} m³.`,
  };
}
