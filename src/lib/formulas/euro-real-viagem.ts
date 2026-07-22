/**
 * Conversão EUR → BRL para viagem (espécie ou cartão pré-pago).
 * IOF espécie/pré-pago 1,1% em 2026 (redução gradual até 0% em 2028).
 * Cartão de crédito tem IOF 3,50%.
 */

export interface Inputs {
  valorEur: number | string;
  cotacaoEuro: number | string;  // R$/EUR
  tipoCambio: string;            // 'especie' | 'prepago' | 'credito'
  spreadCasa?: number | string;  // %
  anoViagem?: number | string;
}

export interface Outputs {
  iofPctAplicada: string;
  iofValor: string;
  spreadCasa: string;
  cotacaoEfetiva: string;
  valorTotalBrl: string;
  custoTotalExtra: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function iofEspecie(ano: number): number {
  if (ano >= 2028) return 0.0;
  if (ano === 2027) return 0.88;
  return 1.1;
}

export function euroRealViagem(i: Inputs): Outputs {
  const eur = Number(i.valorEur) || 0;
  const cot = Number(i.cotacaoEuro) || 0;
  const tipo = (i.tipoCambio || 'especie').toString().toLowerCase();
  const spread = Number(i.spreadCasa ?? 3) || 0;
  const ano = Number(i.anoViagem ?? 2026) || 2026;

  if (eur <= 0) throw new Error('Informe o valor em euros.');
  if (cot <= 0) throw new Error('Informe a cotação do euro.');

  const iofPct = tipo === 'credito' ? 3.50 : iofEspecie(ano);
  const brlBase = eur * cot;
  const spreadValor = brlBase * (spread / 100);
  const brlComSpread = brlBase + spreadValor;
  const iofValor = brlComSpread * (iofPct / 100);
  const total = brlComSpread + iofValor;
  const cotEfet = total / eur;
  const extra = total - brlBase;
  const extraPct = (extra / brlBase) * 100;

  const _insight = (() => {
    const tipoLabel = tipo === 'credito' ? 'cartão de crédito' : 'espécie/pré-pago';
    if (tipo === 'credito') {
      return {
        title: 'Cartão de crédito custa mais caro',
        text: `No **${tipoLabel}** o IOF é de **3,50%**: você paga **${brl(extra)}** a mais (**${extraPct.toFixed(1)}%**) sobre a conversão. Em espécie ou pré-pago o IOF cai para ${iofEspecie(ano).toFixed(2)}% e a viagem sai bem mais barata.`,
        tone: 'warn',
        icon: '💳',
      };
    }
    if (extraPct >= 4) {
      return {
        title: 'Atenção ao spread da casa de câmbio',
        text: `Em **${tipoLabel}** o custo extra é **${brl(extra)}** (**${extraPct.toFixed(1)}%**), puxado pelo spread de **${spread}%**. Cotação efetiva: **${brl(cotEfet)}/EUR**. Comparar casas de câmbio pode reduzir esse valor.`,
        tone: 'warn',
        icon: '💶',
      };
    }
    return {
      title: 'Custo extra sob controle',
      text: `Em **${tipoLabel}** você paga só **${brl(extra)}** a mais (**${extraPct.toFixed(1)}%**) sobre a conversão, com cotação efetiva de **${brl(cotEfet)}/EUR**. IOF de ${iofPct.toFixed(2)}% + spread de ${spread}%.`,
      tone: 'good',
      icon: '💶',
    };
  })();

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Conversão (câmbio)', value: Number(brlBase.toFixed(2)) },
      { label: `Spread casa (${spread}%)`, value: Number(spreadValor.toFixed(2)) },
      { label: `IOF (${iofPct.toFixed(2)}%)`, value: Number(iofValor.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total',
    ariaLabel: `Composição do custo total de ${brl(total)}: conversão ${brl(brlBase)}, spread ${brl(spreadValor)} e IOF ${brl(iofValor)}.`,
  };

  return {
    iofPctAplicada: iofPct.toFixed(2) + '% (' + (tipo === 'credito' ? 'cartão crédito' : 'espécie/pré-pago ' + ano) + ')',
    iofValor: brl(iofValor),
    spreadCasa: brl(spreadValor),
    cotacaoEfetiva: brl(cotEfet) + '/EUR',
    valorTotalBrl: brl(total),
    custoTotalExtra: brl(extra) + ' (' + ((extra / brlBase) * 100).toFixed(2) + '%)',
    resumen: `€${eur.toFixed(2)} a ${brl(cot)}/EUR em ${tipo}: custo total ${brl(total)} (IOF ${iofPct}% + spread ${spread}% = cotação efetiva ${brl(cotEfet)}/EUR).`,
    _insight,
    _chart,
  };
}
