/**
 * Cálculo do Descanso Semanal Remunerado (DSR) sobre horas extras e comissões 2026
 * Base: Lei 605/1949. Fórmula usual (semana de 6 dias úteis + 1 domingo/feriado):
 *   DSR = (valor horas extras no mês / dias úteis) × dias de descanso (domingos + feriados).
 */

export interface Inputs {
  totalHorasExtrasMes: number | string;
  diasUteisMes: number | string;
  diasDescansoMes: number | string;
}

export interface Outputs {
  valorDsr: string;
  baseMes: string;
  totalComDsr: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dsrDescansoSemanal(i: Inputs): Outputs {
  const base = Number(i.totalHorasExtrasMes) || 0;
  const uteis = Math.max(1, Number(i.diasUteisMes) || 26);
  const descanso = Math.max(0, Number(i.diasDescansoMes) || 4);

  if (base <= 0) throw new Error('Informe o valor total de horas extras do mês (maior que zero).');

  const dsr = (base / uteis) * descanso;
  const total = base + dsr;

  const pctDsr = base > 0 ? (dsr / base) * 100 : 0;
  const _insight = {
    title: 'DSR sobre horas extras',
    text: `O DSR adiciona **${brl(dsr)}** (${pctDsr.toFixed(1)}%) sobre as **${brl(base)}** de horas extras, totalizando **${brl(total)}** a receber. O cálculo usa ${descanso} dia(s) de descanso e ${uteis} dia(s) útil(eis) no mês, conforme a Lei 605/1949.`,
    tone: 'good',
    icon: '💵',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Horas extras', value: Number(base.toFixed(2)) },
      { label: 'DSR', value: Number(dsr.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: brl(total),
    centerLabel: 'Total',
    ariaLabel: `Total de ${brl(total)}: horas extras ${brl(base)} mais DSR ${brl(dsr)}.`,
  };
  return {
    valorDsr: brl(dsr),
    baseMes: brl(base),
    totalComDsr: brl(total),
    resumen: `DSR sobre ${brl(base)} de horas extras: ${brl(dsr)} (Lei 605/1949). Total recebido: ${brl(total)}.`,
    _insight,
    _chart,
  };
}
