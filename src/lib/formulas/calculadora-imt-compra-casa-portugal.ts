/**
 * Calculadora de IMT — Imposto Municipal sobre Transmissões + Imposto do Selo (continente).
 *
 * Na compra de casa em Portugal pagam-se DOIS impostos sobre o valor de aquisição
 * (o maior entre o preço e o VPT):
 *   1. IMT  — escalões progressivos 2026. Tabela diferente conforme o imóvel seja
 *             habitação PRÓPRIA E PERMANENTE (HPP) ou habitação secundária / arrendamento.
 *             IMT = valor × taxa marginal do escalão − parcela a abater.
 *   2. Imposto do Selo — 0,8 % do valor de aquisição (verba 1.1 da TGIS), sempre.
 *
 * Não hardcoda escalões: tudo sai de portugal-2026.ts (função imt()).
 */
import { fmtEUR, imt } from '../data/portugal-2026';

const SELO_AQUISICAO = 0.008; // 0,8 % — Imposto do Selo na compra de imóvel (verba 1.1 TGIS)

export interface Inputs {
  /** Valor de compra do imóvel (€). */
  valor: number;
  /** Destino: "propria" (habitação própria e permanente) ou "secundaria" (2.ª casa/arrendamento). */
  destino?: string;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraImtCompraCasaPortugal(i: Inputs): Outputs {
  const valor = Math.max(0, Number(i.valor) || 0);
  if (valor <= 0) throw new Error('Indique o valor de compra do imóvel');

  const hpp = String(i.destino || 'propria') !== 'secundaria';

  const impostoImt = imt(valor, hpp);
  const selo = valor * SELO_AQUISICAO;
  const totalImpostos = impostoImt + selo;
  const custoTotal = valor + totalImpostos;

  // Taxa efetiva do IMT (sobre o valor) — útil porque os escalões são marginais.
  const taxaEfetivaImt = valor > 0 ? (impostoImt / valor) * 100 : 0;
  const taxaEfStr = taxaEfetivaImt.toLocaleString('de-DE', { maximumFractionDigits: 2 });

  const isentoImt = impostoImt <= 0;
  const tipoLabel = hpp ? 'habitação própria e permanente' : 'habitação secundária / arrendamento';

  const _insight = {
    type: 'highlight',
    icon: '🔑',
    text:
      `Na compra de uma ${tipoLabel} por **${fmtEUR(valor)}**, paga **${fmtEUR(impostoImt)}** de IMT ` +
      (isentoImt ? '(isento neste escalão) ' : `(taxa efetiva ${taxaEfStr}%) `) +
      `mais **${fmtEUR(selo)}** de Imposto do Selo (0,8 %). ` +
      `Total de impostos: **${fmtEUR(totalImpostos)}** — o imóvel fica-lhe em **${fmtEUR(custoTotal)}**.`,
  };

  // Tabela: IMT por valor de compra, nas duas situações (HPP vs secundária).
  const _table = {
    title: 'IMT na compra de casa por valor — habitação própria vs secundária (2026)',
    headers: ['Valor de compra', 'IMT (própria e permanente)', 'IMT (secundária)', 'Selo 0,8 %'],
    rows: [100000, 150000, 200000, 300000, 400000, 600000].map((v) => [
      fmtEUR(v),
      fmtEUR(imt(v, true)),
      fmtEUR(imt(v, false)),
      fmtEUR(v * SELO_AQUISICAO),
    ]),
    note:
      'A habitação própria e permanente é isenta de IMT até 106.346 € e tem o 1.º escalão a 0 %; ' +
      'a habitação secundária paga 1 % logo desde o primeiro euro. O Imposto do Selo (0,8 %) aplica-se sempre. ' +
      'Jovens até 35 anos podem ter isenção total de IMT e Selo na 1.ª HPP até 330.539 €.',
  };

  return {
    imt: fmtEUR(impostoImt),
    selo: fmtEUR(selo),
    totalImpostos: fmtEUR(totalImpostos),
    valor: fmtEUR(valor),
    custoTotal: fmtEUR(custoTotal),
    taxaEfetivaImt: isentoImt ? 'Isento' : `${taxaEfStr}%`,
    detalhe:
      `IMT ${fmtEUR(impostoImt)} + Selo ${fmtEUR(selo)} (0,8 %) = ${fmtEUR(totalImpostos)} de impostos. ` +
      `Custo total da compra: ${fmtEUR(valor)} + ${fmtEUR(totalImpostos)} = ${fmtEUR(custoTotal)}.`,
    _insight,
    _table,
  };
}
