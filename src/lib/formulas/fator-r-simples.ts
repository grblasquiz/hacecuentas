/** Fator R — Simples Nacional Anexo III vs V (2026)
 *  Fator R = folha 12m / RBT12. Se ≥ 28% → Anexo III. Se < 28% → Anexo V.
 *  Calcula folha mínima necessária para cair em III.
 */

export interface Inputs {
  folha12m: number;
  rbt12: number;
  faturamentoMes?: number;
}

export interface Outputs {
  fatorR: number;
  anexo: string;
  aliquotaAnexoIII: number;
  aliquotaAnexoV: number;
  economiaPotencial: number;
  folhaMinimaIII: number;
  folhaFaltante: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

const F_III = [
  { max: 180000, aliquota: 6.0, deduzir: 0 },
  { max: 360000, aliquota: 11.2, deduzir: 9360 },
  { max: 720000, aliquota: 13.5, deduzir: 17640 },
  { max: 1800000, aliquota: 16.0, deduzir: 35640 },
  { max: 3600000, aliquota: 21.0, deduzir: 125640 },
  { max: 4800000, aliquota: 33.0, deduzir: 648000 },
];
const F_V = [
  { max: 180000, aliquota: 15.5, deduzir: 0 },
  { max: 360000, aliquota: 18.0, deduzir: 4500 },
  { max: 720000, aliquota: 19.5, deduzir: 9900 },
  { max: 1800000, aliquota: 20.5, deduzir: 17100 },
  { max: 3600000, aliquota: 23.0, deduzir: 62100 },
  { max: 4800000, aliquota: 30.5, deduzir: 540000 },
];

function aliqEfetiva(faixas: typeof F_III, rbt12: number): number {
  let f = faixas[0];
  for (const x of faixas) { if (rbt12 <= x.max) { f = x; break; } f = x; }
  return rbt12 > 0 ? Math.max(0, ((rbt12 * (f.aliquota / 100) - f.deduzir) / rbt12) * 100) : f.aliquota;
}

export function fatorRSimples(i: Inputs): Outputs {
  const folha = Math.max(0, Number(i.folha12m) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || 0);
  const fatMes = Number(i.faturamentoMes) || rbt12 / 12;

  if (rbt12 <= 0) throw new Error('Informe RBT12 (receita bruta dos últimos 12 meses)');

  const fatorR = (folha / rbt12) * 100;
  const usaIII = fatorR >= 28;
  const anexo = usaIII ? 'Anexo III' : 'Anexo V';

  const aliqIII = aliqEfetiva(F_III, rbt12);
  const aliqV = aliqEfetiva(F_V, rbt12);
  const economiaPotencial = fatMes * (aliqV - aliqIII) / 100;

  const folhaMinimaIII = rbt12 * 0.28;
  const folhaFaltante = Math.max(0, folhaMinimaIII - folha);

  const formula = `Fator R = Folha 12m / RBT12 = R$ ${folha.toFixed(2)} / R$ ${rbt12.toFixed(2)} = ${fatorR.toFixed(3)}% → ${anexo}`;
  const explicacion = `Fator R = ${fatorR.toFixed(2)}% (folha R$ ${folha.toLocaleString('pt-BR')} / RBT12 R$ ${rbt12.toLocaleString('pt-BR')}). ${usaIII ? '✓ Como é ≥ 28%, aplica-se o Anexo III (alíquota efetiva ' + aliqIII.toFixed(2) + '%).' : '⚠️ Como é < 28%, aplica-se o Anexo V (alíquota efetiva ' + aliqV.toFixed(2) + '%).'} Diferença de alíquota: ${(aliqV - aliqIII).toFixed(2)} p.p. Economia anual se migrar para III: R$ ${(economiaPotencial * 12).toFixed(2)}. Para cair no Anexo III, folha mínima 12m = R$ ${folhaMinimaIII.toFixed(2)}${folhaFaltante > 0 ? ' (faltam R$ ' + folhaFaltante.toFixed(2) + ')' : ' — você já está!'}.`;

  const economiaAnual = economiaPotencial * 12;
  const _insight = {
    title: usaIII ? 'Você está no Anexo III' : 'Você caiu no Anexo V',
    text: usaIII
      ? `Com Fator R de **${fatorR.toFixed(1)}%** (≥ 28%) você tributa pelo **Anexo III**, alíquota efetiva **${aliqIII.toFixed(2)}%** — a faixa mais vantajosa. Está **${(fatorR - 28).toFixed(1)} p.p.** acima do limite.`
      : `Com Fator R de **${fatorR.toFixed(1)}%** (< 28%) você tributa pelo **Anexo V** a **${aliqV.toFixed(2)}%**, **${(aliqV - aliqIII).toFixed(2)} p.p.** acima do Anexo III. Aumentar a folha em **R$ ${folhaFaltante.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}** migraria para o III e economizaria **R$ ${economiaAnual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano**.`,
    tone: usaIII ? 'good' : 'warn',
    icon: usaIII ? '✅' : '⚠️',
  };

  const topMax = Math.max(60, Math.ceil(fatorR / 10) * 10 + 5);
  const _chart = {
    type: 'scale',
    marker: Number(fatorR.toFixed(1)),
    markerLabel: `${fatorR.toFixed(1)}%`,
    min: 0,
    segments: [
      { nombre: 'Anexo V (< 28%)', max: 28, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Anexo III (≥ 28%)', max: topMax, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Fator R de ${fatorR.toFixed(1)}%, limite de 28% entre Anexo V e Anexo III`,
  };

  return {
    fatorR: Number(fatorR.toFixed(2)),
    anexo,
    aliquotaAnexoIII: Number(aliqIII.toFixed(3)),
    aliquotaAnexoV: Number(aliqV.toFixed(3)),
    economiaPotencial: Number((economiaPotencial * 12).toFixed(2)),
    folhaMinimaIII: Number(folhaMinimaIII.toFixed(2)),
    folhaFaltante: Number(folhaFaltante.toFixed(2)),
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
