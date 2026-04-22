/** 1ª parcela do 13º salário: 50% sem descontos, paga até 30/novembro.
 *  Lei 4.090/1962 e Lei 4.749/1965.
 */

export interface Inputs {
  salarioBruto: number;
  mesesTrabalhados: number;
}

export interface Outputs {
  decimoBruto: string;
  primeiraParcela: string;
  dataLimite: string;
  formula: string;
  explicacao: string;
}

const fmt = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function decimoTerceiroPrimeiraParcela(i: Inputs): Outputs {
  const salario = Number(i.salarioBruto);
  const meses = Math.min(12, Math.max(0, Math.floor(Number(i.mesesTrabalhados) || 12)));
  if (!salario || salario <= 0) throw new Error('Informe o salário bruto.');

  const decimoBruto = (salario / 12) * meses;
  const primeira = decimoBruto / 2;

  const formula = `1ª parcela = (Salário/12) × meses × 0,5 = (${fmt(salario)}/12) × ${meses} × 50% = ${fmt(primeira)}`;
  const explicacao = `A primeira parcela do 13º corresponde a 50% do valor integral e é paga entre fevereiro e 30 de novembro, sem descontos de INSS ou IRRF. Com ${meses}/12 meses trabalhados, valor: ${fmt(primeira)}.`;

  return {
    decimoBruto: fmt(decimoBruto),
    primeiraParcela: fmt(primeira),
    dataLimite: '30 de novembro',
    formula,
    explicacao,
  };
}
