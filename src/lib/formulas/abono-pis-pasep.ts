/**
 * Abono Salarial PIS/PASEP 2026
 * Elegibilidade:
 *   - Estar cadastrado no PIS/PASEP há pelo menos 5 anos
 *   - Ter trabalhado com carteira assinada ao menos 30 dias no ano-base
 *   - Salário médio até 2 salários mínimos
 *   - Empregador ter informado dados na RAIS/eSocial
 * Valor: 1 salário mínimo proporcional aos meses trabalhados (1/12 por mês).
 * Salário mínimo 2026: R$ 1.518 (paga com base no SM vigente no ano do pagamento).
 */

export interface AbonoPisPasepInputs {
  salarioMedioAnoBase: number;
  mesesTrabalhadosAnoBase: number;
  anosCadastroPis: number;
}

export interface AbonoPisPasepOutputs {
  elegivel: string;
  valorAbono: number;
  fracaoAplicada: string;
  formula: string;
  explicacion: string;
}

const SALARIO_MINIMO = 1518;
const LIMITE_SALARIO = 2 * SALARIO_MINIMO; // 2 SM

export function abonoPisPasep(inputs: AbonoPisPasepInputs): AbonoPisPasepOutputs {
  const salarioMedio = Number(inputs.salarioMedioAnoBase) || 0;
  const meses = Math.min(12, Math.max(0, Number(inputs.mesesTrabalhadosAnoBase) || 0));
  const anosPis = Number(inputs.anosCadastroPis) || 0;

  const atendeCadastro = anosPis >= 5;
  const atendeSalario = salarioMedio > 0 && salarioMedio <= LIMITE_SALARIO;
  const atendeMeses = meses >= 1;

  let motivo = '';
  let elegivelBool = false;

  if (atendeCadastro && atendeSalario && atendeMeses) {
    elegivelBool = true;
    motivo = 'Elegível: 5+ anos de PIS/PASEP, salário ≤ 2 SM e ao menos 1 mês trabalhado';
  } else {
    const problemas: string[] = [];
    if (!atendeCadastro) problemas.push('precisa ≥ 5 anos de cadastro PIS/PASEP');
    if (!atendeSalario) problemas.push(`salário médio ≤ 2 SM (R$ ${LIMITE_SALARIO})`);
    if (!atendeMeses) problemas.push('precisa ≥ 30 dias trabalhados no ano-base');
    motivo = 'Não elegível: ' + problemas.join(', ');
  }

  const fracao = meses / 12;
  const valorAbono = elegivelBool ? Math.round(SALARIO_MINIMO * fracao * 100) / 100 : 0;

  const formula = `Abono = 1 SM × (meses trabalhados / 12) = R$ ${SALARIO_MINIMO} × (${meses}/12) = R$ ${valorAbono.toFixed(2)}`;
  const explicacion = `${motivo}. Valor do abono PIS/PASEP 2026: R$ ${valorAbono.toFixed(2)} (proporcional aos ${meses} meses trabalhados no ano-base). O pagamento é feito pela Caixa (PIS) ou Banco do Brasil (PASEP) conforme calendário anual.`;

  return {
    elegivel: motivo,
    valorAbono,
    fracaoAplicada: `${meses}/12`,
    formula,
    explicacion,
  };
}
