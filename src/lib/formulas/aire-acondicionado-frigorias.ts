/** Frigorías necesarias para enfriar un ambiente (regla 100 frig/m²) */
export interface Inputs {
  largo: number;
  ancho: number;
  altoTecho?: number;
  orientacion?: string; // norte | sur | este | oeste
  ocupantes?: number;
  electronicos?: number; // cantidad de PCs/TVs en el ambiente
  aislacion?: string; // buena | media | mala
}
export interface Outputs {
  frigorias: number;
  btuH: number;
  watts: number;
  m2: number;
  splitRecomendado: string;
  potenciaConsumo: number; // consumo eléctrico watts
  resumen: string;
}

export function aireAcondicionadoFrigorias(i: Inputs): Outputs {
  const l = Number(i.largo);
  const a = Number(i.ancho);
  const h = Number(i.altoTecho) || 2.6;
  const orient = String(i.orientacion || 'sur');
  const oc = Number(i.ocupantes) || 2;
  const elec = Number(i.electronicos) || 1;
  const ais = String(i.aislacion || 'media');

  if (!l || l <= 0 || !a || a <= 0) throw new Error('Ingresá largo y ancho en metros');

  const m2 = l * a;

  // Base: 100 frig/m² (norma estándar Argentina zona centro, 2.6 m altura)
  let frigorias = m2 * 100;

  // Ajuste por altura
  if (h > 2.8) frigorias *= 1 + (h - 2.8) * 0.1;

  // Ajuste por orientación
  if (orient === 'oeste') frigorias *= 1.15; // sol de la tarde
  else if (orient === 'norte') frigorias *= 1.10;
  else if (orient === 'este') frigorias *= 1.05;
  // sur: sin cambio

  // Ajuste por ocupantes: +100 frig por persona adicional
  if (oc > 2) frigorias += (oc - 2) * 100;

  // Ajuste por electrónicos: +100 frig por electrónico
  if (elec > 0) frigorias += elec * 100;

  // Ajuste por aislación
  if (ais === 'mala') frigorias *= 1.20;
  else if (ais === 'buena') frigorias *= 0.90;

  const btuH = frigorias * 3.968;
  const watts = frigorias * 1.163;

  // Split recomendado
  let split = '';
  if (frigorias < 2500) split = 'Split 2200-2500 frig/h (9.000 BTU)';
  else if (frigorias < 3500) split = 'Split 3000-3500 frig/h (12.000 BTU)';
  else if (frigorias < 4800) split = 'Split 4500 frig/h (18.000 BTU)';
  else if (frigorias < 6500) split = 'Split 6000 frig/h (24.000 BTU)';
  else if (frigorias < 9000) split = 'Split 9000 frig/h (36.000 BTU)';
  else split = 'Requiere multi-split o central';

  // Consumo eléctrico aproximado (EER ~ 3): watts_consumo = watts_frio / 3
  const potConsumo = watts / 3;

  return {
    frigorias: Math.round(frigorias),
    btuH: Math.round(btuH),
    watts: Math.round(watts),
    m2: Number(m2.toFixed(2)),
    splitRecomendado: split,
    potenciaConsumo: Math.round(potConsumo),
    resumen: `Necesitás ~${Math.round(frigorias)} frigorías/h (${Math.round(btuH)} BTU/h) para ${m2.toFixed(1)} m². ${split}.`,
  };
}
