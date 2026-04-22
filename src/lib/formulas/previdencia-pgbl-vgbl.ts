/**
 * PGBL vs VGBL — comparador 2026.
 * PGBL: aporte dedutível do IR até 12% da renda bruta tributável (só declaração COMPLETA).
 *       IR sobre o valor total do resgate.
 * VGBL: aporte não dedutível. IR só sobre o rendimento.
 * Tabela regressiva (escolhida): 35% até 10%, redução 5% a cada 2 anos. (Decreto 3.000/99, Lei 11.053/2004)
 */

export interface Inputs {
  rendaBrutaAnual: number | string;
  aporteAnual: number | string;
  anos: number | string;
  rentabilidadeAnual: number | string; // % aa
  declaracao: string;                  // 'completa' | 'simplificada'
  tabela?: string;                     // 'progressiva' | 'regressiva' (default regressiva)
}

export interface Outputs {
  aporteTotal: string;
  montanteBrutoPgbl: string;
  montanteBrutoVgbl: string;
  deducaoIrPgblAnual: string;
  economiaIrTotalPgbl: string;
  irResgatePgbl: string;
  irResgateVgbl: string;
  liquidoPgbl: string;
  liquidoVgbl: string;
  recomendacao: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function aliqRegressivaPrev(anos: number): number {
  if (anos <= 2) return 0.35;
  if (anos <= 4) return 0.30;
  if (anos <= 6) return 0.25;
  if (anos <= 8) return 0.20;
  if (anos <= 10) return 0.15;
  return 0.10;
}

export function previdenciaPgblVgbl(i: Inputs): Outputs {
  const renda = Number(i.rendaBrutaAnual) || 0;
  const aporte = Number(i.aporteAnual) || 0;
  const anos = Number(i.anos) || 0;
  const rent = Number(i.rentabilidadeAnual) || 0;
  const decl = (i.declaracao || 'completa').toString().toLowerCase();
  const tabela = (i.tabela || 'regressiva').toString().toLowerCase();

  if (aporte <= 0) throw new Error('Informe o aporte anual.');
  if (anos <= 0) throw new Error('Informe o prazo em anos.');

  const rentMensal = Math.pow(1 + rent / 100, 1 / 12) - 1;
  // Anuidade antecipada simplificada: monta aporte único anual capitalizado
  let montante = 0;
  for (let a = 0; a < anos; a++) {
    montante = (montante + aporte) * (1 + rent / 100);
  }
  const aporteTotal = aporte * anos;
  const rendimento = montante - aporteTotal;

  // PGBL: dedução anual limitada a 12% da renda (somente completa)
  const limiteDeducao = renda * 0.12;
  const aporteDedutivel = decl === 'completa' ? Math.min(aporte, limiteDeducao) : 0;
  const aliqMarginalIr = 0.275; // assume faixa superior IRPF
  const deducaoAnual = aporteDedutivel * aliqMarginalIr;
  const economiaTotal = deducaoAnual * anos;

  const aliq = tabela === 'regressiva' ? aliqRegressivaPrev(anos) : 0.275;

  const irPgbl = montante * aliq;            // IR sobre tudo
  const irVgbl = rendimento * aliq;          // IR só sobre rendimento
  const liquidoPgbl = montante - irPgbl + economiaTotal;
  const liquidoVgbl = montante - irVgbl;

  const diff = liquidoPgbl - liquidoVgbl;
  const recom = decl === 'completa' && diff > 0
    ? `PGBL vence por ${brl(diff)} (você faz declaração completa e aproveita a dedução de até 12%).`
    : decl !== 'completa'
      ? 'VGBL é mais indicado: sem declaração completa, você não aproveita o benefício fiscal do PGBL.'
      : `VGBL vence por ${brl(-diff)} (o aporte excede o teto dedutível).`;

  return {
    aporteTotal: brl(aporteTotal),
    montanteBrutoPgbl: brl(montante),
    montanteBrutoVgbl: brl(montante),
    deducaoIrPgblAnual: brl(deducaoAnual),
    economiaIrTotalPgbl: brl(economiaTotal),
    irResgatePgbl: brl(irPgbl),
    irResgateVgbl: brl(irVgbl),
    liquidoPgbl: brl(liquidoPgbl),
    liquidoVgbl: brl(liquidoVgbl),
    recomendacao: recom,
    resumen: `Após ${anos} anos aportando ${brl(aporte)}/ano: PGBL líquido ${brl(liquidoPgbl)} vs VGBL líquido ${brl(liquidoVgbl)}. ${recom}`,
  };
}
