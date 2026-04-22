/** Salário-Maternidade INSS.
 * 4 meses (120 dias) de salário integral.
 * Para empregadas CLT: média dos 6 últimos salários.
 * Para contribuinte individual: média dos 12 últimos salários contribuição.
 * Limitado ao teto INSS.
 */

export interface Inputs {
  tipoSegurada: 'clt' | 'individual' | string;
  mediaSalarial: number;
}

export interface Outputs {
  duracao: string;
  valorMensal: string;
  valorTotal4Meses: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function salarioMaternidadeInss(i: Inputs): Outputs {
  const tipo = String(i.tipoSegurada || 'clt').toLowerCase();
  const media = Number(i.mediaSalarial);
  if (!media) throw new Error('Informe a média salarial.');

  const teto = 8157.41;
  const salarioMinimo = 1518;
  const mediaAplicada = Math.min(media, teto);
  const mensal = Math.max(mediaAplicada, salarioMinimo);
  const total = mensal * 4;

  const baseDesc = tipo === 'individual' ? 'média dos 12 últimos salários de contribuição' : 'média dos 6 últimos salários (CLT)';
  const formula = `Salário integral × 4 meses = ${fmtBRL(mensal)} × 4 = ${fmtBRL(total)}`;
  const explicacao = `Salário-maternidade: 120 dias (4 meses) de licença remunerada por nascimento, adoção ou guarda de criança. Base de cálculo: ${baseDesc}, limitada ao teto INSS (${fmtBRL(teto)}). Mínimo: salário mínimo (${fmtBRL(salarioMinimo)}). Carência: contribuinte individual/facultativa precisa 10 contribuições; segurada CLT não tem carência (só precisa ter contribuído ao INSS). Empresas Cidadãs podem estender para 180 dias.`;

  return {
    duracao: '4 meses (120 dias)',
    valorMensal: fmtBRL(mensal),
    valorTotal4Meses: fmtBRL(total),
    formula,
    explicacao,
  };
}
