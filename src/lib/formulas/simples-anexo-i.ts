/** Simples Nacional Anexo I — Comércio (2026)
 *  Faixas: 180k=4%/0 ; 360k=7.3%/5760 ; 720k=9.5%/13860 ; 1.8M=10.7%/22500 ; 3.6M=14.3%/87300 ; 4.8M=19%/378000
 *  Alíquota efetiva = (RBT12 × aliq - PD) / RBT12
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
  { min: 0, max: 180000, aliquota: 4.0, deduzir: 0 },
  { min: 180000.01, max: 360000, aliquota: 7.3, deduzir: 5760 },
  { min: 360000.01, max: 720000, aliquota: 9.5, deduzir: 13860 },
  { min: 720000.01, max: 1800000, aliquota: 10.7, deduzir: 22500 },
  { min: 1800000.01, max: 3600000, aliquota: 14.3, deduzir: 87300 },
  { min: 3600000.01, max: 4800000, aliquota: 19.0, deduzir: 378000 },
];

export function simplesAnexoI(i: Inputs): Outputs {
  const fatMes = Math.max(0, Number(i.faturamentoMes) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || fatMes * 12);

  if (rbt12 > 4800000) throw new Error('RBT12 acima de R$ 4.8M — não é mais Simples Nacional');

  let fIdx = 0;
  for (let idx = 0; idx < FAIXAS.length; idx++) {
    if (rbt12 <= FAIXAS[idx].max) { fIdx = idx; break; }
    fIdx = idx;
  }
  const f = FAIXAS[fIdx];

  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * (f.aliquota / 100) - f.deduzir) / rbt12) * 100 : f.aliquota;
  const aliqEf = Math.max(0, aliquotaEfetiva);
  const valorDas = fatMes * (aliqEf / 100);

  const formula = `Alíquota efetiva = (${rbt12.toFixed(2)} × ${f.aliquota}% - ${f.deduzir}) / ${rbt12.toFixed(2)} = ${aliqEf.toFixed(3)}%. DAS = ${fatMes.toFixed(2)} × ${aliqEf.toFixed(3)}% = R$ ${valorDas.toFixed(2)}`;
  const explicacion = `Anexo I (comércio) — faixa ${fIdx + 1}: RBT12 R$ ${rbt12.toLocaleString('pt-BR')}, alíquota nominal ${f.aliquota}%, parcela a deduzir R$ ${f.deduzir.toLocaleString('pt-BR')}. Alíquota efetiva: ${aliqEf.toFixed(3)}%. DAS do mês (faturamento R$ ${fatMes.toFixed(2)}): R$ ${valorDas.toFixed(2)}. Aplica-se a lojas, mercados, revendas, e-commerces de produtos físicos.`;

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
