/** Riesgo cambiario hipoteca USD vs hipoteca UVA pesos */
export interface Inputs { montoUsd: number; tipoCambioActual: number; tasaUsdAnualPct: number; plazoAnios: number; tasaUvaAnualPct: number; inflacionAnualEstPct: number; devaluacionAnualEstPct: number; }
export interface Outputs { cuotaUsdMensualUsd: number; cuotaUsdMensualArs: number; cuotaUvaMensualArs: number; totalPagadoUsdEnArs: number; totalPagadoUva: number; diferencia: number; mejorOpcion: string; explicacion: string; }
export function hipotecaDivisaExtranjeraVsUva(i: Inputs): Outputs {
  const usd = Number(i.montoUsd);
  const tc = Number(i.tipoCambioActual);
  const tnaUsd = Number(i.tasaUsdAnualPct) / 100 / 12;
  const aniosN = Number(i.plazoAnios) * 12;
  const tnaUva = Number(i.tasaUvaAnualPct) / 100 / 12;
  const inf = Number(i.inflacionAnualEstPct) / 100;
  const dev = Number(i.devaluacionAnualEstPct) / 100;
  if (!usd || usd <= 0) throw new Error('Ingresá el monto en USD');
  if (!tc || tc <= 0) throw new Error('Ingresá el tipo de cambio');
  // Cuota USD (francés)
  const cuotaUsd = usd * (tnaUsd * Math.pow(1 + tnaUsd, aniosN)) / (Math.pow(1 + tnaUsd, aniosN) - 1);
  const cuotaUsdArs = cuotaUsd * tc;
  const montoArs = usd * tc;
  // Cuota UVA: capital ajustado por inflación, cuota nominal en pesos
  const cuotaUva = montoArs * (tnaUva * Math.pow(1 + tnaUva, aniosN)) / (Math.pow(1 + tnaUva, aniosN) - 1);
  // Total pagado USD: cada cuota se paga al TC del momento (devaluación esperada)
  let totalUsdArs = 0;
  for (let m = 1; m <= aniosN; m++) {
    const tcM = tc * Math.pow(1 + dev, m / 12);
    totalUsdArs += cuotaUsd * tcM;
  }
  // Total UVA: cuota nominal ajusta por UVA (inflación)
  let totalUva = 0;
  for (let m = 1; m <= aniosN; m++) {
    totalUva += cuotaUva * Math.pow(1 + inf, m / 12);
  }
  const dif = totalUsdArs - totalUva;
  const mejor = totalUva < totalUsdArs ? 'UVA' : 'USD';
  return {
    cuotaUsdMensualUsd: Number(cuotaUsd.toFixed(2)),
    cuotaUsdMensualArs: Number(cuotaUsdArs.toFixed(2)),
    cuotaUvaMensualArs: Number(cuotaUva.toFixed(2)),
    totalPagadoUsdEnArs: Number(totalUsdArs.toFixed(2)),
    totalPagadoUva: Number(totalUva.toFixed(2)),
    diferencia: Number(dif.toFixed(2)),
    mejorOpcion: mejor,
    explicacion: `Hipoteca USD total: $${totalUsdArs.toFixed(0)} ARS. UVA total: $${totalUva.toFixed(0)} ARS. Mejor escenario estimado: ${mejor}.`,
  };
}
