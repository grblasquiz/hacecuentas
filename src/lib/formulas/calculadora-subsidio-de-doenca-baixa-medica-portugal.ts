/**
 * Subsídio de doença (baixa médica) — Portugal continente 2026.
 * Valor diário = % da remuneração de referência diária, por escalões de duração:
 *   dias 1–3 não pagos (TCO); 4–30 → 55 %; 31–90 → 60 %; 91–365 → 70 %; >365 → 75 %.
 * Majoração de +5 pp nos escalões de 55 %/60 % (RR ≤ 500 € ou 3+ filhos).
 * Mínimo diário 30 % do IAS (5,37 €/dia em 2026). Usa o IAS de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  remuneracaoMedia: number;     // remuneração de referência mensal (€)
  diasBaixa: number;            // dias de baixa médica
  majoracao?: string;           // 'sim' (RR ≤ 500 € ou 3+ filhos) | 'nao'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const MIN_DIARIO = Math.round((PORTUGAL_2026.ias / 30) * 0.30 * 100) / 100; // 30 % do IAS/dia ≈ 5,37 €
const NAO_PAGOS = 3; // primeiros 3 dias (trabalhador por conta de outrem)

// Escalões (limite superior de dia, percentagem base).
const ESCALOES = [
  { ate: 30, pct: 0.55, maj: 0.05 },
  { ate: 90, pct: 0.60, maj: 0.05 },
  { ate: 365, pct: 0.70, maj: 0 },
  { ate: Infinity, pct: 0.75, maj: 0 },
];

export function compute(i: Inputs): Outputs {
  const rr = Math.max(0, Number(i.remuneracaoMedia) || 0);
  const dias = Math.max(0, Math.floor(Number(i.diasBaixa) || 0));
  const temMaj = String(i.majoracao || 'nao') === 'sim';
  if (rr <= 0) throw new Error('Indique a remuneração de referência mensal');
  if (dias <= 0) throw new Error('Indique os dias de baixa médica');

  const diariaRR = rr / 30;
  const pisoDiario = Math.min(MIN_DIARIO, diariaRR); // nunca acima da própria RR diária

  let total = 0;
  let diasPagos = 0;
  const detalhePorEscalao: Array<[string, string]> = [];
  let anterior = 0;
  for (const e of ESCALOES) {
    // dias deste escalão dentro do intervalo pago [NAO_PAGOS+1 .. dias]
    const inicio = Math.max(anterior, NAO_PAGOS) + 1;
    const fim = Math.min(dias, e.ate);
    const nDias = Math.max(0, fim - inicio + 1);
    anterior = e.ate;
    if (nDias <= 0) continue;
    const pct = e.pct + (temMaj ? e.maj : 0);
    const diario = Math.max(diariaRR * pct, pisoDiario);
    total += diario * nDias;
    diasPagos += nDias;
    detalhePorEscalao.push([
      `Dias ${inicio}–${fim} (${Math.round(pct * 100)} %)`,
      `${nDias} × ${fmtEUR(diario)} = ${fmtEUR(diario * nDias)}`,
    ]);
    if (dias <= e.ate) break;
  }

  const _table = {
    title: 'Cálculo por escalão de duração',
    headers: ['Escalão', 'Cálculo'],
    rows: [
      ['Remuneração de referência diária', fmtEUR(diariaRR)],
      ['Dias não pagos (1–3)', `${Math.min(NAO_PAGOS, dias)} dias`],
      ...detalhePorEscalao,
      ['Total do subsídio', fmtEUR(total)],
    ],
    note: `Primeiros 3 dias não pagos (TCO). Mínimo diário ${fmtEUR(MIN_DIARIO)} (30 % do IAS ${fmtEUR(PORTUGAL_2026.ias)}).${temMaj ? ' Com majoração de +5 pp nos escalões de 55 %/60 %.' : ''}`,
  };

  const _insight = {
    title: `Recebe ${fmtEUR(total)} por ${dias} dias de baixa`,
    text: `Com uma remuneração de referência de **${fmtEUR(rr)}** (${fmtEUR(diariaRR)}/dia), uma baixa de **${dias} dias** paga **${fmtEUR(total)}** ` +
      `(${diasPagos} dias pagos — os 3 primeiros não são pagos). A percentagem sobe com a duração: 55 % até 30 dias, 60 % até 90, 70 % até 1 ano.` +
      (temMaj ? ' Aplicou-se a majoração de +5 pp.' : ''),
    tone: 'warn',
    icon: '🩺',
  };

  const _chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Salário (período)', value: Math.round(diariaRR * dias) },
      { label: 'Subsídio', value: Math.round(total) },
    ],
    prefix: '€ ',
    ariaLabel: `Num período de ${dias} dias, o salário seria ${fmtEUR(diariaRR * dias)} e o subsídio de doença ${fmtEUR(total)}.`,
  };

  return {
    subsidioTotal: fmtEUR(total),
    diasPagos: `${diasPagos} dias`,
    remuneracaoDiaria: fmtEUR(diariaRR),
    valorMedioDiario: diasPagos > 0 ? fmtEUR(total / diasPagos) : fmtEUR(0),
    detalhe: `${dias} dias de baixa → ${diasPagos} pagos (3 primeiros não pagos) = ${fmtEUR(total)} (RR diária ${fmtEUR(diariaRR)}).`,
    _insight,
    _table,
    _chart,
  };
}
