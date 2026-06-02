/** Costo mensual estimado en Claude Code según horas/día de uso developer */
export interface Inputs { horasDiaUso: number; diasMes: number; tokensPorHoraProm: number; precioInputUsdM: number; precioOutputUsdM: number; ratioOutputPct: number; descuentoCachingPct: number; }
export interface Outputs { tokensMes: number; costoBrutoUsd: number; costoConCachingUsd: number; ahorroCachingUsd: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const costoInput = (tokIn / 1e6) * pIn;
  const costoOutput = (tokOut / 1e6) * pOut;
  const costoBruto = costoInput + costoOutput;
  // Caching solo aplica al input
  const costoConCache = costoInput * (1 - cache) + costoOutput;
  const ahorro = costoBruto - costoConCache;
  const pctAhorro = costoBruto > 0 ? (ahorro / costoBruto) * 100 : 0;
  const usd = (n: number) => `US$${Math.round(n).toLocaleString('en-US')}`;
  const _insight = {
    title: 'Costo mensual estimado',
    text: `**${horasMes} h/mes** generan **${(tokensMes / 1e6).toFixed(1)}M tokens**, lo que sale **${usd(costoConCache)}/mes** con **${(cache * 100).toFixed(0)}% de caching** (ahorrás **${usd(ahorro)}**, ${pctAhorro.toFixed(0)}%, sobre los ${usd(costoBruto)} sin caché). El output, aunque sea menos volumen, suele pesar más por su precio por millón.`,
    tone: 'neutral',
    icon: '🧑‍💻',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Input', value: Math.round(costoInput * 100) / 100 },
      { label: 'Output', value: Math.round(costoOutput * 100) / 100 },
    ].filter(s => s.value > 0),
    prefix: 'US$',
    centerValue: usd(costoBruto),
    centerLabel: 'Bruto/mes',
    ariaLabel: `Costo bruto mensual ${usd(costoBruto)}: input ${usd(costoInput)} y output ${usd(costoOutput)}.`,
  };
  return {
    tokensMes: Number(tokensMes.toFixed(0)),
    costoBrutoUsd: Number(costoBruto.toFixed(2)),
    costoConCachingUsd: Number(costoConCache.toFixed(2)),
    ahorroCachingUsd: Number(ahorro.toFixed(2)),
    explicacion: `${horasMes}h/mes × ${tph.toLocaleString('en-US')} tok/h = ${(tokensMes / 1e6).toFixed(1)}M tokens. Bruto USD ${costoBruto.toFixed(0)}, con ${(cache * 100).toFixed(0)}% caching USD ${costoConCache.toFixed(0)}.`,
    _insight,
    _chart,
  };
}
