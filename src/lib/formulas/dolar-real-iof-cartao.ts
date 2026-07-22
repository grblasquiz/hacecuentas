/**
 * Conversão USD → BRL para compras no cartão de crédito internacional.
 * IOF 3,50% (unificado em 2025 — vigente 2026, alterações Decreto 10.997/2022) + spread banco.
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
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dolarRealIofCartao(i: Inputs): Outputs {
  const usd = Number(i.valorUsd) || 0;
  const cot = Number(i.cotacaoDolar) || 0;
  const spread = Number(i.spreadBanco ?? 4) || 0;
  const iofPct = Number(i.iofPct ?? 3.50) || 0;

  if (usd <= 0) throw new Error('Informe o valor em USD.');
  if (cot <= 0) throw new Error('Informe a cotação do dólar.');

  const brlBase = usd * cot;
  const brlComSpread = brlBase * (1 + spread / 100);
  const iofValor = brlComSpread * (iofPct / 100);
  const brlFinal = brlComSpread + iofValor;
  const cotEfet = brlFinal / usd;
  const custoExtra = (brlFinal / brlBase - 1) * 100;

  const spreadValor = brlComSpread - brlBase;
  const _insight = {
    title: 'O custo real no cartão',
    text: `Sua compra de US$ ${usd.toFixed(2)} vira **${brl(brlFinal)}** na fatura: **${brl(spreadValor + iofValor)}** a mais que a cotação comercial (**${custoExtra.toFixed(2)}%**). A cotação efetiva do seu dólar fica em **${brl(cotEfet)}/USD**.`,
    tone: custoExtra >= 6 ? 'warn' : 'neutral',
    icon: '💳',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Valor na cotação', value: Number(brlBase.toFixed(2)) },
      { label: `Spread banco (${spread}%)`, value: Number(spreadValor.toFixed(2)) },
      { label: `IOF (${iofPct}%)`, value: Number(iofValor.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(brlFinal),
    centerLabel: 'Total na fatura',
    ariaLabel: `Dos ${brl(brlFinal)} cobrados, ${brl(brlBase)} são a cotação comercial, ${brl(spreadValor)} o spread do banco e ${brl(iofValor)} de IOF.`,
  };
  return {
    valorBrlSemEncargos: brl(brlBase),
    spreadBanco: brl(spreadValor),
    iofValor: brl(iofValor),
    cotacaoEfetiva: brl(cotEfet) + '/USD',
    valorFinalReais: brl(brlFinal),
    custoExtraPct: custoExtra.toFixed(2) + '%',
    resumen: `Compra de US$ ${usd.toFixed(2)} a ${brl(cot)}/USD = ${brl(brlFinal)} no cartão (IOF 3,50% + spread ${spread}% = ${custoExtra.toFixed(2)}% acima da cotação).`,
    _insight,
    _chart,
  };
}
