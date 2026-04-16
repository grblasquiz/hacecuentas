/** Estimador de costo de gas fee en Ethereum */

export interface Inputs {
  gasLimit: number;
  gasPriceGwei: number;
  precioEthUsd: number;
  tipoTransaccion: string;
}

export interface Outputs {
  costoEth: number;
  costoUsd: number;
  gasLimitUsado: number;
  gasPriceGwei: number;
  formula: string;
  explicacion: string;
}

// Gas limits típicos por tipo de transacción
const GAS_LIMITS: Record<string, number> = {
  transferencia: 21000,
  'erc20-transfer': 65000,
  'uniswap-swap': 150000,
  'nft-mint': 200000,
  'contract-deploy': 3000000,
  custom: 0,
};

export function costoTransaccionGasEth(i: Inputs): Outputs {
  const tipo = String(i.tipoTransaccion || 'transferencia');
  let gasLimit = Number(i.gasLimit);
  const gasPriceGwei = Number(i.gasPriceGwei);
  const precioEth = Number(i.precioEthUsd);

  if (!gasPriceGwei || gasPriceGwei <= 0) throw new Error('Ingresá el gas price en Gwei');
  if (!precioEth || precioEth <= 0) throw new Error('Ingresá el precio de ETH en USD');

  // Si no es custom, usar el gas limit típico
  if (tipo !== 'custom' && GAS_LIMITS[tipo]) {
    gasLimit = GAS_LIMITS[tipo];
  }

  if (!gasLimit || gasLimit <= 0) throw new Error('Ingresá el gas limit');

  // Costo en ETH: gasLimit × gasPrice (Gwei) / 1e9
  const costoEth = (gasLimit * gasPriceGwei) / 1e9;
  const costoUsd = costoEth * precioEth;

  const formula = `${gasLimit.toLocaleString()} gas × ${gasPriceGwei} Gwei / 1,000,000,000 = ${costoEth.toFixed(6)} ETH`;
  const explicacion = `Una transacción tipo "${tipo}" usa ~${gasLimit.toLocaleString()} gas. A ${gasPriceGwei} Gwei de gas price, el costo es ${costoEth.toFixed(6)} ETH ($${costoUsd.toFixed(2)} USD al precio actual de $${precioEth.toLocaleString()} por ETH).`;

  return {
    costoEth: Number(costoEth.toFixed(8)),
    costoUsd: Number(costoUsd.toFixed(2)),
    gasLimitUsado: gasLimit,
    gasPriceGwei,
    formula,
    explicacion,
  };
}
