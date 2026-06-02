/** Amortizacion economica de hardware wallet vs riesgo de hot wallet */
export interface Inputs { costoHardwareUsd: number; saldoCustodiadoUsd: number; probAnualHackPct: number; perdidaEsperadaPct: number; }
export interface Outputs { perdidaEsperadaAnualUsd: number; anosAmortizacion: number; ahorroAnioUsd: number; recomendacion: string; explicacion: string; _insight?: any; }
export function walletHardwareLedgerTrezorAmortizacionAnos(i: Inputs): Outputs {
  const costo = Number(i.costoHardwareUsd);
  const saldo = Number(i.saldoCustodiadoUsd);
  const prob = Number(i.probAnualHackPct) / 100;
  const perdPct = Number(i.perdidaEsperadaPct) / 100;
  if (!costo || costo <= 0) throw new Error('Ingresá el costo del hardware wallet');
  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo custodiado');
  const perdidaEsperada = saldo * prob * perdPct;
  if (perdidaEsperada <= 0) throw new Error('Riesgo esperado debe ser mayor a 0');
  const anos = costo / perdidaEsperada;
  const ahorro = perdidaEsperada;
  const reco = anos < 5 ? 'Conviene comprar hardware wallet' : 'Hardware wallet tarda en amortizar — evaluá';
  const insight = {
    title: anos < 5 ? 'Comprá el hardware wallet' : 'Amortización lenta',
    text: anos < 5
      ? `El riesgo de tener **USD ${saldo.toLocaleString('en-US')}** en hot wallet equivale a **USD ${perdidaEsperada.toFixed(0)}/año** de pérdida esperada, así que un dispositivo de **USD ${costo}** se paga solo en **${anos.toFixed(1)} años**. Es un seguro barato frente a un hackeo.`
      : `Con este saldo y nivel de riesgo, la pérdida esperada es de **USD ${perdidaEsperada.toFixed(0)}/año** y el hardware de **USD ${costo}** recién se amortiza en **${anos.toFixed(1)} años**. Igual la cold wallet elimina el riesgo de hackeo remoto, que no se ve en el número puro.`,
    tone: anos < 5 ? 'good' : 'neutral',
    icon: '🔐',
  };
  return {
    perdidaEsperadaAnualUsd: Number(perdidaEsperada.toFixed(2)),
    anosAmortizacion: Number(anos.toFixed(2)),
    ahorroAnioUsd: Number(ahorro.toFixed(2)),
    recomendacion: reco,
    explicacion: `Custodiar USD ${saldo.toLocaleString('en-US')} en hot wallet con ${(prob * 100).toFixed(2)}% probabilidad anual de hackeo (pérdida esperada ${(perdPct * 100).toFixed(0)}%) implica USD ${perdidaEsperada.toFixed(2)} de pérdida esperada/año. Hardware de USD ${costo} se amortiza en ${anos.toFixed(1)} años.`,
    _insight: insight,
  };
}
