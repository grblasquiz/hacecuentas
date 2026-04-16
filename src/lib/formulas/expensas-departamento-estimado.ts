/** Estimador de expensas de departamento */
export interface Inputs {
  superficieM2: number;
  zona: string;
  tieneAmenities?: string;
  cantidadUnidades?: number;
}
export interface Outputs {
  expensasEstimadas: number;
  costoPorM2: number;
  rangoMinimo: number;
  rangoMaximo: number;
}

export function expensasDepartamentoEstimado(i: Inputs): Outputs {
  const m2 = Number(i.superficieM2);
  const zona = i.zona || 'caba-media';
  const amenities = i.tieneAmenities || 'no';
  const unidades = Number(i.cantidadUnidades) || 20;

  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie en m2');

  // Base cost per m2 by zone
  const basePorM2: Record<string, number> = {
    'caba-premium': 1200,
    'caba-media': 950,
    'caba-sur': 750,
    'gba-norte': 850,
    'gba-oeste-sur': 600,
    'interior': 500,
  };

  let costoPorM2 = basePorM2[zona] || 800;

  // Amenities multiplier
  if (amenities === 'basico') costoPorM2 *= 1.25;
  if (amenities === 'completo') costoPorM2 *= 1.65;

  // Units adjustment (more units = slightly cheaper per unit)
  if (unidades > 40) costoPorM2 *= 0.85;
  else if (unidades > 20) costoPorM2 *= 0.92;
  else if (unidades < 10) costoPorM2 *= 1.15;

  const expensasEstimadas = m2 * costoPorM2;
  const rangoMinimo = expensasEstimadas * 0.75;
  const rangoMaximo = expensasEstimadas * 1.30;

  return {
    expensasEstimadas: Math.round(expensasEstimadas),
    costoPorM2: Math.round(costoPorM2),
    rangoMinimo: Math.round(rangoMinimo),
    rangoMaximo: Math.round(rangoMaximo),
  };
}
