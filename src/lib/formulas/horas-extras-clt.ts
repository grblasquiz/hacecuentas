/** Horas extras CLT: 50% (dia útil) ou 100% (domingo/feriado) + reflexo no DSR.
 *  CF art. 7º XVI, CLT art. 59. DSR: (HE/dias úteis) × dias descanso no mês.
 */

export interface Inputs {
  salarioMensal: number;
  horasMensais: number; // jornada contratual (ex.: 220h)
  horasExtrasDiaUtil: number;
  horasExtrasDomingoFeriado: number;
  diasUteisMes: number;
  diasDescansoMes: number;
}

export interface Outputs {
  valorHoraNormal: string;
  valorHora50: string;
  valorHora100: string;
  totalHoras50: string;
  totalHoras100: string;
  reflexoDsr: string;
  totalReceber: string;
  formula: string;
  explicacao: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function horasExtrasClt(i: Inputs): Outputs {
  const salario = Number(i.salarioMensal);
  const horasMes = Number(i.horasMensais) || 220;
  const he50 = Math.max(0, Number(i.horasExtrasDiaUtil) || 0);
  const he100 = Math.max(0, Number(i.horasExtrasDomingoFeriado) || 0);
  const dUt = Math.max(1, Number(i.diasUteisMes) || 25);
  const dDesc = Math.max(0, Number(i.diasDescansoMes) || 5);
  if (!salario || salario <= 0) throw new Error('Informe o salário mensal.');

  const horaNormal = salario / horasMes;
  const hora50 = horaNormal * 1.5;
  const hora100 = horaNormal * 2;
  const total50 = hora50 * he50;
  const total100 = hora100 * he100;
  const somaHe = total50 + total100;
  const reflexoDsr = (somaHe / dUt) * dDesc;
  const totalReceber = somaHe + reflexoDsr;

  const formula = `HE = ${he50}h × ${fmt(hora50)} + ${he100}h × ${fmt(hora100)} + DSR ${fmt(reflexoDsr)} = ${fmt(totalReceber)}`;
  const explicacao = `Hora normal: ${fmt(horaNormal)} (salário ${fmt(salario)} / ${horasMes}h). HE 50% dia útil: ${he50}h × ${fmt(hora50)} = ${fmt(total50)}. HE 100% domingo/feriado: ${he100}h × ${fmt(hora100)} = ${fmt(total100)}. Reflexo no DSR: (${fmt(somaHe)} / ${dUt}) × ${dDesc} = ${fmt(reflexoDsr)}. Total: ${fmt(totalReceber)}. Base legal: CF art. 7º XVI e CLT art. 59.`;

  const pctDsr = totalReceber > 0 ? (reflexoDsr / totalReceber) * 100 : 0;
  const insight = {
    title: 'O que você recebe de hora extra',
    text: `Por **${he50 + he100}h extras** você recebe **${fmt(totalReceber)}**: ${fmt(total50)} a 50%, ${fmt(total100)} a 100% e mais **${fmt(reflexoDsr)}** de reflexo no DSR (**${pctDsr.toFixed(0)}%** do total). Muita gente esquece o DSR, mas ele é devido por lei (Súmula 172 do TST).`,
    tone: 'good',
    icon: '💰',
  };
  const chart = totalReceber > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'HE 50%', value: Math.round(total50 * 100) / 100 },
      { label: 'HE 100%', value: Math.round(total100 * 100) / 100 },
      { label: 'Reflexo DSR', value: Math.round(reflexoDsr * 100) / 100 },
    ],
    prefix: 'R$ ',
    centerValue: fmt(totalReceber),
    centerLabel: 'Total a receber',
    ariaLabel: 'Composição do total de horas extras: HE a 50%, HE a 100% e reflexo no DSR',
  } : undefined;

  return {
    valorHoraNormal: fmt(horaNormal),
    valorHora50: fmt(hora50),
    valorHora100: fmt(hora100),
    totalHoras50: fmt(total50),
    totalHoras100: fmt(total100),
    reflexoDsr: fmt(reflexoDsr),
    totalReceber: fmt(totalReceber),
    formula,
    explicacao,
    _insight: insight,
    _chart: chart,
  };
}
