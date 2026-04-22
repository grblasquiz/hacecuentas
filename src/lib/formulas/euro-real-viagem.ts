/**
 * Conversão EUR → BRL para viagem (espécie ou cartão pré-pago).
 * IOF espécie/pré-pago 1,1% em 2026 (redução gradual até 0% em 2028).
 * Cartão de crédito tem IOF 3,38%.
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

  const iofPct = tipo === 'credito' ? 3.38 : iofEspecie(ano);
  const brlBase = eur * cot;
  const spreadValor = brlBase * (spread / 100);
  const brlComSpread = brlBase + spreadValor;
  const iofValor = brlComSpread * (iofPct / 100);
  const total = brlComSpread + iofValor;
  const cotEfet = total / eur;
  const extra = total - brlBase;

  return {
    iofPctAplicada: iofPct.toFixed(2) + '% (' + (tipo === 'credito' ? 'cartão crédito' : 'espécie/pré-pago ' + ano) + ')',
    iofValor: brl(iofValor),
    spreadCasa: brl(spreadValor),
    cotacaoEfetiva: brl(cotEfet) + '/EUR',
    valorTotalBrl: brl(total),
    custoTotalExtra: brl(extra) + ' (' + ((extra / brlBase) * 100).toFixed(2) + '%)',
    resumen: `€${eur.toFixed(2)} a ${brl(cot)}/EUR em ${tipo}: custo total ${brl(total)} (IOF ${iofPct}% + spread ${spread}% = cotação efetiva ${brl(cotEfet)}/EUR).`,
  };
}
