/**
 * Remessa pessoa física ao exterior — IOF câmbio 1,1% em 2026.
 * Redução gradual prevista: 1,1% (2026) → 0,88% (2027) → 0% (2028) conforme Decreto 10.997/2022.
 */

export interface Inputs {
  valorBrl: number | string;         // valor em reais a enviar
  cotacaoDolar: number | string;     // R$/USD
  spreadCasa?: number | string;      // % da casa de câmbio (default 2)
  anoRemessa?: number | string;      // 2026|2027|2028
}

export interface Outputs {
  iofPctAplicada: string;
  iofValor: string;
  spreadCasa: string;
  cotacaoEfetiva: string;
  valorUsdRecebido: string;
  custoTotalBrl: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function iofPorAno(ano: number): number {
  if (ano >= 2028) return 0.0;
  if (ano === 2027) return 0.88;
  return 1.1;
}

export function dolarRealIofRemessa(i: Inputs): Outputs {
  const brlInput = Number(i.valorBrl) || 0;
  const cot = Number(i.cotacaoDolar) || 0;
  const spread = Number(i.spreadCasa ?? 2) || 0;
  const ano = Number(i.anoRemessa ?? 2026) || 2026;

  if (brlInput <= 0) throw new Error('Informe o valor em reais a remeter.');
  if (cot <= 0) throw new Error('Informe a cotação do dólar.');

  const iofPct = iofPorAno(ano);
  const spreadValor = brlInput * (spread / 100);
  const iofValor = brlInput * (iofPct / 100);
  const brlDisponivel = brlInput - spreadValor - iofValor;
  const usdRecebido = brlDisponivel / cot;
  const cotEfet = brlInput / usdRecebido;

  const custoTotal = spreadValor + iofValor;
  const custoPct = brlInput > 0 ? (custoTotal / brlInput) * 100 : 0;
  const _insight = {
    title: 'Quanto chega lá fora',
    text: iofPct === 0
      ? `Enviando ${brl(brlInput)} em ${ano} (IOF já zerado), só o spread de ${spread}% pesa: você recebe **US$ ${usdRecebido.toFixed(2)}** e gasta **${brl(custoTotal)}** em custos (cotação efetiva **${brl(cotEfet)}/USD**).`
      : `Dos ${brl(brlInput)} enviados em ${ano}, **${brl(custoTotal)}** ficam em IOF (${iofPct}%) + spread (${spread}%) e você recebe **US$ ${usdRecebido.toFixed(2)}**. A cotação efetiva sobe para **${brl(cotEfet)}/USD**.`,
    tone: custoPct >= 3 ? 'warn' : 'neutral',
    icon: '🌐',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Vira dólar', value: Number(brlDisponivel.toFixed(2)) },
      { label: `Spread casa (${spread}%)`, value: Number(spreadValor.toFixed(2)) },
      { label: `IOF (${iofPct}%)`, value: Number(iofValor.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(brlInput),
    centerLabel: 'Reais enviados',
    ariaLabel: `Dos ${brl(brlInput)} enviados, ${brl(brlDisponivel)} viram dólar, ${brl(spreadValor)} são o spread da casa e ${brl(iofValor)} de IOF.`,
  };
  return {
    iofPctAplicada: iofPct.toFixed(2) + '% (IOF câmbio ' + ano + ')',
    iofValor: brl(iofValor),
    spreadCasa: brl(spreadValor),
    cotacaoEfetiva: brl(cotEfet) + '/USD',
    valorUsdRecebido: 'US$ ' + usdRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    custoTotalBrl: brl(custoTotal),
    resumen: `Remessa de ${brl(brlInput)} em ${ano}: IOF ${iofPct}% + spread ${spread}% = você recebe US$ ${usdRecebido.toFixed(2)} (cotação efetiva ${brl(cotEfet)}/USD).`,
    _insight,
    _chart,
  };
}
