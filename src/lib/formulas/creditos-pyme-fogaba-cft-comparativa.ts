/** Costo financiero total pyme con garantia FOGABA vs sin garantia */
export interface Inputs { montoArs: number; tnaPct: number; plazoMeses: number; comisionFogabaPct: number; gastosOtorgamientoPct: number; ivaSobreInteresPct: number; }
export interface Outputs { cuotaMensualArs: number; totalPagadoArs: number; cftAnualPct: number; costoFogabaArs: number; gastosTotalesArs: number; explicacion: string; }
export function creditosPymeFogabaCftComparativa(i: Inputs): Outputs {
  const monto = Number(i.montoArs);
  const tna = Number(i.tnaPct) / 100;
  const n = Number(i.plazoMeses);
  const cFog = Number(i.comisionFogabaPct) / 100;
  const cOtorg = Number(i.gastosOtorgamientoPct) / 100;
  const ivaInt = Number(i.ivaSobreInteresPct) / 100;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (!n || n <= 0) throw new Error('Ingresá el plazo en meses');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA');
  const tem = tna / 12;
  const cuota = monto * (tem * Math.pow(1 + tem, n)) / (Math.pow(1 + tem, n) - 1);
  const interesTotal = cuota * n - monto;
  const ivaTotal = interesTotal * ivaInt;
  const costoFog = monto * cFog * (n / 12);
  const gastosOtorg = monto * cOtorg;
  const totalPagado = cuota * n + ivaTotal + costoFog + gastosOtorg;
  const cft = (Math.pow(totalPagado / monto, 12 / n) - 1) * 100;
  return {
    cuotaMensualArs: Number(cuota.toFixed(2)),
    totalPagadoArs: Number(totalPagado.toFixed(2)),
    cftAnualPct: Number(cft.toFixed(3)),
    costoFogabaArs: Number(costoFog.toFixed(2)),
    gastosTotalesArs: Number((ivaTotal + costoFog + gastosOtorg).toFixed(2)),
    explicacion: `Crédito pyme de $${monto.toLocaleString('es-AR')} ARS a ${n} meses con TNA ${(tna * 100).toFixed(2)}%: cuota mensual $${cuota.toFixed(0)}, CFT efectivo ${cft.toFixed(2)}%. FOGABA suma $${costoFog.toFixed(0)} en comisión.`,
  };
}
