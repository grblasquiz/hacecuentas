/** INSS Contribuinte Individual (Autônomo) 2026.
 * Plano Simplificado (11% sobre salário mínimo): dá direito a aposentadoria por idade apenas.
 * Plano Normal (20% sobre valor escolhido, entre SM e teto): dá direito a todos os benefícios.
 */

export interface Inputs {
  plano: 'simplificado' | 'normal' | string;
  baseContribuicao: number; // valor sobre o qual calcular (só para plano normal)
}

export interface Outputs {
  planoEscolhido: string;
  aliquota: string;
  baseAplicada: string;
  contribuicaoMensal: string;
  direitos: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function inssAutonomoIndividual(i: Inputs): Outputs {
  const plano = String(i.plano || 'normal').toLowerCase();
  const base = Number(i.baseContribuicao);
  if (!base) throw new Error('Informe a base de contribuição.');

  const salarioMinimo = 1518;
  const teto = 8157.41;

  let aliquota: number;
  let baseAplicada: number;
  let direitos: string;
  let planoDesc: string;

  if (plano === 'simplificado') {
    aliquota = 0.11;
    baseAplicada = salarioMinimo;
    planoDesc = 'Plano Simplificado (11% sobre SM)';
    direitos = 'Apenas aposentadoria por idade. Não dá direito a aposentadoria por tempo de contribuição.';
  } else {
    aliquota = 0.20;
    baseAplicada = Math.min(Math.max(base, salarioMinimo), teto);
    planoDesc = 'Plano Normal (20%)';
    direitos = 'Todos os benefícios: aposentadoria por idade, tempo de contribuição, auxílio-doença, salário-maternidade, pensão por morte.';
  }

  const contribuicao = baseAplicada * aliquota;
  const formula = `${plano === 'simplificado' ? '11%' : '20%'} × ${fmtBRL(baseAplicada)} = ${fmtBRL(contribuicao)}`;
  const explicacao = `Contribuinte individual (autônomo) pode optar por dois planos: (1) Simplificado 11% sobre o salário mínimo (${fmtBRL(salarioMinimo)}) — só dá direito à aposentadoria por idade; (2) Normal 20% sobre a base escolhida entre ${fmtBRL(salarioMinimo)} e o teto (${fmtBRL(teto)}) — dá direito a todos os benefícios. Código de recolhimento GPS: 1007 (normal) ou 1163 (simplificado mensal).`;

  return {
    planoEscolhido: planoDesc,
    aliquota: plano === 'simplificado' ? '11%' : '20%',
    baseAplicada: fmtBRL(baseAplicada),
    contribuicaoMensal: fmtBRL(contribuicao),
    direitos,
    formula,
    explicacao,
  };
}
