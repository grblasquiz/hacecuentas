/**
 * Rendimento líquido CDB pós-fixado (% do CDI) com IR regressivo 2026.
 * Fórmula: VF = VP × (1 + CDI_mes × pctCDI)^meses
 * IR regressivo: 22,5% / 20% / 17,5% / 15% conforme prazo.
 * Fontes: Receita Federal IN 1.585/2015, Banco Central, B3.
 */

export interface Inputs {
  aporte: number | string;
  cdiAnual: number | string;   // % aa, ex: 12.5
  pctCdi: number | string;     // % do CDI, ex: 100
  meses: number | string;
}

export interface Outputs {
  valorBruto: string;
  rendimentoBruto: string;
  aliquotaIr: string;
  impostoIr: string;
  valorLiquido: string;
  rendimentoLiquido: string;
  rentabilidadeAnualLiquida: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
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

export function cdbRendimentoLiquido(i: Inputs): Outputs {
  const aporte = Number(i.aporte) || 0;
  const cdiAnual = Number(i.cdiAnual) || 0;
  const pctCdi = Number(i.pctCdi) || 0;
  const meses = Number(i.meses) || 0;

  if (aporte <= 0) throw new Error('Informe um aporte válido.');
  if (cdiAnual <= 0) throw new Error('Informe a taxa CDI anual (%).');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const cdiEfetiva = (cdiAnual / 100) * (pctCdi / 100);
  const taxaMensal = Math.pow(1 + cdiEfetiva, 1 / 12) - 1;
  const valorBruto = aporte * Math.pow(1 + taxaMensal, meses);
  const rendimentoBruto = valorBruto - aporte;
  const aliq = aliquotaIR(meses);
  const imposto = rendimentoBruto * aliq;
  const valorLiquido = valorBruto - imposto;
  const rendimentoLiquido = valorLiquido - aporte;
  const anos = meses / 12;
  const rentAnualLiq = (Math.pow(valorLiquido / aporte, 1 / anos) - 1) * 100;

  const irAlto = aliq >= 0.225;
  const _insight = {
    title: 'Rendimento líquido',
    text: `Seu aporte de **${brl(aporte)}** vira **${brl(valorLiquido)}** em ${meses} meses — um ganho líquido de **${brl(rendimentoLiquido)}** (${rentAnualLiq.toFixed(2)}% aa). O IR de **${(aliq * 100).toFixed(1)}%** levou **${brl(imposto)}**` +
      (irAlto
        ? `; resgatando após **180 dias** a alíquota cai e você fica com mais.`
        : `, a alíquota mais baixa da tabela regressiva por manter o prazo.`),
    tone: irAlto ? 'warn' : 'good',
    icon: '💰',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aporte', value: Number(aporte.toFixed(2)) },
      { label: 'Rendimento líquido', value: Number(rendimentoLiquido.toFixed(2)) },
      { label: 'IR', value: Number(imposto.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(valorBruto),
    centerLabel: 'Valor bruto',
    ariaLabel: `Composição do valor bruto: aporte, rendimento líquido e imposto de renda`,
  };

  return {
    valorBruto: brl(valorBruto),
    rendimentoBruto: brl(rendimentoBruto),
    aliquotaIr: (aliq * 100).toFixed(1) + '%',
    impostoIr: brl(imposto),
    valorLiquido: brl(valorLiquido),
    rendimentoLiquido: brl(rendimentoLiquido),
    rentabilidadeAnualLiquida: rentAnualLiq.toFixed(2) + '% aa',
    resumen: `Aporte ${brl(aporte)} a ${pctCdi}% do CDI (${cdiAnual}% aa) por ${meses} meses rende ${brl(rendimentoLiquido)} líquido (IR ${(aliq * 100).toFixed(1)}%).`,
    _insight,
    _chart,
  };
}
