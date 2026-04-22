/** DAS MEI mensal — Comércio e Indústria (2026)
 *  Valor fixo 2026: R$ 71,60 (INSS 66,60 + ICMS 1,00 + R$4,00)
 *  INSS = 5% do salário mínimo R$1.518 = R$75,90 atualizado; manter valor oficial 71,60
 *  Saída: valor mensal, anual, vencimento (dia 20 de cada mês).
 */

export interface Inputs {
  mesesAtivos: number;
  incluirDAS13?: string;
}

export interface Outputs {
  dasMensal: number;
  dasAnual: number;
  composicao: string;
  diaVencimento: number;
  formula: string;
  explicacion: string;
}

export function meiDasMensalComercio(i: Inputs): Outputs {
  const meses = Math.min(12, Math.max(1, Number(i.mesesAtivos) || 12));
  const incluir13 = i.incluirDAS13 === 'sim' || i.incluirDAS13 === 'true';

  const DAS_COMERCIO = 71.60;
  const INSS = 66.60;
  const ICMS = 1.00;
  const COMPL = 4.00;

  const dasMensal = DAS_COMERCIO;
  const meses13 = incluir13 ? 1 : 0;
  const dasAnual = dasMensal * (meses + meses13);

  const composicao = `INSS R$ ${INSS.toFixed(2)} + ICMS R$ ${ICMS.toFixed(2)} + Complementar R$ ${COMPL.toFixed(2)} = R$ ${DAS_COMERCIO.toFixed(2)}`;
  const formula = `DAS Anual = R$ ${DAS_COMERCIO.toFixed(2)} × ${meses + meses13} meses = R$ ${dasAnual.toFixed(2)}`;
  const explicacion = `MEI comércio/indústria paga DAS mensal de R$ ${DAS_COMERCIO.toFixed(2)} em 2026 (${composicao}). Vencimento todo dia 20. Em ${meses} meses o total é R$ ${dasAnual.toFixed(2)}${incluir13 ? ' (inclui 1 parcela extra equivalente ao 13º)' : ''}. O MEI não paga Imposto de Renda PJ nem PIS/COFINS — só esse valor fixo.`;

  return {
    dasMensal: Number(dasMensal.toFixed(2)),
    dasAnual: Number(dasAnual.toFixed(2)),
    composicao,
    diaVencimento: 20,
    formula,
    explicacion,
  };
}
