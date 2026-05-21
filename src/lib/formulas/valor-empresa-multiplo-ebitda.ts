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
  deudaNeta: number;
  ratioEquityEv: number;
  benchmarkMultiplo: string;
  valuacionMin: number;
  valuacionMax: number;
  resumen: string;
}

export function valorEmpresaMultiploEbitda(i: Inputs): Outputs {
  const ebitda = Number(i.ebitda);
  const multiplo = Number(i.multiploIndustria);
  // El campo "deudaNeta" en el JSON viene rotulado como "Deuda total" — lo tratamos como deuda total y la convertimos a deuda neta restando caja
  const deudaInput = Number(i.deudaNeta) || 0;
  const caja = Number(i.cajaYEquivalentes) || 0;

  if (!ebitda || ebitda <= 0) throw new Error('Ingresá el EBITDA (debe ser positivo)');
  if (!multiplo || multiplo <= 0) throw new Error('Ingresá el múltiplo de la industria');
  if (multiplo > 50) throw new Error('El múltiplo parece demasiado alto, revisá el valor');
  if (deudaInput < 0) throw new Error('La deuda no puede ser negativa');
  if (caja < 0) throw new Error('La caja no puede ser negativa');

  const deudaNetaCalc = deudaInput - caja;
  const ev = ebitda * multiplo;
  const equityValue = ev - deudaNetaCalc;

  // Rango típico ±15%
  const min = equityValue * 0.85;
  const max = equityValue * 1.15;

  const ratioEquityEv = ev > 0 ? (equityValue / ev) * 100 : 0;

  // Benchmark cualitativo del múltiplo elegido vs estándares de industria
  let benchmarkMultiplo = '';
  if (multiplo < 3) {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es bajo: típico de negocios con alto riesgo o sin recurrencia. Equivale a payback en ${multiplo.toFixed(1)} años.`;
  } else if (multiplo < 5) {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es conservador: rango habitual en construcción, agricultura, servicios profesionales dependientes del fundador.`;
  } else if (multiplo < 8) {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es estándar PyME: rango habitual en servicios B2B, manufactura, retail tradicional.`;
  } else if (multiplo < 12) {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es premium: típico de salud, e-commerce sólido, SaaS mid-market y negocios con buen moat.`;
  } else if (multiplo < 18) {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es alto: rango de SaaS top quartile, tecnología consumo con crecimiento sostenido.`;
  } else {
    benchmarkMultiplo = `Múltiplo ${multiplo.toFixed(1)}× es muy alto: solo justificable en SaaS premium con Rule of 40, crecimiento >40% y recurrencia >90%.`;
  }

  const resumen = `Enterprise Value: ${Math.round(ev).toLocaleString()}. Deuda neta: ${Math.round(deudaNetaCalc).toLocaleString()}. Equity Value estimado: ${Math.round(equityValue).toLocaleString()} (rango ${Math.round(min).toLocaleString()} - ${Math.round(max).toLocaleString()}).`;

  return {
    enterpriseValue: Math.round(ev),
    equityValue: Math.round(equityValue),
    deudaNeta: Math.round(deudaNetaCalc),
    ratioEquityEv: Number(ratioEquityEv.toFixed(2)),
    benchmarkMultiplo,
    valuacionMin: Math.round(min),
    valuacionMax: Math.round(max),
    resumen,
  };
}
