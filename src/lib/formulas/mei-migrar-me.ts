/** MEI → ME Simples Nacional — Simulador primeira DAS como ME
 *  Quando faturamento passa R$81k/ano, precisa virar ME.
 *  Anexo I (comércio) faixa 1 (até 180k): 4% - R$0 dedução = efetivamente 4%
 *  Anexo III (serviços) faixa 1: 6% - R$0
 */

export interface Inputs {
  faturamentoMesME: number;
  rbt12: number;
  tipoAtividade: string;
}

export interface Outputs {
  aliquotaNominal: number;
  aliquotaEfetiva: number;
  valorDasME: number;
  diferencaVsMEI: number;
  faixa: number;
  formula: string;
  explicacion: string;
}

const FAIXAS: Record<string, Array<{ rbt12Max: number; aliquota: number; deduzir: number }>> = {
  comercio: [
    { rbt12Max: 180000, aliquota: 4.0, deduzir: 0 },
    { rbt12Max: 360000, aliquota: 7.3, deduzir: 5760 },
    { rbt12Max: 720000, aliquota: 9.5, deduzir: 13860 },
    { rbt12Max: 1800000, aliquota: 10.7, deduzir: 22500 },
    { rbt12Max: 3600000, aliquota: 14.3, deduzir: 87300 },
    { rbt12Max: 4800000, aliquota: 19.0, deduzir: 378000 },
  ],
  industria: [
    { rbt12Max: 180000, aliquota: 4.5, deduzir: 0 },
    { rbt12Max: 360000, aliquota: 7.8, deduzir: 5940 },
    { rbt12Max: 720000, aliquota: 10.0, deduzir: 13860 },
    { rbt12Max: 1800000, aliquota: 11.2, deduzir: 22500 },
    { rbt12Max: 3600000, aliquota: 14.7, deduzir: 85500 },
    { rbt12Max: 4800000, aliquota: 30.0, deduzir: 720000 },
  ],
  servicos: [
    { rbt12Max: 180000, aliquota: 6.0, deduzir: 0 },
    { rbt12Max: 360000, aliquota: 11.2, deduzir: 9360 },
    { rbt12Max: 720000, aliquota: 13.5, deduzir: 17640 },
    { rbt12Max: 1800000, aliquota: 16.0, deduzir: 35640 },
    { rbt12Max: 3600000, aliquota: 21.0, deduzir: 125640 },
    { rbt12Max: 4800000, aliquota: 33.0, deduzir: 648000 },
  ],
};

export function meiMigrarME(i: Inputs): Outputs {
  const fatMes = Math.max(0, Number(i.faturamentoMesME) || 0);
  const rbt12 = Math.max(0, Number(i.rbt12) || fatMes * 12);
  const tipo = (i.tipoAtividade || 'comercio').toLowerCase();

  const faixas = FAIXAS[tipo] || FAIXAS.comercio;
  let faixaIdx = 0;
  for (let idx = 0; idx < faixas.length; idx++) {
    if (rbt12 <= faixas[idx].rbt12Max) { faixaIdx = idx; break; }
    faixaIdx = idx;
  }
  const f = faixas[faixaIdx];

  const aliquotaEfetiva = rbt12 > 0 ? ((rbt12 * (f.aliquota / 100) - f.deduzir) / rbt12) * 100 : f.aliquota;
  const aliquotaEfFinal = Math.max(0, aliquotaEfetiva);
  const valorDasME = fatMes * (aliquotaEfFinal / 100);

  const DAS_MEI = tipo === 'servicos' ? 75.60 : 71.60;
  const diferencaVsMEI = valorDasME - DAS_MEI;

  const formula = `Alíquota efetiva = (RBT12 × ${f.aliquota}% - R$${f.deduzir}) / RBT12 = ${aliquotaEfFinal.toFixed(2)}%. DAS = R$ ${fatMes.toFixed(2)} × ${aliquotaEfFinal.toFixed(2)}% = R$ ${valorDasME.toFixed(2)}`;
  const explicacion = `Migrando MEI → ME Simples Nacional (${tipo}), faixa ${faixaIdx + 1} (RBT12 ≤ R$ ${f.rbt12Max.toLocaleString('pt-BR')}). Alíquota nominal ${f.aliquota}%, efetiva ${aliquotaEfFinal.toFixed(2)}% (após dedução R$ ${f.deduzir.toLocaleString('pt-BR')}). Primeiro DAS como ME: R$ ${valorDasME.toFixed(2)}/mês — um aumento de R$ ${diferencaVsMEI.toFixed(2)} em relação ao DAS MEI (R$ ${DAS_MEI}). Além disso, ME precisa de contador (R$ 300-600/mês) e emite NF-e.`;

  return {
    aliquotaNominal: f.aliquota,
    aliquotaEfetiva: Number(aliquotaEfFinal.toFixed(2)),
    valorDasME: Number(valorDasME.toFixed(2)),
    diferencaVsMEI: Number(diferencaVsMEI.toFixed(2)),
    faixa: faixaIdx + 1,
    formula,
    explicacion,
  };
}
