/**
 * Seguro-desemprego 2026 — Quantidade de parcelas
 * Regra (trabalhador formal CLT):
 *   6-11 meses trabalhados em 18 meses = 3 parcelas
 *   12-23 meses = 4 parcelas
 *   24+ meses = 5 parcelas
 * Primeira solicitação: mínimo 12 meses. Segunda: 9 meses. Terceira+: 6 meses.
 */

export interface SeguroDesempregoParcelasInputs {
  mesesTrabalhados: number;
  solicitacao: string; // primeira | segunda | terceira
}

export interface SeguroDesempregoParcelasOutputs {
  numParcelas: number;
  elegivel: string;
  regraAplicada: string;
  formula: string;
  explicacion: string;
}

export function seguroDesempregoParcelas(inputs: SeguroDesempregoParcelasInputs): SeguroDesempregoParcelasOutputs {
  const meses = Number(inputs.mesesTrabalhados) || 0;
  const solicitacao = String(inputs.solicitacao || 'primeira').toLowerCase();

  if (meses <= 0) {
    throw new Error('Ingresá a quantidade de meses trabalhados');
  }

  // Validar elegibilidade
  const minimoExigido = solicitacao === 'primeira' ? 12 : solicitacao === 'segunda' ? 9 : 6;
  let elegivel = '';
  let numParcelas = 0;
  let regra = '';

  if (meses < minimoExigido) {
    elegivel = `Não elegível: precisa de ao menos ${minimoExigido} meses para ${solicitacao} solicitação`;
    numParcelas = 0;
    regra = 'Não se aplica';
  } else {
    elegivel = `Elegível (${solicitacao} solicitação, mínimo ${minimoExigido} meses)`;
    if (meses >= 6 && meses <= 11) {
      numParcelas = 3;
      regra = '6 a 11 meses → 3 parcelas';
    } else if (meses >= 12 && meses <= 23) {
      numParcelas = 4;
      regra = '12 a 23 meses → 4 parcelas';
    } else {
      numParcelas = 5;
      regra = '24 meses ou mais → 5 parcelas';
    }
  }

  const formula = `Meses trabalhados: ${meses} → Parcelas: ${numParcelas}`;
  const explicacion = `Com ${meses} meses trabalhados em carteira, na ${solicitacao} solicitação do seguro-desemprego 2026, você tem direito a ${numParcelas} parcelas (regra: ${regra}). ${elegivel}.`;

  return {
    numParcelas,
    elegivel,
    regraAplicada: regra,
    formula,
    explicacion,
  };
}
