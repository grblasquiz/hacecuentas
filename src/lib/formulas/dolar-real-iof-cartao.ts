/**
 * Conversão USD → BRL para compras no cartão de crédito internacional.
 * IOF 3,38% (Decreto 11.156/2022, alterações Decreto 10.997/2022) + spread banco.
 */

export interface Inputs {
  valorUsd: number | string;
  cotacaoDolar: number | string; // R$/USD cotação comercial
  spreadBanco?: number | string; // % ex: 4
  iofPct?: number | string;      // default 3.38
}

export interface Outputs {
  valorBrlSemEncargos: string;
  spreadBanco: string;
  iofValor: string;
  cotacaoEfetiva: string;
  valorFinalReais: string;
  custoExtraPct: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dolarRealIofCartao(i: Inputs): Outputs {
  const usd = Number(i.valorUsd) || 0;
  const cot = Number(i.cotacaoDolar) || 0;
  const spread = Number(i.spreadBanco ?? 4) || 0;
  const iofPct = Number(i.iofPct ?? 3.38) || 0;

  if (usd <= 0) throw new Error('Informe o valor em USD.');
  if (cot <= 0) throw new Error('Informe a cotação do dólar.');

  const brlBase = usd * cot;
  const brlComSpread = brlBase * (1 + spread / 100);
  const iofValor = brlComSpread * (iofPct / 100);
  const brlFinal = brlComSpread + iofValor;
  const cotEfet = brlFinal / usd;
  const custoExtra = (brlFinal / brlBase - 1) * 100;

  return {
    valorBrlSemEncargos: brl(brlBase),
    spreadBanco: brl(brlComSpread - brlBase),
    iofValor: brl(iofValor),
    cotacaoEfetiva: brl(cotEfet) + '/USD',
    valorFinalReais: brl(brlFinal),
    custoExtraPct: custoExtra.toFixed(2) + '%',
    resumen: `Compra de US$ ${usd.toFixed(2)} a ${brl(cot)}/USD = ${brl(brlFinal)} no cartão (IOF 3,38% + spread ${spread}% = ${custoExtra.toFixed(2)}% acima da cotação).`,
  };
}
