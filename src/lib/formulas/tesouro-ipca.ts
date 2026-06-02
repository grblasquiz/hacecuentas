/**
 * Tesouro IPCA+ (NTN-B) — rentabilidade real composta.
 * Taxa = (1 + IPCA%) × (1 + juroReal%) - 1
 * Desconta custódia B3 0,2% aa e IR regressivo.
 */

export interface Inputs {
  aporte: number | string;
  ipcaAnual: number | string;    // % aa estimado
  juroReal: number | string;     // % aa (cupom IPCA+)
  meses: number | string;
  taxaCustodia?: number | string;
}

export interface Outputs {
  taxaNominalAnual: string;
  valorBruto: string;
  rendimentoBruto: string;
  custodiaB3: string;
  aliquotaIr: string;
  impostoIr: string;
  valorLiquido: string;
  juroRealLiquido: string;
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

export function tesouroIpca(i: Inputs): Outputs {
  const aporte = Number(i.aporte) || 0;
  const ipca = Number(i.ipcaAnual) || 0;
  const juroReal = Number(i.juroReal) || 0;
  const meses = Number(i.meses) || 0;
  const custodia = Number(i.taxaCustodia ?? 0.2) || 0;

  if (aporte <= 0) throw new Error('Informe um aporte válido.');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const taxaNominal = (1 + ipca / 100) * (1 + juroReal / 100) - 1;
  const taxaMensal = Math.pow(1 + taxaNominal, 1 / 12) - 1;
  const valorBrutoSemCust = aporte * Math.pow(1 + taxaMensal, meses);
  const anos = meses / 12;
  const custodiaValor = (aporte + valorBrutoSemCust) / 2 * (custodia / 100) * anos;
  const valorBruto = valorBrutoSemCust - custodiaValor;
  const rendBruto = valorBruto - aporte;
  const aliq = aliquotaIR(meses);
  const imposto = Math.max(0, rendBruto) * aliq;
  const valorLiquido = valorBruto - imposto;
  const rentAnualLiq = Math.pow(valorLiquido / aporte, 1 / anos) - 1;
  const juroRealLiq = ((1 + rentAnualLiq) / (1 + ipca / 100) - 1) * 100;
  const ganhoLiquido = valorLiquido - aporte;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (juroRealLiq < 0) {
    insightTone = 'warn';
    insightText = `Após custódia e IR (${(aliq * 100).toFixed(1)}%), o ganho real fica em **${juroRealLiq.toFixed(2)}% aa**, ou seja, **abaixo da inflação**: o poder de compra recua. Prazos mais longos reduzem o IR e melhoram o resultado.`;
  } else {
    insightTone = 'good';
    insightText = `Em ${meses} meses você resgata **${brl(valorLiquido)}** líquidos: **${brl(ganhoLiquido)}** de ganho, com **${juroRealLiq.toFixed(2)}% aa reais** acima do IPCA já descontados custódia e IR de ${(aliq * 100).toFixed(1)}%.`;
  }

  const out: Outputs = {
    taxaNominalAnual: (taxaNominal * 100).toFixed(2) + '% aa',
    valorBruto: brl(valorBruto),
    rendimentoBruto: brl(rendBruto),
    custodiaB3: brl(custodiaValor),
    aliquotaIr: (aliq * 100).toFixed(1) + '%',
    impostoIr: brl(imposto),
    valorLiquido: brl(valorLiquido),
    juroRealLiquido: juroRealLiq.toFixed(2) + '% aa acima do IPCA',
    resumen: `Tesouro IPCA+ ${juroReal}% com IPCA ${ipca}% por ${meses} meses: ${brl(valorLiquido)} líquido (juro real líquido ${juroRealLiq.toFixed(2)}% aa).`,
    _insight: {
      title: 'Seu resgate líquido',
      text: insightText,
      tone: insightTone,
      icon: '📈',
    },
  };

  if (ganhoLiquido > 0 && valorLiquido > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Aporte', value: Number(aporte.toFixed(2)) },
        { label: 'Ganho líquido', value: Number(ganhoLiquido.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(valorLiquido),
      centerLabel: 'Líquido',
      ariaLabel: `Resgate líquido de ${brl(valorLiquido)}: aporte ${brl(aporte)} mais ganho líquido ${brl(ganhoLiquido)}`,
    };
  }

  return out;
}
