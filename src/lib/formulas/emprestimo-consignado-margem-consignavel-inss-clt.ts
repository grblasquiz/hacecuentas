// Empréstimo consignado — margem consignável (INSS, CLT e servidor).
// A lei limita o total descontado em folha a 45% da renda:
//   - 35% para parcelas de empréstimo consignado;
//   - 5% para o cartão de crédito consignado;
//   - 5% para o cartão benefício (aposentados/pensionistas do INSS).
// A calculadora mostra a margem disponível e, a partir de uma taxa de juros
// mensal e um prazo, estima o valor de empréstimo que cabe nessa margem
// (tabela Price: PV = parcela × [1 − (1+i)^−n] ÷ i). A taxa é editável — os
// tetos de juros são definidos pelo CNPS (INSS) e pelos bancos.

export interface Inputs {
  rendaLiquida: number;      // R$ (benefício ou salário líquido)
  margemPercentual?: number; // % destinado ao empréstimo (padrão 35)
  incluirCartoes?: string;   // 'sim' soma 5% cartão consignado + 5% cartão benefício
  taxaJurosMensal?: number;  // % a.m. (opcional, para estimar o valor liberado)
  prazoMeses?: number;       // nº de parcelas (opcional)
}
export interface Outputs {
  margemEmprestimo: string;
  margemCartoes: string;
  margemTotal: string;
  parcelaMaxima: string;
  valorEmprestimoEstimado: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const renda = Number(i.rendaLiquida) || 0;
  let margemPct = Number(i.margemPercentual);
  if (!isFinite(margemPct) || margemPct <= 0) margemPct = 35;
  margemPct = Math.min(45, margemPct) / 100;
  const incluirCartoes = String(i.incluirCartoes) === 'sim';
  const taxa = Math.max(0, Number(i.taxaJurosMensal) || 0) / 100;
  const prazo = Math.max(0, Math.floor(Number(i.prazoMeses) || 0));

  if (renda <= 0) {
    return {
      margemEmprestimo: '—', margemCartoes: '—', margemTotal: '—', parcelaMaxima: '—', valorEmprestimoEstimado: '—',
      detalhe: 'Informe sua renda líquida mensal (benefício do INSS ou salário).',
      _insight: { title: 'Falta a renda', text: 'Informe sua **renda líquida mensal** para calcular a margem consignável.', tone: 'warn', icon: '⚠️' },
    };
  }

  const margemEmprestimo = renda * margemPct;         // 35% padrão
  const margemCartoes = incluirCartoes ? renda * 0.10 : 0; // 5% + 5%
  const margemTotal = margemEmprestimo + margemCartoes;

  // A parcela máxima do empréstimo (a que estima o valor liberado) usa só a
  // fatia de empréstimo (35%), pois os cartões consignados não são parcela fixa.
  const parcelaMax = margemEmprestimo;

  let valorEstimado = 0;
  if (taxa > 0 && prazo > 0) {
    // Valor presente de uma série de parcelas iguais (tabela Price).
    valorEstimado = parcelaMax * (1 - Math.pow(1 + taxa, -prazo)) / taxa;
  } else if (prazo > 0) {
    // Sem juros informados: soma simples das parcelas.
    valorEstimado = parcelaMax * prazo;
  }

  const detalhe = `Sobre renda de ${fmtBRL(renda)}: margem de empréstimo ${(margemPct * 100).toFixed(0)}% = ${fmtBRL(margemEmprestimo)}` +
    (incluirCartoes ? ` + 10% de cartões (${fmtBRL(margemCartoes)}) → margem total ${fmtBRL(margemTotal)}` : `.`) +
    (valorEstimado > 0 ? ` Com parcela de ${fmtBRL(parcelaMax)}${taxa > 0 ? ` a ${(taxa * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% a.m.` : ''} em ${prazo}x, o empréstimo estimado é ${fmtBRL(valorEstimado)}.` : '');

  return {
    margemEmprestimo: fmtBRL(margemEmprestimo),
    margemCartoes: incluirCartoes ? fmtBRL(margemCartoes) : '—',
    margemTotal: fmtBRL(margemTotal),
    parcelaMaxima: fmtBRL(parcelaMax),
    valorEmprestimoEstimado: valorEstimado > 0 ? fmtBRL(valorEstimado) : '—',
    detalhe,
    _insight: {
      title: `Margem de empréstimo: ${fmtBRL(margemEmprestimo)}`,
      text: `Com renda de **${fmtBRL(renda)}**, a parcela do consignado pode chegar a **${fmtBRL(margemEmprestimo)}** (${(margemPct * 100).toFixed(0)}%).` +
        (valorEstimado > 0 ? ` Isso equivale a um empréstimo de aproximadamente **${fmtBRL(valorEstimado)}** em ${prazo} parcelas.` : ' Informe taxa e prazo para estimar o valor liberado.'),
      tone: 'good',
      icon: '💳',
    },
    _chart: {
      type: 'bar',
      labels: incluirCartoes ? ['Margem empréstimo', 'Margem cartões', 'Margem total'] : ['Margem empréstimo', 'Renda'],
      values: incluirCartoes
        ? [Math.round(margemEmprestimo * 100) / 100, Math.round(margemCartoes * 100) / 100, Math.round(margemTotal * 100) / 100]
        : [Math.round(margemEmprestimo * 100) / 100, Math.round(renda * 100) / 100],
      prefix: 'R$ ',
      ariaLabel: `Margem de empréstimo ${fmtBRL(margemEmprestimo)} sobre renda ${fmtBRL(renda)}.`,
    },
  };
}
