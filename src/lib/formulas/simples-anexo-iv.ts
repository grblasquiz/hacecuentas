/** Simples Nacional Anexo IV — Serviços de Construção / Advocacia (2026)
 *  Faixas: 4.5%/0 ; 9%/8100 ; 10.2%/12420 ; 14%/39780 ; 22%/183780 ; 33%/828000
 *  NÃO inclui CPP — recolhida à parte na folha (INSS patronal 20%).
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
  _insight?: any;
  _chart?: any;
}

const FAIXAS = [
  { max: 180000, aliquota: 4.5, deduzir: 0 },
  { max: 360000, aliquota: 9.0, deduzir: 8100 },
  { max: 720000, aliquota: 10.2, deduzir: 12420 },
  { max: 1800000, aliquota: 14.0, deduzir: 39780 },
  { max: 3600000, aliquota: 22.0, deduzir: 183780 },
  { max: 4800000, aliquota: 33.0, deduzir: 828000 },
];

export function simplesAnexoIV(i: Inputs): Outputs {
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
  const explicacion = `Anexo IV (construção civil e advocacia) — faixa ${fIdx + 1}: RBT12 R$ ${rbt12.toLocaleString('pt-BR')}, alíquota nominal ${f.aliquota}%, dedução R$ ${f.deduzir.toLocaleString('pt-BR')}. Alíquota efetiva: ${aliqEf.toFixed(3)}%. DAS mensal: R$ ${valorDas.toFixed(2)}. ATENÇÃO: CPP (20% INSS patronal sobre folha) NÃO está incluída — paga separado via GPS/GFIP. Aplica-se SEMPRE a: advocacia, construção de imóveis, obras de engenharia, limpeza/vigilância/conservação.`;

  const _insight = {
    title: `Faixa ${fIdx + 1} de 6 — Anexo IV`,
    text: `Com RBT12 de **R$ ${rbt12.toLocaleString('pt-BR')}**, a alíquota efetiva é **${aliqEf.toFixed(2)}%** e o DAS fica em **R$ ${valorDas.toFixed(2)}**. Atenção: o Anexo IV **não inclui a CPP** — os 20% de INSS patronal sobre a folha são pagos à parte (GPS/GFIP), então o custo real é maior que só o DAS.`,
    tone: 'warn',
    icon: '👷',
  };

  const _chart = {
    type: 'scale',
    marker: Number(aliqEf.toFixed(2)),
    markerLabel: `${aliqEf.toFixed(2)}% efetiva`,
    min: 0,
    segments: [
      { nombre: 'Faixa 1', max: 4.5, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Faixa 2', max: 9.0, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Faixa 3', max: 10.2, color: '#ca8a04', colorDark: '#eab308' },
      { nombre: 'Faixa 4', max: 14.0, color: '#ea580c', colorDark: '#f97316' },
      { nombre: 'Faixa 5', max: 22.0, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Faixa 6', max: 33.0, color: '#b91c1c', colorDark: '#dc2626' },
    ],
    ariaLabel: `Alíquota efetiva de ${aliqEf.toFixed(2)}% dentro das seis faixas do Anexo IV, da menor (4,5%) à maior (33%).`,
  };

  return {
    faixa: fIdx + 1,
    aliquotaNominal: f.aliquota,
    parcelaDeduzir: f.deduzir,
    aliquotaEfetiva: Number(aliqEf.toFixed(3)),
    valorDas: Number(valorDas.toFixed(2)),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
