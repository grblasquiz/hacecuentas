/**
 * Estimativa ORIENTATIVA da pensão de alimentos a filho — Portugal (art. 2003.º-2004.º Código Civil).
 * Não existe fórmula legal fixa: a pensão é fixada pelo Tribunal de Família por PROPORCIONALIDADE
 * dos rendimentos dos pais e das necessidades da criança. Modelo usado: o progenitor sem a guarda
 * paga a sua quota-parte do custo mensal da criança, na proporção do seu rendimento face ao total.
 * Valor meramente indicativo — a decisão final é do tribunal.
 */
import { fmtEUR } from '../data/portugal-2026';

export interface Inputs {
  rendimentoPagador?: number;    // rendimento mensal do progenitor SEM guarda (quem paga), €/mês
  rendimentoOutro?: number;      // rendimento mensal do progenitor COM guarda, €/mês
  custoMensalCrianca?: number;   // necessidades mensais estimadas da criança, €/mês
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const rendPagador = Math.max(0, Number(i.rendimentoPagador) || 0);
  const rendOutro = Math.max(0, Number(i.rendimentoOutro) || 0);
  const custo = Math.max(0, Number(i.custoMensalCrianca) || 400);
  const totalRend = rendPagador + rendOutro;

  if (totalRend <= 0) throw new Error('Indique o rendimento mensal de, pelo menos, um dos progenitores');

  const fracao = rendPagador / totalRend;      // quota-parte do progenitor pagador
  const quotaPct = fracao * 100;
  const pensao = custo * fracao;

  const detalhe = `Quota-parte do progenitor pagador = ${fmtEUR(rendPagador)} ÷ ${fmtEUR(totalRend)} = ${quotaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %. `
    + `Pensão orientativa = ${fmtEUR(custo)} × ${(fracao).toLocaleString('de-DE', { maximumFractionDigits: 2 })} = ${fmtEUR(pensao)}/mês.`;

  const _table = {
    title: 'Repartição proporcional do custo da criança',
    headers: ['Progenitor', 'Rendimento', 'Quota-parte', 'Contribui'],
    rows: [
      ['Sem guarda (paga pensão)', fmtEUR(rendPagador), `${quotaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`, fmtEUR(pensao)],
      ['Com guarda', fmtEUR(rendOutro), `${(100 - quotaPct).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`, fmtEUR(custo - pensao)],
      ['Custo total da criança', '—', '100 %', fmtEUR(custo)],
    ],
    note: 'Valor ORIENTATIVO. Não há fórmula legal fixa: o Tribunal de Família fixa a pensão ponderando os rendimentos e o património de cada progenitor e as necessidades reais do filho (art. 2004.º do Código Civil). Despesas extraordinárias (saúde, educação) somam-se à parte.',
  };

  const _insight = {
    title: `Pensão orientativa: ${fmtEUR(pensao)}/mês`,
    text: `Como o progenitor pagador representa **${quotaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %** do rendimento conjunto, `
      + `assume essa fração do custo mensal da criança (${fmtEUR(custo)}) → **${fmtEUR(pensao)}/mês**. `
      + `É apenas uma estimativa: a pensão é decidida pelo **Tribunal de Família**, caso a caso.`,
    tone: 'info',
    icon: '⚖️',
  };

  return {
    pensao: `${fmtEUR(pensao)}/mês`,
    quotaParte: `${quotaPct.toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`,
    custoCrianca: `${fmtEUR(custo)}/mês`,
    detalhe,
    _insight,
    _table,
  };
}
