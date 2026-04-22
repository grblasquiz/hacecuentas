/** Simples Nacional Anexo III — Serviços gerais (2026)
 *  Faixas: 6%/0 ; 11.2%/9360 ; 13.5%/17640 ; 16%/35640 ; 21%/125640 ; 33%/648000
 *  Aplica-se por fator R (folha/RBT12 ≥ 28%) ou atividades listadas no art. 18 §5-B LC 123.
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
  recomendacao: string;
  formula: string;
  explicacion: string;
}

const FAIXAS = [
  { max: 180000, aliquota: 6.0, deduzir: 0 },
  { max: 360000, aliquota: 11.2, deduzir: 9360 },
  { max: 720000, aliquota: 13.5, deduzir: 17640 },
  { max: 1800000, aliquota: 16.0, deduzir: 35640 },
  { max: 3600000, aliquota: 21.0, deduzir: 125640 },
  { max: 4800000, aliquota: 33.0, deduzir: 648000 },
];

export function simplesAnexoIII(i: Inputs): Outputs {
  const fatMes = Math.max(0, Number(i.faturamentoMes) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || fatMes * 12);
  const folha = Math.max(0, Number(i.folha12m) || 0);

  if (rbt12 > 4800000) throw new Error('RBT12 acima de R$ 4.8M');

  let fIdx = 0;
  for (let idx = 0; idx < FAIXAS.length; idx++) {
    if (rbt12 <= FAIXAS[idx].max) { fIdx = idx; break; }
    fIdx = idx;
  }
  const f = FAIXAS[fIdx];

  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * (f.aliquota / 100) - f.deduzir) / rbt12) * 100 : f.aliquota;
  const aliqEf = Math.max(0, aliquotaEfetiva);
  const valorDas = fatMes * (aliqEf / 100);

  const fatorR = rbt12 > 0 ? (folha / rbt12) * 100 : 0;
  let recomendacao = '';
  if (folha === 0) {
    recomendacao = 'Se sua atividade depende de fator R (dev, designer, consultor), informe a folha para decidir entre Anexo III e V.';
  } else if (fatorR >= 28) {
    recomendacao = `✓ Fator R = ${fatorR.toFixed(2)}% (≥ 28%) — enquadrado em Anexo III (alíquota menor). Mantenha folha acima desse patamar.`;
  } else {
    recomendacao = `⚠️ Fator R = ${fatorR.toFixed(2)}% (< 28%) — sua atividade cai em Anexo V (alíquota maior, começa em 15.5%). Aumente pro-labore/folha para voltar a III.`;
  }

  const formula = `Alíquota efetiva = (${rbt12.toFixed(2)} × ${f.aliquota}% - ${f.deduzir}) / ${rbt12.toFixed(2)} = ${aliqEf.toFixed(3)}%. DAS = R$ ${valorDas.toFixed(2)}`;
  const explicacion = `Anexo III (serviços gerais) — faixa ${fIdx + 1}: RBT12 R$ ${rbt12.toLocaleString('pt-BR')}, alíquota nominal ${f.aliquota}%, dedução R$ ${f.deduzir.toLocaleString('pt-BR')}. Alíquota efetiva: ${aliqEf.toFixed(3)}%. DAS mensal: R$ ${valorDas.toFixed(2)}. Fator R: ${fatorR.toFixed(2)}%. ${recomendacao} Aplica-se a academias, salões, agências, escolas de idiomas e — via fator R — a devs, designers, consultores.`;

  return {
    faixa: fIdx + 1,
    aliquotaNominal: f.aliquota,
    parcelaDeduzir: f.deduzir,
    aliquotaEfetiva: Number(aliqEf.toFixed(3)),
    valorDas: Number(valorDas.toFixed(2)),
    fatorR: Number(fatorR.toFixed(2)),
    recomendacao,
    formula,
    explicacion,
  };
}
