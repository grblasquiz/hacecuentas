/** Reverso: dado o salário líquido, calcula o bruto (iterativo/bisseção).
 *  Usa tabelas INSS + IRRF 2026.
 */

import { calcInss2026, calcIrrf2026 } from './salario-liquido-clt-inss-irrf';

export interface Inputs {
  salarioLiquido: number;
}

export interface Outputs {
  salarioLiquido: string;
  salarioBrutoEstimado: string;
  inssEstimado: string;
  irrfEstimado: string;
  iteracoes: number;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function liquidoDeBruto(bruto: number): { liquido: number; inss: number; irrf: number } {
  const inss = calcInss2026(bruto);
  const base = bruto - inss;
  const irrf = Math.max(0, calcIrrf2026(base));
  return { liquido: bruto - inss - irrf, inss, irrf };
}

export function salarioBrutoDoLiquido(i: Inputs): Outputs {
  const liq = Number(i.salarioLiquido);
  if (!liq || liq <= 0) throw new Error('Informe o salário líquido desejado.');

  let lo = liq;
  let hi = liq * 2 + 1000;
  let it = 0;
  let mid = lo;
  while (hi - lo > 0.01 && it < 80) {
    mid = (lo + hi) / 2;
    const { liquido } = liquidoDeBruto(mid);
    if (liquido < liq) lo = mid;
    else hi = mid;
    it++;
  }
  const bruto = (lo + hi) / 2;
  const { inss, irrf } = liquidoDeBruto(bruto);

  const formula = `Bruto tal que Bruto − INSS − IRRF = ${fmt(liq)} → ${fmt(bruto)} (bisseção, ${it} iter.)`;
  const explicacao = `Para receber líquido de ${fmt(liq)}, o salário bruto estimado é ${fmt(bruto)}, com INSS ${fmt(inss)} e IRRF ${fmt(irrf)}.`;

  return {
    salarioLiquido: fmt(liq),
    salarioBrutoEstimado: fmt(bruto),
    inssEstimado: fmt(inss),
    irrfEstimado: fmt(irrf),
    iteracoes: it,
    formula,
    explicacao,
  };
}
