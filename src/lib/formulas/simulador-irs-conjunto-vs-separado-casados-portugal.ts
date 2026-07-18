/**
 * Simulador IRS: tributação conjunta vs separada (casados/unidos de facto) — Portugal 2026.
 *
 * Reutiliza o MOTOR de escalões de IRS de portugal-2026.ts (irsTrabalhoDependenteAnual):
 *   - Separada: cada titular apura o seu IRS individualmente e somam-se.
 *   - Conjunta (quociente conjugal): soma-se o rendimento dos dois, divide-se por 2,
 *     apura-se o IRS sobre essa metade e multiplica-se por 2.
 * Como os escalões são progressivos, a conjunta costuma poupar quando há grande
 * diferença de rendimentos entre os cônjuges (e dá igual quando os rendimentos coincidem).
 */
import {
  PORTUGAL_2026,
  fmtEUR,
  irsTrabalhoDependenteAnual,
  segSocialTrabalhador,
} from '../data/portugal-2026';

export interface Inputs {
  /** Rendimento bruto anual do 1.º titular (Cat. A, ~14 × salário mensal). */
  brutoAnual1: number;
  /** Rendimento bruto anual do 2.º titular. */
  brutoAnual2?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

function irsIndividual(bruto: number): number {
  return irsTrabalhoDependenteAnual(bruto, segSocialTrabalhador(bruto), 0);
}

function irsConjunta(b1: number, b2: number): number {
  const metade = (b1 + b2) / 2;
  const ss = metade * PORTUGAL_2026.segSocial.trabalhador;
  return irsTrabalhoDependenteAnual(metade, ss, 0) * 2;
}

export function compute(i: Inputs): Outputs {
  const b1 = Math.max(0, Number(i.brutoAnual1) || 0);
  const b2 = Math.max(0, Number(i.brutoAnual2) || 0);
  if (b1 + b2 <= 0) throw new Error('Indique o rendimento bruto anual de pelo menos um dos titulares');

  const irsSeparado = irsIndividual(b1) + irsIndividual(b2);
  const irsConjunto = irsConjunta(b1, b2);
  const poupanca = irsSeparado - irsConjunto; // > 0 → conjunta poupa

  const conjuntaMelhor = poupanca > 0.005;
  const iguais = Math.abs(poupanca) <= 0.005;

  const recomendacaoLabel = iguais
    ? 'Indiferente: as duas opções pagam o mesmo'
    : conjuntaMelhor
      ? `Tributação conjunta — poupa ${fmtEUR(poupanca)}`
      : `Tributação separada — poupa ${fmtEUR(-poupanca)}`;

  const _insight = {
    type: 'highlight',
    icon: iguais ? 'ℹ️' : '💶',
    text: iguais
      ? `Com rendimentos semelhantes (**${fmtEUR(b1)}** e **${fmtEUR(b2)}**), a tributação conjunta e a separada dão praticamente o **mesmo IRS** (${fmtEUR(irsConjunto)}). O quociente conjugal só compensa quando há diferença de rendimentos.`
      : conjuntaMelhor
        ? `Com **${fmtEUR(b1)}** e **${fmtEUR(b2)}**, declarar **em conjunto** paga **${fmtEUR(irsConjunto)}** de IRS, contra **${fmtEUR(irsSeparado)}** em separado. Poupa **${fmtEUR(poupanca)}** por ano.`
        : `Com **${fmtEUR(b1)}** e **${fmtEUR(b2)}**, declarar **em separado** paga **${fmtEUR(irsSeparado)}**, contra **${fmtEUR(irsConjunto)}** em conjunto. Poupa **${fmtEUR(-poupanca)}** por ano.`,
  };

  const _table = {
    title: 'IRS conjunto vs separado por diferença de rendimentos (titular B com 10.000 €)',
    headers: ['Titular A', 'Titular B', 'Separado', 'Conjunto', 'Poupança conjunta'],
    rows: [20000, 30000, 40000, 50000, 60000].map((a) => {
      const sep = irsIndividual(a) + irsIndividual(10000);
      const conj = irsConjunta(a, 10000);
      return [fmtEUR(a), fmtEUR(10000), fmtEUR(sep), fmtEUR(conj), fmtEUR(sep - conj)];
    }),
    note:
      'Quanto maior a diferença de rendimentos entre os cônjuges, mais compensa a tributação conjunta ' +
      '(quociente conjugal). Com rendimentos iguais, a poupança é nula. Modelo simplificado (só dedução ' +
      'específica); as deduções à coleta reais podem alterar o resultado.',
  };

  return {
    recomendacao: recomendacaoLabel,
    irsConjunto: fmtEUR(irsConjunto),
    irsSeparado: fmtEUR(irsSeparado),
    poupanca: iguais ? fmtEUR(0) : conjuntaMelhor ? `${fmtEUR(poupanca)} (conjunta)` : `${fmtEUR(-poupanca)} (separada)`,
    detalhe:
      `Separado: ${fmtEUR(irsIndividual(b1))} + ${fmtEUR(irsIndividual(b2))} = ${fmtEUR(irsSeparado)}. ` +
      `Conjunto (quociente conjugal): ${fmtEUR(irsConjunto)}. ` +
      (iguais ? 'Diferença nula.' : `Melhor opção: ${conjuntaMelhor ? 'conjunta' : 'separada'} (poupa ${fmtEUR(Math.abs(poupanca))}).`),
    _insight,
    _table,
  };
}
