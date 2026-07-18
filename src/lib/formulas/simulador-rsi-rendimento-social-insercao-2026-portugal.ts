/**
 * RSI — Rendimento Social de Inserção (prestação diferencial), Portugal 2026.
 * RSI = max(0, valor de referência do agregado − rendimentos mensais do agregado).
 * Valor de referência 2026 = 247,56 € (titular) + 173,29 € por cada adulto adicional
 * (2.º e seguintes) + 123,78 € por cada criança/jovem < 18 anos. O valor do titular
 * subiu de 242,23 € para 247,56 € em 2026 (46,09 % do IAS, 537,13 €).
 */
import { RSI_2026, rsiValorReferencia, fmtEUR } from '../data/portugal-2026';

export interface Inputs {
  nAdultos?: number;         // adultos do agregado (mín. 1, o titular)
  nCriancas?: number;        // crianças/jovens < 18 anos
  rendimentosMensais?: number; // rendimentos mensais do agregado (€)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const nAdultos = Math.max(1, Math.floor(Number(i.nAdultos) || 1));
  const nCriancas = Math.max(0, Math.floor(Number(i.nCriancas) || 0));
  const rendimentos = Math.max(0, Number(i.rendimentosMensais) || 0);

  const valorReferencia = rsiValorReferencia(nAdultos, nCriancas);
  const rsi = Math.max(0, valorReferencia - rendimentos);

  const adultosAdicionais = nAdultos - 1;
  const componentes: string[] = [`${fmtEUR(RSI_2026.titular)} (titular)`];
  if (adultosAdicionais > 0) {
    componentes.push(`${fmtEUR(RSI_2026.adultoAdicional)} × ${adultosAdicionais} adulto(s) adicional(is)`);
  }
  if (nCriancas > 0) {
    componentes.push(`${fmtEUR(RSI_2026.crianca)} × ${nCriancas} criança(s)`);
  }

  const detalhe = rsi > 0
    ? `Valor de referência = ${componentes.join(' + ')} = ${fmtEUR(valorReferencia)}. RSI = ${fmtEUR(valorReferencia)} − ${fmtEUR(rendimentos)} = ${fmtEUR(rsi)}/mês.`
    : `Valor de referência = ${fmtEUR(valorReferencia)}, inferior aos rendimentos do agregado (${fmtEUR(rendimentos)}). Sem direito a RSI (a prestação é diferencial).`;

  const _table = {
    title: 'Escala de equivalência do RSI — Portugal 2026',
    headers: ['Elemento do agregado', 'Valor de referência mensal'],
    rows: [
      ['Titular (1.º adulto)', fmtEUR(RSI_2026.titular)],
      ['Cada adulto adicional (2.º e seguintes)', fmtEUR(RSI_2026.adultoAdicional)],
      ['Cada criança/jovem menor de 18 anos', fmtEUR(RSI_2026.crianca)],
      ['O seu agregado', `${fmtEUR(valorReferencia)} de referência`],
    ],
    note: 'O RSI 2026 do titular subiu para 247,56 € (era 242,23 €), equivalente a 46,09 % do IAS (537,13 €). A prestação efetiva é a diferença entre o valor de referência do agregado e os seus rendimentos mensais.',
  };

  const _insight = {
    title: rsi > 0 ? `RSI estimado: ${fmtEUR(rsi)}/mês` : 'Sem direito a RSI com estes rendimentos',
    text: rsi > 0
      ? `O RSI é **diferencial**: soma-se o valor de referência do agregado (**${fmtEUR(valorReferencia)}**) e desconta-se o rendimento mensal (**${fmtEUR(rendimentos)}**). Sobram **${fmtEUR(rsi)}/mês**. Se os rendimentos subirem, o RSI desce na mesma medida.`
      : `Com rendimentos de **${fmtEUR(rendimentos)}/mês**, o agregado já supera o valor de referência (**${fmtEUR(valorReferencia)}**), pelo que não há prestação a pagar. O RSI cobre apenas a diferença até esse valor de referência.`,
    tone: rsi > 0 ? 'good' : 'neutral',
    icon: '🤝',
  };

  return {
    rsi: fmtEUR(rsi),
    valorReferencia: fmtEUR(valorReferencia),
    rendimentos: fmtEUR(rendimentos),
    detalhe,
    _insight,
    _table,
  };
}
