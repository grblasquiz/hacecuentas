/** Calculadora de cafeína para rendimiento deportivo */
export interface Inputs {
  peso: number;
  tolerancia: string;
}
export interface Outputs {
  dosisOptima: string;
  dosisMinima: number;
  dosisMaxima: number;
  cafesEquiv: string;
  timing: string;
  mensaje: string;
}

export function cafeinaDosisRendimiento(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const tolerancia = String(i.tolerancia || 'media');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  // ISSN: 3-6 mg/kg para rendimiento
  let mgMin: number, mgMax: number;
  if (tolerancia === 'baja') {
    mgMin = peso * 2; mgMax = peso * 3;
  } else if (tolerancia === 'media') {
    mgMin = peso * 3; mgMax = peso * 5;
  } else {
    mgMin = peso * 4; mgMax = peso * 6;
  }

  // Cap at EFSA safe limit 400 mg
  if (mgMax > 400) mgMax = 400;
  if (mgMin > mgMax) mgMin = mgMax;

  const cafesMin = (mgMin / 95).toFixed(1);
  const cafesMax = (mgMax / 95).toFixed(1);

  return {
    dosisOptima: `${Math.round(mgMin)}-${Math.round(mgMax)} mg`,
    dosisMinima: Math.round(mgMin),
    dosisMaxima: Math.round(mgMax),
    cafesEquiv: `${cafesMin}-${cafesMax} cafés de filtro (~95 mg c/u)`,
    timing: tolerancia === 'baja' ? '45-60 min antes de entrenar (empezá con la dosis mínima)' : '30-60 min antes de entrenar',
    mensaje: `Dosis óptima: ${Math.round(mgMin)}-${Math.round(mgMax)} mg (${cafesMin}-${cafesMax} cafés). Tomá 30-60 min antes de entrenar.`
  };
}