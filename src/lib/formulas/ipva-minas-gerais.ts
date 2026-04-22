/**
 * IPVA Minas Gerais 2026
 * Lei Estadual 14.937/2003 — alíquotas: 4% autos/camionetas, 2% motos, 3% utilitários, 1% ônibus.
 * Base: Tabela FIPE. Desconto 3% pagto único.
 */

export interface IpvaMgInputs {
  valorFipe: number;
  tipoVeiculo: string; // auto | moto | utilitario | onibus
  pagamento: string; // unico | parcelado
}

export interface IpvaMgOutputs {
  aliquota: string;
  ipvaAnual: number;
  valorComDesconto: number;
  parcela: number;
  formula: string;
  explicacion: string;
}

const ALIQUOTAS_MG: Record<string, number> = {
  auto: 4,
  moto: 2,
  utilitario: 3,
  onibus: 1,
};

export function ipvaMinasGerais(inputs: IpvaMgInputs): IpvaMgOutputs {
  const valorFipe = Number(inputs.valorFipe) || 0;
  const tipo = String(inputs.tipoVeiculo || 'auto').toLowerCase();
  const pagamento = String(inputs.pagamento || 'unico').toLowerCase();

  if (valorFipe <= 0) {
    throw new Error('Ingresá o valor FIPE do veículo');
  }

  const aliquota = ALIQUOTAS_MG[tipo] ?? 4;
  const ipvaAnual = valorFipe * (aliquota / 100);
  const valorComDesconto = pagamento === 'unico' ? ipvaAnual * 0.97 : ipvaAnual;
  const parcela = ipvaAnual / 3;

  const formula = `IPVA MG = R$ ${valorFipe.toLocaleString('pt-BR')} × ${aliquota}% = R$ ${ipvaAnual.toFixed(2)}`;
  const explicacion = `Para veículo tipo ${tipo} com valor FIPE R$ ${valorFipe.toLocaleString('pt-BR')}, alíquota MG é ${aliquota}% (Lei 14.937/2003). IPVA: R$ ${ipvaAnual.toFixed(2)}. Pagamento único com desconto 3%: R$ ${valorComDesconto.toFixed(2)}. Parcelado em 3x de R$ ${parcela.toFixed(2)}.`;

  return {
    aliquota: `${aliquota}%`,
    ipvaAnual: Math.round(ipvaAnual * 100) / 100,
    valorComDesconto: Math.round(valorComDesconto * 100) / 100,
    parcela: Math.round(parcela * 100) / 100,
    formula,
    explicacion,
  };
}
