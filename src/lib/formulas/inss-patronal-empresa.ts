/** INSS Patronal (Contribuição da Empresa) 2026.
 * 20% sobre folha de pagamento (empresas não optantes pelo Simples).
 * + RAT (Riscos Ambientais do Trabalho): 1%, 2% ou 3% conforme grau de risco.
 * + Terceiros (Sistema S, INCRA, SENAI/SESI/SENAC/SESC/SEBRAE): ~5,8% em média.
 */

export interface Inputs {
  folhaPagamento: number;
  grauRisco: '1' | '2' | '3' | string; // 1%, 2% ou 3%
  percentualTerceiros?: number; // default 5.8
}

export interface Outputs {
  inssPatronal: string;
  rat: string;
  terceiros: string;
  totalEncargos: string;
  percentualTotalFolha: string;
  formula: string;
  explicacao: string;
}

const fmtBRL = (n: number) =>
  'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function inssPatronalEmpresa(i: Inputs): Outputs {
  const folha = Number(i.folhaPagamento);
  const risco = String(i.grauRisco || '2');
  const pTerc = Number(i.percentualTerceiros || 5.8);
  if (!folha) throw new Error('Informe o valor da folha de pagamento.');

  const aliqRat = risco === '1' ? 0.01 : risco === '3' ? 0.03 : 0.02;
  const inss = folha * 0.20;
  const rat = folha * aliqRat;
  const terceiros = folha * (pTerc / 100);
  const total = inss + rat + terceiros;
  const pctTotal = (total / folha) * 100;

  const formula = `20% + ${(aliqRat * 100).toFixed(0)}% (RAT) + ${pTerc.toFixed(1)}% (terceiros) = ${pctTotal.toFixed(1)}% × ${fmtBRL(folha)}`;
  const explicacao = `INSS patronal é a contribuição previdenciária devida pela empresa: 20% sobre o total da folha de pagamento + RAT/SAT (1%, 2% ou 3% conforme grau de risco da atividade — baixo/médio/alto) + contribuição para Terceiros (Sistema S, INCRA, SEBRAE) que varia de 2,5% a 5,8%. Empresas optantes pelo Simples Nacional recolhem via DAS (não se aplica essa regra). Recolhimento via GPS até o dia 20 do mês seguinte.`;

  return {
    inssPatronal: fmtBRL(inss),
    rat: `${fmtBRL(rat)} (${(aliqRat * 100).toFixed(0)}%)`,
    terceiros: `${fmtBRL(terceiros)} (${pTerc.toFixed(1)}%)`,
    totalEncargos: fmtBRL(total),
    percentualTotalFolha: pctTotal.toFixed(2) + '%',
    formula,
    explicacao,
  };
}
