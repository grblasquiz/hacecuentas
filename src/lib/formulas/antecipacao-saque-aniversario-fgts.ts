// Antecipação do saque-aniversário do FGTS — o banco adianta HOJE o valor de
// vários saques-aniversário FUTUROS, descontando juros. Você recebe um valor
// líquido agora e, a cada ano, o FGTS paga seu saque-aniversário direto ao banco.
// Distinto do cálculo do saque-aniversário em si: aqui comparamos o valor
// liberado (valor presente descontado) com o total dos saques que você abre mão.
//
//   saque anual = tabela do saque-aniversário sobre o saldo
//   valor liberado = Σ (saque anual ÷ (1 + i_anual)^k), k = 1..N
//   total antecipado (nominal) = saque anual × N
//   custo (juros) = total antecipado − valor liberado

export interface Inputs {
  saldoFgts: number;
  numeroAnos?: number;       // quantos saques anuais antecipar (padrão 5)
  jurosMensal?: number;      // taxa do banco em % a.m. (padrão 1,8)
}

export interface Outputs {
  valorLiberado: string;
  saqueAnual: string;
  totalAntecipado: string;
  custoJuros: string;
  taxaAnual: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

interface Faixa { ate: number; aliquota: number; adicional: number; }
const TABELA: Faixa[] = [
  { ate: 500, aliquota: 0.5, adicional: 0 },
  { ate: 1000, aliquota: 0.4, adicional: 50 },
  { ate: 5000, aliquota: 0.3, adicional: 150 },
  { ate: 10000, aliquota: 0.2, adicional: 650 },
  { ate: 15000, aliquota: 0.15, adicional: 1150 },
  { ate: 20000, aliquota: 0.1, adicional: 1900 },
  { ate: Infinity, aliquota: 0.05, adicional: 2900 },
];

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  const saldo = Math.max(0, Number(i.saldoFgts) || 0);
  if (saldo <= 0) throw new Error('Informe um saldo de FGTS válido (maior que zero).');
  let anos = Math.floor(Number(i.numeroAnos));
  if (!isFinite(anos) || anos < 1) anos = 5;
  if (anos > 10) anos = 10;
  let jurosMes = Number(i.jurosMensal);
  if (!isFinite(jurosMes) || jurosMes < 0) jurosMes = 1.8;

  const faixa = TABELA.find((f) => saldo <= f.ate)!;
  const saqueAnual = saldo * faixa.aliquota + faixa.adicional;

  const iAnual = Math.pow(1 + jurosMes / 100, 12) - 1;
  let valorLiberado = 0;
  for (let k = 1; k <= anos; k++) {
    valorLiberado += saqueAnual / Math.pow(1 + iAnual, k);
  }
  const totalAntecipado = saqueAnual * anos;
  const custoJuros = totalAntecipado - valorLiberado;

  const detalhe =
    `Saque-aniversário anual sobre ${brl(saldo)}: ${brl(saqueAnual)} (${(faixa.aliquota * 100).toFixed(0)}% + adicional ${brl(faixa.adicional)}). ` +
    `Antecipando ${anos} anos a ${jurosMes.toLocaleString('pt-BR')}% a.m. (${(iAnual * 100).toFixed(1)}% a.a.), ` +
    `o banco libera ${brl(valorLiberado)} hoje. Você abre mão de ${brl(totalAntecipado)} em saques — custo de ${brl(custoJuros)} em juros.`;

  return {
    valorLiberado: brl(valorLiberado),
    saqueAnual: brl(saqueAnual),
    totalAntecipado: brl(totalAntecipado),
    custoJuros: brl(custoJuros),
    taxaAnual: `${(iAnual * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% a.a.`,
    detalhe,
    _insight: {
      title: `Você recebe ${brl(valorLiberado)} hoje`,
      text:
        `Antecipando **${anos}** saques-aniversário (de ${brl(saqueAnual)}/ano), o banco libera **${brl(valorLiberado)}** agora. ` +
        `Mas você entrega **${brl(totalAntecipado)}** em saques futuros: o custo dos juros é **${brl(custoJuros)}** ` +
        `(${((custoJuros / valorLiberado) * 100).toFixed(0)}% sobre o valor recebido). Só vale a pena se você **precisa do dinheiro agora** e não acha crédito mais barato.`,
      tone: 'warn',
      icon: '🎂',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Você recebe hoje', value: Number(valorLiberado.toFixed(2)) },
        { label: 'Juros (custo)', value: Number(custoJuros.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(totalAntecipado),
      centerLabel: 'Saques cedidos',
      ariaLabel: `De ${brl(totalAntecipado)} em saques futuros, você recebe ${brl(valorLiberado)} hoje e paga ${brl(custoJuros)} de juros.`,
    },
  };
}
