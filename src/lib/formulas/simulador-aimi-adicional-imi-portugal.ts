/**
 * Simulador do AIMI — Adicional ao Imposto Municipal sobre Imóveis — Portugal 2026.
 *
 * Incide sobre o somatório do VPT de prédios habitacionais e terrenos para construção
 * de que uma pessoa singular (ou herança indivisa) é titular a 1 de janeiro.
 *   - Dedução: 600.000 € (1.200.000 € no casal com tributação conjunta).
 *   - Bandas marginais sobre a base: 0,7 % até 1 M€, 1 % de 1–2 M€, 1,5 % acima de 2 M€.
 *   - No casal conjunto, os limites das bandas duplicam (2 M€ / 4 M€).
 * Toda a matemática vem de portugal-2026.ts (aimiPessoaSingular).
 */
import { fmtEUR, aimiPessoaSingular, AIMI_2026 } from '../data/portugal-2026';

export interface Inputs {
  /** Somatório do VPT dos prédios habitacionais e terrenos para construção (€). */
  vptTotal: number;
  /** Casal com opção pela tributação conjunta? 'sim' duplica dedução (1,2 M€) e escalões. */
  tributacaoConjunta?: string;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const vpt = Math.max(0, Number(i.vptTotal) || 0);
  if (vpt <= 0) throw new Error('Indique o valor patrimonial tributário (VPT) total');
  const conjunta = String(i.tributacaoConjunta || 'nao') === 'sim';

  const deducao = conjunta ? AIMI_2026.deducaoCasal : AIMI_2026.deducaoSingular;
  const base = Math.max(0, vpt - deducao);
  const aimi = aimiPessoaSingular(vpt, conjunta);
  const taxaEfetiva = vpt > 0 ? (aimi / vpt) * 100 : 0;

  const sujeito = base > 0;

  const _insight = {
    type: 'highlight',
    icon: sujeito ? '🏘️' : '✅',
    text: sujeito
      ? `Com um VPT total de **${fmtEUR(vpt)}**${conjunta ? ' (casal, tributação conjunta)' : ''}, deduz-se **${fmtEUR(deducao)}** e a base sujeita a AIMI é **${fmtEUR(base)}**. O AIMI a pagar é **${fmtEUR(aimi)}** por ano.`
      : `Com um VPT total de **${fmtEUR(vpt)}**, fica **abaixo da dedução de ${fmtEUR(deducao)}**${conjunta ? ' (casal)' : ''}, pelo que **não paga AIMI**. O AIMI só incide sobre o que exceder esse limite.`,
  };

  const _table = {
    title: `AIMI por VPT total (${conjunta ? 'casal, tributação conjunta' : 'pessoa singular'}) — 2026`,
    headers: ['VPT total habitacional', 'Base sujeita', 'AIMI anual', 'Taxa efetiva'],
    rows: [500000, 700000, 1000000, 1500000, 2500000].map((v) => {
      const b = Math.max(0, v - deducao);
      const a = aimiPessoaSingular(v, conjunta);
      return [fmtEUR(v), fmtEUR(b), fmtEUR(a), `${((a / v) * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`];
    }),
    note:
      'Dedução de 600.000 € (1.200.000 € no casal com tributação conjunta). Bandas marginais: 0,7 % até 1 M€, ' +
      '1 % de 1–2 M€, 1,5 % acima de 2 M€ (limites duplicados no casal). O AIMI é liquidado em junho e pago em setembro.',
  };

  return {
    aimi: fmtEUR(aimi),
    deducao: fmtEUR(deducao),
    baseTributavel: fmtEUR(base),
    vptTotal: fmtEUR(vpt),
    taxaEfetiva: sujeito ? `${taxaEfetiva.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%` : '0%',
    detalhe: sujeito
      ? `VPT ${fmtEUR(vpt)} − dedução ${fmtEUR(deducao)} = base ${fmtEUR(base)}. AIMI = ${fmtEUR(aimi)}/ano (taxa efetiva ${taxaEfetiva.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%).`
      : `VPT ${fmtEUR(vpt)} < dedução ${fmtEUR(deducao)} → sem AIMI.`,
    _insight,
    _table,
  };
}
