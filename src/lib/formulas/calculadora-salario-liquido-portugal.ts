/**
 * Salário líquido Portugal 2026 (continente) — do bruto mensal ao líquido (em mão).
 * Líquido = bruto − Segurança Social (11 %) − retenção de IRS.
 * Não fixa taxas: tudo vem de portugal-2026.ts (escalões IRS, taxa SS, dedução específica).
 * A retenção de IRS é a estimativa anualizada (IRS anual a 14 meses ÷ 14) — coerente como
 * taxa efetiva média; pode diferir alguns euros da tabela de retenção mensal oficial da AT.
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  salarioLiquido,
  segSocialTrabalhador,
} from '../data/portugal-2026.ts';

export interface Inputs {
  bruto: number;
  jovem?: string; // 'nao' | 'sim' (IRS Jovem 1.º ano, 100 % isento)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraSalarioLiquidoPortugal(i: Inputs): Outputs {
  const bruto = Number(i.bruto) || 0;
  if (bruto <= 0) throw new Error('Introduza o seu salário bruto mensal');

  // IRS Jovem opcional (1.º ano de rendimentos = 100 % isento, tope 55×IAS).
  const isencaoJovem = String(i.jovem || 'nao') === 'sim' ? 1 : 0;

  const r = salarioLiquido(bruto, PORTUGAL_2026.subsidios.totalMesesAno, isencaoJovem);
  const ss = r.segSocial;
  const irs = r.irs;
  const liquido = r.liquido;

  const taxaSsPct = (PORTUGAL_2026.segSocial.trabalhador * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 });
  const efetivoPct = ((bruto - liquido) / bruto) * 100;
  const efetivoStr = efetivoPct.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const _insight = {
    title: 'O seu salário em mão',
    text:
      `De um salário bruto de **${fmtEUR(bruto)}** ficam **${fmtEUR(liquido)}** líquidos: ` +
      `descontam-se **${fmtEUR(ss)}** de Segurança Social (${taxaSsPct} %)` +
      (irs > 0 ? ` e **${fmtEUR(irs)}** de retenção de IRS` : ' (sem retenção de IRS — abaixo do mínimo de existência)') +
      `. O desconto total é de **${efetivoStr} %**.`,
    tone: 'good',
    icon: '💶',
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
    centerValue: fmtEUR(bruto),
    centerLabel: 'Salário bruto',
    ariaLabel: `Bruto ${fmtEUR(bruto)}: líquido ${fmtEUR(liquido)}, Segurança Social ${fmtEUR(ss)}, IRS ${fmtEUR(irs)}.`,
  };

  const _table = {
    title: `Desconto do salário bruto de ${fmtEUR(bruto)} (mensal)`,
    headers: ['Conceito', 'Taxa', 'Montante'],
    rows: [
      ['Segurança Social', `${taxaSsPct} %`, fmtEUR(ss)],
      ['Retenção de IRS', irs > 0 ? 'progressiva' : '0 %', fmtEUR(irs)],
      ['Total descontado', `${efetivoStr} %`, fmtEUR(bruto - liquido)],
      ['Líquido em mão', '', fmtEUR(liquido)],
    ],
    note: 'IRS estimado anualizando a 14 meses (taxa efetiva média). Não inclui subsídio de refeição nem outros abonos.',
  };

  return {
    liquido: fmtEUR(liquido),
    bruto: fmtEUR(bruto),
    segSocial: `${fmtEUR(ss)} (${taxaSsPct} %)`,
    irs: fmtEUR(irs),
    descontoTotal: `${fmtEUR(bruto - liquido)} (${efetivoStr} %)`,
    detalhe:
      `Bruto ${fmtEUR(bruto)} − Segurança Social ${fmtEUR(ss)}` +
      (irs > 0 ? ` − IRS ${fmtEUR(irs)}` : '') +
      ` = líquido ${fmtEUR(liquido)}.`,
    _insight,
    _chart,
    _table,
  };
}
