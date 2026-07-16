/**
 * Atualização anual de rendas — Portugal 2026.
 * Nova renda = renda atual × coeficiente de atualização do INE.
 * Coeficiente 2026 = 1,0224 (+2,24 %), Aviso n.º 23174/2025/2 (DR, 19-set-2025).
 * Cálculo de utilidade (multiplicação pelo coeficiente); fmtEUR de portugal-2026.ts.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  rendaAtual: number;           // renda mensal atual (€)
  coeficiente?: number;         // coeficiente de atualização (default 1,0224 para 2026)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const COEF_2026 = 1.0224; // +2,24 % (INE, Aviso n.º 23174/2025/2)

export function compute(i: Inputs): Outputs {
  const renda = Math.max(0, Number(i.rendaAtual) || 0);
  const coefInput = Number(i.coeficiente);
  const coef = Number.isFinite(coefInput) && coefInput > 0 ? coefInput : COEF_2026;
  if (renda <= 0) throw new Error('Indique a renda mensal atual');

  const novaRenda = renda * coef;
  const aumentoMensal = novaRenda - renda;
  const aumentoAnual = aumentoMensal * 12;
  const percStr = ((coef - 1) * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 });

  const _table = {
    title: 'Atualização da renda',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Renda atual', fmtEUR(renda)],
      ['Coeficiente', coef.toLocaleString('de-DE', { maximumFractionDigits: 4 })],
      ['Nova renda', fmtEUR(novaRenda)],
      ['Aumento mensal', fmtEUR(aumentoMensal)],
      ['Aumento anual (12 meses)', fmtEUR(aumentoAnual)],
    ],
    note: 'Coeficiente 2026 = 1,0224 (+2,24 %), apurado pelo INE (Aviso n.º 23174/2025/2). O senhorio deve comunicar por escrito com 30 dias de antecedência.',
  };

  const _insight = {
    title: `A renda sobe ${fmtEUR(aumentoMensal)}/mês (+${percStr} %)`,
    text: `Com o coeficiente de **${coef.toLocaleString('de-DE', { maximumFractionDigits: 4 })}** (+${percStr} %), uma renda de **${fmtEUR(renda)}** passa a **${fmtEUR(novaRenda)}** — mais **${fmtEUR(aumentoMensal)}** por mês, **${fmtEUR(aumentoAnual)}** ao ano. ` +
      `O aumento é opcional para o senhorio e tem de ser comunicado por escrito com, pelo menos, 30 dias de antecedência.`,
    tone: 'warn',
    icon: '🏘️',
  };

  const _chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Renda atual', value: Math.round(renda) },
      { label: 'Nova renda', value: Math.round(novaRenda) },
    ],
    prefix: '€ ',
    ariaLabel: `A renda passa de ${fmtEUR(renda)} para ${fmtEUR(novaRenda)}.`,
  };

  return {
    novaRenda: fmtEUR(novaRenda),
    aumentoMensal: fmtEUR(aumentoMensal),
    aumentoAnual: fmtEUR(aumentoAnual),
    percentagem: `+${percStr} %`,
    detalhe: `${fmtEUR(renda)} × ${coef.toLocaleString('de-DE', { maximumFractionDigits: 4 })} = ${fmtEUR(novaRenda)} (+${fmtEUR(aumentoMensal)}/mês).`,
    _insight,
    _table,
    _chart,
  };
}
