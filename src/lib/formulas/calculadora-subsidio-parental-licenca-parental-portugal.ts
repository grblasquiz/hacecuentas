/**
 * Subsídio parental inicial (licença de parentalidade) — Portugal 2026.
 * Valor diário = % da remuneração de referência diária (RR ÷ 30), por modalidade:
 *   120 dias → 100 % · 150 dias → 80 % · partilha 150 dias → 100 % · partilha 180 dias → 83 %.
 * Mínimo diário = 80 % de 1/30 do IAS (14,32 € em 2026). Usa o IAS de portugal-2026.ts.
 */
import { PORTUGAL_2026, fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  remuneracaoMedia: number;     // remuneração de referência mensal (€)
  modalidade?: string;          // '120' | '150' | 'partilha150' | 'partilha180'
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const MIN_DIARIO = Math.round((PORTUGAL_2026.ias / 30) * 0.80 * 100) / 100; // 80 % do IAS/dia ≈ 14,32 €

const MODALIDADES: Record<string, { dias: number; pct: number; label: string }> = {
  '120': { dias: 120, pct: 1.00, label: '120 dias a 100 %' },
  '150': { dias: 150, pct: 0.80, label: '150 dias a 80 %' },
  partilha150: { dias: 150, pct: 1.00, label: '120 + 30 (partilha) = 150 dias a 100 %' },
  partilha180: { dias: 180, pct: 0.83, label: '150 + 30 (partilha) = 180 dias a 83 %' },
};

export function compute(i: Inputs): Outputs {
  const rr = Math.max(0, Number(i.remuneracaoMedia) || 0);
  const key = String(i.modalidade || '120');
  const mod = MODALIDADES[key] || MODALIDADES['120'];
  if (rr <= 0) throw new Error('Indique a remuneração de referência mensal');

  const diariaRR = rr / 30;
  const diario = Math.max(diariaRR * mod.pct, Math.min(MIN_DIARIO, diariaRR));
  const subsidioMensal = diario * 30;
  const subsidioTotal = diario * mod.dias;

  const _table = {
    title: 'Cálculo do subsídio parental',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Remuneração de referência mensal', fmtEUR(rr)],
      ['Remuneração de referência diária', fmtEUR(diariaRR)],
      ['Modalidade', mod.label],
      ['Subsídio diário', fmtEUR(diario)],
      ['Subsídio mensal (30 dias)', fmtEUR(subsidioMensal)],
      [`Total (${mod.dias} dias)`, fmtEUR(subsidioTotal)],
    ],
    note: `Mínimo diário ${fmtEUR(MIN_DIARIO)} (80 % do IAS ${fmtEUR(PORTUGAL_2026.ias)}). A licença exclusiva do pai (28 + 7 dias) é sempre paga a 100 %. RR = total dos 6 primeiros dos últimos 8 meses ÷ 180.`,
  };

  const _insight = {
    title: `Recebe ${fmtEUR(subsidioMensal)}/mês durante ${mod.dias} dias`,
    text: `Com uma remuneração de referência de **${fmtEUR(rr)}**, a modalidade de **${mod.label}** paga **${fmtEUR(subsidioMensal)}/mês** ` +
      `(${fmtEUR(subsidioTotal)} no total dos ${mod.dias} dias). ` +
      `A opção de **150 dias** alonga a licença mas paga 80 %; com **partilha** entre os dois progenitores mantém-se 100 % em 150 dias (ou 83 % em 180).`,
    tone: 'good',
    icon: '👶',
  };

  const _chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Subsídio mensal', value: Math.round(subsidioMensal) },
      { label: 'Salário de referência', value: Math.round(rr) },
    ],
    prefix: '€ ',
    ariaLabel: `Subsídio parental mensal ${fmtEUR(subsidioMensal)} face à remuneração de referência ${fmtEUR(rr)}.`,
  };

  return {
    subsidioMensal: fmtEUR(subsidioMensal),
    subsidioTotal: fmtEUR(subsidioTotal),
    diasTotais: `${mod.dias} dias`,
    percentagem: `${Math.round(mod.pct * 100)} %`,
    detalhe: `${mod.label}: ${fmtEUR(diario)}/dia × ${mod.dias} dias = ${fmtEUR(subsidioTotal)} (${fmtEUR(subsidioMensal)}/mês).`,
    _insight,
    _table,
    _chart,
  };
}
