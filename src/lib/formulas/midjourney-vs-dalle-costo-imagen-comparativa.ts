/** Costo por imagen Midjourney vs DALL-E 3 vs Flux según plan y uso */
export interface Inputs { imagenesMes: number; precioPlanUsdMes: number; imagenesIncluidasPlan: number; precioImagenExtraUsd: number; }
export interface Outputs { imagenesExtras: number; costoExtrasUsd: number; costoTotalMesUsd: number; costoPorImagenUsd: number; explicacion: string; }
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
  return {
    imagenesExtras: Number(extras.toFixed(0)),
    costoExtrasUsd: Number(costoExtras.toFixed(2)),
    costoTotalMesUsd: Number(costoTotal.toFixed(2)),
    costoPorImagenUsd: Number(porImagen.toFixed(4)),
    explicacion: `${total} imágenes/mes. Plan USD ${planMes} cubre ${incluidas}. Extras: ${extras} × USD ${precioExtra} = USD ${costoExtras.toFixed(2)}. Total USD ${costoTotal.toFixed(2)} (USD ${porImagen.toFixed(3)}/img).`,
  };
}
