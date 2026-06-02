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
  _insight?: any;
  _chart?: any;
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

  const segunda = decimoBruto - primeira;
  const mesesTxt = meses < 12 ? `proporcional a ${meses}/12 meses` : 'integral (12 meses)';

  return {
    decimoBruto: fmt(decimoBruto),
    primeiraParcela: fmt(primeira),
    dataLimite: '30 de novembro',
    formula,
    explicacao,
    _insight: {
      title: 'O que você recebe agora',
      text: `A 1ª parcela é **${fmt(primeira)}** — metade do 13º ${mesesTxt} (**${fmt(decimoBruto)}**), paga até 30/nov **sem descontos**. INSS e IRRF só incidem na 2ª parcela, em dezembro.`,
      tone: 'good',
      icon: '💵',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: '1ª parcela (até 30/nov)', value: Number(primeira.toFixed(2)) },
        { label: '2ª parcela (até 20/dez)', value: Number(segunda.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: fmt(decimoBruto),
      centerLabel: '13º bruto',
      ariaLabel: `13º salário bruto de ${fmt(decimoBruto)} dividido em duas parcelas iguais`,
    },
  };
}
