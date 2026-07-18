/**
 * Imposto do Selo sobre transmissões gratuitas (heranças / doações) — Portugal 2026.
 * Taxa de 10 % (verba 1.2 da TGIS) sobre o valor transmitido. Em Portugal não existe
 * um "imposto sucessório" clássico: só este Imposto do Selo de 10% para herdeiros fora
 * do núcleo próximo.
 * ISENTOS (verba 1.2): cônjuge/unido de facto, descendentes (filhos, netos) e
 * ascendentes (pais, avós). PAGAM 10%: irmãos, sobrinhos, tios, primos, amigos, terceiros.
 */
import { SELO_TRANSMISSAO_GRATUITA_2026, fmtEUR } from '../data/portugal-2026';

export interface Inputs {
  valor?: number;       // valor transmitido / quinhão / VPT herdado (€)
  parentesco?: string;  // 'conjuge_desc_asc' (isento) | 'outros' (10%)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valor) || 0);
  const isento = String(i.parentesco || 'conjuge_desc_asc') !== 'outros';
  const taxa = SELO_TRANSMISSAO_GRATUITA_2026.taxa; // 0,10
  const selo = isento ? 0 : valor * taxa;
  const liquido = valor - selo;

  const parentescoLabel = isento
    ? 'Cônjuge, unido de facto, filhos, netos, pais ou avós'
    : 'Irmãos, sobrinhos, tios, primos ou outros';

  const detalhe = isento
    ? `${parentescoLabel}: ISENTO de Imposto do Selo (verba 1.2 da TGIS). Sobre ${fmtEUR(valor)} não há imposto a pagar.`
    : `${parentescoLabel}: 10% × ${fmtEUR(valor)} = ${fmtEUR(selo)} de Imposto do Selo. Recebe líquido ${fmtEUR(liquido)}.`;

  const _table = {
    title: 'Imposto do Selo em heranças e doações — Portugal',
    headers: ['Herdeiro / donatário', 'Imposto do Selo'],
    rows: [
      ['Cônjuge ou unido de facto', 'Isento (0%)'],
      ['Filhos e netos (descendentes)', 'Isento (0%)'],
      ['Pais e avós (ascendentes)', 'Isento (0%)'],
      ['Irmãos, sobrinhos, tios, primos', '10% (verba 1.2 TGIS)'],
      ['Amigos e terceiros', '10% (verba 1.2 TGIS)'],
    ],
    note: 'Portugal não tem imposto sucessório clássico. A única tributação das transmissões gratuitas é o Imposto do Selo de 10%, do qual estão isentos o cônjuge/unido de facto, descendentes e ascendentes.',
  };

  const _insight = {
    title: isento ? 'Isento de Imposto do Selo' : `Imposto do Selo: ${fmtEUR(selo)}`,
    text: isento
      ? `Como **${parentescoLabel.toLowerCase()}**, esta transmissão está **isenta** do Imposto do Selo (verba 1.2 da TGIS). Sobre ${fmtEUR(valor)} não paga qualquer imposto de herança em Portugal.`
      : `Como **${parentescoLabel.toLowerCase()}**, paga **10%** sobre ${fmtEUR(valor)} = **${fmtEUR(selo)}** de Imposto do Selo. Se fosse cônjuge, filho, neto, pai ou avô, seria **0 €** (isento).`,
    tone: isento ? 'good' : 'neutral',
    icon: '🏛️',
  };

  return {
    selo: fmtEUR(selo),
    valor: fmtEUR(valor),
    parentesco: isento ? 'Isento (cônjuge/descendentes/ascendentes)' : 'Sujeito a 10% (irmãos e outros)',
    detalhe,
    _insight,
    _table,
  };
}
