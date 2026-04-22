/**
 * Licenciamento Anual de Veículos 2026
 * Soma: Taxa CRLV + DPVAT (se aplicável) + IPVA
 * Taxa CRLV varia por estado (~R$ 150-170 em SP).
 */

export interface LicenciamentoInputs {
  taxaCrlv: number;
  valorDpvat: number;
  valorIpva: number;
  incluirMultas: number;
}

export interface LicenciamentoOutputs {
  totalLicenciamento: number;
  somaTaxas: number;
  formula: string;
  explicacion: string;
}

export function licenciamentoVeiculos(inputs: LicenciamentoInputs): LicenciamentoOutputs {
  const taxaCrlv = Number(inputs.taxaCrlv) || 0;
  const valorDpvat = Number(inputs.valorDpvat) || 0;
  const valorIpva = Number(inputs.valorIpva) || 0;
  const multas = Number(inputs.incluirMultas) || 0;

  if (taxaCrlv <= 0) {
    throw new Error('Ingresá a taxa CRLV do seu estado');
  }

  const somaTaxas = taxaCrlv + valorDpvat;
  const totalLicenciamento = somaTaxas + valorIpva + multas;

  const formula = `Licenciamento = Taxa CRLV (R$ ${taxaCrlv.toFixed(2)}) + DPVAT (R$ ${valorDpvat.toFixed(2)}) + IPVA (R$ ${valorIpva.toFixed(2)}) + Multas (R$ ${multas.toFixed(2)}) = R$ ${totalLicenciamento.toFixed(2)}`;
  const explicacion = `Para regularizar seu veículo em 2026 você precisa pagar: Taxa CRLV R$ ${taxaCrlv.toFixed(2)}, DPVAT R$ ${valorDpvat.toFixed(2)} (se voltar), IPVA R$ ${valorIpva.toFixed(2)} e eventuais multas R$ ${multas.toFixed(2)}. Total: R$ ${totalLicenciamento.toFixed(2)}. O CRLV digital é exigido para circular.`;

  return {
    totalLicenciamento: Math.round(totalLicenciamento * 100) / 100,
    somaTaxas: Math.round(somaTaxas * 100) / 100,
    formula,
    explicacion,
  };
}
