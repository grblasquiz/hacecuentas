/** Simples Nacional Anexo V — Profissional liberal sem fator R (2026)
 *  Faixas: 15.5%/0 ; 18%/4500 ; 19.5%/9900 ; 20.5%/17100 ; 23%/62100 ; 30.5%/540000
 *  Se fator R (folha/RBT12) ≥ 28% → migra para Anexo III (mais barato).
 */

export interface Inputs {
  faturamentoMes: number;
  rbt12: number;
  folha12m?: number;
}

export interface Outputs {
  faixa: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
  aliquotaEfetiva: number;
  valorDas: number;
  fatorR: number;
  anexoAplicavel: string;
  recomendacao: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

const FAIXAS_V = [
  { max: 180000, aliquota: 15.5, deduzir: 0 },
  { max: 360000, aliquota: 18.0, deduzir: 4500 },
  { max: 720000, aliquota: 19.5, deduzir: 9900 },
  { max: 1800000, aliquota: 20.5, deduzir: 17100 },
  { max: 3600000, aliquota: 23.0, deduzir: 62100 },
  { max: 4800000, aliquota: 30.5, deduzir: 540000 },
];

const FAIXAS_III = [
  { max: 180000, aliquota: 6.0, deduzir: 0 },
  { max: 360000, aliquota: 11.2, deduzir: 9360 },
  { max: 720000, aliquota: 13.5, deduzir: 17640 },
  { max: 1800000, aliquota: 16.0, deduzir: 35640 },
  { max: 3600000, aliquota: 21.0, deduzir: 125640 },
  { max: 4800000, aliquota: 33.0, deduzir: 648000 },
];

export function simplesAnexoV(i: Inputs): Outputs {
  const fatMes = Math.max(0, Number(i.faturamentoMes) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || fatMes * 12);
  const folha = Math.max(0, Number(i.folha12m) || 0);

  if (rbt12 > 4800000) throw new Error('RBT12 acima de R$ 4.8M');

  const fatorR = rbt12 > 0 ? (folha / rbt12) * 100 : 0;
  const usarAnexoIII = fatorR >= 28;
  const faixas = usarAnexoIII ? FAIXAS_III : FAIXAS_V;

  let fIdx = 0;
  for (let idx = 0; idx < faixas.length; idx++) {
    if (rbt12 <= faixas[idx].max) { fIdx = idx; break; }
    fIdx = idx;
  }
  const f = faixas[fIdx];

  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * (f.aliquota / 100) - f.deduzir) / rbt12) * 100 : f.aliquota;
  const aliqEf = Math.max(0, aliquotaEfetiva);
  const valorDas = fatMes * (aliqEf / 100);

  const anexoAplicavel = usarAnexoIII ? 'Anexo III (fator R ≥ 28%)' : 'Anexo V (fator R < 28%)';
  const recomendacao = usarAnexoIII
    ? `✓ Fator R = ${fatorR.toFixed(2)}% — você está no Anexo III, ótimo! Alíquota efetiva ${aliqEf.toFixed(2)}%.`
    : `⚠️ Fator R = ${fatorR.toFixed(2)}% — Anexo V aplicado. Para migrar a III precisa folha ≥ R$ ${(rbt12 * 0.28 / 12).toFixed(2)}/mês. Avalie aumentar pro-labore.`;

  const formula = `Alíquota efetiva = (${rbt12.toFixed(2)} × ${f.aliquota}% - ${f.deduzir}) / ${rbt12.toFixed(2)} = ${aliqEf.toFixed(3)}%`;
  const explicacion = `${anexoAplicavel} — faixa ${fIdx + 1}: RBT12 R$ ${rbt12.toLocaleString('pt-BR')}, alíquota nominal ${f.aliquota}%, dedução R$ ${f.deduzir.toLocaleString('pt-BR')}. Alíquota efetiva: ${aliqEf.toFixed(3)}%. DAS mensal: R$ ${valorDas.toFixed(2)}. ${recomendacao} Exemplos típicos de Anexo V sem fator R: médicos sem folha, psicólogos autônomos, engenheiros PJ puros.`;

  const _insight = {
    title: usarAnexoIII ? `Anexo III via fator R — faixa ${fIdx + 1}` : `Anexo V — faixa ${fIdx + 1} de 6`,
    text: usarAnexoIII
      ? `Seu **fator R de ${fatorR.toFixed(2)}%** (≥ 28%) levou a atividade ao **Anexo III**, mais barato: alíquota efetiva de **${aliqEf.toFixed(2)}%** e DAS de **R$ ${valorDas.toFixed(2)}** sobre R$ ${fatMes.toLocaleString('pt-BR')} no mês.`
      : `Com **fator R de ${fatorR.toFixed(2)}%** (< 28%), você fica no **Anexo V**: alíquota efetiva de **${aliqEf.toFixed(2)}%** e DAS de **R$ ${valorDas.toFixed(2)}**. Para migrar ao Anexo III (mais barato) a folha precisaria chegar a **R$ ${(rbt12 * 0.28 / 12).toFixed(2)}/mês**.`,
    tone: usarAnexoIII ? 'good' : 'warn',
    icon: '🧮',
  };

  const segmentsV = [
    { nombre: 'Faixa 1', max: 15.5, color: '#65a30d', colorDark: '#84cc16' },
    { nombre: 'Faixa 2', max: 18.0, color: '#ca8a04', colorDark: '#eab308' },
    { nombre: 'Faixa 3', max: 19.5, color: '#d97706', colorDark: '#f59e0b' },
    { nombre: 'Faixa 4', max: 20.5, color: '#ea580c', colorDark: '#f97316' },
    { nombre: 'Faixa 5', max: 23.0, color: '#dc2626', colorDark: '#ef4444' },
    { nombre: 'Faixa 6', max: 30.5, color: '#b91c1c', colorDark: '#dc2626' },
  ];
  const segmentsIII = [
    { nombre: 'Faixa 1', max: 6.0, color: '#16a34a', colorDark: '#22c55e' },
    { nombre: 'Faixa 2', max: 11.2, color: '#65a30d', colorDark: '#84cc16' },
    { nombre: 'Faixa 3', max: 13.5, color: '#ca8a04', colorDark: '#eab308' },
    { nombre: 'Faixa 4', max: 16.0, color: '#ea580c', colorDark: '#f97316' },
    { nombre: 'Faixa 5', max: 21.0, color: '#dc2626', colorDark: '#ef4444' },
    { nombre: 'Faixa 6', max: 33.0, color: '#b91c1c', colorDark: '#dc2626' },
  ];
  const _chart = {
    type: 'scale',
    marker: Number(aliqEf.toFixed(2)),
    markerLabel: `${aliqEf.toFixed(2)}% efetiva`,
    min: 0,
    segments: usarAnexoIII ? segmentsIII : segmentsV,
    ariaLabel: `Alíquota efetiva de ${aliqEf.toFixed(2)}% nas seis faixas do ${usarAnexoIII ? 'Anexo III' : 'Anexo V'}.`,
  };

  return {
    faixa: fIdx + 1,
    aliquotaNominal: f.aliquota,
    parcelaDeduzir: f.deduzir,
    aliquotaEfetiva: Number(aliqEf.toFixed(3)),
    valorDas: Number(valorDas.toFixed(2)),
    fatorR: Number(fatorR.toFixed(2)),
    anexoAplicavel,
    recomendacao,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
