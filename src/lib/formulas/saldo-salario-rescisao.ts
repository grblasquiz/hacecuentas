/**
 * Cálculo do Saldo de Salário na Rescisão 2026
 * Fórmula: (salário mensal / 30) × dias efetivamente trabalhados no mês da rescisão.
 * Base: CLT art. 477 e 478.
 */

export interface Inputs {
  salarioMensal: number | string;
  diasTrabalhadosMes: number | string;
}

export interface Outputs {
  saldoSalario: string;
  valorDiario: string;
  diasConsiderados: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function saldoSalarioRescisao(i: Inputs): Outputs {
  const sal = Number(i.salarioMensal) || 0;
  const dias = Math.min(31, Math.max(0, Number(i.diasTrabalhadosMes) || 0));

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const diario = sal / 30;
  const total = diario * dias;

  return {
    saldoSalario: brl(total),
    valorDiario: brl(diario),
    diasConsiderados: `${dias} dias`,
    resumen: `Saldo de salário = (${brl(sal)} / 30) × ${dias} = ${brl(total)}.`,
  };
}
