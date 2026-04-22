/**
 * Comparador LCI/LCA (isento IR) vs CDB (com IR regressivo).
 * LCI/LCA são isentas de IR para pessoa física (Lei 11.033/2004, art. 3º).
 * Calcula o CDB equivalente (% do CDI) necessário para empatar com a LCI/LCA líquida.
 */

export interface Inputs {
  aporte: number | string;
  cdiAnual: number | string;     // % aa
  pctLci: number | string;       // % CDI oferecido pela LCI/LCA
  meses: number | string;
}

export interface Outputs {
  valorLciLca: string;
  rendimentoLciLca: string;
  cdbEquivalentePctCdi: string;
  aliquotaIrCdb: string;
  rentabilidadeLciAnual: string;
  vantagemLci: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function aliquotaIR(meses: number): number {
  const dias = meses * 30;
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.20;
  if (dias <= 720) return 0.175;
  return 0.15;
}

export function lciLcaComparador(i: Inputs): Outputs {
  const aporte = Number(i.aporte) || 0;
  const cdiAnual = Number(i.cdiAnual) || 0;
  const pctLci = Number(i.pctLci) || 0;
  const meses = Number(i.meses) || 0;

  if (aporte <= 0) throw new Error('Informe um aporte válido.');
  if (cdiAnual <= 0) throw new Error('Informe a taxa CDI anual (%).');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const cdiEfet = (cdiAnual / 100) * (pctLci / 100);
  const taxaMensal = Math.pow(1 + cdiEfet, 1 / 12) - 1;
  const valorLci = aporte * Math.pow(1 + taxaMensal, meses);
  const rendLci = valorLci - aporte;
  const aliq = aliquotaIR(meses);
  // CDB equivalente: pctCDB × (1 - IR) = pctLCI → pctCDB = pctLCI / (1 - IR)
  const cdbEquiv = pctLci / (1 - aliq);
  const anos = meses / 12;
  const rentLciAnual = (Math.pow(valorLci / aporte, 1 / anos) - 1) * 100;

  return {
    valorLciLca: brl(valorLci),
    rendimentoLciLca: brl(rendLci),
    cdbEquivalentePctCdi: cdbEquiv.toFixed(2) + '% do CDI',
    aliquotaIrCdb: (aliq * 100).toFixed(1) + '%',
    rentabilidadeLciAnual: rentLciAnual.toFixed(2) + '% aa',
    vantagemLci: `LCI/LCA ${pctLci}% CDI isento = CDB ${cdbEquiv.toFixed(1)}% CDI bruto`,
    resumen: `Uma LCI/LCA a ${pctLci}% do CDI isenta de IR equivale a um CDB de ${cdbEquiv.toFixed(1)}% do CDI (IR ${(aliq * 100).toFixed(1)}%).`,
  };
}
