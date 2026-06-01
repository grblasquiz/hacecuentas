/**
 * Cálculo do Aviso Prévio Indenizado 2026
 * 30 dias básicos (CLT art. 487) pagos como salário integral sem obrigação de cumprimento.
 * Projeta no tempo de serviço para 13º e férias.
 */

export interface Inputs {
  salario: number | string;
  diasAviso?: number | string;
}

export interface Outputs {
  valorAviso: string;
  reflexo13: string;
  reflexoFerias: string;
  totalBruto: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function avisoPrevioIndenizado(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const dias = Number(i.diasAviso) || 30;

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const valor = (sal / 30) * dias;
  const reflexo13 = valor / 12;
  const reflexoFerias = valor / 12 + (valor / 12) / 3;
  const total = valor + reflexo13 + reflexoFerias;

  const pctReflexos = total > 0 ? Math.round(((reflexo13 + reflexoFerias) / total) * 100) : 0;

  return {
    valorAviso: brl(valor),
    reflexo13: brl(reflexo13),
    reflexoFerias: brl(reflexoFerias),
    totalBruto: brl(total),
    resumen: `Aviso prévio indenizado de ${dias} dias: ${brl(valor)} + reflexos em 13º e férias = ${brl(total)} total bruto.`,
    _insight: {
      title: 'Quanto você recebe',
      text: `Seu aviso prévio indenizado de **${dias} dias** soma **${brl(total)}** brutos: ${brl(valor)} do aviso mais **${brl(reflexo13 + reflexoFerias)}** em reflexos de 13º e férias (${pctReflexos}% extra). Esse valor entra na rescisão e tem desconto de INSS/IRRF na fonte.`,
      tone: 'good',
      icon: '💼',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Aviso prévio', value: Number(valor.toFixed(2)) },
        { label: 'Reflexo 13º', value: Number(reflexo13.toFixed(2)) },
        { label: 'Reflexo férias', value: Number(reflexoFerias.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(total),
      centerLabel: 'Total bruto',
      ariaLabel: `Composição do total bruto: aviso prévio ${brl(valor)}, reflexo 13º ${brl(reflexo13)}, reflexo férias ${brl(reflexoFerias)}.`,
    },
  };
}
