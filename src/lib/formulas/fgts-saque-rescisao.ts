/**
 * Cálculo do Saque do FGTS por Rescisão (sem justa causa) 2026
 * Saldo total + multa de 40% paga pelo empregador (CLT art. 18, §1º da Lei 8.036/90)
 */

export interface Inputs {
  saldoFgts: number | string;
  depositosEmpregador?: number | string;
}

export interface Outputs {
  saldoDisponivel: string;
  multa40: string;
  totalReceber: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fgtsSaqueRescisao(i: Inputs): Outputs {
  const saldo = Number(i.saldoFgts) || 0;
  const base = Number(i.depositosEmpregador) || saldo;

  if (saldo <= 0) {
    throw new Error('Informe um saldo de FGTS válido (maior que zero).');
  }

  const multa = base * 0.40;
  const total = saldo + multa;

  const _insight = {
    title: 'Saldo + multa de 40%',
    text: `Na demissão sem justa causa você recebe **${brl(saldo)}** de saldo mais **${brl(multa)}** de multa paga pelo empregador, somando **${brl(total)}**. A multa de 40% representa um acréscimo importante sobre o que estava depositado.`,
    tone: 'good',
    icon: '💰',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Saldo FGTS', value: Number(saldo.toFixed(2)) },
      { label: 'Multa 40%', value: Number(multa.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total a receber',
    ariaLabel: `Total de ${brl(total)} formado por saldo de ${brl(saldo)} e multa de 40% de ${brl(multa)}.`,
  };

  return {
    saldoDisponivel: brl(saldo),
    multa40: brl(multa),
    totalReceber: brl(total),
    resumen: `Na rescisão sem justa causa você saca ${brl(saldo)} de saldo + ${brl(multa)} de multa de 40% = ${brl(total)} total.`,
    _insight,
    _chart,
  };
}
