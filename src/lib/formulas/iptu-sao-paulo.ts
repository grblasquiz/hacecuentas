/**
 * IPTU São Paulo 2026 — alíquotas progressivas.
 * Residencial: 1,0% até R$ 94.435; 1,3% até R$ 188.870; 1,5% acima.
 * Com descontos e acréscimos (Lei 17.719/2022).
 * Não-residencial: 1,5% a 2,0%.
 */

export interface Inputs {
  valorVenal: number | string;
  tipoImovel: string; // 'residencial' | 'nao-residencial'
}

export interface Outputs {
  valorVenal: string;
  aliquotaAplicada: string;
  iptuAnual: string;
  iptuMensal: string;
  parcelaCota: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function iptuSaoPaulo(i: Inputs): Outputs {
  const vv = Number(i.valorVenal) || 0;
  const tipo = String(i.tipoImovel || 'residencial');

  if (vv <= 0) {
    throw new Error('Informe o valor venal do imóvel.');
  }

  let aliquotaBase = 0;
  let aliquotaLabel = '';

  if (tipo === 'residencial') {
    if (vv <= 94435) {
      aliquotaBase = 0.01;
      aliquotaLabel = '1,0% (até R$ 94.435)';
    } else if (vv <= 188870) {
      aliquotaBase = 0.013;
      aliquotaLabel = '1,3% (até R$ 188.870)';
    } else {
      aliquotaBase = 0.015;
      aliquotaLabel = '1,5% (acima de R$ 188.870)';
    }
  } else {
    if (vv <= 188870) {
      aliquotaBase = 0.015;
      aliquotaLabel = '1,5% (não-residencial até R$ 188.870)';
    } else {
      aliquotaBase = 0.02;
      aliquotaLabel = '2,0% (não-residencial acima de R$ 188.870)';
    }
  }

  const iptuAnual = vv * aliquotaBase;
  const iptuMensal = iptuAnual / 12;
  const cota = iptuAnual / 10; // SP parcela em até 10 cotas

  return {
    valorVenal: brl(vv),
    aliquotaAplicada: aliquotaLabel,
    iptuAnual: brl(iptuAnual),
    iptuMensal: brl(iptuMensal),
    parcelaCota: brl(cota),
    resumen: `IPTU-SP ${tipo}: ${aliquotaLabel} sobre ${brl(vv)} = ${brl(iptuAnual)}/ano (${brl(cota)} por cota em 10 parcelas).`,
  };
}
