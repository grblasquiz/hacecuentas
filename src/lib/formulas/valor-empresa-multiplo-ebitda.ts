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
  _insight?: any;
  _chart?: any;
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

  // Insight: interpreta el equity según la deuda neta
  let insightTone: string, insightTitle: string, insightText: string, insightIconTmp: string;
  if (equityValue <= 0) {
    insightTone = 'warn';
    insightTitle = 'Equity negativo: la deuda se come el valor';
    insightText = `Con un EV de **$${Math.round(ev).toLocaleString()}** (${multiplo.toFixed(1)}× EBITDA) y una deuda neta de **$${Math.round(deudaNetaCalc).toLocaleString()}**, el equity value queda en **$${Math.round(equityValue).toLocaleString()}**: la deuda supera lo que vale el negocio. El comprador asumiría ese pasivo.`;
    insightIconTmp = '⚠️';
  } else if (deudaNetaCalc > 0 && ratioEquityEv < 60) {
    insightTone = 'warn';
    insightTitle = 'Deuda alta reduce el equity';
    insightText = `El Enterprise Value es **$${Math.round(ev).toLocaleString()}**, pero la deuda neta de **$${Math.round(deudaNetaCalc).toLocaleString()}** deja un equity value de solo **$${Math.round(equityValue).toLocaleString()}** (${ratioEquityEv.toFixed(0)}% del EV). Rango estimado: $${Math.round(min).toLocaleString()} a $${Math.round(max).toLocaleString()}.`;
    insightIconTmp = '🏢';
  } else {
    insightTone = deudaNetaCalc < 0 ? 'good' : 'neutral';
    insightTitle = 'Valuación estimada';
    insightText = `A **${multiplo.toFixed(1)}× EBITDA** la empresa vale unos **$${Math.round(ev).toLocaleString()}** de Enterprise Value y **$${Math.round(equityValue).toLocaleString()}** de equity${deudaNetaCalc < 0 ? ' (la caja supera la deuda, suma valor)' : ''}. Rango razonable: **$${Math.round(min).toLocaleString()} a $${Math.round(max).toLocaleString()}**.`;
    insightIconTmp = deudaNetaCalc < 0 ? '💰' : '📊';
  }
  const _insight = { title: insightTitle, text: insightText, tone: insightTone, icon: insightIconTmp };

  // Gauge: posiciona el múltiplo elegido en las zonas de mercado
  const _chart = {
    type: 'scale',
    marker: Number(multiplo.toFixed(1)),
    markerLabel: `${multiplo.toFixed(1)}× EBITDA`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 3, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Conservador', max: 5, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Estándar PyME', max: 8, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Premium', max: 12, color: '#3b82f6', colorDark: '#2563eb' },
      { nombre: 'Alto', max: 18, color: '#8b5cf6', colorDark: '#7c3aed' },
      { nombre: 'Muy alto', max: 60, color: '#ec4899', colorDark: '#db2777' },
    ],
    ariaLabel: `Múltiplo de ${multiplo.toFixed(1)}× EBITDA ubicado en la escala de valuación de mercado.`,
  };

  return {
    enterpriseValue: Math.round(ev),
    equityValue: Math.round(equityValue),
    deudaNeta: Math.round(deudaNetaCalc),
    ratioEquityEv: Number(ratioEquityEv.toFixed(2)),
    benchmarkMultiplo,
    valuacionMin: Math.round(min),
    valuacionMax: Math.round(max),
    resumen,
    _insight,
    _chart,
  };
}
