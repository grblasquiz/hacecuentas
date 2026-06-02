/** Costo por imagen Midjourney vs DALL-E 3 vs Flux según plan y uso */
export interface Inputs { imagenesMes: number; precioPlanUsdMes: number; imagenesIncluidasPlan: number; precioImagenExtraUsd: number; }
export interface Outputs { imagenesExtras: number; costoExtrasUsd: number; costoTotalMesUsd: number; costoPorImagenUsd: number; explicacion: string; _insight?: any; _chart?: any; }
export function midjourneyVsDalleCostoImagenComparativa(i: Inputs): Outputs {
  const total = Number(i.imagenesMes);
  const planMes = Number(i.precioPlanUsdMes);
  const incluidas = Number(i.imagenesIncluidasPlan);
  const precioExtra = Number(i.precioImagenExtraUsd);
  if (!total || total <= 0) throw new Error('Ingresá imágenes/mes');
  if (planMes < 0) throw new Error('Plan inválido');
  const extras = Math.max(0, total - incluidas);
  const costoExtras = extras * precioExtra;
  const costoTotal = planMes + costoExtras;
  const porImagen = total > 0 ? costoTotal / total : 0;
  const totalFmt = Number(costoTotal.toFixed(2));
  const porImg = Number(porImagen.toFixed(4));

  // Insight: el costo por imagen baja cuanto más aprovechás el plan; sube si abusás de extras
  const pctExtras = costoTotal > 0 ? (costoExtras / costoTotal) * 100 : 0;
  let _insight;
  if (extras <= 0) {
    _insight = {
      title: 'Estás dentro del plan',
      text: `Tus **${total} imágenes/mes** entran en las **${incluidas} incluidas**, así que pagás sólo el plan: **USD ${planMes}** (**USD ${porImagen.toFixed(3)}/img**). No estás tirando plata en extras.`,
      tone: 'good',
      icon: '🎨',
    };
  } else if (pctExtras >= 50) {
    _insight = {
      title: 'Los extras dominan el costo',
      text: `Los extras (**${extras} img × USD ${precioExtra}**) ya son el **${pctExtras.toFixed(0)}%** de los **USD ${totalFmt}** mensuales. A este volumen, un plan superior probablemente te salga más barato por imagen.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    _insight = {
      title: 'Mayormente cubierto por el plan',
      text: `Generás **${extras} imágenes extra** sobre las ${incluidas} del plan: **USD ${costoExtras.toFixed(2)}** adicionales. Te queda en **USD ${porImagen.toFixed(3)}/img** (total USD ${totalFmt}).`,
      tone: 'neutral',
      icon: '🖼️',
    };
  }

  // Donut: total mensual = plan base + extras
  const slices = [{ label: 'Plan base', value: Number(planMes.toFixed(2)) }];
  if (costoExtras > 0) slices.push({ label: `Extras (${extras} img)`, value: Number(costoExtras.toFixed(2)) });
  const _chart = {
    type: 'doughnut',
    slices,
    prefix: 'USD ',
    centerValue: `USD ${totalFmt}`,
    centerLabel: 'Total/mes',
    ariaLabel: `Costo mensual de USD ${totalFmt}: USD ${planMes.toFixed(2)} de plan base y USD ${costoExtras.toFixed(2)} de imágenes extra`,
  };

  return {
    imagenesExtras: Number(extras.toFixed(0)),
    costoExtrasUsd: Number(costoExtras.toFixed(2)),
    costoTotalMesUsd: totalFmt,
    costoPorImagenUsd: porImg,
    explicacion: `${total} imágenes/mes. Plan USD ${planMes} cubre ${incluidas}. Extras: ${extras} × USD ${precioExtra} = USD ${costoExtras.toFixed(2)}. Total USD ${costoTotal.toFixed(2)} (USD ${porImagen.toFixed(3)}/img).`,
    _insight,
    _chart,
  };
}
