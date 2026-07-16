/**
 * Amortização antecipada de crédito habitação (Portugal) — vale a pena?
 * Compara os juros que se poupam ao amortizar capital antecipadamente contra a
 * comissão de reembolso antecipado (0,25 % taxa variável / 0,5 % taxa fixa).
 * Duas estratégias: reduzir o PRAZO (mantém prestação) ou reduzir a PRESTAÇÃO
 * (mantém prazo). PMT calculado aqui; fmtEUR vem de portugal-2026.ts.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  capitalEmDivida: number;      // capital em dívida atual (€)
  taxaAnual: number;            // TAN anual (%)
  prazoRestanteAnos: number;    // prazo restante (anos)
  valorAmortizar: number;       // valor a amortizar antecipadamente (€)
  tipoTaxa?: string;            // 'variavel' (comissão 0,5 %) — nota: variável tem sido 0 %; usamos 0,5 %? ver abaixo
  estrategia?: string;          // 'prazo' (reduz prazo) | 'prestacao' (reduz prestação)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

function pmt(capital: number, iMens: number, n: number): number {
  if (n <= 0) return capital;
  if (iMens === 0) return capital / n;
  return capital * (iMens * Math.pow(1 + iMens, n)) / (Math.pow(1 + iMens, n) - 1);
}

export function compute(i: Inputs): Outputs {
  const capital = Math.max(0, Number(i.capitalEmDivida) || 0);
  const tan = Math.max(0, Number(i.taxaAnual) || 0);
  const prazoAnos = Math.max(1, Number(i.prazoRestanteAnos) || 1);
  const amortizar = Math.max(0, Number(i.valorAmortizar) || 0);
  const tipoTaxa = String(i.tipoTaxa || 'variavel');
  const estrategia = String(i.estrategia || 'prazo');
  if (capital <= 0) throw new Error('Indique o capital em dívida');
  if (amortizar <= 0) throw new Error('Indique o valor a amortizar');

  const amort = Math.min(amortizar, capital);
  const iMens = tan / 100 / 12;
  const n = Math.round(prazoAnos * 12);

  const prestacaoAtual = pmt(capital, iMens, n);
  const jurosAntes = prestacaoAtual * n - capital;
  const novoCapital = capital - amort;

  let jurosDepois = 0;
  let novaPrestacao = prestacaoAtual;
  let novoPrazoMeses = n;

  if (estrategia === 'prestacao') {
    // Mantém o prazo, baixa a prestação.
    novaPrestacao = pmt(novoCapital, iMens, n);
    jurosDepois = novaPrestacao * n - novoCapital;
    novoPrazoMeses = n;
  } else {
    // Mantém a prestação, encurta o prazo (poupa mais juros).
    if (iMens > 0 && prestacaoAtual > novoCapital * iMens) {
      novoPrazoMeses = Math.ceil(
        Math.log(prestacaoAtual / (prestacaoAtual - novoCapital * iMens)) / Math.log(1 + iMens)
      );
    } else {
      novoPrazoMeses = Math.ceil(novoCapital / prestacaoAtual);
    }
    jurosDepois = prestacaoAtual * novoPrazoMeses - novoCapital;
    novaPrestacao = prestacaoAtual;
  }

  const jurosPoupados = Math.max(0, jurosAntes - jurosDepois);
  // Comissão de reembolso antecipado: 0,5 % taxa fixa; 0,25 % taxa variável.
  const percComissao = tipoTaxa === 'fixa' ? 0.005 : 0.0025;
  const comissao = amort * percComissao;
  const poupancaLiquida = jurosPoupados - comissao;
  const mesesReduzidos = n - novoPrazoMeses;

  const _table = {
    title: estrategia === 'prazo' ? 'Amortizar reduzindo o prazo' : 'Amortizar reduzindo a prestação',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Capital em dívida', fmtEUR(capital)],
      ['Prestação atual', fmtEUR(prestacaoAtual)],
      ['Valor amortizado', fmtEUR(amort)],
      ...(estrategia === 'prestacao'
        ? [['Nova prestação', fmtEUR(novaPrestacao)] as [string, string]]
        : [['Prazo poupado', `${mesesReduzidos} meses (${(mesesReduzidos / 12).toLocaleString('de-DE', { maximumFractionDigits: 1 })} anos)`] as [string, string]]),
      ['Juros poupados', fmtEUR(jurosPoupados)],
      [`Comissão (${(percComissao * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} %)`, `− ${fmtEUR(comissao)}`],
      ['Poupança líquida', fmtEUR(poupancaLiquida)],
    ],
    note: 'Comissão de reembolso antecipado: 0,5 % (taxa fixa) / 0,25 % (taxa variável). Reduzir o prazo poupa mais juros do que reduzir a prestação. Cálculo orientativo.',
  };

  const _insight = {
    title: `Poupa ${fmtEUR(poupancaLiquida)} líquidos ao amortizar ${fmtEUR(amort)}`,
    text: `Amortizando **${fmtEUR(amort)}** ${estrategia === 'prazo' ? 'e mantendo a prestação' : 'e mantendo o prazo'}, poupa **${fmtEUR(jurosPoupados)}** em juros. ` +
      `Descontando a comissão de reembolso (${(percComissao * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })} % = ${fmtEUR(comissao)}), a **poupança líquida** é **${fmtEUR(poupancaLiquida)}**. ` +
      (estrategia === 'prazo'
        ? `O crédito fica **${mesesReduzidos} meses** mais curto.`
        : `A prestação desce de ${fmtEUR(prestacaoAtual)} para **${fmtEUR(novaPrestacao)}**.`) +
      ` Reduzir o prazo costuma poupar mais juros do que reduzir a prestação.`,
    tone: poupancaLiquida > 0 ? 'good' : 'warn',
    icon: '🏠',
  };

  const _chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Juros sem amortizar', value: Math.round(jurosAntes) },
      { label: 'Juros após amortizar', value: Math.round(jurosDepois) },
    ],
    prefix: '€ ',
    ariaLabel: `Juros totais descem de ${fmtEUR(jurosAntes)} para ${fmtEUR(jurosDepois)} ao amortizar ${fmtEUR(amort)}.`,
  };

  return {
    poupancaLiquida: fmtEUR(poupancaLiquida),
    jurosPoupados: fmtEUR(jurosPoupados),
    comissao: fmtEUR(comissao),
    resultado: estrategia === 'prazo'
      ? `Prazo −${mesesReduzidos} meses`
      : `Prestação ${fmtEUR(novaPrestacao)}`,
    detalhe: `Amortizar ${fmtEUR(amort)} poupa ${fmtEUR(jurosPoupados)} de juros − ${fmtEUR(comissao)} de comissão = ${fmtEUR(poupancaLiquida)} líquidos${estrategia === 'prazo' ? ` (menos ${mesesReduzidos} meses)` : ` (prestação ${fmtEUR(novaPrestacao)})`}.`,
    _insight,
    _table,
    _chart,
  };
}
