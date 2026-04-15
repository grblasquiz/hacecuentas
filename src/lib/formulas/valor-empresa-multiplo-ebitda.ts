/** Valuación rápida de empresa por múltiplo EBITDA según industria */
export interface Inputs {
  ebitda: number;
  multiploIndustria: number;
  deudaNeta?: number;
  cajaYEquivalentes?: number;
}
export interface Outputs {
  enterpriseValue: number;
  equityValue: number;
  valuacionMin: number;
  valuacionMax: number;
  resumen: string;
}

export function valorEmpresaMultiploEbitda(i: Inputs): Outputs {
  const ebitda = Number(i.ebitda);
  const multiplo = Number(i.multiploIndustria);
  const deuda = Number(i.deudaNeta) || 0;
  const caja = Number(i.cajaYEquivalentes) || 0;

  if (!ebitda || ebitda <= 0) throw new Error('Ingresá el EBITDA (debe ser positivo)');
  if (!multiplo || multiplo <= 0) throw new Error('Ingresá el múltiplo de la industria');
  if (multiplo > 50) throw new Error('El múltiplo parece demasiado alto, revisá el valor');
  if (deuda < 0) throw new Error('La deuda neta no puede ser negativa');
  if (caja < 0) throw new Error('La caja no puede ser negativa');

  const ev = ebitda * multiplo;
  const equityValue = ev - deuda + caja;
  // Rango típico ±20%
  const min = equityValue * 0.85;
  const max = equityValue * 1.15;

  const resumen = `Enterprise Value: ${Math.round(ev).toLocaleString()}. Equity Value estimado: ${Math.round(equityValue).toLocaleString()} (rango ${Math.round(min).toLocaleString()} - ${Math.round(max).toLocaleString()}).`;

  return {
    enterpriseValue: Math.round(ev),
    equityValue: Math.round(equityValue),
    valuacionMin: Math.round(min),
    valuacionMax: Math.round(max),
    resumen,
  };
}
