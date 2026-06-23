/**
 * Salário anual (14 meses) Portugal 2026 — do bruto mensal ao total anual, bruto e líquido.
 * Anual bruto = bruto mensal × 14. Anual líquido = bruto anual − Segurança Social (11 %) − IRS anual.
 * Não fixa taxas: tudo vem de portugal-2026.ts.
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  segSocialTrabalhador,
  irsTrabalhoDependenteAnual,
  salarioLiquido,
} from '../data/portugal-2026.ts';

export interface Inputs {
  bruto: number;
  jovem?: string; // 'nao' | 'sim' (IRS Jovem 1.º ano)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraSalarioAnual14MesesPortugal(i: Inputs): Outputs {
  const bruto = Number(i.bruto) || 0;
  if (bruto <= 0) throw new Error('Introduza o seu salário bruto mensal');

  const meses = PORTUGAL_2026.subsidios.totalMesesAno; // 14
  const isencaoJovem = String(i.jovem || 'nao') === 'sim' ? 1 : 0;

  const brutoAnual = bruto * meses;
  const ssMensal = segSocialTrabalhador(bruto);
  const ssAnual = ssMensal * meses;
  const irsAnual = irsTrabalhoDependenteAnual(brutoAnual, ssAnual, isencaoJovem);
  const liquidoAnual = brutoAnual - ssAnual - irsAnual;

  // Líquido mensal "normal" (um dos 14 meses) para referência.
  const mes = salarioLiquido(bruto, meses, isencaoJovem);
  const liquidoMensal = mes.liquido;
  const liquidoMensalMedio12 = liquidoAnual / 12; // o mesmo rendimento repartido por 12 meses

  const taxaSsPct = (PORTUGAL_2026.segSocial.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const efetivoPct = ((brutoAnual - liquidoAnual) / brutoAnual) * 100;
  const efetivoStr = efetivoPct.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const _insight = {
    title: 'O seu salário anual',
    text:
      `Um salário bruto de **${fmtEUR(bruto)}/mês** rende, com os **14 meses** (12 + subsídio de férias + subsídio de Natal), ` +
      `**${fmtEUR(brutoAnual)}** brutos por ano e **${fmtEUR(liquidoAnual)}** líquidos. ` +
      `Descontam-se **${fmtEUR(ssAnual)}** de Segurança Social` +
      (irsAnual > 0 ? ` e **${fmtEUR(irsAnual)}** de IRS` : ' (sem IRS)') +
      ` (desconto de ${efetivoStr} %).`,
    tone: 'good',
    icon: '📅',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Líquido anual', value: Math.round(liquidoAnual) },
      { label: 'Segurança Social', value: Math.round(ssAnual) },
      { label: 'IRS', value: Math.round(irsAnual) },
    ].filter((s) => s.value > 0),
    prefix: '',
    suffix: ' €',
    centerValue: fmtEUR(brutoAnual),
    centerLabel: 'Bruto anual',
    ariaLabel: `Bruto anual ${fmtEUR(brutoAnual)}: líquido ${fmtEUR(liquidoAnual)}, Segurança Social ${fmtEUR(ssAnual)}, IRS ${fmtEUR(irsAnual)}.`,
  };

  const _table = {
    title: `Mensal vs anual — salário bruto de ${fmtEUR(bruto)}`,
    headers: ['Conceito', 'Mensal (1 dos 14)', 'Anual (14 meses)'],
    rows: [
      ['Bruto', fmtEUR(bruto), fmtEUR(brutoAnual)],
      ['Segurança Social', `− ${fmtEUR(ssMensal)}`, `− ${fmtEUR(ssAnual)}`],
      ['IRS', `− ${fmtEUR(mes.irs)}`, `− ${fmtEUR(irsAnual)}`],
      ['Líquido', fmtEUR(liquidoMensal), fmtEUR(liquidoAnual)],
    ],
    note: `Os 14 meses incluem 12 ordenados + subsídio de férias + subsídio de Natal. Repartido por 12 meses, o líquido médio seria ${fmtEUR(liquidoMensalMedio12)}/mês.`,
  };

  return {
    brutoAnual: fmtEUR(brutoAnual),
    liquidoAnual: fmtEUR(liquidoAnual),
    segSocialAnual: `${fmtEUR(ssAnual)} (${taxaSsPct} %)`,
    irsAnual: fmtEUR(irsAnual),
    liquidoMensal: fmtEUR(liquidoMensal),
    liquidoMensalMedio: `${fmtEUR(liquidoMensalMedio12)} (repartido por 12)`,
    detalhe:
      `${fmtEUR(bruto)} × 14 = ${fmtEUR(brutoAnual)} brutos. ` +
      `Líquido anual ${fmtEUR(liquidoAnual)} (Seg. Social ${fmtEUR(ssAnual)}` +
      (irsAnual > 0 ? ` + IRS ${fmtEUR(irsAnual)}` : '') + ').',
    _insight,
    _chart,
    _table,
  };
}
