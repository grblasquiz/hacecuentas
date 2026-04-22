/**
 * IPVA São Paulo 2026
 * Lei Estadual 13.296/2008 — alíquotas: 4% autos, 2% motos, 3% utilitários, 1,5% caminhões, 1% ônibus.
 * Base de cálculo: Tabela FIPE (valor venal).
 */

export interface IpvaSaoPauloInputs {
  valorFipe: number;
  tipoVeiculo: string; // auto | moto | utilitario | caminhao | onibus
}

export interface IpvaSaoPauloOutputs {
  aliquota: string;
  ipvaAnual: number;
  parcela: number;
  descontoUnico: number;
  formula: string;
  explicacion: string;
}

const ALIQUOTAS_SP: Record<string, number> = {
  auto: 4,
  moto: 2,
  utilitario: 3,
  caminhao: 1.5,
  onibus: 1,
};

export function ipvaSaoPaulo(inputs: IpvaSaoPauloInputs): IpvaSaoPauloOutputs {
  const valorFipe = Number(inputs.valorFipe) || 0;
  const tipo = String(inputs.tipoVeiculo || 'auto').toLowerCase();

  if (valorFipe <= 0) {
    throw new Error('Ingresá o valor FIPE do veículo');
  }

  const aliquota = ALIQUOTAS_SP[tipo] ?? 4;
  const ipvaAnual = valorFipe * (aliquota / 100);
  const parcela = ipvaAnual / 3; // SP parcela em até 3x sem desconto
  const descontoUnico = ipvaAnual * 0.97; // ~3% desconto pagto único (alguns anos)

  const formula = `IPVA = R$ ${valorFipe.toLocaleString('pt-BR')} × ${aliquota}% = R$ ${ipvaAnual.toFixed(2)}`;
  const explicacion = `Para um veículo tipo ${tipo} com valor FIPE de R$ ${valorFipe.toLocaleString('pt-BR')}, a alíquota aplicável em SP é ${aliquota}% (Lei 13.296/2008). IPVA anual: R$ ${ipvaAnual.toFixed(2)}. Pode ser parcelado em até 3x de R$ ${parcela.toFixed(2)} ou pago à vista.`;

  return {
    aliquota: `${aliquota}%`,
    ipvaAnual: Math.round(ipvaAnual * 100) / 100,
    parcela: Math.round(parcela * 100) / 100,
    descontoUnico: Math.round(descontoUnico * 100) / 100,
    formula,
    explicacion,
  };
}
