/** DAS MEI mensal — Comércio e Indústria (2026)
 *  Valor 2026: INSS 5% do salário mínimo (R$ 81,05) + ICMS R$ 1,00 = R$ 82,05.
 *  Fuente única: src/lib/data/brasil-2026.ts (DAS_MEI).
 *  Saída: valor mensal, anual, vencimento (dia 20 de cada mês).
 */
import { DAS_MEI } from '../data/brasil-2026';

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
  _insight?: any;
  _chart?: any;
}

export function meiDasMensalComercio(i: Inputs): Outputs {
  const meses = Math.min(12, Math.max(1, Number(i.mesesAtivos) || 12));
  const incluir13 = i.incluirDAS13 === 'sim' || i.incluirDAS13 === 'true';

  const DAS_COMERCIO = DAS_MEI.comercio;
  const INSS = DAS_MEI.inss5;
  const ICMS = DAS_MEI.icms;

  const dasMensal = DAS_COMERCIO;
  const meses13 = incluir13 ? 1 : 0;
  const dasAnual = dasMensal * (meses + meses13);

  const composicao = `INSS (5% do salário mínimo) R$ ${INSS.toFixed(2)} + ICMS R$ ${ICMS.toFixed(2)} = R$ ${DAS_COMERCIO.toFixed(2)}`;
  const formula = `DAS Anual = R$ ${DAS_COMERCIO.toFixed(2)} × ${meses + meses13} meses = R$ ${dasAnual.toFixed(2)}`;
  const explicacion = `MEI comércio/indústria paga DAS mensal de R$ ${DAS_COMERCIO.toFixed(2)} em 2026 (${composicao}). Vencimento todo dia 20. Em ${meses} meses o total é R$ ${dasAnual.toFixed(2)}${incluir13 ? ' (inclui 1 parcela extra equivalente ao 13º)' : ''}. O MEI não paga Imposto de Renda PJ nem PIS/COFINS — só esse valor fixo.`;

  const totalMeses = meses + meses13;
  const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const _insight = {
    title: "Quanto você paga de DAS",
    text: `O DAS do MEI comércio/indústria é fixo: **R$ ${fmtBRL(DAS_COMERCIO)} por mês**, vencendo todo dia 20. Em ${totalMeses} ${totalMeses === 1 ? 'mês' : 'meses'} o total fica em **R$ ${fmtBRL(dasAnual)}**${incluir13 ? ' (já com a parcela extra do 13º)' : ''}. Quase tudo é INSS (**R$ ${fmtBRL(INSS)}**), que conta para sua aposentadoria.`,
    tone: "neutral",
    icon: "🇧🇷",
  };

  const _chart = {
    type: "doughnut" as const,
    slices: [
      { label: "INSS", value: INSS },
      { label: "ICMS", value: ICMS },
    ],
    prefix: "R$ ",
    centerValue: `R$ ${fmtBRL(DAS_COMERCIO)}`,
    centerLabel: "DAS mensal",
    ariaLabel: "Composição do DAS mensal do MEI comércio: INSS, ICMS e valor complementar.",
  };

  return {
    dasMensal: Number(dasMensal.toFixed(2)),
    dasAnual: Number(dasAnual.toFixed(2)),
    composicao,
    diaVencimento: 20,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
