/** Costo mensual estimado en Claude Code según horas/día de uso developer */
export interface Inputs { horasDiaUso: number; diasMes: number; tokensPorHoraProm: number; precioInputUsdM: number; precioOutputUsdM: number; ratioOutputPct: number; descuentoCachingPct: number; }
export interface Outputs { tokensMes: number; costoBrutoUsd: number; costoConCachingUsd: number; ahorroCachingUsd: number; explicacion: string; }
export function claudeCodeCostoMensualUsoDeveloper(i: Inputs): Outputs {
  const h = Number(i.horasDiaUso);
  const d = Number(i.diasMes);
  const tph = Number(i.tokensPorHoraProm);
  const pIn = Number(i.precioInputUsdM);
  const pOut = Number(i.precioOutputUsdM);
  const ratio = Number(i.ratioOutputPct) / 100;
  const cache = Number(i.descuentoCachingPct) / 100;
  if (!h || h <= 0) throw new Error('Ingresá horas/día');
  if (!d || d <= 0) throw new Error('Ingresá días/mes');
  if (!tph || tph <= 0) throw new Error('Ingresá tokens/hora');
  const horasMes = h * d;
  const tokensMes = horasMes * tph;
  const tokOut = tokensMes * ratio;
  const tokIn = tokensMes - tokOut;
  const costoBruto = (tokIn / 1e6) * pIn + (tokOut / 1e6) * pOut;
  // Caching solo aplica al input
  const costoConCache = ((tokIn / 1e6) * pIn) * (1 - cache) + (tokOut / 1e6) * pOut;
  const ahorro = costoBruto - costoConCache;
  return {
    tokensMes: Number(tokensMes.toFixed(0)),
    costoBrutoUsd: Number(costoBruto.toFixed(2)),
    costoConCachingUsd: Number(costoConCache.toFixed(2)),
    ahorroCachingUsd: Number(ahorro.toFixed(2)),
    explicacion: `${horasMes}h/mes × ${tph.toLocaleString('en-US')} tok/h = ${(tokensMes / 1e6).toFixed(1)}M tokens. Bruto USD ${costoBruto.toFixed(0)}, con ${(cache * 100).toFixed(0)}% caching USD ${costoConCache.toFixed(0)}.`,
  };
}
