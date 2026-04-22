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

  return {
    valorAviso: brl(valor),
    reflexo13: brl(reflexo13),
    reflexoFerias: brl(reflexoFerias),
    totalBruto: brl(total),
    resumen: `Aviso prévio indenizado de ${dias} dias: ${brl(valor)} + reflexos em 13º e férias = ${brl(total)} total bruto.`,
  };
}
