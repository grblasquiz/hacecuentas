/** Ganancia por staking de criptomonedas según APY y período */

export interface Inputs {
  cantidadStake: number;
  apyPorcentaje: number;
  periodoMeses: number;
  precioTokenUsd: number;
  compounding: string;
}

export interface Outputs {
  tokensGanados: number;
  gananciaUsd: number;
  totalTokens: number;
  totalUsd: number;
  rendimientoEfectivo: number;
  formula: string;
  explicacion: string;
}

export function rentabilidadStaking(i: Inputs): Outputs {
  const cantidad = Number(i.cantidadStake);
  const apy = Number(i.apyPorcentaje);
  const meses = Number(i.periodoMeses);
  const precio = Number(i.precioTokenUsd) || 1;
  const compType = String(i.compounding || 'mensual');

  if (!cantidad || cantidad <= 0) throw new Error('Ingresá la cantidad de tokens a stakear');
  if (apy === undefined || apy < 0) throw new Error('Ingresá el APY');
  if (!meses || meses <= 0) throw new Error('Ingresá el período en meses');

  const apyDecimal = apy / 100;
  let totalTokens: number;

  // Compounding frequency
  let n: number;
  switch (compType) {
    case 'diario': n = 365; break;
    case 'semanal': n = 52; break;
    case 'mensual': n = 12; break;
    case 'trimestral': n = 4; break;
    case 'anual': n = 1; break;
    default: n = 12;
  }

  // A = P(1 + r/n)^(n*t), where t is in years
  const t = meses / 12;
  totalTokens = cantidad * Math.pow(1 + apyDecimal / n, n * t);

  const tokensGanados = totalTokens - cantidad;
  const gananciaUsd = tokensGanados * precio;
  const totalUsd = totalTokens * precio;
  const rendimientoEfectivo = ((totalTokens / cantidad) - 1) * 100;

  const formula = `${cantidad} × (1 + ${apy}%/${n})^(${n} × ${(meses / 12).toFixed(2)}) = ${totalTokens.toFixed(4)} tokens`;
  const explicacion = `Stakeando ${cantidad} tokens al ${apy}% APY con compounding ${compType} durante ${meses} meses, ganás ${tokensGanados.toFixed(4)} tokens adicionales (${rendimientoEfectivo.toFixed(2)}% rendimiento efectivo). Al precio actual de $${precio} USD/token, eso son $${gananciaUsd.toFixed(2)} USD de ganancia.`;

  return {
    tokensGanados: Number(tokensGanados.toFixed(6)),
    gananciaUsd: Number(gananciaUsd.toFixed(2)),
    totalTokens: Number(totalTokens.toFixed(6)),
    totalUsd: Number(totalUsd.toFixed(2)),
    rendimientoEfectivo: Number(rendimientoEfectivo.toFixed(2)),
    formula,
    explicacion,
  };
}
