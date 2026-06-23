/**
 * Compensação por cessação do contrato de trabalho — Portugal continente 2026.
 * Regime geral (contratos pós 1-out-2013, art. 366.º CT): 12 dias de retribuição base +
 * diuturnidades por cada ano completo de antiguidade.
 * = (retribuição mensal ÷ 30) × 12 × anos, com topes: retribuição mensal ≤ 20 × RMMG;
 *   compensação total ≤ 240 × RMMG.
 * Não hardcodea cifras: usa compensacaoCessacao + constantes de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR, compensacaoCessacao } from '../data/portugal-2026.ts';

export interface Inputs {
  retribuicaoMensal?: number; // retribuição base mensal + diuturnidades
  anos?: number;              // anos completos de antiguidade (fração conta proporcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function calculadoraCompensacaoDespedimentoPortugal(i: Inputs): Outputs {
  const c = PORTUGAL_2026.cessacao;
  const retribuicao = Number(i.retribuicaoMensal) || 0;
  const anos = Number(i.anos) || 0;
  if (retribuicao <= 0) throw new Error('Indique a retribuição base mensal + diuturnidades');
  if (anos <= 0) throw new Error('Indique a antiguidade em anos');

  const compensacao = compensacaoCessacao(retribuicao, anos);

  // Valores intermédios para o desglose
  const retribuicaoTopada = Math.min(retribuicao, c.topeRetribuicaoMensal);
  const valorDia = retribuicaoTopada / c.divisorDias;
  const brutoSemTope = valorDia * c.diasPorAno * anos;
  const aplicaTopeRetribuicao = retribuicao > c.topeRetribuicaoMensal;
  const aplicaTopeTotal = brutoSemTope > c.topeCompensacaoTotal;

  const _table = {
    title: 'Cálculo da compensação por cessação',
    headers: ['Passo', 'Valor'],
    rows: [
      ['Retribuição base + diuturnidades (mensal)', fmtEUR(retribuicao)],
      ['Retribuição considerada (tope 20 × RMMG = ' + fmtEUR(c.topeRetribuicaoMensal) + ')', fmtEUR(retribuicaoTopada)],
      ['Valor diário (÷ 30)', fmtEUR(valorDia)],
      ['Dias por ano (regime atual)', String(c.diasPorAno) + ' dias'],
      ['Anos de antiguidade', anos.toLocaleString('de-DE', { maximumFractionDigits: 2 })],
      ['Compensação a receber', fmtEUR(compensacao)],
    ],
    note: 'Compensação total limitada a 240 × RMMG = ' + fmtEUR(c.topeCompensacaoTotal) + '. Regime do art. 366.º do Código do Trabalho (12 dias/ano).',
  };

  let topeNota = '';
  if (aplicaTopeRetribuicao && aplicaTopeTotal) topeNota = ' Aplicaram-se ambos os topes legais (retribuição e total).';
  else if (aplicaTopeRetribuicao) topeNota = ` A retribuição foi limitada ao tope de ${fmtEUR(c.topeRetribuicaoMensal)} (20 × RMMG).`;
  else if (aplicaTopeTotal) topeNota = ` A compensação foi limitada ao tope total de ${fmtEUR(c.topeCompensacaoTotal)} (240 × RMMG).`;

  const _insight = {
    title: 'A sua compensação',
    text:
      `Com **${anos.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ${anos === 1 ? 'ano' : 'anos'}** de antiguidade e uma retribuição de ` +
      `**${fmtEUR(retribuicao)}**/mês, a compensação por cessação é de **${fmtEUR(compensacao)}** ` +
      `(12 dias por ano completo, sobre a retribuição base + diuturnidades).` + topeNota,
    tone: aplicaTopeRetribuicao || aplicaTopeTotal ? 'warn' : 'good',
    icon: '📄',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: '1 mês de retribuição', value: Math.round(retribuicaoTopada) },
      { label: 'Compensação total', value: Math.round(compensacao) },
    ],
    prefix: '€ ',
    ariaLabel: `Retribuição mensal ${fmtEUR(retribuicaoTopada)}, compensação total ${fmtEUR(compensacao)} por ${anos} anos.`,
  };

  return {
    compensacao: fmtEUR(compensacao),
    retribuicaoMensal: fmtEUR(retribuicao),
    valorDia: fmtEUR(valorDia),
    diasTotais: (c.diasPorAno * anos).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' dias',
    equivalenteMeses: (compensacao / (retribuicaoTopada || 1)).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' meses de retribuição',
    detalhe:
      `(${fmtEUR(retribuicaoTopada)} ÷ 30) × ${c.diasPorAno} dias × ${anos.toLocaleString('de-DE', { maximumFractionDigits: 2 })} anos = ${fmtEUR(compensacao)}.`,
    _table,
    _insight,
    _chart,
  };
}
