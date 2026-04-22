/**
 * Fundo Imobiliário (FII) — rendimento total:
 * Dividendos mensais (isentos de IR para PF conforme Lei 11.033/2004 art. 3º, III)
 * + ganho de capital na venda (IR 20% conforme IN RFB 1.585/2015).
 */

export interface Inputs {
  valorInvestido: number | string;
  precoCota: number | string;
  dividendoMensalPorCota: number | string; // R$
  meses: number | string;
  valorizacaoAnual?: number | string;       // % aa esperada
}

export interface Outputs {
  qtdCotas: string;
  dividendosTotais: string;
  dividendYieldMensal: string;
  dividendYieldAnual: string;
  valorFinalCotas: string;
  ganhoCapital: string;
  irGanhoCapital: string;
  rendimentoTotalLiquido: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fiiRendimento(i: Inputs): Outputs {
  const valor = Number(i.valorInvestido) || 0;
  const preco = Number(i.precoCota) || 0;
  const divMes = Number(i.dividendoMensalPorCota) || 0;
  const meses = Number(i.meses) || 0;
  const valorizacao = Number(i.valorizacaoAnual ?? 0) || 0;

  if (valor <= 0) throw new Error('Informe o valor investido.');
  if (preco <= 0) throw new Error('Informe o preço da cota.');
  if (meses <= 0) throw new Error('Informe o prazo em meses.');

  const qtd = Math.floor(valor / preco);
  const investidoReal = qtd * preco;
  const dyMensal = divMes / preco;
  const dyAnual = Math.pow(1 + dyMensal, 12) - 1;
  const dividendos = qtd * divMes * meses;
  const anos = meses / 12;
  const valorFinal = investidoReal * Math.pow(1 + valorizacao / 100, anos);
  const ganhoCapital = Math.max(0, valorFinal - investidoReal);
  const irGanho = ganhoCapital * 0.20;
  const totalLiquido = dividendos + (valorFinal - irGanho) - investidoReal;

  return {
    qtdCotas: qtd.toString() + ' cotas (' + brl(investidoReal) + ' aplicados)',
    dividendosTotais: brl(dividendos),
    dividendYieldMensal: (dyMensal * 100).toFixed(3) + '% am',
    dividendYieldAnual: (dyAnual * 100).toFixed(2) + '% aa',
    valorFinalCotas: brl(valorFinal),
    ganhoCapital: brl(ganhoCapital),
    irGanhoCapital: brl(irGanho),
    rendimentoTotalLiquido: brl(totalLiquido),
    resumen: `Com ${qtd} cotas a ${brl(preco)} e dividendo ${brl(divMes)}/cota/mês, em ${meses} meses você recebe ${brl(dividendos)} em dividendos (isentos) e ${brl(valorFinal - irGanho - investidoReal)} de ganho líquido.`,
  };
}
