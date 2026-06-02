/** Costo total relocation package para mudanza internacional de empleado */
export interface Inputs { mudanzaUsd: number; visaUsd: number; housingMensualUsd: number; mesesHousing: number; viajesUsd: number; bonusFirmaUsd: number; }
export interface Outputs { totalRelocationUsd: number; housingTotalUsd: number; costoMensualPromedioUsd: number; explicacion: string; _chart?: any; _insight?: any; }
export function relocationPackageMudanzaInternacionalEmpresa(i: Inputs): Outputs {
  const mudanza = Number(i.mudanzaUsd) || 0;
  const visa = Number(i.visaUsd) || 0;
  const housingM = Number(i.housingMensualUsd) || 0;
  const meses = Number(i.mesesHousing) || 0;
  const viajes = Number(i.viajesUsd) || 0;
  const bonus = Number(i.bonusFirmaUsd) || 0;
  if (mudanza <= 0 && visa <= 0 && housingM <= 0) throw new Error('Ingresá al menos mudanza, visa o housing');
  const housingTotal = housingM * meses;
  const total = mudanza + visa + housingTotal + viajes + bonus;
  const promedio = meses > 0 ? total / meses : total;
  const chartSlices = [
    { label: 'Mudanza', value: mudanza },
    { label: 'Visa', value: visa },
    { label: 'Housing', value: housingTotal },
    { label: 'Viajes', value: viajes },
    { label: 'Bonus firma', value: bonus },
  ].filter((s) => s.value > 0);
  const chart = {
    type: 'doughnut' as const,
    slices: chartSlices,
    prefix: '$',
    centerValue: '$' + Math.round(total).toLocaleString('es-AR'),
    centerLabel: 'Total USD',
    ariaLabel: 'Composición del paquete de relocation: mudanza, visa, housing, viajes y bonus de firma.',
  };
  const mayor = chartSlices.reduce((a, b) => (b.value > a.value ? b : a), chartSlices[0] || { label: '—', value: 0 });
  const mayorPct = total > 0 ? (mayor.value / total) * 100 : 0;
  const insight = {
    title: 'Costo del paquete',
    text: `El relocation completo cuesta **USD ${Math.round(total).toLocaleString('es-AR')}**${meses > 0 ? `, ~USD ${Math.round(promedio).toLocaleString('es-AR')}/mes prorrateado` : ''}. El rubro más pesado es **${mayor.label.toLowerCase()}** (USD ${Math.round(mayor.value).toLocaleString('es-AR')}, **${mayorPct.toFixed(0)}%** del total).`,
    tone: 'neutral',
    icon: '🌍',
  };
  return {
    totalRelocationUsd: Number(total.toFixed(2)),
    housingTotalUsd: Number(housingTotal.toFixed(2)),
    costoMensualPromedioUsd: Number(promedio.toFixed(2)),
    explicacion: `Relocation total USD ${total.toLocaleString('es-AR')} (mudanza ${mudanza}, visa ${visa}, housing ${housingTotal}, viajes ${viajes}, bonus ${bonus}).`,
    _chart: chart,
    _insight: insight,
  };
}
