/** Simples Nacional Anexo II — Indústria (2026)
 *  Faixas: 4.5%/0 ; 7.8%/5940 ; 10%/13860 ; 11.2%/22500 ; 14.7%/85500 ; 30%/720000
 */

export interface Inputs {
  faturamentoMes: number;
  rbt12: number;
}

export interface Outputs {
  faixa: number;
  aliquotaNominal: number;
  parcelaDeduzir: number;
  aliquotaEfetiva: number;
  valorDas: number;
  formula: string;
  explicacion: string;
}

const FAIXAS = [
  { max: 180000, aliquota: 4.5, deduzir: 0 },
  { max: 360000, aliquota: 7.8, deduzir: 5940 },
  { max: 720000, aliquota: 10.0, deduzir: 13860 },
  { max: 1800000, aliquota: 11.2, deduzir: 22500 },
  { max: 3600000, aliquota: 14.7, deduzir: 85500 },
  { max: 4800000, aliquota: 30.0, deduzir: 720000 },
];

export function simplesAnexoII(i: Inputs): Outputs {
  const fatMes = Math.max(0, Number(i.faturamentoMes) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || fatMes * 12);

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

  const formula = `Alíquota efetiva = (${rbt12.toFixed(2)} × ${f.aliquota}% - ${f.deduzir}) / ${rbt12.toFixed(2)} = ${aliqEf.toFixed(3)}%`;
  const explicacion = `Anexo II (indústria) — faixa ${fIdx + 1}: RBT12 R$ ${rbt12.toLocaleString('pt-BR')}, alíquota nominal ${f.aliquota}% com dedução R$ ${f.deduzir.toLocaleString('pt-BR')}. Alíquota efetiva: ${aliqEf.toFixed(3)}%. DAS mensal: R$ ${valorDas.toFixed(2)}. Aplica-se a fábricas, confecções, metalúrgicas, indústrias de alimentos, qualquer atividade com transformação de matéria-prima em produto final.`;

  return {
    faixa: fIdx + 1,
    aliquotaNominal: f.aliquota,
    parcelaDeduzir: f.deduzir,
    aliquotaEfetiva: Number(aliqEf.toFixed(3)),
    valorDas: Number(valorDas.toFixed(2)),
    formula,
    explicacion,
  };
}
