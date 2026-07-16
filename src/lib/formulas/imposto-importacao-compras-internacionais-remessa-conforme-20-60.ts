// Imposto de importação em compras internacionais — Programa Remessa Conforme.
// Regras (Lei 14.902/2024 e regulamentação da Receita Federal):
//   - Compras de até US$ 50 em empresas certificadas no PRC: II de 20%.
//   - Acima de US$ 50 (até US$ 3.000): II de 60% COM abatimento de US$ 20.
//   - Sobre (valor aduaneiro + II) incide ICMS de 17% "por dentro" (alíquota
//     padrão da maioria dos estados; alguns aplicam 18% a 20%).
// O valor aduaneiro é a soma de produto + frete + seguro, convertida pelo
// câmbio informado. Todas as alíquotas são editáveis.

export interface Inputs {
  valorProdutoUSD: number;  // US$
  freteUSD?: number;        // US$
  cotacaoDolar: number;     // R$ por US$
  aliquotaICMS?: number;    // % (padrão 17)
}
export interface Outputs {
  valorAduaneiroBRL: string;
  impostoImportacao: string;
  icms: string;
  totalImpostos: string;
  custoFinal: string;
  faixaAplicada: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LIMITE_USD_20 = 50;      // até US$ 50 → II 20%
const II_ATE_50 = 0.20;
const II_ACIMA_50 = 0.60;
const ABATIMENTO_USD = 20;     // dedução de US$ 20 na faixa de 60%

export function compute(i: Inputs): Outputs {
  const produtoUSD = Number(i.valorProdutoUSD) || 0;
  const freteUSD = Math.max(0, Number(i.freteUSD) || 0);
  const cotacao = Number(i.cotacaoDolar) || 0;
  let aliqICMS = Number(i.aliquotaICMS);
  if (!isFinite(aliqICMS) || aliqICMS <= 0) aliqICMS = 17;
  aliqICMS = Math.min(35, aliqICMS) / 100;

  if (produtoUSD <= 0 || cotacao <= 0) {
    return {
      valorAduaneiroBRL: '—', impostoImportacao: '—', icms: '—', totalImpostos: '—', custoFinal: '—', faixaAplicada: '—',
      detalhe: 'Informe o valor do produto em dólar e a cotação do dólar (R$).',
      _insight: { title: 'Faltam dados', text: 'Informe o **valor do produto (US$)** e a **cotação do dólar** para calcular II e ICMS.', tone: 'warn', icon: '⚠️' },
    };
  }

  const totalUSD = produtoUSD + freteUSD;         // valor aduaneiro em dólar
  const valorAduaneiroBRL = totalUSD * cotacao;

  // Imposto de Importação (II).
  let ii: number;
  let faixaAplicada: string;
  if (totalUSD <= LIMITE_USD_20) {
    ii = valorAduaneiroBRL * II_ATE_50;
    faixaAplicada = `Até US$ ${LIMITE_USD_20} — II de 20%`;
  } else {
    ii = valorAduaneiroBRL * II_ACIMA_50 - ABATIMENTO_USD * cotacao;
    if (ii < 0) ii = 0;
    faixaAplicada = `Acima de US$ ${LIMITE_USD_20} — II de 60% com abatimento de US$ 20`;
  }

  // ICMS "por dentro": incide sobre (valor aduaneiro + II) / (1 − alíquota).
  const baseICMS = (valorAduaneiroBRL + ii) / (1 - aliqICMS);
  const icms = baseICMS - (valorAduaneiroBRL + ii);

  const totalImpostos = ii + icms;
  const custoFinal = valorAduaneiroBRL + totalImpostos;

  const detalhe = `Valor aduaneiro US$ ${totalUSD.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} × ${fmtBRL(cotacao)} = ${fmtBRL(valorAduaneiroBRL)}. ${faixaAplicada}: II ${fmtBRL(ii)}. ICMS ${(aliqICMS * 100).toFixed(0)}% por dentro: ${fmtBRL(icms)}. Total de impostos ${fmtBRL(totalImpostos)}; custo final ${fmtBRL(custoFinal)}.`;

  return {
    valorAduaneiroBRL: fmtBRL(valorAduaneiroBRL),
    impostoImportacao: fmtBRL(ii),
    icms: fmtBRL(icms),
    totalImpostos: fmtBRL(totalImpostos),
    custoFinal: fmtBRL(custoFinal),
    faixaAplicada,
    detalhe,
    _insight: {
      title: `Impostos: ${fmtBRL(totalImpostos)}`,
      text: `Sua compra de US$ ${totalUSD.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} (${fmtBRL(valorAduaneiroBRL)}) paga **${fmtBRL(ii)}** de Imposto de Importação e **${fmtBRL(icms)}** de ICMS (${(aliqICMS * 100).toFixed(0)}%). O custo final chega a **${fmtBRL(custoFinal)}** — ${(totalImpostos / valorAduaneiroBRL * 100).toFixed(0)}% a mais que o valor do produto.`,
      tone: 'neutral',
      icon: '📦',
    },
    _chart: {
      type: 'bar',
      labels: ['Produto+frete', 'Imposto Importação', 'ICMS', 'Custo final'],
      values: [Math.round(valorAduaneiroBRL * 100) / 100, Math.round(ii * 100) / 100, Math.round(icms * 100) / 100, Math.round(custoFinal * 100) / 100],
      prefix: 'R$ ',
      ariaLabel: `Valor aduaneiro ${fmtBRL(valorAduaneiroBRL)}, II ${fmtBRL(ii)}, ICMS ${fmtBRL(icms)}, custo final ${fmtBRL(custoFinal)}.`,
    },
  };
}
