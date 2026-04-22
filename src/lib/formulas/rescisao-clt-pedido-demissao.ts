/**
 * Cálculo de Rescisão CLT — Pedido de Demissão 2026
 * Parcelas: saldo de salário + 13º proporcional + férias proporcionais + 1/3.
 * NÃO tem multa de 40% do FGTS, NÃO tem aviso prévio indenizado e o FGTS NÃO pode ser sacado.
 * (CLT art. 487, §2º; Lei 8.036/90).
 */

export interface Inputs {
  salario: number | string;
  diasTrabalhadosMes: number | string;
  mesesTrabalhadosAno: number | string;
  cumpriuAvisoPrevio?: string;
}

export interface Outputs {
  saldoSalario: string;
  decimoTerceiro: string;
  feriasProporcionais: string;
  tercoConstitucional: string;
  descontoAvisoNaoCumprido: string;
  totalRescisao: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function rescisaoCltPedidoDemissao(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Math.min(30, Math.max(0, Number(i.diasTrabalhadosMes) || 0));
  const meses = Math.min(12, Math.max(0, Number(i.mesesTrabalhadosAno) || 0));
  const cumpriu = String(i.cumpriuAvisoPrevio || 'sim').toLowerCase() === 'sim';

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const saldoSalario = (sal / 30) * dias;
  const decimoTerceiro = (sal / 12) * meses;
  const feriasProp = (sal / 12) * meses;
  const terco = feriasProp / 3;
  const descontoAviso = cumpriu ? 0 : sal; // se não cumpre, empregador desconta 1 salário
  const total = saldoSalario + decimoTerceiro + feriasProp + terco - descontoAviso;

  return {
    saldoSalario: brl(saldoSalario),
    decimoTerceiro: brl(decimoTerceiro),
    feriasProporcionais: brl(feriasProp),
    tercoConstitucional: brl(terco),
    descontoAvisoNaoCumprido: brl(descontoAviso),
    totalRescisao: brl(total),
    resumen: `Pedido de demissão: total líquido ≈ ${brl(total)}. Sem multa 40% FGTS e sem direito a sacar FGTS. ${cumpriu ? '' : 'Desconto de 1 salário por aviso não cumprido.'}`.trim(),
  };
}
