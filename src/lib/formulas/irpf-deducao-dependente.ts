/**
 * IRPF — Dedução por dependente
 * Valor 2026 (declaração ajuste anual): R$ 2.275,08 por dependente/ano
 * Mensal (folha): R$ 189,59 por dependente
 * Lei 9.250/1995, art. 8º III
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const DEDUCAO_ANUAL = 2275.08;
const DEDUCAO_MENSAL = 189.59;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeducaoDependente(i: Inputs): Outputs {
  const qtde = Number(i.qtdeDependentes) || 0;
  const aliq = (Number(i.aliquotaMarginal) || 27.5) / 100;

  const deducaoAnual = qtde * DEDUCAO_ANUAL;
  const deducaoMensal = qtde * DEDUCAO_MENSAL;
  const economiaIR = deducaoAnual * aliq;

  return {
    qtdeDependentes: qtde,
    deducaoAnual: fmt(deducaoAnual),
    deducaoMensal: fmt(deducaoMensal),
    economiaIR: fmt(economiaIR),
    valorPorDependente: fmt(DEDUCAO_ANUAL),
    resumo: `${qtde} dependente(s) × ${fmt(DEDUCAO_ANUAL)}/ano = ${fmt(deducaoAnual)} dedutível. Na alíquota de ${(aliq * 100).toFixed(1)}% reduz ${fmt(economiaIR)} no IR a pagar (ajuste anual).`,
  };
}
