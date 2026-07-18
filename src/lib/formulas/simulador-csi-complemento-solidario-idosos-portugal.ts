/**
 * CSI — Complemento Solidário para Idosos (prestação diferencial), Portugal 2026.
 * Prestação para pessoas com 66+ anos e recursos abaixo do valor de referência.
 * Isolado:  CSI = max(0, (8.040 − rendimentos anuais) ÷ 12).
 * Casal:    CSI = max(0, (14.070 − rendimentos anuais do casal) ÷ 12).
 * Valores de referência 2026: 8.040 €/ano (≈ 670 €/mês) isolado, 14.070 €/ano casal.
 * É uma prestação social (Money), não aconselhamento médico.
 */
import { CSI_2026, fmtEUR } from '../data/portugal-2026';

export interface Inputs {
  situacao?: string;         // 'isolado' | 'casal'
  rendimentosAnuais?: number; // rendimentos anuais do idoso ou do casal (€)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const situacao = String(i.situacao || 'isolado') === 'casal' ? 'casal' : 'isolado';
  const rendimentos = Math.max(0, Number(i.rendimentosAnuais) || 0);

  const referenciaAnual = situacao === 'casal'
    ? CSI_2026.referenciaCasalAnual
    : CSI_2026.referenciaIsoladoAnual;

  const csi = Math.max(0, (referenciaAnual - rendimentos) / 12);
  const referenciaMensal = referenciaAnual / 12;

  const detalhe = csi > 0
    ? `${situacao === 'casal' ? 'Casal' : 'Idoso isolado'}: (${fmtEUR(referenciaAnual)}/ano − ${fmtEUR(rendimentos)}/ano) ÷ 12 = ${fmtEUR(csi)}/mês.`
    : `${situacao === 'casal' ? 'Casal' : 'Idoso isolado'}: os rendimentos anuais (${fmtEUR(rendimentos)}) igualam ou superam o valor de referência (${fmtEUR(referenciaAnual)}). Sem direito ao CSI.`;

  const _table = {
    title: 'Valores de referência do CSI — Portugal 2026',
    headers: ['Situação', 'Valor de referência anual', 'Equivalente mensal'],
    rows: [
      ['Idoso isolado', fmtEUR(CSI_2026.referenciaIsoladoAnual), fmtEUR(CSI_2026.referenciaIsoladoAnual / 12)],
      ['Casal', fmtEUR(CSI_2026.referenciaCasalAnual), fmtEUR(CSI_2026.referenciaCasalAnual / 12)],
      ['O seu caso', fmtEUR(referenciaAnual), fmtEUR(referenciaMensal)],
    ],
    note: 'O CSI é diferencial: paga a diferença entre o valor de referência e os rendimentos do idoso (ou do casal). Requisitos: 66 anos ou mais e recursos abaixo do valor de referência. Prestação social, sujeita a condição de recursos.',
  };

  const _insight = {
    title: csi > 0 ? `CSI estimado: ${fmtEUR(csi)}/mês` : 'Rendimentos acima do valor de referência',
    text: csi > 0
      ? `Sendo **${situacao === 'casal' ? 'um casal' : 'um idoso isolado'}**, o valor de referência é **${fmtEUR(referenciaAnual)}/ano**. Descontados os rendimentos (**${fmtEUR(rendimentos)}/ano**), o CSI cobre a diferença: **${fmtEUR(csi)}/mês**. É preciso ter 66+ anos.`
      : `Os rendimentos anuais (**${fmtEUR(rendimentos)}**) atingem o valor de referência (**${fmtEUR(referenciaAnual)}**), pelo que não há complemento a pagar. O CSI só cobre a diferença até esse valor de referência.`,
    tone: csi > 0 ? 'good' : 'neutral',
    icon: '👵',
  };

  return {
    csi: fmtEUR(csi),
    valorReferenciaAnual: fmtEUR(referenciaAnual),
    rendimentos: fmtEUR(rendimentos),
    detalhe,
    _insight,
    _table,
  };
}
