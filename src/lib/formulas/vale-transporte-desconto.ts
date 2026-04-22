/** Vale-transporte: empregado paga até 6% do salário-base; empresa custeia o excedente.
 *  Lei 7.418/1985.
 */

export interface Inputs {
  salarioBase: number;
  custoMensalTransporte: number;
}

export interface Outputs {
  salarioBase: string;
  custoTotalTransporte: string;
  descontoEmpregado: string;
  subsidioEmpresa: string;
  percentualDesconto: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function valeTransporteDesconto(i: Inputs): Outputs {
  const salario = Number(i.salarioBase);
  const custo = Number(i.custoMensalTransporte);
  if (!salario || salario <= 0) throw new Error('Informe o salário-base.');
  if (custo < 0) throw new Error('Custo do transporte inválido.');

  const teto = salario * 0.06;
  const desconto = Math.min(custo, teto);
  const subsidio = Math.max(0, custo - desconto);
  const perc = (desconto / salario) * 100;

  const formula = `Desconto = mín(6% × ${fmt(salario)}, ${fmt(custo)}) = ${fmt(desconto)}`;
  const explicacao = `O empregado pode ter descontado no máximo 6% do salário-base (${fmt(teto)}). Com custo mensal de transporte de ${fmt(custo)}, desconto é ${fmt(desconto)} e a empresa subsidia ${fmt(subsidio)}.`;

  return {
    salarioBase: fmt(salario),
    custoTotalTransporte: fmt(custo),
    descontoEmpregado: fmt(desconto),
    subsidioEmpresa: fmt(subsidio),
    percentualDesconto: perc.toFixed(2) + '%',
    formula,
    explicacao,
  };
}
