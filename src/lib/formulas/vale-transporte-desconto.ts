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
  _insight?: any;
  _chart?: any;
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

  const noTeto = custo >= teto && custo > 0;
  const _insight = {
    title: noTeto ? 'Desconto no teto de 6%' : 'Desconto abaixo do teto',
    text: noTeto
      ? `O custo do transporte (${fmt(custo)}) supera o teto legal: você desconta o máximo de **6% (${fmt(teto)})** e a empresa subsidia os **${fmt(subsidio)}** restantes.`
      : `Com custo de ${fmt(custo)}, seu desconto é de **${fmt(desconto)}** (${perc.toFixed(2)}% do salário), abaixo do teto de 6% (${fmt(teto)}). A empresa subsidia **${fmt(subsidio)}**.`,
    tone: noTeto ? 'warn' : 'good',
    icon: '🚌',
  };

  const slices = [
    { label: 'Desconto do empregado', value: Number(desconto.toFixed(2)) },
    { label: 'Subsídio da empresa', value: Number(subsidio.toFixed(2)) },
  ].filter(s => s.value > 0);
  const _chart = custo > 0 ? {
    type: 'doughnut',
    slices,
    prefix: 'R$ ',
    centerValue: fmt(custo).replace('R$ ', ''),
    centerLabel: 'custo total',
    ariaLabel: `Composição do vale-transporte: desconto do empregado ${fmt(desconto)} e subsídio da empresa ${fmt(subsidio)}, custo total ${fmt(custo)}.`,
  } : undefined;

  return {
    salarioBase: fmt(salario),
    custoTotalTransporte: fmt(custo),
    descontoEmpregado: fmt(desconto),
    subsidioEmpresa: fmt(subsidio),
    percentualDesconto: perc.toFixed(2) + '%',
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
