/**
 * Cálculo de Rescisão CLT — Demissão por Justa Causa 2026
 * Parcelas: apenas saldo de salário + férias vencidas + 1/3 (se houver).
 * NÃO tem aviso, 13º proporcional, férias proporcionais, multa 40% FGTS nem saque FGTS.
 * (CLT art. 482, 482, 483).
 */

export interface Inputs {
  salario: number | string;
  diasTrabalhadosMes: number | string;
  temFeriasVencidas?: string;
}

export interface Outputs {
  saldoSalario: string;
  feriasVencidas: string;
  tercoFeriasVencidas: string;
  totalRescisao: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltJustaCausa(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const temVencidas = String(i.temFeriasVencidas || 'nao').toLowerCase() === 'sim';

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  const ferias = temVencidas ? sal : 0;
  const terco = temVencidas ? sal / 3 : 0;
  const total = saldoSalario + ferias + terco;

  return {
    saldoSalario: brl(saldoSalario),
    feriasVencidas: brl(ferias),
    tercoFeriasVencidas: brl(terco),
    totalRescisao: brl(total),
    resumen: `Justa causa: total ≈ ${brl(total)}. Apenas saldo de salário${temVencidas ? ' + férias vencidas + 1/3' : ''}. Sem 13º proporcional, aviso prévio, multa 40% FGTS ou saque do FGTS.`,
  };
}
