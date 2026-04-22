/**
 * Cálculo do Aviso Prévio Proporcional (Lei 12.506/2011) 2026
 * 30 dias + 3 dias por ano trabalhado no mesmo empregador, limitado a 90 dias no total.
 * Aplica-se apenas em favor do empregado (demissão sem justa causa).
 */

export interface Inputs {
  salario: number | string;
  anosServico: number | string;
}

export interface Outputs {
  diasAviso: string;
  valorAviso: string;
  diasAdicionais: string;
  atingiuMaximo: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function avisoPrevioProporcional(i: Inputs): Outputs {
  const sal = Number(i.salario) || 0;
  const anos = Math.max(0, Number(i.anosServico) || 0);

  if (sal <= 0) throw new Error('Informe um salário mensal válido (maior que zero).');

  const adicionaisSemLimite = anos * 3;
  const diasBrutos = 30 + adicionaisSemLimite;
  const dias = Math.min(90, diasBrutos);
  const adicionais = dias - 30;
  const valor = (sal / 30) * dias;
  const atingiu = diasBrutos >= 90;

  return {
    diasAviso: `${dias} dias`,
    valorAviso: brl(valor),
    diasAdicionais: `${adicionais} dias`,
    atingiuMaximo: atingiu ? 'Sim (teto 90 dias)' : 'Não',
    resumen: `Aviso prévio proporcional (Lei 12.506/2011): ${dias} dias (30 + ${adicionais} adicionais) = ${brl(valor)}. ${atingiu ? 'Atingiu teto legal de 90 dias.' : ''}`.trim(),
  };
}
