/** Adicional noturno CLT art. 73: 20% sobre hora normal para jornada entre 22h e 5h.
 *  Hora noturna reduzida: 52 min 30s = 1h (fator 60/52,5 = 1,14286).
 */

export interface Inputs {
  salarioMensal: number;
  horasMensais: number;
  horasNoturnasTrabalhadas: number; // em horas "relógio" (22h-5h)
}

export interface Outputs {
  valorHoraNormal: string;
  valorHoraNoturna: string;
  horasNoturnasReduzidas: string;
  adicionalTotal: string;
  valorTotalNoturno: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function adicionalNoturnoClt(i: Inputs): Outputs {
  const salario = Number(i.salarioMensal);
  const horasMes = Number(i.horasMensais) || 220;
  const horasRelogio = Math.max(0, Number(i.horasNoturnasTrabalhadas) || 0);
  if (!salario || salario <= 0) throw new Error('Informe o salário mensal.');

  const horaNormal = salario / horasMes;
  // Hora reduzida: 60min / 52,5min ≈ 1,142857
  const FATOR_REDUZIDO = 60 / 52.5;
  const horasReduzidas = horasRelogio * FATOR_REDUZIDO;
  const horaNoturna = horaNormal * 1.2; // adicional de 20%
  const valorTotal = horasReduzidas * horaNoturna;
  const adicional = horasReduzidas * (horaNormal * 0.2);

  const formula = `Noturno = ${horasRelogio}h (relógio) × ${FATOR_REDUZIDO.toFixed(4)} × ${fmt(horaNoturna)} = ${fmt(valorTotal)}`;
  const explicacao = `Hora normal: ${fmt(horaNormal)}. Jornada noturna (22h-5h) com hora reduzida 52min30s: ${horasRelogio}h relógio = ${horasReduzidas.toFixed(2)}h noturnas computadas. Hora noturna com adicional de 20%: ${fmt(horaNoturna)}. Adicional noturno: ${fmt(adicional)}. Total noturno a pagar: ${fmt(valorTotal)}. Base legal: CLT art. 73.`;

  return {
    valorHoraNormal: fmt(horaNormal),
    valorHoraNoturna: fmt(horaNoturna),
    horasNoturnasReduzidas: horasReduzidas.toFixed(2) + ' h',
    adicionalTotal: fmt(adicional),
    valorTotalNoturno: fmt(valorTotal),
    formula,
    explicacao,
  };
}
