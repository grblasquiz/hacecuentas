/** Crédito prendario auto: comparativa CFT entre bancos AR */
export interface Inputs { montoCredito: number; plazoMeses: number; tnaBancoPct: number; gastosOtorgamientoPct: number; seguroMensual: number; }
export interface Outputs { cuotaMensual: number; totalAPagar: number; intereses: number; cftEstimadoPct: number; costoTotalConSeguro: number; explicacion: string; _chart?: any; _insight?: any; }
export function creditoPrendarioAutoCftComparativaBancos(i: Inputs): Outputs {
  const monto = Number(i.montoCredito);
  const plazo = Number(i.plazoMeses);
  const tnm = Number(i.tnaBancoPct) / 100 / 12;
  const gastos = Number(i.gastosOtorgamientoPct) / 100;
  const seguro = Number(i.seguroMensual);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo');
  // Sistema francés
  const cuota = tnm > 0
    ? monto * (tnm * Math.pow(1 + tnm, plazo)) / (Math.pow(1 + tnm, plazo) - 1)
    : monto / plazo;
  const total = cuota * plazo;
  const intereses = total - monto;
  const gastosOtorg = monto * gastos;
  const seguroTotal = seguro * plazo;
  const costoTotal = total + gastosOtorg + seguroTotal;
  // CFT real: TIR mensual de los flujos reales, luego anualizada.
  // t0: el tomador recibe (monto − gastos de otorgamiento).
  // t1..plazo: paga (cuota + seguro mensual).
  // Anualizar costoTotal/monto sería un error: ese ratio incluye la devolución
  // del capital, así que comprime un préstamo de varios años y subestima el CFT.
  const desembolsoNeto = monto - gastosOtorg;
  const pagoMensual = cuota + seguro;
  const npv = (im: number) =>
    Math.abs(im) < 1e-12
      ? -desembolsoNeto + pagoMensual * plazo
      : -desembolsoNeto + pagoMensual * (1 - Math.pow(1 + im, -plazo)) / im;
  let cftAnual: number;
  if (desembolsoNeto <= 0 || pagoMensual * plazo <= desembolsoNeto) {
    // Sin costo financiero medible (gastos ≥ monto, o pagos ≤ desembolso).
    cftAnual = 0;
  } else {
    // npv(im) es decreciente en im → bisección sobre la tasa mensual.
    let lo = 1e-9;
    let hi = 1;
    while (npv(hi) > 0 && hi < 1e6) hi *= 2;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (npv(mid) > 0) lo = mid;
      else hi = mid;
    }
    const tirMensual = (lo + hi) / 2;
    cftAnual = (Math.pow(1 + tirMensual, 12) - 1) * 100;
  }
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(intereses) },
      { label: 'Gastos de otorgamiento', value: Math.round(gastosOtorg) },
      { label: 'Seguro', value: Math.round(seguroTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoTotal).toLocaleString('es-AR'),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total del crédito prendario: capital, intereses, gastos de otorgamiento y seguro',
  };
  const sobreCapitalPct = monto > 0 ? Math.round(((costoTotal - monto) / monto) * 100) : 0;
  const extras = gastosOtorg + seguroTotal;
  const extrasPctCosto = (costoTotal - monto) > 0 ? Math.round((extras / (costoTotal - monto)) * 100) : 0;
  const cargoso = sobreCapitalPct >= 100;
  const insight = {
    title: cargoso ? 'Vas a devolver mucho más que lo prestado' : 'Costo del crédito acotado',
    text: cargoso
      ? `Sobre el capital de $${Math.round(monto).toLocaleString('es-AR')} terminás pagando **${sobreCapitalPct}% más** (CFT estimado **${cftAnual.toFixed(0)}%** anual). Gastos y seguro suman **${extrasPctCosto}%** del costo extra: compará el CFT entre bancos, no sólo la TNA.`
      : `Sobre el capital de $${Math.round(monto).toLocaleString('es-AR')} pagás un **${sobreCapitalPct}% extra** (CFT estimado **${cftAnual.toFixed(0)}%** anual), con gastos y seguro aportando **${extrasPctCosto}%** de ese sobrecosto. Igual conviene comparar el CFT con otros bancos.`,
    tone: cargoso ? 'warn' as const : 'neutral' as const,
    icon: cargoso ? '⚠️' : '🚗',
  };

  return {
    cuotaMensual: Number(cuota.toFixed(2)),
    totalAPagar: Number(total.toFixed(2)),
    intereses: Number(intereses.toFixed(2)),
    cftEstimadoPct: Number(cftAnual.toFixed(2)),
    costoTotalConSeguro: Number(costoTotal.toFixed(2)),
    explicacion: `Cuota: $${cuota.toFixed(0)}. Total a pagar: $${total.toFixed(0)}. CFT estimado: ${cftAnual.toFixed(2)}% anual.`,
    _chart: chart,
    _insight: insight,
  };
}
