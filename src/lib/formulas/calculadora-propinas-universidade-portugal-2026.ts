/**
 * Custo das propinas do ensino superior — Portugal 2026/2027.
 * Descongelamento: o máximo público (TeSP, licenciatura, mestrado integrado) subiu para 710 €/ano
 * (era 697 €). O ensino privado varia (2.500–8.000 €/ano, sem tabela oficial). Pagamento habitual
 * em 10 prestações. Calcula a prestação mensal e o custo total do curso.
 */
import { fmtEUR, PROPINAS_2026_27 } from '../data/portugal-2026';

export interface Inputs {
  propinaAnual?: number;  // propina anual, €/ano
  nAnos?: number;         // anos de duração do curso
  nPrestacoes?: number;   // n.º de prestações do pagamento anual
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const propinaAnual = Math.max(0, Number(i.propinaAnual) || PROPINAS_2026_27.maxPublicoAnual);
  const nAnos = Math.max(1, Math.floor(Number(i.nAnos) || 3));
  const nPrestacoes = Math.max(1, Math.floor(Number(i.nPrestacoes) || PROPINAS_2026_27.prestacoesPadrao));

  const prestacaoMensal = propinaAnual / nPrestacoes;
  const custoTotal = propinaAnual * nAnos;

  const acimaMax = propinaAnual > PROPINAS_2026_27.maxPublicoAnual;

  const detalhe = `${fmtEUR(propinaAnual)}/ano ÷ ${nPrestacoes} prestações = ${fmtEUR(prestacaoMensal)}/mês. `
    + `Curso de ${nAnos} ${nAnos === 1 ? 'ano' : 'anos'} → custo total ${fmtEUR(custoTotal)}.`
    + (acimaMax ? ' (Valor acima do máximo público de 710 €/ano — típico do ensino privado.)' : '');

  const _table = {
    title: 'Propinas 2026/2027 — público vs privado',
    headers: ['Tipo de ensino', 'Propina anual', 'Prestação (10×)'],
    rows: [
      ['Público (máximo 2026/27)', `${fmtEUR(PROPINAS_2026_27.maxPublicoAnual)}`, fmtEUR(PROPINAS_2026_27.maxPublicoAnual / 10)],
      ['Público (2025/26 anterior)', `${fmtEUR(PROPINAS_2026_27.anteriorAnual)}`, fmtEUR(PROPINAS_2026_27.anteriorAnual / 10)],
      ['Privado (varia)', '2.500 – 8.000 €', '250 – 800 €'],
      ['O seu curso', `${fmtEUR(propinaAnual)}`, fmtEUR(prestacaoMensal)],
    ],
    note: `Descongelamento das propinas: o máximo público passou de ${fmtEUR(PROPINAS_2026_27.anteriorAnual)} para ${fmtEUR(PROPINAS_2026_27.maxPublicoAnual)} em 2026/2027 — a primeira subida após anos congelada. O ensino privado não tem tabela oficial: confirme com a instituição.`,
  };

  const _insight = {
    title: `Custo total do curso: ${fmtEUR(custoTotal)}`,
    text: `Uma propina de **${fmtEUR(propinaAnual)}/ano** paga em **${nPrestacoes} prestações** dá **${fmtEUR(prestacaoMensal)}/mês**. `
      + `Ao longo de **${nAnos} ${nAnos === 1 ? 'ano' : 'anos'}**, o curso custa **${fmtEUR(custoTotal)}** só em propinas`
      + (acimaMax ? '.' : ` — no público, o máximo de 2026/27 é ${fmtEUR(PROPINAS_2026_27.maxPublicoAnual)}/ano.`),
    tone: 'info',
    icon: '🎓',
  };

  return {
    custoTotal: fmtEUR(custoTotal),
    prestacaoMensal: `${fmtEUR(prestacaoMensal)}/mês`,
    propinaAnual: `${fmtEUR(propinaAnual)}/ano`,
    detalhe,
    _insight,
    _table,
  };
}
