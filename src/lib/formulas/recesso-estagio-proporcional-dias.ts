// Recesso remunerado do estágio — Lei 11.788/2008 (Lei do Estágio), art. 13.
// 30 dias de recesso a cada 12 meses de estágio; proporcional (2,5 dias/mês) se
// o estágio durar menos de 1 ano. Se a bolsa for remunerada, o recesso também é.
//   dias = 30 × (meses ÷ 12) = 2,5 × meses
//   valor do recesso = bolsa × (dias ÷ 30)

export interface Inputs {
  mesesEstagio: number;  // meses de estágio no período
  valorBolsa?: number;   // bolsa-auxílio mensal (opcional, para recesso remunerado)
}

export interface Outputs {
  diasRecesso: string;
  diasArredondado: string;
  valorRecesso: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num1 = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function compute(i: Inputs): Outputs {
  let meses = Number(i.mesesEstagio);
  if (!isFinite(meses) || meses < 0) meses = 0;
  const bolsa = Math.max(0, Number(i.valorBolsa) || 0);

  const diasExatos = 2.5 * meses;         // 30 dias a cada 12 meses
  const diasArred = Math.round(diasExatos);
  const valorRecesso = bolsa > 0 ? bolsa * (diasExatos / 30) : 0;

  const detalhe =
    `${meses} meses de estágio × 2,5 dias/mês = ${num1(diasExatos)} dias de recesso ` +
    `(30 dias a cada 12 meses). ` +
    (bolsa > 0
      ? `Recesso remunerado = bolsa ${brl(bolsa)} × (${num1(diasExatos)} ÷ 30) = ${brl(valorRecesso)}.`
      : `Informe a bolsa para calcular o valor do recesso remunerado.`);

  return {
    diasRecesso: `${num1(diasExatos)} dias`,
    diasArredondado: `${diasArred} dias`,
    valorRecesso: bolsa > 0 ? brl(valorRecesso) : '—',
    detalhe,
    _insight: {
      title: `Recesso: ${num1(diasExatos)} dias`,
      text:
        `Com **${meses} meses** de estágio, você tem direito a **${num1(diasExatos)} dias** de recesso remunerado ` +
        `(a lei garante 30 dias a cada 12 meses, proporcional para períodos menores)` +
        (bolsa > 0 ? `, no valor de **${brl(valorRecesso)}** com a bolsa de ${brl(bolsa)}.` : `. Informe a bolsa para ver o valor pago no recesso.`),
      tone: 'good',
      icon: '🎓',
    },
    _chart: {
      type: 'bar',
      labels: ['Dias de recesso', 'Restante do período (dias/12m)'],
      values: [Math.round(diasExatos * 10) / 10, Math.max(0, Math.round((30 - diasExatos) * 10) / 10)],
      ariaLabel: `${num1(diasExatos)} dias de recesso proporcionais a ${meses} meses de estágio.`,
    },
  };
}
