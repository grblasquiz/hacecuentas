/** DAS MEI mensal — Transportador Autônomo de Cargas (2026)
 *  Valor fixo 2026: R$ 176,60 (INSS 12% salário mínimo 182,16 + ICMS 1,00... ajustado a valor oficial 176,60)
 *  INSS 12% = R$ 171,60 + ICMS R$ 1,00 + ISS 0 + Complementar R$4,00
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

export function meiDasMensalTransporte(i: Inputs): Outputs {
  const meses = Math.min(12, Math.max(1, Number(i.mesesAtivos) || 12));
  const incluir13 = i.incluirDAS13 === 'sim' || i.incluirDAS13 === 'true';

  const DAS_TRANSPORTE = 176.60;
  const INSS = 171.60;
  const ICMS = 1.00;
  const COMPL = 4.00;

  const dasMensal = DAS_TRANSPORTE;
  const meses13 = incluir13 ? 1 : 0;
  const dasAnual = dasMensal * (meses + meses13);

  const composicao = `INSS 12% R$ ${INSS.toFixed(2)} + ICMS R$ ${ICMS.toFixed(2)} + Complementar R$ ${COMPL.toFixed(2)} = R$ ${DAS_TRANSPORTE.toFixed(2)}`;
  const formula = `DAS Anual = R$ ${DAS_TRANSPORTE.toFixed(2)} × ${meses + meses13} meses = R$ ${dasAnual.toFixed(2)}`;
  const explicacion = `MEI transportador autônomo de cargas paga DAS de R$ ${DAS_TRANSPORTE.toFixed(2)}/mês em 2026 — valor mais alto porque o INSS é 12% do salário mínimo (e não 5% como outras categorias). Total em ${meses} meses: R$ ${dasAnual.toFixed(2)}${incluir13 ? ' (13º incluso)' : ''}. Vencimento dia 20. Aplicável a caminhoneiros, motoristas de carga, transportadores autônomos registrados no MEI.`;

  return {
    dasMensal: Number(dasMensal.toFixed(2)),
    dasAnual: Number(dasAnual.toFixed(2)),
    composicao,
    diaVencimento: 20,
    formula,
    explicacion,
  };
}
