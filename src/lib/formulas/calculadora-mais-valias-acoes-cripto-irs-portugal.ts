/**
 * Mais-valias de ações, ETF e criptoativos — IRS (Portugal, residentes, 2026).
 * Mobiliário (ações/ETF): 100 % da mais-valia tributada à taxa autónoma de 28 %
 *   (art. 72.º CIRS), com opção de englobamento. Criptoativos: detidos < 365 dias
 *   → tributados a 28 %; detidos ≥ 365 dias → ISENTOS (salvo casos especiais).
 * Usa a taxa autónoma de portugal-2026.ts (28 %). fmtEUR do mesmo módulo.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  valorVenda: number;           // valor de venda/realização (€)
  valorCompra: number;          // valor de aquisição (€)
  despesas?: number;            // comissões de compra/venda (€)
  tipoAtivo?: string;           // 'acoes' | 'etf' | 'cripto'
  diasDetencao?: number;        // dias de detenção (relevante para cripto)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const venda = Math.max(0, Number(i.valorVenda) || 0);
  const compra = Math.max(0, Number(i.valorCompra) || 0);
  const despesas = Math.max(0, Number(i.despesas) || 0);
  const tipo = String(i.tipoAtivo || 'acoes');
  const dias = Math.max(0, Math.floor(Number(i.diasDetencao) || 0));
  if (venda <= 0) throw new Error('Indique o valor de venda');
  if (compra <= 0) throw new Error('Indique o valor de aquisição');

  const taxa = PORTUGAL_2026.irs.taxaAutonomaMaisValias; // 0,28
  const maisValia = Math.max(0, venda - compra - despesas);
  const isCripto = tipo === 'cripto';
  const criptoIsento = isCripto && dias >= 365;

  const baseTributavel = criptoIsento ? 0 : maisValia;
  const irs = baseTributavel * taxa;
  const liquido = venda - compra - despesas - irs;
  const taxaEfetiva = maisValia > 0 ? (irs / maisValia) * 100 : 0;

  const nomeAtivo = tipo === 'etf' ? 'ETF' : isCripto ? 'criptoativos' : 'ações';

  const _table = {
    title: 'Cálculo da mais-valia e do IRS',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Valor de venda', fmtEUR(venda)],
      ['(−) Valor de aquisição', `− ${fmtEUR(compra)}`],
      ['(−) Despesas/comissões', `− ${fmtEUR(despesas)}`],
      ['Mais-valia', fmtEUR(maisValia)],
      ['Base tributável', criptoIsento ? '0 € (cripto ≥ 365 dias: isento)' : fmtEUR(baseTributavel)],
      ['IRS (28 % autónoma)', `− ${fmtEUR(irs)}`],
      ['Encaixe líquido', fmtEUR(liquido)],
    ],
    note: 'Ações/ETF: mais-valia tributada a 28 % (com opção de englobamento). Cripto: isento se detido ≥ 365 dias; a 28 % se < 365 dias. Menos-valias podem compensar mais-valias.',
  };

  const _insight = {
    title: criptoIsento
      ? 'Cripto detido ≥ 1 ano: isento de IRS'
      : `IRS de ${fmtEUR(irs)} sobre a mais-valia`,
    text: criptoIsento
      ? `Como deteve os **criptoativos ${dias} dias** (≥ 365), a mais-valia de **${fmtEUR(maisValia)}** está **isenta de IRS**. Encaixa **${fmtEUR(liquido)}** limpos.`
      : `A mais-valia com **${nomeAtivo}** é **${fmtEUR(maisValia)}**. À taxa autónoma de **28 %**, o IRS é **${fmtEUR(irs)}**, ficando **${fmtEUR(liquido)}** líquidos. ` +
        (isCripto ? `Se tivesse detido ≥ 365 dias, ficaria isento. ` : `Pode optar pelo englobamento se a sua taxa marginal for inferior a 28 %. `) +
        `Menos-valias do ano podem reduzir o imposto.`,
    tone: criptoIsento ? 'good' : 'warn',
    icon: '📈',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital investido', value: Math.round(compra + despesas) },
      { label: 'Mais-valia líquida', value: Math.round(maisValia - irs) },
      { label: 'IRS', value: Math.round(irs) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(liquido),
    centerLabel: 'Líquido',
    ariaLabel: `Venda ${fmtEUR(venda)}: mais-valia líquida ${fmtEUR(maisValia - irs)}, IRS ${fmtEUR(irs)}.`,
  };

  return {
    maisValia: fmtEUR(maisValia),
    irs: fmtEUR(irs),
    taxa: criptoIsento ? '0 % (isento)' : '28 %',
    taxaEfetiva: `${taxaEfetiva.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`,
    liquido: fmtEUR(liquido),
    detalhe: criptoIsento
      ? `Cripto detido ${dias} dias (≥ 365): mais-valia ${fmtEUR(maisValia)} isenta. Líquido ${fmtEUR(liquido)}.`
      : `Mais-valia ${fmtEUR(maisValia)} × 28 % = ${fmtEUR(irs)} de IRS. Líquido ${fmtEUR(liquido)}.`,
    _insight,
    _table,
    _chart,
  };
}
