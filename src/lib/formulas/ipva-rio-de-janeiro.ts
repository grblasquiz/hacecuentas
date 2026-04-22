/**
 * IPVA Rio de Janeiro 2026
 * Lei Estadual 2.877/1997 — alíquotas: 4% autos, 2% motos, 1% carga, 0,5% elétricos.
 * Base: Tabela FIPE. Desconto de 3% pagto único à vista.
 */

export interface IpvaRioInputs {
  valorFipe: number;
  tipoVeiculo: string; // auto | moto | carga | eletrico
  pagamento: string; // unico | parcelado
}

export interface IpvaRioOutputs {
  aliquota: string;
  ipvaAnual: number;
  valorComDesconto: number;
  parcela: number;
  formula: string;
  explicacion: string;
}

const ALIQUOTAS_RJ: Record<string, number> = {
  auto: 4,
  moto: 2,
  carga: 1,
  eletrico: 0.5,
};

export function ipvaRioDeJaneiro(inputs: IpvaRioInputs): IpvaRioOutputs {
  const valorFipe = Number(inputs.valorFipe) || 0;
  const tipo = String(inputs.tipoVeiculo || 'auto').toLowerCase();
  const pagamento = String(inputs.pagamento || 'unico').toLowerCase();

  if (valorFipe <= 0) {
    throw new Error('Ingresá o valor FIPE do veículo');
  }

  const aliquota = ALIQUOTAS_RJ[tipo] ?? 4;
  const ipvaAnual = valorFipe * (aliquota / 100);
  const valorComDesconto = pagamento === 'unico' ? ipvaAnual * 0.97 : ipvaAnual;
  const parcela = ipvaAnual / 3;

  const formula = `IPVA RJ = R$ ${valorFipe.toLocaleString('pt-BR')} × ${aliquota}% = R$ ${ipvaAnual.toFixed(2)}`;
  const explicacion = `Para veículo tipo ${tipo} com valor FIPE R$ ${valorFipe.toLocaleString('pt-BR')}, alíquota RJ é ${aliquota}% (Lei 2.877/1997). IPVA: R$ ${ipvaAnual.toFixed(2)}. Pagamento único com desconto 3%: R$ ${valorComDesconto.toFixed(2)}. Parcelado em 3x de R$ ${parcela.toFixed(2)}.`;

  return {
    aliquota: `${aliquota}%`,
    ipvaAnual: Math.round(ipvaAnual * 100) / 100,
    valorComDesconto: Math.round(valorComDesconto * 100) / 100,
    parcela: Math.round(parcela * 100) / 100,
    formula,
    explicacion,
  };
}
