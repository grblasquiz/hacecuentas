/** Yield farming APY real neto */
export interface Inputs { principalUsd: number; apyNominal: number; tokenPriceChange: number; gasCostUsd: number; ilPercent: number; months: number; }
export interface Outputs { apyReal: number; nominalReturn: number; ilLoss: number; gasCost: number; priceAdjustment: number; netReturnUsd: number; explicacion: string; _insight?: any; _chart?: any; }
export function yieldFarmingApyReal(i: Inputs): Outputs {
  const p = Number(i.principalUsd);
  const apy = Number(i.apyNominal) / 100;
  const priceChg = Number(i.tokenPriceChange) / 100;
  const gas = Number(i.gasCostUsd);
  const il = Number(i.ilPercent) / 100;
  const months = Number(i.months) || 12;
  if (!p || p <= 0) throw new Error('Ingresá capital');
  const years = months / 12;
  const nominalReturn = p * apy * years;
  const priceAdjustment = nominalReturn * priceChg;
  const nominalAfterPrice = nominalReturn + priceAdjustment;
  const ilLoss = p * il;
  const netReturn = nominalAfterPrice - gas - ilLoss;
  const apyReal = (netReturn / p) * 100 / years;
  const apyRealR = Number(apyReal.toFixed(3));
  const insightTone = apyRealR < 0 ? 'warn' : apyRealR < 5 ? 'neutral' : 'good';
  const drag = (apy * 100) - apyRealR; // cuánto se comió la realidad vs nominal
  const insightText = apyRealR < 0
    ? `Tu APY real es **${apyRealR.toFixed(2)}%**: estás **perdiendo $${Math.abs(netReturn).toFixed(2)}** en ${months} meses. Entre IL ($${ilLoss.toFixed(2)}), gas ($${gas.toFixed(2)}) y precio del token, el rendimiento nominal del ${(apy*100).toFixed(1)}% no alcanza.`
    : apyRealR < 5
    ? `Tu APY real cae a **${apyRealR.toFixed(2)}%** (del ${(apy*100).toFixed(1)}% nominal): solo **$${netReturn.toFixed(2)}** netos en ${months}m. La realidad se comió **${drag.toFixed(1)} puntos** entre IL, gas y precio.`
    : `Tu APY real es **${apyRealR.toFixed(2)}%**, con **$${netReturn.toFixed(2)}** netos en ${months}m. Aún descontando IL ($${ilLoss.toFixed(2)}) y gas ($${gas.toFixed(2)}), el farmeo te queda **favorable**.`;

  // Gauge dinámico sobre el APY real. Zonas: pérdida / flojo / sólido / agresivo.
  const segMax = Math.max(50, Math.ceil((apyRealR + 10) / 10) * 10);
  const lowMin = Math.min(-50, Math.floor((apyRealR - 10) / 10) * 10);
  const chart = {
    type: 'scale',
    marker: apyRealR,
    markerLabel: `${apyRealR.toFixed(1)}%`,
    min: lowMin,
    segments: [
      { nombre: 'Pérdida', max: 0, color: '#ef4444', colorDark: '#dc2626' },
      { nombre: 'Flojo', max: 5, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Sólido', max: 20, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Agresivo', max: segMax, color: '#3b82f6', colorDark: '#2563eb' },
    ],
    ariaLabel: `APY real de ${apyRealR.toFixed(1)}% ubicado en la escala de rendimiento neto de yield farming`,
  };

  return {
    apyReal: apyRealR,
    nominalReturn: Number(nominalReturn.toFixed(2)),
    ilLoss: Number(ilLoss.toFixed(2)),
    gasCost: Number(gas.toFixed(2)),
    priceAdjustment: Number(priceAdjustment.toFixed(2)),
    netReturnUsd: Number(netReturn.toFixed(2)),
    explicacion: `APY nominal ${(apy*100).toFixed(2)}%. Ajuste por precio token ${(priceChg*100).toFixed(1)}%, gas $${gas}, IL ${(il*100).toFixed(2)}%: APY real ${apyReal.toFixed(2)}%, neto $${netReturn.toFixed(2)} en ${months}m.`,
    _insight: {
      title: 'Tu APY real neto',
      text: insightText,
      tone: insightTone,
      icon: '🌾',
    },
    _chart: chart,
  };
}
