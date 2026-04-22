/**
 * Cálculo de Rescisão CLT — Demissão sem Justa Causa 2026
 * Parcelas: saldo de salário + aviso prévio + 13º proporcional + férias proporcionais + 1/3
 *           + multa de 40% sobre FGTS (CLT art. 477, 487, Lei 8.036/90 art. 18).
 * Salário mínimo 2026: R$ 1.518/mês.
 */

export interface Inputs {
  salario: number | string;
  diasTrabalhadosMes: number | string;
  mesesTrabalhadosAno: number | string;
  saldoFgts: number | string;
  anosServico?: number | string;
}

export interface Outputs {
  saldoSalario: string;
  avisoPrevio: string;
  decimoTerceiro: string;
  feriasProporcionais: string;
  tercoConstitucional: string;
  multaFgts40: string;
  totalRescisao: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltSemJustaCausa(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const meses = Math.min(12, Math.max(0, Number(i.mesesTrabalhadosAno) || 0));
  const fgts = Number(i.saldoFgts) || 0;
  const anos = Number(i.anosServico) || 0;

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  // aviso prévio indenizado: 30 dias + proporcional 3 dias por ano (Lei 12.506/2011), máx 90 dias
  const diasAviso = Math.min(90, 30 + anos * 3);
  const avisoPrevio = (sal / 30) * diasAviso;
  const decimoTerceiro = (sal / 12) * meses;
  const feriasProp = (sal / 12) * meses;
  const terco = feriasProp / 3;
  const multa = fgts * 0.40;
  const total = saldoSalario + avisoPrevio + decimoTerceiro + feriasProp + terco + multa;

  return {
    saldoSalario: brl(saldoSalario),
    avisoPrevio: brl(avisoPrevio),
    decimoTerceiro: brl(decimoTerceiro),
    feriasProporcionais: brl(feriasProp),
    tercoConstitucional: brl(terco),
    multaFgts40: brl(multa),
    totalRescisao: brl(total),
    resumen: `Demissão sem justa causa: total bruto ≈ ${brl(total)}. Inclui aviso prévio de ${diasAviso} dias, 13º e férias proporcionais + 1/3 + multa 40% do FGTS.`,
  };
}
