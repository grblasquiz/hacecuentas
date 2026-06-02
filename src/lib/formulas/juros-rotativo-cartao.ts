/**
 * Juros do rotativo do cartão de crédito — teto 8% ao mês desde Lei 14.690/2023.
 * Cálculo: saldoDevedor × (1 + 0,08)^meses + IOF diário 0,0082% (anual 0,38% sobre operações de crédito)
 *                                           + IOF adicional 0,38% sobre o valor financiado.
 */

export interface Inputs {
  saldoDevedor: number | string;
  mesesAtraso: number | string;
  taxaMensalRotativo?: number | string; // default 8%
  iofPct?: number | string;              // default 0.38
}

export interface Outputs {
  taxaMensalAplicada: string;
  taxaAnualEquivalente: string;
  juros: string;
  iofAdicional: string;
  iofDiario: string;
  totalDevido: string;
  custoEfetivoTotal: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function jurosRotativoCartao(i: Inputs): Outputs {
  const saldo = Number(i.saldoDevedor) || 0;
  const meses = Number(i.mesesAtraso) || 0;
  const taxaMes = Math.min(Number(i.taxaMensalRotativo ?? 8), 8) / 100; // teto legal
  const iofAdic = Number(i.iofPct ?? 0.38) / 100;

  if (saldo <= 0) throw new Error('Informe o saldo devedor.');
  if (meses <= 0) throw new Error('Informe os meses em atraso.');

  const valorComJuros = saldo * Math.pow(1 + taxaMes, meses);
  const juros = valorComJuros - saldo;
  const iofAdicValor = saldo * iofAdic;
  const dias = meses * 30;
  const iofDiarioPct = 0.000082; // 0,0082% ao dia
  const iofDiario = saldo * Math.min(dias, 365) * iofDiarioPct;
  const total = valorComJuros + iofAdicValor + iofDiario;
  const taxaAnual = (Math.pow(1 + taxaMes, 12) - 1) * 100;
  const cet = ((total / saldo - 1) / (meses / 12)) * 100;

  const iofTotal = iofAdicValor + iofDiario;
  const pctJuros = (juros / total) * 100;

  const _insight = {
    title: 'O custo do rotativo',
    text: `Uma dívida de **${brl(saldo)}** no rotativo por **${meses} ${meses === 1 ? 'mês' : 'meses'}** vira **${brl(total)}**: são **${brl(juros)}** de juros (${pctJuros.toFixed(0)}% do total) mais **${brl(iofTotal)}** de IOF, com CET de **${cet.toFixed(1)}% ao ano**. Quite o quanto antes ou troque por uma linha mais barata.`,
    tone: 'warn',
    icon: '💳',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Saldo original', value: Number(saldo.toFixed(2)) },
      { label: 'Juros', value: Number(juros.toFixed(2)) },
      { label: 'IOF', value: Number(iofTotal.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total devido',
    ariaLabel: `Composição do total devido de ${brl(total)}: saldo ${brl(saldo)}, juros ${brl(juros)} e IOF ${brl(iofTotal)}.`,
  };

  return {
    taxaMensalAplicada: (taxaMes * 100).toFixed(2) + '% am (teto Lei 14.690/2023)',
    taxaAnualEquivalente: taxaAnual.toFixed(2) + '% aa',
    juros: brl(juros),
    iofAdicional: brl(iofAdicValor),
    iofDiario: brl(iofDiario),
    totalDevido: brl(total),
    custoEfetivoTotal: cet.toFixed(2) + '% aa (CET anualizado)',
    resumen: `Saldo ${brl(saldo)} no rotativo por ${meses} meses a 8% am vira ${brl(total)} (juros ${brl(juros)} + IOF ${brl(iofAdicValor + iofDiario)}). CET ${cet.toFixed(1)}% aa.`,
    _insight,
    _chart,
  };
}
