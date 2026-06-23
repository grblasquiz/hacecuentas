/**
 * Subsídio de refeição Portugal 2026 — parte isenta vs tributada e total mensal.
 * Limites de isenção 2026 (valor da função pública): 6,15 €/dia em dinheiro, 10,46 €/dia em cartão/vale.
 * O excedente é tributado em IRS e sujeito a Segurança Social.
 * Usa subsidioRefeicaoIsento de portugal-2026.ts (não fixa limites no formula).
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  subsidioRefeicaoIsento,
} from '../data/portugal-2026.ts';

export interface Inputs {
  valorDia: number;     // subsídio de refeição por dia (€)
  meio?: string;        // 'cartao' (default) | 'dinheiro'
  dias?: number;        // nº de dias de trabalho no mês (default 22)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraSubsidioRefeicaoPortugal(i: Inputs): Outputs {
  const valorDia = Number(i.valorDia) || 0;
  if (valorDia <= 0) throw new Error('Introduza o valor do subsídio de refeição por dia');

  const emCartao = String(i.meio || 'cartao') !== 'dinheiro';
  let dias = i.dias == null ? 22 : Number(i.dias);
  if (!Number.isFinite(dias) || dias <= 0) dias = 22;

  const r = subsidioRefeicaoIsento(valorDia, emCartao);
  const isentoDia = r.isento;
  const tributadoDia = r.tributado;
  const limite = r.limite;

  const totalMes = valorDia * dias;
  const isentoMes = isentoDia * dias;
  const tributadoMes = tributadoDia * dias;

  const meioLabel = emCartao ? 'cartão/vale de refeição' : 'dinheiro';
  const ultrapassa = tributadoDia > 0;

  const _insight = {
    title: 'Subsídio de refeição',
    text:
      `Com **${fmtEUR(valorDia)}/dia** em **${meioLabel}** durante **${dias} dias**, recebe **${fmtEUR(totalMes)}** por mês. ` +
      (ultrapassa
        ? `Como ultrapassa o limite isento de **${fmtEUR(limite)}/dia**, ` +
          `**${fmtEUR(isentoMes)}** ficam isentos de IRS e Segurança Social e **${fmtEUR(tributadoMes)}** são tributados.`
        : `Está dentro do limite isento de **${fmtEUR(limite)}/dia**, pelo que **a totalidade (${fmtEUR(totalMes)}) está isenta** de IRS e Segurança Social.`),
    tone: ultrapassa ? 'warning' : 'good',
    icon: '🍽️',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Isento', value: Math.round(isentoMes) },
      { label: 'Tributado', value: Math.round(tributadoMes) },
    ].filter((s) => s.value > 0),
    prefix: '',
    suffix: ' €',
    centerValue: fmtEUR(totalMes),
    centerLabel: 'Total mensal',
    ariaLabel: `Total mensal ${fmtEUR(totalMes)}: isento ${fmtEUR(isentoMes)}, tributado ${fmtEUR(tributadoMes)}.`,
  };

  const _table = {
    title: `Subsídio de refeição: ${fmtEUR(valorDia)}/dia em ${meioLabel}`,
    headers: ['Conceito', 'Por dia', 'No mês (' + dias + ' dias)'],
    rows: [
      ['Subsídio total', fmtEUR(valorDia), fmtEUR(totalMes)],
      [`Parte isenta (até ${fmtEUR(limite)})`, fmtEUR(isentoDia), fmtEUR(isentoMes)],
      ['Parte tributada (excedente)', fmtEUR(tributadoDia), fmtEUR(tributadoMes)],
    ],
    note: `Limites de isenção 2026: ${fmtEUR(PORTUGAL_2026.subsidios.refeicao.isentoDinheiroDia)}/dia em dinheiro, ${fmtEUR(PORTUGAL_2026.subsidios.refeicao.isentoCartaoDia)}/dia em cartão. O excedente soma ao rendimento tributável (IRS + Segurança Social).`,
  };

  return {
    totalMes: fmtEUR(totalMes),
    isentoMes: fmtEUR(isentoMes),
    tributadoMes: fmtEUR(tributadoMes),
    limiteDia: `${fmtEUR(limite)}/dia (${meioLabel})`,
    valorDia: fmtEUR(valorDia),
    detalhe:
      `${fmtEUR(valorDia)}/dia × ${dias} dias = ${fmtEUR(totalMes)} no mês. ` +
      (ultrapassa
        ? `Isento ${fmtEUR(isentoMes)} + tributado ${fmtEUR(tributadoMes)}.`
        : `Totalmente isento.`),
    _insight,
    _chart,
    _table,
  };
}
