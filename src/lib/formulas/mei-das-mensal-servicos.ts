/** DAS MEI mensal — Prestador de Serviços (2026)
 *  Valor fixo 2026: R$ 75,60 (INSS 66,60 + ISS 5,00 + R$4,00)
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
  _insight?: any;
  _chart?: any;
}

export function meiDasMensalServicos(i: Inputs): Outputs {
  const meses = Math.min(12, Math.max(1, Number(i.mesesAtivos) || 12));
  const incluir13 = i.incluirDAS13 === 'sim' || i.incluirDAS13 === 'true';

  const DAS_SERVICOS = 75.60;
  const INSS = 66.60;
  const ISS = 5.00;
  const COMPL = 4.00;

  const dasMensal = DAS_SERVICOS;
  const meses13 = incluir13 ? 1 : 0;
  const dasAnual = dasMensal * (meses + meses13);

  const composicao = `INSS R$ ${INSS.toFixed(2)} + ISS R$ ${ISS.toFixed(2)} + Complementar R$ ${COMPL.toFixed(2)} = R$ ${DAS_SERVICOS.toFixed(2)}`;
  const formula = `DAS Anual = R$ ${DAS_SERVICOS.toFixed(2)} × ${meses + meses13} meses = R$ ${dasAnual.toFixed(2)}`;
  const explicacion = `MEI prestador de serviços paga DAS mensal de R$ ${DAS_SERVICOS.toFixed(2)} em 2026 (${composicao}). Vencimento dia 20. Total em ${meses} meses: R$ ${dasAnual.toFixed(2)}${incluir13 ? ' (com 13º incluso)' : ''}. Exemplos de atividades: cabeleireiro, manicure, pedreiro, eletricista autônomo, programador MEI.`;

  const _insight = {
    title: 'Seu DAS de prestador de serviços',
    text: `Como MEI de serviços você paga **R$ ${DAS_SERVICOS.toFixed(2)}/mês** fixos — dá **R$ ${dasAnual.toFixed(2)}** em ${meses + meses13} parcela(s). Quase tudo (R$ ${INSS.toFixed(2)}) é INSS, que conta como contribuição para sua aposentadoria.`,
    tone: 'good',
    icon: '🧾',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'INSS (aposentadoria)', value: Number(INSS.toFixed(2)) },
      { label: 'ISS (município)', value: Number(ISS.toFixed(2)) },
      { label: 'Complementar', value: Number(COMPL.toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: `R$ ${DAS_SERVICOS.toFixed(2)}`,
    centerLabel: 'DAS mensal',
    ariaLabel: `Composição do DAS mensal de R$ ${DAS_SERVICOS.toFixed(2)}: INSS R$ ${INSS.toFixed(2)}, ISS R$ ${ISS.toFixed(2)} e complementar R$ ${COMPL.toFixed(2)}.`,
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
