/**
 * Cálculo de Rescisão CLT — Acordo Mútuo (Lei 13.467/2017, art. 484-A) 2026
 * Parcelas: saldo + 50% do aviso prévio + 13º + férias + 1/3 + 20% de multa FGTS (metade da multa cheia)
 *           + saque de até 80% do saldo do FGTS.
 * NÃO dá direito ao seguro-desemprego.
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
  avisoPrevio50: string;
  decimoTerceiro: string;
  feriasProporcionais: string;
  tercoConstitucional: string;
  multaFgts20: string;
  fgtsSacavel80: string;
  totalRescisao: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltAcordoMutuo(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const meses = Math.min(12, Math.max(0, Number(i.mesesTrabalhadosAno) || 0));
  const fgts = Number(i.saldoFgts) || 0;
  const anos = Number(i.anosServico) || 0;

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  const diasAvisoCheio = Math.min(90, 30 + anos * 3);
  const avisoPrevio50 = ((sal / 30) * diasAvisoCheio) * 0.5;
  const decimoTerceiro = (sal / 12) * meses;
  const feriasProp = (sal / 12) * meses;
  const terco = feriasProp / 3;
  const multa20 = fgts * 0.20; // 50% da multa de 40% = 20%
  const fgtsSacavel = fgts * 0.80;
  const total = saldoSalario + avisoPrevio50 + decimoTerceiro + feriasProp + terco + multa20 + fgtsSacavel;

  return {
    saldoSalario: brl(saldoSalario),
    avisoPrevio50: brl(avisoPrevio50),
    decimoTerceiro: brl(decimoTerceiro),
    feriasProporcionais: brl(feriasProp),
    tercoConstitucional: brl(terco),
    multaFgts20: brl(multa20),
    fgtsSacavel80: brl(fgtsSacavel),
    totalRescisao: brl(total),
    resumen: `Acordo mútuo (Lei 13.467/2017 art. 484-A): total ≈ ${brl(total)}. Aviso 50%, multa FGTS 20%, saque 80% do FGTS. SEM direito a seguro-desemprego.`,
  };
}
