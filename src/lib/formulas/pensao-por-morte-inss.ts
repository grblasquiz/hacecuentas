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
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function pensaoPorMorteInss(i: Inputs): Outputs {
  const beneficio = Number(i.beneficioSegurado);
  const deps = Math.max(1, Math.floor(Number(i.numDependentes) || 1));
  const acidente = i.acidenteTrabalho === true || i.acidenteTrabalho === 'true' || i.acidenteTrabalho === 'sim';
  if (!beneficio) throw new Error('Informe o benefício do segurado e número de dependentes.');

  const salarioMinimo = 1518;
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

  return {
    percentualTotal: `${percentual}%`,
    cotaCadaDependente: '10% por dependente',
    valorTotalPensao: fmtBRL(valorTotal),
    valorPorDependente: fmtBRL(porDep),
    formula,
    explicacao,
  };
}
