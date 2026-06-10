import { SALARIO_MINIMO } from '../data/brasil-2026';
/** Pensão por Morte INSS (pós-EC 103/2019).
 * Cônjuge: 50% + 10% por dependente (máx 100%).
 * Se óbito por acidente de trabalho ou doença profissional: 100% do benefício.
 */

export interface Inputs {
  beneficioSegurado: number; // valor que o segurado recebia ou teria direito
  numDependentes: number; // número total de dependentes (incluindo cônjuge)
  acidenteTrabalho?: boolean | string;
}

export interface Outputs {
  percentualTotal: string;
  cotaCadaDependente: string;
  valorTotalPensao: string;
  valorPorDependente: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function pensaoPorMorteInss(i: Inputs): Outputs {
  const beneficio = Number(i.beneficioSegurado);
  const deps = Math.max(1, Math.floor(Number(i.numDependentes) || 1));
  const acidente = i.acidenteTrabalho === true || i.acidenteTrabalho === 'true' || i.acidenteTrabalho === 'sim';
  if (!beneficio) throw new Error('Informe o benefício do segurado e número de dependentes.');

  const salarioMinimo = SALARIO_MINIMO;
  let percentual: number;
  if (acidente) {
    percentual = 100;
  } else {
    percentual = Math.min(100, 50 + deps * 10);
  }
  const valorTotal = Math.max(salarioMinimo, beneficio * (percentual / 100));
  const porDep = valorTotal / deps;

  const formula = acidente
    ? `Acidente/doença profissional → 100% do benefício = ${fmtBRL(valorTotal)}`
    : `50% + ${deps} × 10% = ${percentual}% × ${fmtBRL(beneficio)} = ${fmtBRL(valorTotal)}`;
  const explicacao = `Pensão por morte pós-EC 103/2019: cota familiar de 50% fixa + 10% por dependente (cônjuge, filhos menores de 21, filhos inválidos). Máximo 100%. Em caso de óbito por acidente de trabalho ou doença profissional, o benefício é sempre 100%. Valor mínimo: salário mínimo (${fmtBRL(salarioMinimo)}). A cota individual não reverte aos outros dependentes quando um deles perde o direito (regra nova).`;

  const noPiso = valorTotal <= salarioMinimo + 0.01 && beneficio * (percentual / 100) < salarioMinimo;
  const _insight = {
    title: 'Valor da pensão',
    text: acidente
      ? `Por óbito decorrente de acidente de trabalho ou doença profissional, a pensão é de **100%** do benefício: **${fmtBRL(valorTotal)}** por mês, dividida entre ${deps} dependente${deps > 1 ? 's' : ''}.`
      : noPiso
        ? `O cálculo (50% + ${deps} × 10% = ${percentual}%) ficaria abaixo do piso, então a pensão é elevada ao **salário mínimo: ${fmtBRL(valorTotal)}** por mês.`
        : `A cota familiar fixa de 50% mais ${deps} × 10% somam **${percentual}%** do benefício: **${fmtBRL(valorTotal)}** por mês${deps > 1 ? `, ou ${fmtBRL(porDep)} por dependente` : ''}.`,
    tone: acidente ? 'good' : 'neutral',
    icon: '🕊️',
  };

  const _chart = deps > 1 ? {
    type: 'doughnut',
    slices: Array.from({ length: deps }, (_, idx) => ({
      label: `Dependente ${idx + 1}`,
      value: Number(porDep.toFixed(2)),
    })),
    prefix: 'R$ ',
    centerValue: fmtBRL(valorTotal),
    centerLabel: 'Total/mês',
    ariaLabel: `Pensão total de ${fmtBRL(valorTotal)} dividida em ${deps} cotas iguais de ${fmtBRL(porDep)}`,
  } : undefined;

  return {
    percentualTotal: `${percentual}%`,
    cotaCadaDependente: '10% por dependente',
    valorTotalPensao: fmtBRL(valorTotal),
    valorPorDependente: fmtBRL(porDep),
    formula,
    explicacao,
    _insight,
    _chart,
  };
}
