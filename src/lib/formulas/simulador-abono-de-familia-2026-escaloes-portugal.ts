/**
 * Simulador do Abono de Família para Crianças e Jovens — Portugal 2026.
 *
 * Determina o ESCALÃO de rendimentos do agregado e o MONTANTE mensal do abono.
 *   1. rendimento de referência = rendimentos anuais do agregado ÷ (n.º de filhos com direito + 1)
 *   2. escalão (1..5) por comparação com os limites (múltiplos de IAS × 14). 5.º = sem direito.
 *   3. montante mensal por escalão e faixa etária (≤36 / 36–72 / >72 meses).
 *   4. famílias monoparentais: majoração de +50 % sobre o valor do abono.
 *
 * Não hardcoda tabelas: escalões, limites e montantes saem de portugal-2026.ts.
 * Para pedidos NOVOS feitos em 2026 os limites usam o IAS de 2025 (522,50 €).
 */
import {
  ABONO_FAMILIA_2026,
  abonoFamiliaEscalao,
  abonoFamiliaRendimentoReferencia,
  fmtEUR,
} from '../data/portugal-2026';

export interface Inputs {
  /** Soma dos rendimentos anuais de todos os elementos do agregado (€). */
  rendimentoAnualAgregado: number;
  /** N.º de crianças/jovens com direito a abono no agregado (divisor = n.º + 1). */
  nFilhos?: number;
  /** Faixa etária da criança: 'ate36' | 'de36a72' | 'mais72' (meses). */
  idade?: string;
  /** Família monoparental? 'sim' aplica majoração de +50 %. */
  monoparental?: string;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const IDADE_KEY: Record<string, keyof typeof ABONO_FAMILIA_2026.montante> = {
  ate36: 'ate36meses',
  de36a72: 'de36a72meses',
  mais72: 'mais72meses',
};
const IDADE_LABEL: Record<string, string> = {
  ate36: 'até 36 meses',
  de36a72: 'dos 36 aos 72 meses',
  mais72: 'mais de 72 meses',
};

export function compute(i: Inputs): Outputs {
  const rendimento = Math.max(0, Number(i.rendimentoAnualAgregado) || 0);
  const nFilhos = Math.max(1, Math.floor(Number(i.nFilhos) || 1));
  const idade = IDADE_KEY[String(i.idade || 'ate36')] ? String(i.idade || 'ate36') : 'ate36';
  const mono = String(i.monoparental || 'nao') === 'sim';

  const rendRef = abonoFamiliaRendimentoReferencia(rendimento, nFilhos);
  const escalao = abonoFamiliaEscalao(rendRef); // 1..5

  const idadeKey = IDADE_KEY[idade];
  const idadeLabel = IDADE_LABEL[idade];

  let base = 0;
  let semDireito = false;
  if (escalao === 5) {
    semDireito = true;
  } else {
    base = ABONO_FAMILIA_2026.montante[idadeKey][escalao - 1];
  }

  const majoracao = mono ? base * ABONO_FAMILIA_2026.majoracaoMonoparentalPct : 0;
  const abonoPorCrianca = base + majoracao;
  const abonoTotal = abonoPorCrianca * nFilhos;

  const escalaoLabel = semDireito
    ? '5.º escalão — sem direito a abono'
    : `${escalao}.º escalão`;

  const resultadoLabel = semDireito
    ? 'Sem direito a abono (5.º escalão)'
    : `${fmtEUR(abonoPorCrianca)} por mês, por criança`;

  const _insight = {
    type: 'highlight',
    icon: semDireito ? '⚠️' : '👶',
    text: semDireito
      ? `Com um rendimento de referência de **${fmtEUR(rendRef)}** (rendimentos ÷ ${nFilhos + 1}), o agregado fica no **5.º escalão** (acima de 18.287,50 €) e **não tem direito** a abono de família em 2026.`
      : `Com um rendimento de referência de **${fmtEUR(rendRef)}**, o agregado está no **${escalao}.º escalão**. ` +
        `Uma criança ${idadeLabel} recebe **${fmtEUR(base)}** por mês` +
        (mono ? ` mais **${fmtEUR(majoracao)}** de majoração monoparental (+50 %) = **${fmtEUR(abonoPorCrianca)}**` : '') +
        `. Para ${nFilhos} ${nFilhos === 1 ? 'criança' : 'crianças'} da mesma idade e escalão, o total ronda **${fmtEUR(abonoTotal)}**/mês.`,
  };

  // Tabela do montante mensal por escalão para a faixa etária escolhida.
  const _table = {
    title: `Montante mensal do abono (2026) — criança ${idadeLabel}`,
    headers: ['Escalão', 'Rendimento de referência anual', 'Montante mensal'],
    rows: [
      ['1.º', 'até 3.657,50 €', fmtEUR(ABONO_FAMILIA_2026.montante[idadeKey][0])],
      ['2.º', '3.657,50 € a 7.315,00 €', fmtEUR(ABONO_FAMILIA_2026.montante[idadeKey][1])],
      ['3.º', '7.315,00 € a 12.435,50 €', fmtEUR(ABONO_FAMILIA_2026.montante[idadeKey][2])],
      ['4.º', '12.435,50 € a 18.287,50 €', fmtEUR(ABONO_FAMILIA_2026.montante[idadeKey][3])],
      ['5.º', 'mais de 18.287,50 €', 'sem direito'],
    ],
    note:
      'Rendimento de referência = rendimentos anuais do agregado ÷ (n.º de filhos com direito + 1). ' +
      'Famílias monoparentais têm majoração de +50 %. O 4.º escalão só recebe até aos 72 meses. ' +
      'Limites de 2026 para pedidos novos (IAS 2025 = 522,50 €).',
  };

  return {
    abonoMensal: resultadoLabel,
    escalao: escalaoLabel,
    rendimentoReferencia: fmtEUR(rendRef),
    abonoTotalAgregado: semDireito ? fmtEUR(0) : fmtEUR(abonoTotal),
    detalhe: semDireito
      ? `Rendimento de referência ${fmtEUR(rendRef)} > 18.287,50 € → 5.º escalão, sem abono.`
      : `Rendimento de referência ${fmtEUR(rendRef)} → ${escalao}.º escalão. ` +
        `Criança ${idadeLabel}: ${fmtEUR(base)}` +
        (mono ? ` + 50 % monoparental (${fmtEUR(majoracao)}) = ${fmtEUR(abonoPorCrianca)}` : '') +
        ` por mês, por criança.`,
    _insight,
    _table,
  };
}
