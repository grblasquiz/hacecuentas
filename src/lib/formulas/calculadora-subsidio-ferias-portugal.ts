/**
 * Subsídio de férias Portugal 2026 — bruto vs líquido.
 * O subsídio de férias = 1 mês de retribuição base (art. 264.º CT), pago em geral antes das férias.
 * É tributado: desconta 11 % de Segurança Social + retenção de IRS (taxa marginal do escalão).
 * Não fixa taxas: tudo vem de portugal-2026.ts.
 * IRS do subsídio = retenção marginal: IRS anual com o subsídio − IRS anual sem ele (o 14.º mês).
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  segSocialTrabalhador,
  irsTrabalhoDependenteAnual,
} from '../data/portugal-2026.ts';

export interface Inputs {
  retribuicao: number; // retribuição base mensal (= valor do subsídio integral)
  meses?: number;      // meses de trabalho no ano civil para proporcional (default 12 = integral)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraSubsidioFeriasPortugal(i: Inputs): Outputs {
  const retribuicao = Number(i.retribuicao) || 0;
  if (retribuicao <= 0) throw new Error('Introduza a sua retribuição base mensal');

  // Proporcional: o subsídio de férias vence-se na proporção dos meses de serviço no ano.
  let meses = i.meses == null ? 12 : Number(i.meses);
  if (!Number.isFinite(meses) || meses < 0) meses = 12;
  meses = Math.min(12, meses);
  const proporcao = meses / 12;

  const subsidioBruto = retribuicao * proporcao;

  // Segurança Social: 11 % sobre o subsídio.
  const ss = segSocialTrabalhador(subsidioBruto);

  // IRS marginal sobre o subsídio: diferença entre o IRS anual COM o subsídio (14 meses)
  // e SEM ele (13 meses), mantendo a SS proporcional de cada cenário.
  const ssMensal = segSocialTrabalhador(retribuicao);
  const irs14 = irsTrabalhoDependenteAnual(retribuicao * 13 + subsidioBruto, ssMensal * 13 + ss);
  const irs13 = irsTrabalhoDependenteAnual(retribuicao * 13, ssMensal * 13);
  const irs = Math.max(0, irs14 - irs13);

  const liquido = subsidioBruto - ss - irs;

  const taxaSsPct = (PORTUGAL_2026.segSocial.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const efetivoPct = subsidioBruto > 0 ? ((subsidioBruto - liquido) / subsidioBruto) * 100 : 0;
  const efetivoStr = efetivoPct.toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const proporcText = meses < 12 ? ` (proporcional a ${meses} ${meses === 1 ? 'mês' : 'meses'} de serviço)` : '';

  const _insight = {
    title: 'Subsídio de férias',
    text:
      `Com uma retribuição de **${fmtEUR(retribuicao)}**, o subsídio de férias bruto é de **${fmtEUR(subsidioBruto)}**${proporcText}. ` +
      `Depois de **${fmtEUR(ss)}** de Segurança Social (${taxaSsPct} %)` +
      (irs > 0 ? ` e **${fmtEUR(irs)}** de IRS` : ' (sem retenção de IRS)') +
      `, recebe **${fmtEUR(liquido)}** líquidos.`,
    tone: 'good',
    icon: '🏖️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido', value: Math.round(liquido) },
      { label: 'Segurança Social', value: Math.round(ss) },
      { label: 'IRS', value: Math.round(irs) },
    ].filter((s) => s.value > 0),
    prefix: '',
    suffix: ' €',
    centerValue: fmtEUR(subsidioBruto),
    centerLabel: 'Subsídio bruto',
    ariaLabel: `Subsídio bruto ${fmtEUR(subsidioBruto)}: líquido ${fmtEUR(liquido)}, Segurança Social ${fmtEUR(ss)}, IRS ${fmtEUR(irs)}.`,
  };

  const _table = {
    title: `Subsídio de férias sobre ${fmtEUR(retribuicao)} de retribuição`,
    headers: ['Conceito', 'Taxa', 'Montante'],
    rows: [
      ['Subsídio bruto', meses < 12 ? `${meses}/12` : '1 mês', fmtEUR(subsidioBruto)],
      ['Segurança Social', `${taxaSsPct} %`, `− ${fmtEUR(ss)}`],
      ['Retenção de IRS', irs > 0 ? 'marginal' : '0 %', `− ${fmtEUR(irs)}`],
      ['Subsídio líquido', `desconto ${efetivoStr} %`, fmtEUR(liquido)],
    ],
    note: 'O subsídio de férias é tributado como rendimento de trabalho (Segurança Social + IRS), à parte do salário do mês.',
  };

  return {
    liquido: fmtEUR(liquido),
    bruto: fmtEUR(subsidioBruto),
    segSocial: `${fmtEUR(ss)} (${taxaSsPct} %)`,
    irs: fmtEUR(irs),
    descontoTotal: `${fmtEUR(subsidioBruto - liquido)} (${efetivoStr} %)`,
    detalhe:
      `Subsídio bruto ${fmtEUR(subsidioBruto)} − Segurança Social ${fmtEUR(ss)}` +
      (irs > 0 ? ` − IRS ${fmtEUR(irs)}` : '') +
      ` = líquido ${fmtEUR(liquido)}.`,
    _insight,
    _chart,
    _table,
  };
}
